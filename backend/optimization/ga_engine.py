import random
from typing import List, Tuple


# ─────────────────────────────────────────────
# Fitness helpers
# ─────────────────────────────────────────────

def compute_gini(allocations: List[int]) -> float:
    """Gini coefficient: 0 = perfectly equal, 1 = completely unequal."""
    n = len(allocations)
    if n == 0:
        return 0.0
    total = sum(allocations)
    if total == 0:
        return 0.0
    sorted_a = sorted(allocations)
    cumulative = sum((i + 1) * v for i, v in enumerate(sorted_a))
    return (2 * cumulative) / (n * total) - (n + 1) / n


def compute_fitness(chromosome: List[int], priorities: List[float],
                    total_packages: int) -> dict:
    """
    Multi-objective fitness:
      w1 * priority_satisfaction  (higher = more vulnerable households served first)
    + w2 * coverage_rate          (higher = more households reached)
    - w3 * gini_coefficient       (lower gini = fairer distribution)

    Returns a dict so callers can log each metric individually.
    """
    n = len(chromosome)
    if n == 0:
        return {'fitness': 0.0, 'gini': 0.0, 'coverage': 0.0, 'priority_satisfaction': 0.0}

    total_allocated = sum(chromosome)

    # Hard penalty: discard over-budget chromosomes
    if total_allocated > total_packages:
        return {'fitness': -1.0, 'gini': 1.0, 'coverage': 0.0, 'priority_satisfaction': 0.0}

    # Coverage: fraction of households that receive at least 1 package
    served_count = sum(1 for q in chromosome if q > 0)
    coverage = served_count / n

    # Priority satisfaction: allocation is weighted by priority score
    max_alloc = max(chromosome) if any(chromosome) else 1
    total_priority = sum(priorities)
    if total_priority > 0 and max_alloc > 0:
        priority_satisfaction = sum(
            (chromosome[i] / max_alloc) * priorities[i]
            for i in range(n)
        ) / total_priority
    else:
        priority_satisfaction = 0.0

    gini = compute_gini(chromosome)

    w1, w2, w3 = 0.50, 0.30, 0.20
    fitness = w1 * priority_satisfaction + w2 * coverage - w3 * gini

    return {
        'fitness': round(fitness, 6),
        'gini': round(gini, 6),
        'coverage': round(coverage, 6),
        'priority_satisfaction': round(priority_satisfaction, 6),
    }


# ─────────────────────────────────────────────
# Population initialisation
# ─────────────────────────────────────────────

def init_population(pop_size: int, n: int,
                    total_packages: int, max_per_hh: int) -> List[List[int]]:
    """Create an initial population of random feasible chromosomes."""
    population = []
    for _ in range(pop_size):
        chrom = [0] * n
        remaining = total_packages
        indices = list(range(n))
        random.shuffle(indices)
        for i in indices:
            if remaining <= 0:
                break
            give = random.randint(1, min(max_per_hh, remaining))
            chrom[i] = give
            remaining -= give
        population.append(chrom)
    return population


# ─────────────────────────────────────────────
# GA operators
# ─────────────────────────────────────────────

def tournament_selection(population: List[List[int]], fitnesses: List[float],
                          k: int = 3) -> List[int]:
    """Select one parent via k-way tournament."""
    competitors = random.sample(range(len(population)), min(k, len(population)))
    winner = max(competitors, key=lambda i: fitnesses[i])
    return population[winner][:]


def single_point_crossover(p1: List[int], p2: List[int],
                            rate: float) -> Tuple[List[int], List[int]]:
    """Single-point crossover: swap tails after a random cut point."""
    if random.random() < rate and len(p1) > 1:
        pt = random.randint(1, len(p1) - 1)
        return p1[:pt] + p2[pt:], p2[:pt] + p1[pt:]
    return p1[:], p2[:]


def swap_mutation(chrom: List[int], rate: float) -> List[int]:
    """
    Swap mutation: exchange allocations of two random households.
    Preserves the total sum → keeps the chromosome feasible.
    """
    c = chrom[:]
    if random.random() < rate:
        i, j = random.sample(range(len(c)), 2)
        c[i], c[j] = c[j], c[i]
    return c


def repair(chrom: List[int], total_packages: int, max_per_hh: int) -> List[int]:
    """Clamp values and trim total if crossover pushed it over budget."""
    c = [min(v, max_per_hh) for v in chrom]
    excess = sum(c) - total_packages
    if excess > 0:
        idxs = [i for i in range(len(c)) if c[i] > 0]
        random.shuffle(idxs)
        for i in idxs:
            if excess <= 0:
                break
            cut = min(c[i], excess)
            c[i] -= cut
            excess -= cut
    return c


# ─────────────────────────────────────────────
# Main GA runner
# ─────────────────────────────────────────────

def run_ga(households: list, total_packages: int, num_generations: int,
           population_size: int = 50, crossover_rate: float = 0.8,
           mutation_rate: float = 0.1, elitism_count: int = 2,
           max_per_household: int = 5) -> dict:
    """
    Run the Genetic Algorithm.

    Parameters
    ----------
    households        : list of dicts with keys 'id' and 'priority_score'
    total_packages    : total food packages available
    num_generations   : number of GA generations (100 or 500 for comparison)
    population_size   : number of chromosomes per generation
    crossover_rate    : probability of crossover (default 0.8)
    mutation_rate     : probability of swap mutation per chromosome (default 0.1)
    elitism_count     : number of elite chromosomes preserved each generation
    max_per_household : maximum packages any single household can receive

    Returns
    -------
    dict with keys:
        best_chromosome      : best allocation array
        generation_metrics   : list of per-generation stats (for convergence chart)
        final_metrics        : fitness/gini/coverage of the best solution
        allocation_details   : per-household allocation results
    """
    n = len(households)
    if n == 0:
        return {'error': 'No households provided'}

    priorities = [h['priority_score'] for h in households]
    population = init_population(population_size, n, total_packages, max_per_household)

    best_chrom = None
    best_fitness_val = float('-inf')
    generation_metrics = []

    for gen in range(num_generations):
        evals = [compute_fitness(c, priorities, total_packages) for c in population]
        fitnesses = [e['fitness'] for e in evals]

        # Track global best
        top_idx = max(range(len(fitnesses)), key=lambda i: fitnesses[i])
        if fitnesses[top_idx] > best_fitness_val:
            best_fitness_val = fitnesses[top_idx]
            best_chrom = population[top_idx][:]

        avg_fit = sum(fitnesses) / len(fitnesses)
        top_eval = evals[top_idx]

        generation_metrics.append({
            'generation': gen + 1,
            'best_fitness': top_eval['fitness'],
            'avg_fitness': round(avg_fit, 6),
            'gini_coefficient': top_eval['gini'],
            'coverage_rate': top_eval['coverage'],
            'priority_satisfaction_rate': top_eval['priority_satisfaction'],
        })

        # Build next generation
        paired = sorted(zip(fitnesses, population), key=lambda x: x[0], reverse=True)
        next_gen = [c[:] for _, c in paired[:elitism_count]]  # elites

        while len(next_gen) < population_size:
            p1 = tournament_selection(population, fitnesses)
            p2 = tournament_selection(population, fitnesses)
            c1, c2 = single_point_crossover(p1, p2, crossover_rate)
            c1 = swap_mutation(c1, mutation_rate)
            c2 = swap_mutation(c2, mutation_rate)
            c1 = repair(c1, total_packages, max_per_household)
            c2 = repair(c2, total_packages, max_per_household)
            next_gen.append(c1)
            if len(next_gen) < population_size:
                next_gen.append(c2)

        population = next_gen

    final_eval = compute_fitness(best_chrom, priorities, total_packages)

    allocation_details = [
        {
            'id': households[i]['id'],
            'priority_score': priorities[i],
            'allocated_quantity': best_chrom[i],
            'is_served': best_chrom[i] > 0,
        }
        for i in range(n)
    ]

    return {
        'best_chromosome': best_chrom,
        'generation_metrics': generation_metrics,
        'final_metrics': final_eval,
        'allocation_details': allocation_details,
    }

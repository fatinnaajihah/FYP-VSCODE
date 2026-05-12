import math
import random
from typing import List

from .ga_engine import compute_fitness, repair


def run_sa(households: list, total_packages: int, num_iterations: int,
           initial_temp: float = 1.0, min_temp: float = 0.01,
           max_per_household: int = 5) -> dict:
    """
    Simulated Annealing for food aid allocation.

    Neighbourhood operator: swap allocations between two random households.
    Uses the same fitness function as the GA for a fair comparison.

    Temperature cools geometrically from initial_temp → min_temp over
    num_iterations steps, so the cooling schedule adapts automatically to
    both 100-generation and 500-generation runs.
    """
    n = len(households)
    if n == 0:
        return {'error': 'No households provided'}

    priorities = [h['priority_score'] for h in households]

    # Adaptive cooling: reach min_temp exactly on the last iteration
    cooling_rate = (min_temp / initial_temp) ** (1.0 / max(num_iterations - 1, 1))

    # Initial feasible solution (same logic as GA init_population for 1 chromosome)
    current: List[int] = [0] * n
    remaining = total_packages
    indices = list(range(n))
    random.shuffle(indices)
    for i in indices:
        if remaining <= 0:
            break
        give = random.randint(1, min(max_per_household, remaining))
        current[i] = give
        remaining -= give
    current = repair(current, total_packages, max_per_household)

    current_eval = compute_fitness(current, priorities, total_packages)
    current_fitness = current_eval['fitness']

    best = current[:]
    best_fitness = current_fitness
    best_eval = current_eval

    temperature = initial_temp
    generation_metrics = []

    for iteration in range(num_iterations):
        # Generate neighbour: swap allocations of two random households
        neighbor = current[:]
        i, j = random.sample(range(n), 2)
        neighbor[i], neighbor[j] = neighbor[j], neighbor[i]

        neighbor_eval = compute_fitness(neighbor, priorities, total_packages)
        neighbor_fitness = neighbor_eval['fitness']

        delta = neighbor_fitness - current_fitness

        # Accept better solutions always; accept worse solutions probabilistically
        if delta > 0 or (temperature > 1e-10 and random.random() < math.exp(delta / temperature)):
            current = neighbor
            current_fitness = neighbor_fitness
            current_eval = neighbor_eval

        if current_fitness > best_fitness:
            best = current[:]
            best_fitness = current_fitness
            best_eval = current_eval

        generation_metrics.append({
            'generation': iteration + 1,
            'best_fitness': round(best_fitness, 6),
            'avg_fitness': round(current_fitness, 6),  # current solution acts as "population of 1"
            'gini_coefficient': round(best_eval['gini'], 6),
            'coverage_rate': round(best_eval['coverage'], 6),
            'priority_satisfaction_rate': round(best_eval['priority_satisfaction'], 6),
        })

        temperature *= cooling_rate

    allocation_details = [
        {
            'id': households[i]['id'],
            'priority_score': priorities[i],
            'allocated_quantity': best[i],
            'is_served': best[i] > 0,
        }
        for i in range(n)
    ]

    return {
        'best_chromosome': best,
        'generation_metrics': generation_metrics,
        'final_metrics': best_eval,
        'allocation_details': allocation_details,
    }

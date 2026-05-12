from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('optimization', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='allocationrun',
            name='run_mode',
            field=models.CharField(
                choices=[
                    ('crossover_only', 'Crossover Only'),
                    ('crossover_mutation', 'Crossover + Mutation (GA)'),
                    ('sa', 'Simulated Annealing'),
                ],
                default='crossover_mutation',
                max_length=20,
            ),
        ),
    ]

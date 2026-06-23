<?php

namespace Database\Factories;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ActivityLog>
 */
class ActivityLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $actions = ['user.create', 'mitra.create', 'harvest.create'];
        $seed = random_int(100, 999);

        return [
            'user_id' => User::factory(),
            'action' => $actions[array_rand($actions)],
            'description' => 'Aktivitas sistem '.$seed,
            'metadata' => ['source' => 'factory'],
        ];
    }
}

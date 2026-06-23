<?php

namespace Database\Factories;

use App\Models\SystemNotification;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SystemNotification>
 */
class SystemNotificationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $types = ['info', 'warning', 'success', 'error'];
        $seed = random_int(100, 999);

        return [
            'user_id' => User::factory(),
            'type' => $types[array_rand($types)],
            'title' => 'Notifikasi '.$seed,
            'message' => 'Pesan notifikasi sistem '.$seed,
            'meta' => ['source' => 'factory'],
        ];
    }
}

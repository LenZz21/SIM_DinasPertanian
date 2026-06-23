<?php

namespace Database\Factories;

use App\Models\Harvest;
use App\Models\PartnerFarmer;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Harvest>
 */
class HarvestFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $crops = ['Padi', 'Jagung', 'Kedelai', 'Cabai'];
        $locations = ['Makassar', 'Gowa', 'Maros', 'Takalar', 'Jeneponto'];

        return [
            'partner_farmer_id' => PartnerFarmer::factory(),
            'crop_type' => $crops[array_rand($crops)],
            'harvest_amount' => random_int(100, 5000),
            'harvested_at' => now()->subDays(random_int(1, 365)),
            'location' => $locations[array_rand($locations)],
            'notes' => 'Catatan panen '.random_int(100, 999),
            'created_by' => User::factory(),
        ];
    }
}

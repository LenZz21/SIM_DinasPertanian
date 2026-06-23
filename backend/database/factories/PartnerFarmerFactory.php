<?php

namespace Database\Factories;

use App\Models\PartnerFarmer;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PartnerFarmer>
 */
class PartnerFarmerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $regions = ['Makassar', 'Gowa', 'Maros', 'Takalar', 'Jeneponto'];
        $crops = ['Padi', 'Jagung', 'Kedelai', 'Cabai'];
        $seed = random_int(1000, 99999);

        return [
            'name' => 'Mitra '.$seed,
            'address' => 'Alamat Mitra '.$seed,
            'phone' => '08'.random_int(1000000000, 9999999999),
            'region' => $regions[array_rand($regions)],
            'plant_type' => $crops[array_rand($crops)],
            'created_by' => User::factory(),
        ];
    }
}

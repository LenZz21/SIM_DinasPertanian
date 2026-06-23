<?php

namespace Database\Factories;

use App\Models\News;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<News>
 */
class NewsFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $seed = random_int(1000, 99999);
        $title = 'Program Pertanian '.$seed;

        return [
            'title' => $title,
            'slug' => Str::slug($title).'-'.random_int(100, 999),
            'excerpt' => 'Ringkasan berita pertanian '.$seed,
            'content' => 'Konten berita pertanian '.$seed.' dengan fokus pada peningkatan produktivitas dan modernisasi layanan dinas.',
            'is_published' => random_int(1, 100) <= 80,
            'published_at' => now(),
            'author_id' => User::factory(),
        ];
    }
}

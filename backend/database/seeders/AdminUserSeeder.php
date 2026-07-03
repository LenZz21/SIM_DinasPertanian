<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class AdminUserSeeder extends Seeder
{
    /**
     * Seed or update the default administrator account.
     */
    public function run(): void
    {
        Role::firstOrCreate([
            'name' => 'Admin',
            'guard_name' => 'api',
        ]);

        $admin = User::updateOrCreate([
            'email' => 'admin@gmail.com',
        ], [
            'name' => 'Admin Dinas',
            'phone' => '081234567890',
            'address' => 'Kantor Dinas Pertanian',
            'password' => Hash::make('12345678'),
            'is_active' => true,
        ]);

        $admin->syncRoles(['Admin']);
    }
}

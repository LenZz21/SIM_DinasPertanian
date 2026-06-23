<?php

namespace Database\Seeders;

use App\Models\Harvest;
use App\Models\News;
use App\Models\PartnerFarmer;
use App\Models\SystemNotification;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $permissions = [
            'dashboard.view',
            'users.manage',
            'mitra.manage',
            'harvest.manage',
            'reports.export',
            'news.manage',
            'settings.manage',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'api',
            ]);
        }

        $adminRole = Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'api']);
        $petugasRole = Role::firstOrCreate(['name' => 'Petugas', 'guard_name' => 'api']);
        $mitraRole = Role::firstOrCreate(['name' => 'Mitra Petani', 'guard_name' => 'api']);

        $adminRole->syncPermissions($permissions);
        $petugasRole->syncPermissions([
            'dashboard.view',
            'mitra.manage',
            'harvest.manage',
            'reports.export',
        ]);
        $mitraRole->syncPermissions([
            'dashboard.view',
        ]);

        $admin = User::firstOrCreate([
            'email' => 'admin@simpertanian.test',
        ], [
            'name' => 'Admin Dinas',
            'phone' => '081234567890',
            'address' => 'Kantor Dinas Pertanian',
            'password' => Hash::make('Password@123'),
            'is_active' => true,
        ]);
        $admin->syncRoles(['Admin']);

        $petugas = User::firstOrCreate([
            'email' => 'petugas@simpertanian.test',
        ], [
            'name' => 'Petugas Lapangan',
            'phone' => '081234567891',
            'address' => 'Unit Operasional',
            'password' => Hash::make('Password@123'),
            'is_active' => true,
        ]);
        $petugas->syncRoles(['Petugas']);

        $mitraUser = User::firstOrCreate([
            'email' => 'mitra@simpertanian.test',
        ], [
            'name' => 'Mitra Petani',
            'phone' => '081234567892',
            'address' => 'Desa Tani Sejahtera',
            'password' => Hash::make('Password@123'),
            'is_active' => true,
        ]);
        $mitraUser->syncRoles(['Mitra Petani']);

        $partners = PartnerFarmer::factory(20)->create([
            'created_by' => $petugas->id,
        ]);

        Harvest::factory(80)->make()->each(function ($harvest) use ($partners, $petugas) {
            $harvest->partner_farmer_id = $partners->random()->id;
            $harvest->created_by = $petugas->id;
            $harvest->save();
        });

        News::factory(12)->create([
            'author_id' => $admin->id,
            'is_published' => true,
            'published_at' => now(),
        ]);

        SystemNotification::factory(20)->create([
            'user_id' => $admin->id,
        ]);
    }
}

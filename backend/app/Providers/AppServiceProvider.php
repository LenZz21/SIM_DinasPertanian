<?php

namespace App\Providers;

use App\Repositories\Contracts\HarvestRepositoryInterface;
use App\Repositories\Contracts\PartnerFarmerRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\Eloquent\HarvestRepository;
use App\Repositories\Eloquent\PartnerFarmerRepository;
use App\Repositories\Eloquent\UserRepository;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);
        $this->app->bind(PartnerFarmerRepositoryInterface::class, PartnerFarmerRepository::class);
        $this->app->bind(HarvestRepositoryInterface::class, HarvestRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}

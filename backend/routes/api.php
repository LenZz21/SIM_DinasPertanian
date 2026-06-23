<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EmployeeRecordController;
use App\Http\Controllers\Api\ExtensionSessionController;
use App\Http\Controllers\Api\FertilizerStockController;
use App\Http\Controllers\Api\GalleryController;
use App\Http\Controllers\Api\HarvestController;
use App\Http\Controllers\Api\LandAreaController;
use App\Http\Controllers\Api\LivestockRecordController;
use App\Http\Controllers\Api\NewsController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PartnerFarmerController;
use App\Http\Controllers\Api\PublicController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('public')->group(function () {
    Route::get('/stats', [PublicController::class, 'stats']);
    Route::get('/news', [PublicController::class, 'news']);
    Route::get('/news/{news:slug}', [PublicController::class, 'newsDetail']);
    Route::post('/news/{news:slug}/comments', [PublicController::class, 'storeNewsComment']);
});

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

Route::middleware('auth:api')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
    });

    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy']);

    Route::get('/harvests/statistics', [HarvestController::class, 'statistics']);

    Route::get('/reports/preview', [ReportController::class, 'preview']);
    Route::get('/reports/export/excel', [ReportController::class, 'exportExcel']);
    Route::get('/reports/export/pdf', [ReportController::class, 'exportPdf']);

    Route::middleware('role:Admin|Petugas')->group(function () {
        Route::apiResource('mitra', PartnerFarmerController::class)->parameters([
            'mitra' => 'mitra',
        ]);
        Route::apiResource('hasil', HarvestController::class)->parameters([
            'hasil' => 'hasil',
        ]);
        Route::apiResource('gallery', GalleryController::class)->parameters([
            'gallery' => 'gallery',
        ]);
        Route::apiResource('fertilizers', FertilizerStockController::class)->parameters([
            'fertilizers' => 'fertilizerStock',
        ]);
        Route::apiResource('livestock', LivestockRecordController::class)->parameters([
            'livestock' => 'livestockRecord',
        ]);
        Route::apiResource('land-areas', LandAreaController::class)->parameters([
            'land-areas' => 'landArea',
        ]);
        Route::apiResource('extension-sessions', ExtensionSessionController::class)->parameters([
            'extension-sessions' => 'extensionSession',
        ]);
        Route::apiResource('employees', EmployeeRecordController::class)->parameters([
            'employees' => 'employeeRecord',
        ]);
    });

    Route::middleware('role:Admin')->group(function () {
        Route::apiResource('users', UserController::class);
        Route::apiResource('news', NewsController::class)->parameters([
            'news' => 'berita',
        ]);
    });
});

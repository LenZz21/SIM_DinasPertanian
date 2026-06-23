<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/login', function () {
    return response()->json([
        'success' => false,
        'message' => 'Sesi login tidak valid. Silakan login ulang.',
    ], 401);
})->name('login');

<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\WeatherController;

Route::get('/weather', [WeatherController::class, 'show']);
Route::get('/cities', [WeatherController::class, 'search']);

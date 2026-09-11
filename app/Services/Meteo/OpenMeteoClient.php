<?php

namespace App\Services\Meteo;

use App\Exceptions\MeteoException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenMeteoClient
{
    private string $baseUrl;
    private int $timeout;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('services.open_meteo.base_url'), '/');
        $this->timeout = (int) config('services.open_meteo.timeout', 10);
    }

    public function forecast(float $latitude, float $longitude): array
    {
        try {
            $response = Http::timeout($this->timeout)->get("{$this->baseUrl}/forecast", [
                'latitude'  => $latitude,
                'longitude' => $longitude,
                'current'   => 'temperature_2m,wind_speed_10m,weather_code',
                'daily'     => 'temperature_2m_max,temperature_2m_min,weather_code',
                'timezone'  => 'auto',
            ]);
        } catch (ConnectionException $e) {
            Log::error('Open-Meteo connection failed', ['error' => $e->getMessage()]);
            throw new MeteoException('Could not reach the weather service.');
        }

        if ($response->failed()) {
            Log::warning('Open-Meteo request failed', ['status' => $response->status()]);
            throw new MeteoException('Weather service error.');
        }

        return $response->json();
    }

    public function geocode(string $name): array
    {
        try {
            $response = Http::timeout($this->timeout)->get('https://geocoding-api.open-meteo.com/v1/search', [
                'name'     => $name,
                'count'    => 5,
                'language' => 'en',
            ]);
        } catch (ConnectionException $e) {
            Log::error('Open-Meteo geocoding connection failed', ['error' => $e->getMessage()]);
            throw new MeteoException('Could not reach the geocoding service.');
        }

        if ($response->failed()) {
            Log::warning('Open-Meteo geocoding request failed', ['status' => $response->status()]);
            throw new MeteoException('Geocoding service error.');
        }

        return collect($response->json('results') ?? [])
            ->map(fn(array $r) => [
                'id'        => $r['id'],
                'name'      => $r['name'],
                'country'   => $r['country'] ?? null,
                'admin1'    => $r['admin1'] ?? null,
                'latitude'  => $r['latitude'],
                'longitude' => $r['longitude'],
            ])
            ->all();
    }
}

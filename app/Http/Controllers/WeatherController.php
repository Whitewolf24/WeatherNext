<?php

namespace App\Http\Controllers;

use App\Exceptions\MeteoException;
use App\Http\Controllers\Controller;
use App\Services\Meteo\OpenMeteoClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WeatherController extends Controller
{
    public function __construct(private OpenMeteoClient $openMeteo) {}

    public function show(Request $request): JsonResponse
    {
        $latitude = $request->query('lat');
        $longitude = $request->query('lon');
        $city = trim((string) $request->query('city', ''));

        try {
            if ($latitude !== null && $longitude !== null) {
                // Came from a clicked suggestion — already know exactly which
                // place this is, so skip geocoding entirely.
                $validated = $request->validate([
                    'lat' => ['required', 'numeric', 'between:-90,90'],
                    'lon' => ['required', 'numeric', 'between:-180,180'],
                ]);
                $location = [
                    'latitude'  => (float) $validated['lat'],
                    'longitude' => (float) $validated['lon'],
                    'name'      => $request->query('name'),
                    'country'   => $request->query('country'),
                ];
            } elseif ($city !== '') {
                $matches = $this->openMeteo->geocode($city);

                if (count($matches) === 0) {
                    return response()->json(['error' => "No location found matching \"{$city}\"."], 404);
                }
                if (count($matches) > 1) {
                    return response()->json(['matches' => $matches]);
                }
                $location = $matches[0];
            } else {
                return response()->json(['error' => 'No city or coordinates provided.'], 422);
            }

            $forecast = $this->openMeteo->forecast($location['latitude'], $location['longitude']);
        } catch (MeteoException $e) {
            return response()->json(['error' => $e->getMessage()], 502);
        }

        return response()->json(['location' => $location, 'forecast' => $forecast]);
    }

    public function search(Request $request): JsonResponse
    {
        $query = trim((string) $request->query('query', ''));

        if (mb_strlen($query) < 2) {
            return response()->json(['matches' => []]);
        }

        try {
            $matches = $this->openMeteo->geocode($query);
        } catch (MeteoException $e) {
            return response()->json(['matches' => []]);
        }

        return response()->json(['matches' => $matches]);
    }
}

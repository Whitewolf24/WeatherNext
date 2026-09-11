import CitySearch from './components/citysearch';

interface SearchResult {
    name: string;
    country: string | null;
    admin1: string | null;
    latitude: number;
    longitude: number;
}

interface WeatherApiResponse {
    matches?: SearchResult[];
    location?: SearchResult;
    forecast?: {
        current: { temperature_2m: number; wind_speed_10m: number; weather_code: number };
        daily: { time: string[]; temperature_2m_max: number[]; temperature_2m_min: number[]; weather_code: number[] };
    };
    error?: string;
}

//////////

async function get_weather(params: URLSearchParams): Promise<WeatherApiResponse> {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_LARAVEL_API}/api/weather?${params.toString()}`,
        { cache: 'no-store', headers: { Accept: 'application/json' } }
    );
    return res.json();
}

const WEATHER_CODES: Record<number, string> = {
    0: 'Sunny', 1: 'Mostly Sunny', 2: 'Partly Cloudy', 3: 'Cloudy',
    45: 'Fog', 48: 'Freezing Fog',
    51: 'Light Drizzle', 53: 'Drizzle', 55: 'Heavy Drizzle',
    61: 'Light Rain', 63: 'Rain', 65: 'Heavy Rain',
    71: 'Light Snow', 73: 'Snow', 75: 'Heavy Snow',
    80: 'Rain Showers', 81: 'Rain Showers', 82: 'Heavy Showers',
    95: 'Thunderstorms', 96: 'Thunderstorms', 99: 'Severe Storms',
};
const weather_label = (code: number) => WEATHER_CODES[code] ?? 'Unknown';

const HEADER_ICON_COLOR: Record<'sun' | 'cloud' | 'fog' | 'rain' | 'snow' | 'storm', string> = {
    sun: 'text-amber-200',
    cloud: 'text-white',
    fog: 'text-slate-200',
    rain: 'text-slate-300',
    snow: 'text-white',
    storm: 'text-indigo-200',
};

function weather_theme(code: number) {
    if (code === 0 || code === 1) return { gradient: 'from-sky-400 via-sky-300 to-amber-200', icon: 'sun' as const };
    if (code === 2 || code === 3) return { gradient: 'from-slate-400 via-sky-200 to-slate-500', icon: 'cloud' as const };
    if (code === 45 || code === 48) return { gradient: 'from-slate-300 via-slate-200 to-slate-200', icon: 'fog' as const };
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return { gradient: 'from-slate-400 via-sky-500 to-sky-800', icon: 'rain' as const };
    if ([71, 73, 75].includes(code)) return { gradient: 'from-sky-200 via-sky-200 to-white', icon: 'snow' as const };
    if ([95, 96, 99].includes(code)) return { gradient: 'from-slate-800 via-indigo-600 to-slate-500', icon: 'storm' as const };
    return { gradient: 'from-sky-400 via-sky-300 to-sky-100', icon: 'cloud' as const };
}

function WeatherIcon({ type, className }: { type: 'sun' | 'cloud' | 'fog' | 'rain' | 'snow' | 'storm'; className?: string }) {
    const cloudPath = "M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z";

    switch (type) {
        case 'sun':
            return (
                <svg className={className} fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="5" />
                    <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
                    </g>
                </svg>
            );
        case 'cloud':
            return (
                <svg className={className} fill="currentColor" viewBox="0 0 24 24">
                    <path d={cloudPath} />
                </svg>
            );
        case 'fog':
            return (
                <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                    <path d="M4 8h16M2 12h20M4 16h16M6 20h12" />
                </svg>
            );
        case 'rain':
            return (
                <svg className={className} viewBox="0 0 24 24">
                    <g transform="translate(2,-2) scale(0.8)">
                        <path fill="currentColor" d={cloudPath} />
                    </g>
                    <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <path d="M8 17l-1 3M12 17l-1 3M16 17l-1 3" />
                    </g>
                </svg>
            );
        case 'snow':
            return (
                <svg className={className} viewBox="0 0 24 24">
                    <g transform="translate(2,-2) scale(0.8)">
                        <path fill="currentColor" d={cloudPath} />
                    </g>
                    <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <path d="M8 17v4M6 19h4M12 17v4M10 19h4M16 17v4M14 19h4" />
                    </g>
                </svg>
            );
        case 'storm':
            return (
                <svg className={className} viewBox="0 0 24 24">
                    <g transform="translate(2,-2) scale(0.8)">
                        <path fill="currentColor" d={cloudPath} />
                    </g>
                    <path fill="currentColor" d="M13 12l-4 6h3l-1 4 5-7h-3l1-3z" />
                </svg>
            );
    }
}

//////////

export default async function Home({

    searchParams,
}: {
    searchParams: Promise<{ city?: string; lat?: string; lon?: string; name?: string; country?: string }>;
}) {
    const sp = await searchParams;

    const params = new URLSearchParams();
    if (sp.lat && sp.lon) {
        params.set('lat', sp.lat);
        params.set('lon', sp.lon);
        if (sp.name) params.set('name', sp.name);
        if (sp.country) params.set('country', sp.country);
    } else if (sp.city) {
        params.set('city', sp.city);
    }

    const meteo_query = params.has('lat') || params.has('city');
    const data = meteo_query ? await get_weather(params) : null;
    const display_city = sp.name ?? sp.city;
    const theme = data?.forecast ? weather_theme(data.forecast.current.weather_code) : { gradient: 'from-sky-500 via-sky-400 to-sky-200', icon: 'sun' as const };
    const header_icontype = data?.forecast ? theme.icon : 'cloud';
    const header_iconcolor = data?.forecast ? HEADER_ICON_COLOR[theme.icon] : 'text-white';

    /////

    return (
        <div className={`min-h-screen w-full bg-gradient-to-b ${theme.gradient} text-slate-800 antialiased`}>            <div className={`relative w-full pb-32 pt-8 px-6`}>
            <div className="max-w-2xl mx-auto">

                <div className="flex items-center gap-2 mb-6">
                    <WeatherIcon type={header_icontype} className={`w-6 h-6 drop-shadow ${header_iconcolor}`} />
                    <a href="/" className="text-white font-bold text-lg tracking-tight drop-shadow cursor-default">
                        WeatherNext
                    </a>
                </div>

                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/10 p-3 relative z-30">
                    <CitySearch initialCity={display_city} />
                </div>

                {data?.error && (
                    <p className="animate-fade-in mt-4 px-4 py-3 bg-white/90 border border-red-200 text-red-600 font-semibold text-sm rounded-xl text-center shadow">
                        {data.error}
                    </p>
                )}

                {data?.location && data?.forecast && (
                    <div className="animate-fade-in mt-10 flex items-center justify-between text-white">
                        <div>
                            <p className="text-lg font-semibold drop-shadow">{data.location.name}</p>
                            <p className="text-7xl font-thin drop-shadow-sm leading-none mt-1">{Math.round(data.forecast.current.temperature_2m)}°</p>
                            <p className="text-white/90 font-medium mt-1">{weather_label(data.forecast.current.weather_code)}</p>
                            <p className="text-white/70 text-sm mt-0.5">Wind {data.forecast.current.wind_speed_10m} km/h</p>
                        </div>
                        <WeatherIcon type={theme.icon} className="w-28 h-28 text-white drop-shadow-lg" />
                    </div>
                )}
            </div>
        </div>

            {data?.location && data?.forecast && (
                <div className="max-w-2xl mx-auto px-6 -mt-20 pb-16 relative z-10 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl shadow-slate-900/5 p-5">
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">7-Day Forecast</h2>
                        <ul className="divide-y divide-slate-100">
                            {data.forecast.daily.time.map((date, i) => {
                                const dayTheme = weather_theme(data.forecast!.daily.weather_code[i]);
                                return (
                                    <li key={date} className="flex items-center justify-between py-3">
                                        <span className="text-sm font-semibold text-slate-700 w-24">
                                            {new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </span>
                                        <WeatherIcon type={dayTheme.icon} className="w-8 h-8 text-sky-500 shrink-0" />
                                        <span className="text-xs text-slate-400 flex-1 text-center px-2">{weather_label(data.forecast!.daily.weather_code[i])}</span>
                                        <span className="text-sm font-bold text-slate-800 w-20 text-right">
                                            {Math.round(data.forecast!.daily.temperature_2m_max[i])}°
                                            <span className="text-slate-400 font-normal ml-1">{Math.round(data.forecast!.daily.temperature_2m_min[i])}°</span>
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
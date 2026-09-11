'use client';

import { useState, useEffect, useRef, FormEvent, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';

interface CitySuggestion {
    id: number;
    name: string;
    country: string | null;
    admin1: string | null;
    latitude: number;
    longitude: number;
}

//////////

export default function CitySearch({ initialCity }: { initialCity?: string }) {
    const [query, setQuery] = useState(initialCity ?? '');
    const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const queryRef = useRef(query);
    queryRef.current = query;

    const router = useRouter();

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (query.trim().length < 2) {
            setSuggestions([]);
            setOpen(false);
            return;
        }

        const requestedQuery = query;
        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_LARAVEL_API}/api/cities?query=${encodeURIComponent(requestedQuery)}`,
                    { headers: { Accept: 'application/json' } }
                );
                const data = await res.json();

                if (queryRef.current !== requestedQuery) return;

                setSuggestions(data.matches ?? []);
                setOpen(true);
                setActiveIndex(-1);
            } catch (error) {
                // console.error("City search fetch failed:", error);
                setSuggestions([]);

            } finally {
                setLoading(false);
            }
        }, 300);

        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [query]);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    /////////////

    function select_city(c: CitySuggestion) {
        setQuery('');
        setSuggestions([]);
        setOpen(false);
        const params = new URLSearchParams({
            lat: String(c.latitude),
            lon: String(c.longitude),
            name: c.name,
        });
        if (c.country) params.set('country', c.country);
        router.push(`/?${params.toString()}`);
    }

    function handle_sub(e: FormEvent) {
        e.preventDefault();
        setOpen(false);
        router.push(`/?city=${encodeURIComponent(query)}`);
    }

    function handle_keyd(e: KeyboardEvent) {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (open && activeIndex >= 0) {
                select_city(suggestions[activeIndex]);
            }
            return;
        }
        if (!open || suggestions.length === 0) return;
        if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1)); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, 0)); }
        else if (e.key === 'Escape') setOpen(false);
    }

    /////////

    return (
        <div ref={containerRef} className="relative w-full">
            <form onSubmit={handle_sub} className="flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-400 shrink-0 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="7" />
                    <path strokeLinecap="round" d="M21 21l-4.3-4.3" />
                </svg>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handle_keyd}
                    onFocus={() => suggestions.length > 0 && setOpen(true)}
                    placeholder="Search for a city name or postal code"
                    autoComplete="off"
                    className="flex-1 py-2 text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none font-medium"
                />
                {loading && (
                    <svg className="animate-spin h-4 w-4 text-sky-500 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                )}
                <button type="submit" className="bg-sky-500 hover:bg-sky-600 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors shrink-0">
                    Search
                </button>
            </form>

            {open && suggestions.length > 0 && (
                <ul className="absolute top-full mt-2 left-0 right-0 z-50 bg-white border border-slate-100 rounded-xl shadow-xl shadow-slate-900/10 overflow-hidden divide-y divide-slate-100 animate-fade-in-menu">
                    {suggestions.map((s, i) => (
                        <li key={s.id}>
                            <button
                                type="button"
                                onClick={() => select_city(s)}
                                onMouseEnter={() => setActiveIndex(i)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${i === activeIndex ? 'bg-sky-50' : 'hover:bg-slate-50'}`}
                            >
                                <svg className="w-4 h-4 text-sky-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 truncate">{s.name}</p>
                                    <p className="text-xs text-slate-400 truncate">{[s.admin1, s.country].filter(Boolean).join(', ')}</p>
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
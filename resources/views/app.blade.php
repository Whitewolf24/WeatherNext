<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
    <link rel="preconnect" href="https://googleapis.com">
    <link rel="preconnect" href="https://gstatic.com" crossorigin>

    <link href="/src/style.css" rel="stylesheet">

    @inertiaHead
    @routes
    @viteReactRefresh
    @vite(['resources/js/app.tsx'])
</head>

<body>
    @inertia
    {{-- @yield('content') --}}
</body>

</html>
{{-- resources/views/bookings/create.blade.php --}}
@extends('layouts.app')

@section('content')
    <h1>Book a Flight</h1>

    {{-- $errors is a MessageBag Laravel makes available to every view
         automatically after a failed validate() call — no need to pass it
         in from the controller. ->any() is true only if there's at least
         one validation error to show. --}}
    @if ($errors->any())
        <div style="color: red;">
            @foreach ($errors->all() as $message)
                <p>{{ $message }}</p>
            @endforeach
        </div>
    @endif

    {{-- action="{{ route('bookings.store') }}" points this form at the
         POST /bookings route from routes/web.php, which is handled by
         BookingController::store(). --}}
    <form action="{{ route('bookings.store') }}" method="POST">
        {{-- @csrf outputs a hidden input with Laravel's CSRF token. Every
             POST/PUT/PATCH/DELETE form needs this, or Laravel rejects the
             request with a 419 error — it's the framework's built-in
             protection against cross-site request forgery. --}}
        @csrf

        <label>
            Flight ID
            {{-- old('flightId', ...) re-shows whatever the user last typed
                 if validation failed (see withInput() in the controller);
                 the second argument is the fallback used on a fresh page
                 load, here reading ?flightId= from the query string that
                 the "Book" link in flights/index.blade.php set. --}}
            <input type="number" name="flightId" value="{{ old('flightId', request('flightId')) }}" required>
        </label>
        <label>
            Passenger Name
            <input type="text" name="passengerName" value="{{ old('passengerName') }}" required>
        </label>
        <button type="submit">Book</button>
    </form>
@endsection

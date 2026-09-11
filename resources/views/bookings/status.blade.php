{{-- resources/views/bookings/status.blade.php --}}
@extends('layouts.app')

@section('content')
{{-- $bookingId comes straight from the {bookingId} route segment,
         passed through by BookingController::status(). --}}
<h1>Booking {{ $bookingId }}</h1>

{{-- session('success') reads the one-time flash message set by
         ->with('success', ...) in BookingController::store() after a
         successful redirect() here. It only exists for this single
         page load — a refresh won't show it again. --}}
@if (session('success'))
<p style="color: green;">{{ session('success') }}</p>
@endif

{{-- $error is non-null only if SoapTravelClient threw a
         MeteoException (e.g. unknown booking reference, or the
         SOAP partner being unreachable) — see the controller's catch block. --}}
@if ($error)
<p style="color: red;">{{ $error }}</p>
@else
{{-- $status comes from getBookingStatus() (a plain string);
             $details comes from getBookingDetails(), cast to an array
             in SoapTravelClient so it's accessed the same way REST data
             would be. --}}
<p>Status: {{ $status }}</p>
<ul>
    <li>Passenger: {{ $details['passengerName'] }}</li>
    <li>Flight: {{ $details['flightNumber'] }}</li>
</ul>
@endif
@endsection
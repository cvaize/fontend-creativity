<?php
// Конфиг для текущего layout app
$config = [
//    'events'=>[
//        'cart'=>[
//            'updated'=>'eventAppCartUpdated'
//        ],
//    ],
//    'routes'=>[
//        'cart'=>[
//            'index'=>[
//                'url'=> route('site.cart.index'),
//                'method'=>'GET',
//            ],
//        ],
//    ],
];

\FrontendResource::addComponent('layout-app', true, true, true);
?>

{{-------------------------------------Main-Layout-------------------------------------}}
@extends('layouts.index')

@section('content')

    @includeIf('components.flash-message.default')

    @yield('content')

@stop

{{-------------------------------------Head-------------------------------------}}
@push('head')
    @include('components.favicon.default')
@endpush

{{-------------------------------------Navbar-------------------------------------}}
@push('navbar')
    <!-- Global configuration object -->
    <script>window.config = @json($config);</script>

    @if(config('app.env') === 'production')
        {{-------------------------------------Просто заготовка для метрики-------------------------------------}}
        <!-- Google Tag Manager (noscript) -->
        <!-- End Google Tag Manager (noscript) -->
    @endif
    @include('components.navbar.index')
@endpush

{{-------------------------------------Footer-------------------------------------}}
@push('footer')
    @include('components.footer.index')
@endpush

{{-------------------------------------Scripts-------------------------------------}}
@push('scripts')
    @if(config('app.env') === 'production')
        {{-------------------------------------Просто заготовка для метрики-------------------------------------}}
        <!-- Yandex.Metrika counter -->
        <!-- GTM -->
    @endif
@endpush

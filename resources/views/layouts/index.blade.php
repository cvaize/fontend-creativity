<!doctype html>
<html lang="{{ app()->getLocale() }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <link rel="stylesheet" href="{{ \FrontendResource::compileComponentsStyles() }}">

    {!! SEO::generate(true) !!}

    @stack('head')
</head>
<body class="{{ $bodyClass ?? null }}">
@if(\FrontendResource::isHeader())<h1 style="display: none">{!! \FrontendResource::getHeader() !!}</h1>@endif

@stack('navbar')

<main>
    @yield('content')
</main>

@stack('footer')

<script>
    window.appComponents = [];
</script>
@foreach(\FrontendResource::getComponents() as $name=>$is)
    @if($is[1])
        <script src="{{ mix('/'.$name.'.js', '/js/components') }}" async></script>
    @endif
@endforeach

@stack('scripts')
</body>
</html>

<?php
\FrontendResource::addComponent('init', false, true);
\FrontendResource::addComponent('layout-app', false, true);
\FrontendResource::addComponent('box-item', false, true);
?>
@extends('layouts.app')

@section('content')
    <div class="container welcome-example">Добро пожаловать!</div>
@stop

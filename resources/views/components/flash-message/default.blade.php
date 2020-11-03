<?php
/**
 * Флеш сообщения всегда приходят массивом. Удалено получение соло-флеш сообщения
 */
$flashMessages = session('flashMessages');
?>
<div id="flash_messages" class="flash-messages container" style="max-width: 600px;">
    @if(session('flash_message') && isset(session('flash_message')['type']) && isset(session('flash_message')['text']))
        <div class="alert alert-{{ session('flash_message')['type'] }} text-center">
            {!!  session('flash_message')['text']!!}
        </div>
    @endif
    @if(Session::has('status'))
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
            <div class="alert-message">
                {{ Session::get('status') }}
            </div>
        </div>
    @endif
    @if (Session::has('verified'))
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
            <div class="alert-message">
                {!! __('notification.Email address is confirmed') !!}
            </div>
        </div>
    @endif
    @if (null !== $flashMessages)
        @foreach($flashMessages as $message)
            <div class="alert alert-{{ $message['type'] }} alert-dismissible fade show" role="alert">
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                <div class="alert-message">
                    {!! $message['text'] !!}
                </div>
            </div>
        @endforeach
    @endif
</div>

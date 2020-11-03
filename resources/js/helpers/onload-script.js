export default function (src, cb) {
    let script = document.createElement('script');
    script.setAttribute('src', src);
    script.async = true;
    script.onload = script.onreadystatechange = function(e, isAbort) {
        if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState)) {
            script.onload = script.onreadystatechange = null;
            !isAbort && cb()
        }
    };

    document.body.appendChild(script);
}

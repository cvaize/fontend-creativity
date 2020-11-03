window.trigger = function (element, eventName, bubbles = true, cancelable = true) {
    if ("createEvent" in document) {
        let evt = document.createEvent("HTMLEvents");
        evt.initEvent(eventName, bubbles, cancelable);
        element.dispatchEvent(evt);
    } else {
        // IE 8
        let e       = document.createEventObject();
        e.eventType = eventName;
        element.fireEvent('on' + e.eventType, e);
    }
}
export default window.trigger;

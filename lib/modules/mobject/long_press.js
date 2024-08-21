// long press gesture recognizer
export function addLongPressListener(element, triggeredFunction, time = 500) {
    let timeoutID = 0;
    function startLongPress(e) {
        element.removeEventListener('mousedown', startLongPress);
        timeoutID = window.setTimeout(detectLongPress, time, e, triggeredFunction);
        element.addEventListener('mouseup', cancelLongPress);
        element.addEventListener('mousemove', cancelLongPress);
    }
    function cancelLongPress(e) {
        element.removeEventListener('mouseup', cancelLongPress);
        element.removeEventListener('mousemove', cancelLongPress);
        element.addEventListener('mousedown', startLongPress);
        window.clearTimeout(timeoutID);
    }
    function detectLongPress(e, triggeredFunction) {
        element.removeEventListener('mouseup', cancelLongPress);
        element.addEventListener('mouseup', endLongPress);
        triggeredFunction(e);
    }
    function endLongPress(e) {
        element.removeEventListener('mouseup', endLongPress);
        element.addEventListener('mousedown', startLongPress);
    }
    element.addEventListener('mousedown', startLongPress);
    element['startLongPress'] = startLongPress;
}
export function removeLongPressListener(element) {
    element.removeEventListener('mousedown', element['startLongPress']);
    element['startLongPress'] = undefined;
}
//# sourceMappingURL=long_press.js.map
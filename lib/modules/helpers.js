import { Vertex } from './transform.js';
export const isTouchDevice = 'ontouchstart' in document.documentElement;
export function stringFromPoint(point) {
    let x = point[0], y = point[1];
    return `${x} ${y}`;
}
export function remove(arr, value, all = false) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] == value) {
            arr.splice(i, 1);
            if (!all) {
                break;
            }
        }
    }
}
// replicate RGB(A) notation from CSS
//function rgb(r, g, b) { return `rgb(${255*r}, ${255*g}, ${255*b})` }
export function rgba(r, g, b, a) {
    return `rgb(${255 * r}, ${255 * g}, ${255 * b}, ${a})`;
}
export function rgb(r, g, b) {
    let hex_r = (Math.round(r * 255)).toString(16).padStart(2, '0');
    let hex_g = (Math.round(g * 255)).toString(16).padStart(2, '0');
    let hex_b = (Math.round(b * 255)).toString(16).padStart(2, '0');
    return '#' + hex_r + hex_g + hex_b;
}
export function gray(x) { return rgb(x, x, x); }
// long press gesture recognizer
export function addLongPress(element, triggeredFunction, time = 500) {
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
    function detectLongPress(e) {
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
export function removeLongPress(element) {
    element.removeEventListener('mousedown', element['startLongPress']);
    element['startLongPress'] = undefined;
}
export function pointerEventPageLocation(e) {
    let t = null;
    let sidebarWidth = 0;
    try {
        let sidebar = document.querySelector('#sidebar');
        sidebarWidth = sidebar.clientWidth;
    }
    catch (_a) {
    }
    if (e instanceof MouseEvent) {
        t = e;
    }
    else {
        t = e.changedTouches[0];
    }
    return [t.pageX - sidebarWidth, t.pageY];
}
export function pointerEventVertex(e) {
    return new Vertex(pointerEventPageLocation(e));
}
export function addPointerDown(element, method) {
    element.addEventListener('touchstart', method, { capture: true });
    element.addEventListener('mousedown', method, { capture: true });
}
export function removePointerDown(element, method) {
    element.removeEventListener('touchstart', method, { capture: true });
    element.removeEventListener('mousedown', method, { capture: true });
}
export function addPointerMove(element, method) {
    element.addEventListener('touchmove', method, { capture: true });
    element.addEventListener('mousemove', method, { capture: true });
}
export function removePointerMove(element, method) {
    element.removeEventListener('touchmove', method, { capture: true });
    element.removeEventListener('mousemove', method, { capture: true });
}
export function addPointerUp(element, method) {
    element.addEventListener('touchend', method, { capture: true });
    element.addEventListener('mouseup', method, { capture: true });
    element.addEventListener('pointerup', method, { capture: true });
}
export function removePointerUp(element, method) {
    element.removeEventListener('touchend', method, { capture: true });
    element.removeEventListener('mouseup', method, { capture: true });
    element.removeEventListener('pointerup', method, { capture: true });
}
export function logInto(obj, id) {
    let msg = obj.toString();
    let newLine = document.createElement('p');
    newLine.innerText = msg;
    let myConsole = document.querySelector('#' + id);
    // Neither of these lines does what it is claimed to. I give up
    //myConsole.scrollTop = console.scrollHeight
    //newLine.scrollIntoView()
}
export function paperLog(msg) { } // logInto(msg.toString(), 'paper-console') }

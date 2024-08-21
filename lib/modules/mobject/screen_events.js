import { Vertex } from '../helpers/Vertex.js';
window.emulatePen = false;
export const isTouchDevice = (document.body.className == 'ipad');
// this includes PointerEvent (subclass of MouseEvent)
export var ScreenEventDevice;
(function (ScreenEventDevice) {
    ScreenEventDevice[ScreenEventDevice["Mouse"] = 0] = "Mouse";
    ScreenEventDevice[ScreenEventDevice["Finger"] = 1] = "Finger";
    ScreenEventDevice[ScreenEventDevice["Pen"] = 2] = "Pen";
    ScreenEventDevice[ScreenEventDevice["Unknown"] = 3] = "Unknown";
})(ScreenEventDevice || (ScreenEventDevice = {}));
export var ScreenEventType;
(function (ScreenEventType) {
    ScreenEventType[ScreenEventType["Down"] = 0] = "Down";
    ScreenEventType[ScreenEventType["Move"] = 1] = "Move";
    ScreenEventType[ScreenEventType["Up"] = 2] = "Up";
    ScreenEventType[ScreenEventType["Cancel"] = 3] = "Cancel";
    ScreenEventType[ScreenEventType["Unknown"] = 4] = "Unknown";
})(ScreenEventType || (ScreenEventType = {}));
export var ScreenEventHandler;
(function (ScreenEventHandler) {
    ScreenEventHandler[ScreenEventHandler["Auto"] = 0] = "Auto";
    // e.g. for CindyJS canvas
    ScreenEventHandler[ScreenEventHandler["Below"] = 1] = "Below";
    // e. g. for the interior of a TwoPointCircle
    ScreenEventHandler[ScreenEventHandler["Self"] = 2] = "Self";
    ScreenEventHandler[ScreenEventHandler["Parent"] = 3] = "Parent"; // let the parent handle it, even if the target (this mob or a submob) could handle it
    // i. e. this disables the interactivity of the mobjects and of all its submobs
    // General rule: the event is handled by the lowest submob that can handle it
    // and that is not underneath a PassUp
    // If the event policies end in a loop, no one handles it
})(ScreenEventHandler || (ScreenEventHandler = {}));
export function eventVertex(e) {
    // subtract the sidebar's width if necessary
    // i. e. if running in the browser (minter.html)
    // instead of in the app (paper.html)
    var sidebarWidth = 0;
    let sidebarView = document.querySelector('#sidebar_id');
    if (sidebarView !== null) {
        // we are in the browser
        sidebarWidth = sidebarView.clientWidth;
    }
    let t = null;
    if (e instanceof MouseEvent) {
        t = e;
    }
    else {
        t = e.changedTouches[0];
    }
    //log(`pageXY: ${t.pageX}, ${t.pageY}`)
    return new Vertex(t.pageX - sidebarWidth, t.pageY);
}
export function screenEventType(e) {
    if (e.type == 'pointerdown' || e.type == 'mousedown' || e.type == 'touchstart') {
        return ScreenEventType.Down;
    }
    if (e.type == 'pointermove' || e.type == 'mousemove' || e.type == 'touchmove') {
        return ScreenEventType.Move;
    }
    if (e.type == 'pointerup' || e.type == 'mouseup' || e.type == 'touchend') {
        return ScreenEventType.Up;
    }
    if (e.type == 'pointercancel' || e.type == 'touchcancel') {
        return ScreenEventType.Cancel;
    }
    return ScreenEventType.Unknown;
}
export function screenEventDevice(e) {
    if (isTouchDevice) {
        if (e instanceof TouchEvent) {
            if (e.touches[0].force == 0) {
                return ScreenEventDevice.Finger;
            }
            else {
                return ScreenEventDevice.Pen;
            }
        }
        else if (e instanceof MouseEvent) {
            return ScreenEventDevice.Mouse;
        }
        else {
            return ScreenEventDevice.Unknown;
        }
    }
    else {
        if (window.emulatePen) {
            return ScreenEventDevice.Pen;
        }
        else {
            return ScreenEventDevice.Finger;
        }
    }
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
//# sourceMappingURL=screen_events.js.map
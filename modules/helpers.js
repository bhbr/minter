export const isTouchDevice = 'ontouchstart' in document.documentElement


export function stringFromPoint(point) {
    let x = point[0],
        y = point[1]
    return x + ' ' + y
}

export function remove(arr, value, all = false) {
   for (let i = 0; i < arr.length; i++) {
        if (arr[i] == value) {
            arr.splice(i,1)
            if (!all) { break }
        }
    }
}


// replicate RGB(A) notation from CSS
//function rgb(r, g, b) { return `rgb(${255*r}, ${255*g}, ${255*b})` }
export function rgba(r, g, b, a) { return `rgb(${255*r}, ${255*g}, ${255*b}, ${a})` }

export function rgb(r, g, b) {
    let hex_r = (Math.round(r*255)).toString(16).padStart(2, '0')
    let hex_g = (Math.round(g*255)).toString(16).padStart(2, '0')
    let hex_b = (Math.round(b*255)).toString(16).padStart(2, '0')
    return '#' + hex_r + hex_g + hex_b
}

export function gray(x) { return rgb(x, x, x) }

// long press gesture recognizer
export function addLongPress(element, triggeredFunction, time = 500) {

    element.addEventListener('mousedown', startLongPress)
    element.startLongPress = startLongPress
    let timeoutID = 0

    function startLongPress(e) {
        element.removeEventListener('mousedown', startLongPress)
        timeoutID = window.setTimeout(detectLongPress, time, e, triggeredFunction)
        element.addEventListener('mouseup', cancelLongPress)
        element.addEventListener('mousemove', cancelLongPress)
    }

    function cancelLongPress(e) {
        element.removeEventListener('mouseup', cancelLongPress)
        element.removeEventListener('mousemove', cancelLongPress)
        element.addEventListener('mousedown', startLongPress)
        window.clearTimeout(timeoutID)
    }

    function detectLongPress(e) {
        element.removeEventListener('mouseup', cancelLongPress)
        element.addEventListener('mouseup', endLongPress)
        triggeredFunction(e)
    }

    function endLongPress(e) {
        element.removeEventListener('mouseup', endLongPress)
        element.addEventListener('mousedown', startLongPress)
    }

}

export function removeLongPress(element) {
    element.removeEventListener('mousedown', element.startLongPress)
    element.startLongPress = undefined
}


export function pointerEventPageLocation(e) {
    let t = null
    let sidebarWidth = 0
    try {
        let sidebar = document.querySelector('#sidebar')
        sidebarWidth = sidebar.clientWidth
    } catch {
    }
    if (e instanceof MouseEvent) { t = e }
    else { t = e.changedTouches[0] }
    return [t.pageX - sidebarWidth, t.pageY]
}


export function addPointerDown(element, method) {
    element.addEventListener('touchstart', method)
    element.addEventListener('mousedown', method)
}

export function removePointerDown(element, method) {
    element.removeEventListener('touchstart', method)
    element.removeEventListener('mousedown', method)
}

export function addPointerMove(element, method) {
    element.addEventListener('touchmove', method)
    element.addEventListener('mousemove', method)
}

export function removePointerMove(element, method) {
    element.removeEventListener('touchmove', method)
    element.removeEventListener('mousemove', method)
}

export function addPointerUp(element, method) {
    element.addEventListener('touchend', method)
    element.addEventListener('mouseup', method)
    element.addEventListener('pointerup', method)
}

export function removePointerUp(element, method) {
    element.removeEventListener('touchend', method)
    element.removeEventListener('mouseup', method)
}

export function logInto(obj, id) {
    let msg = obj.toString()
    let newLine = document.createElement('p')
    newLine.innerText = msg
    let myConsole = document.querySelector('#' + id)
    myConsole.appendChild(newLine)
    
    // Neither of these lines does what they are supposed to. I give up
    //myConsole.scrollTop = console.scrollHeight
    //newLine.scrollIntoView()
}



















import { Vertex } from './modules/transform.js'
import { MGroup } from './modules/mobject.js'
import { Circle } from './modules/shapes.js'
import { Line } from './modules/arrows.js'

//import { tabulate, toCamelCase, Evented } from './node_modules/@mathigon/core/index.js'
// import tabulate from './node_modules/@mathigon/core/src/arrays.js'
// import toCamelCase from './node_modules/@mathigon/core/src/strings.js'
// import Evented from './node_modules/@mathigon/core/src/evented.js'


function rgb(r, g, b) {
    let hex_r = (Math.round(r*255)).toString(16)
    hex_r = (hex_r == 0) ? '00' : hex_r
    let hex_g = (Math.round(g*255)).toString(16)
    hex_g = (hex_g == 0) ? '00' : hex_g
    let hex_b = (Math.round(b*255)).toString(16)
    hex_b = (hex_b == 0) ? '00' : hex_b
    let hex_color = '#' + hex_r + hex_g + hex_b
    return hex_color
}


let lineButton = new Circle(25)
lineButton.midPoint = new Vertex(50, 500)
lineButton.fillColor = rgb(0.5, 0.5, 1)
paper.add(lineButton)



let circleButton = new Circle(25)
circleButton.midPoint = new Vertex(50, 600)
circleButton.fillColor = rgb(1, 0.5, 0.5)
paper.add(circleButton)

let mode = 'draw'
let creating = false
let keyPressed = false

paper.addEventListener('touchstart', startCreating)
paper.addEventListener('mousedown', startCreating)
lineButton.view.addEventListener('touchstart', lineButtonDown)
circleButton.view.addEventListener('touchstart', circleButtonDown)
document.addEventListener('keydown', buttonDownKeySelector)
document.addEventListener('keyup', buttonUpKeySelector)

function buttonDownKeySelector(e) {
    if (mode != 'draw') {
        return
    }
    if (e.key == 'q') {
        lineButtonDown(e)
    } else if (e.key == 'w') {
        circleButtonDown(e)
    }
}

function buttonUpKeySelector(e) {
    if (e.key == 'q') {
        lineButtonUp(e)
    } else if (e.key == 'w') {
        circleButtonUp(e)
    }
}

function pointerEventPageLocation(e) {
    let t = null
    if (e instanceof MouseEvent) {
        t = e
    } else {
        for (let tt of e.touches) {
            if (tt.target != lineButton.path && tt.target != circleButton.path) {
                t = tt
                break
            }
        }
    }
    return [t.pageX, t.pageY]
}

function startCreating(e) {
    e.preventDefault()
    e.stopPropagation()

    let p = pointerEventPageLocation(e)

    paper.removeEventListener('touchstart', startCreating)
    paper.removeEventListener('mousedown', startCreating)
    paper.addEventListener('touchmove', creativeMove)
    paper.addEventListener('mousemove', creativeMove)
    paper.addEventListener('touchend', endCreating)
    paper.addEventListener('mouseup', endCreating)

    creating = true

    // freehand drawing
    paper.freehand = new MGroup()
    paper.line = new MGroup()
    paper.circle = new MGroup()

    // line drawing
    paper.line.startPoint = new Vertex(p)
    paper.line.c1 = new Circle(5)
    paper.line.c1.midPoint = paper.line.startPoint
    paper.line.endPoint = new Vertex(p)
    paper.line.c2 = new Circle(5)
    paper.line.c2.midPoint = paper.line.endPoint
    paper.line.line = new Line(paper.line.startPoint, paper.line.endPoint)
    paper.line.add(paper.line.c1)
    paper.line.add(paper.line.c2)
    paper.line.add(paper.line.line)

    // circle drawing
    paper.circle.center = new Vertex(p)
    paper.circle.radius = 0
    paper.circle.centerPoint = new Circle(5)
    paper.circle.centerPoint.midPoint = paper.circle.center
    paper.circle.circle = new Circle(paper.circle.radius)
    paper.circle.circle.fillOpacity = 0
    paper.circle.circle.strokeWidth = 1
    paper.circle.circle.strokeColor = rgb(0, 0, 0)
    paper.circle.circle.midPoint = paper.circle.center
    paper.circle.add(paper.circle.centerPoint)
    paper.circle.add(paper.circle.circle)


    if (mode == 'line') {
        paper.add(paper.line)
        paper.circle.view.remove()
        paper.freehand.view.remove()
    } else if (mode == 'circle') {
        paper.line.view.remove()
        paper.add(paper.circle)
        paper.freehand.view.remove()
    } else if (mode == 'draw') {
        paper.add(paper.freehand)
        paper.line.view.remove()
        paper.circle.view.remove()
    }
}

function creativeMove(e) {
    e.preventDefault()
    e.stopPropagation()

    let p = pointerEventPageLocation(e)

    freehandDraw(p)
    drawLine(p)
    drawCircle(p)
}

function lineButtonDown(e) {
    e.preventDefault()
    e.stopPropagation()
    
    lineButton.view.removeEventListener('touchstart', lineButtonDown)
    lineButton.view.addEventListener('touchend', lineButtonUp)
    mode = 'line'
    lineButton.fillColor = rgb(0.25, 0, 0.5)
    lineButton.radius *= 1.5

    if (paper.freehand != null) {
        paper.freehand.view.remove()
    }
    if (paper.line != null) {
        paper.add(paper.line)
    }
}


function circleButtonDown(e) {
    e.preventDefault()
    e.stopPropagation()
    
    circleButton.view.removeEventListener('touchstart', circleButtonDown)
    circleButton.view.addEventListener('touchend', circleButtonUp)
    mode = 'circle'
    circleButton.fillColor = rgb(0.5, 0.25, 0.5)
    circleButton.radius *= 1.5

    if (paper.freehand != null) {
        paper.freehand.view.remove()
    }
    if (paper.circle != null) {
        paper.add(paper.circle)
    }
}




function lineButtonUp(e) {
    e.preventDefault()
    e.stopPropagation()
    
    lineButton.view.addEventListener('touchstart', lineButtonDown)
    lineButton.view.removeEventListener('touchend', lineButtonUp)
    mode = 'draw'
    lineButton.fillColor = rgb(0.5, 0.5, 1)
    lineButton.radius /= 1.5
    if (creating) {
        paper.add(paper.freehand)
        paper.line.view.remove()
    }
}

function circleButtonUp(e) {
    if (e != null) {
        e.preventDefault()
        e.stopPropagation()
    }
    circleButton.view.addEventListener('touchstart', circleButtonDown)
    circleButton.view.removeEventListener('touchend', circleButtonUp)
    mode = 'draw'
    circleButton.fillColor = rgb(1, 0.5, 0.5)
    circleButton.radius /= 1.5
    if (creating) {
        paper.add(paper.freehand)
        paper.circle.view.remove()
    }
}



function freehandDraw(p) {
    let c = new Circle(5)
    c.midPoint = new Vertex(p)
    paper.freehand.add(c)
}

function drawLine(p) {
    paper.line.endPoint.x = p[0]
    paper.line.endPoint.y = p[1]
    paper.line.c2.midPoint = paper.line.endPoint
    paper.line.line.view.remove()
    paper.line.line = new Line(paper.line.startPoint, paper.line.endPoint)
    paper.line.add(paper.line.line)
}

function drawCircle(p) {
    let r = Math.sqrt((p[0] - paper.circle.center.x)**2 + (p[1] - paper.circle.center.y)**2)
    paper.circle.circle.radius = r
    paper.circle.radius = r
}


function endCreating(e) {
    console.log('endCreating')
    e.preventDefault()
    e.stopPropagation()
    paper.removeEventListener('touchmove', creativeMove)
    paper.removeEventListener('mousemove', creativeMove)
    paper.removeEventListener('touchend', endCreating)
    paper.removeEventListener('mouseup', endCreating)
    paper.addEventListener('touchstart', startCreating)
    paper.addEventListener('mousedown', startCreating)

    creating = false
    paper.line = null
    paper.circle = null
    paper.freehand = null
}






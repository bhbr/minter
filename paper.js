import { pointerEventPageLocation, rgb, addPointerDown, removePointerDown, addPointerMove, removePointerMove, addPointerUp, removePointerUp, logInto, isTouchDevice } from './modules/helpers.js'
import { Vertex } from './modules/transform.js'
import { MGroup } from './modules/mobject.js'
import { Circle } from './modules/shapes.js'
import { Line } from './modules/arrows.js'

let creating = false
let paper = document.querySelector('#paper')
paper.mode = 'freehand'
paper.modes = ['freehand', 'segment', 'halfline', 'fullline', 'circle', 'cindy', 'drag']
paper.colors = {
    'white': rgb(1, 1, 1),
    'red': rgb(1, 0, 0),
    'orange': rgb(1, 0.5, 0),
    'yellow': rgb(1, 1, 0),
    'green': rgb(0, 1, 0),
    'blue': rgb(0, 0, 1),
    'indigo': rgb(0.5, 0, 1),
    'violet': rgb(1, 0, 1)
}
paper.color = 'white'

let log = function(msg) { logInto(msg, 'paper-console') }

paper.createdMobjects = {}
paper.createdPoints = []
paper.cindyPorts = []

paper.add = function(mobject) {
    paper.appendChild(mobject.view)
}

// class Paper extends Mobject {

//     constructor() {
//         super()
//         this.view = document.querySelector('#paper')
//         this.isCreating = false
//         this.modes = ['freehand', 'segment', 'halfline', 'fullline', 'circle', 'cindy', 'drag']
//         this.currentMode = 'freehand'
//         this.colorPalette = {
//             'black': rgb(0, 0, 0),
//             'white': rgb(1, 1, 1),
//             'red': rgb(1, 0, 0),
//             'orange': rgb(1, 0.5, 0),
//             'yellow': rgb(1, 1, 0),
//             'green': rgb(0, 1, 0),
//             'blue': rgb(0, 0, 1),
//             'indigo': rgb(0.5, 0, 1),
//             'violet': rgb(1, 0, 1)
//         }
//         this.currentColor = this.colorPalette['white']
//         this.mobjectsCurrentlyBeingDrawn = {}
//         this.cindyPorts = []

//     }

//     changeColorByName(newColorName) {
//         let newColor = this.colorPalette[newColorName]
//         this.changeColor(newColor)
//     }

//     changeColor(newColor) {
//         this.currentColor = newColor
//         for (let [key, mob] of paper.mobjectsCurrentlyBeingDrawn.entries()) {
//                 mob.strokeColor = paper.currentColor
//                 mob.fillColor = paper.currentColor
//             }
//     }


//     changeMode(newMode) {
//         this.currentMode = newMode
        
//         if (newMode == 'drag') {
//             // forbid all objects to handle input themselves
//             for (let mob of paper.constructedObjects) {
//                 mob.view.style['pointer-events'] = 'none'
//             }
//             return
//         } else {
//             // give  them back input control
//             for (let mob of paper.constructedObjects) {
//                 mob.view.style['pointer-events'] = 'auto'
//             }
//         }

//         for (let mob of this.mobjectsCurrentlyBeingDrawn.values()) {
//             mob.hide()
//         }
//         this.mobjectsCurrentlyBeingDrawn[this.currentMode].show()
// }
// }
function changeMode(newMode) {

    if (!paper.modes.includes(newMode)) { return }

    paper.mode = newMode
    
    if (newMode == 'drag') {
        // forbid all objects to handle input themselves
        for (let mob of paper.constructedObjects) {
            mob.view.style['pointer-events'] = 'none'
        }
        return
    } else {
        // give  them back input control
        for (let mob of paper.constructedObjects) {
            mob.view.style['pointer-events'] = 'auto'
        }
    }

    for (let mode in paper.createdMobjects) {
        paper.createdMobjects[mode].hide()
    }
    try {
        paper.createdMobjects[paper.mode].show()
    } catch { }
}


paper.changeMode = changeMode
paper.constructedObjects = []
paper.constructedPoints = []



class Freehand extends MGroup {
    
    constructor(p) {
        super()
        this.update(p, 'freehand')
        this.strokeColor = paper.color
    }
    
    updateWithPoints(q) {
        let nbDrawnPoints = this.submobjects.length
        if (nbDrawnPoints > 0) {
            p = this.submobjects[nbDrawnPoints - 1].midPoint
        }
        let pointDistance = 10
        let distance = ((p.x - q.x)**2 + (p.y - q.y)**2)**0.5
        let unitVector = new Vertex([(q.x - p.x)/distance, (q.y - p.y)/distance])
        for (var step = pointDistance; step < distance; step += pointDistance) {
            let x = p.x + step * unitVector.x + 0.5 * Math.random()
            let y = p.y + step * unitVector.y + 0.5 * Math.random()
            let newPoint = new Vertex([x, y])
            let c = new Circle(2)
            c.fillColor = this.strokeColor
            c.midPoint = new Vertex(newPoint)
            this.add(c)
        }
        let t = Math.random()
        let r = (1 - t) * 0.5 + t * 0.75
        let c = new Circle(r)
        c.midPoint = new Vertex(q)
        this.add(c)
    }
    
    updateWithLines(q) {

        let nbDrawnPoints = this.submobjects.length
        let p = null
        if (nbDrawnPoints == 0) {
            p = q
        } else {
            p = this.submobjects[nbDrawnPoints - 1].endPoint
        }
        let newLine = new Line([p, q])
        newLine.strokeColor = this.strokeColor
        this.add(newLine)
    }
    
    update(q) {
        //this.strokeColor = paper.colors[paper.color]
        this.updateWithLines(q)
    }
}

class DrawnPoint extends Circle {

    constructor(p) {
        super(5)
        this.midPoint = p
    }
}

class DrawnSegment extends MGroup {
    
    constructor(p, q) {
        super()
        if (q == undefined) { q = p }
        this.startPoint = p
        this.endPoint = q
        this.c1 = new DrawnPoint(p)
        this.c2 = new DrawnPoint(q)
        this.line = new Line([p, q])

        this.add(this.c1)
        this.add(this.c2)
        this.add(this.line)

        this.strokeColor = paper.color
        this.fillColor = paper.color
    }
    
    update(q) {
        this.c2.midPoint = q
        this.line.vertices = [this.line.startPoint, q]
        this.updateView()
    }
}

class DrawnHalfLine extends DrawnSegment {

    constructor(p, q) {
        super(p, q)
        this.line.vertices = [this.startPoint, this.farOffEndPoint()]

    }

    farOffEndPoint() {
        if (this.startPoint == this.endPoint) {
            return this.endPoint
        }
        let farOffX = this.startPoint.x + 100 * (this.endPoint.x - this.startPoint.x)
        let farOffY = this.startPoint.y + 100 * (this.endPoint.y - this.startPoint.y)
        return new Vertex(farOffX, farOffY)
    }

    update(q) {
        this.endPoint = q
        this.c2.midPoint = this.endPoint
        this.line.vertices = [this.startPoint, this.farOffEndPoint()]
    }
}

class DrawnFullLine extends DrawnHalfLine {

    constructor(p, q) {
        super(p, q)
        this.line.vertices = [this.farOffStartPoint(), this.farOffEndPoint()]
    }

    farOffStartPoint() {
        if (this.startPoint == this.endPoint) {
            return this.startPoint
        }
        let farOffX = this.endPoint.x + 100 * (this.startPoint.x - this.endPoint.x)
        let farOffY = this.endPoint.y + 100 * (this.startPoint.y - this.endPoint.y)
        return new Vertex(farOffX, farOffY)
    }

    update(q) {
        this.endPoint = q
        this.c2.midPoint = this.endPoint
        this.line.vertices = [this.farOffStartPoint(), this.farOffEndPoint()]
    }
}

class DrawnCircle extends MGroup {
    
    constructor(p) {
        super()
        this.center = new Vertex(p)
        this.outer = new Vertex(p)
        this.radius = 0
        this.centerPoint = new Circle(5)
        this.outerPoint = new Circle(5)
        this.centerPoint.midPoint = this.center
        this.outerPoint.midPoint = this.outer
        this.circle = new Circle(this.radius)
        this.circle.fillOpacity = 0
        this.circle.strokeWidth = 1
        this.circle.strokeColor = rgb(0, 0, 0)
        this.circle.midPoint = this.center
        this.add(this.centerPoint)
        this.add(this.outerPoint)
        this.add(this.circle)
        this.strokeColor = paper.color
        this.fillColor = paper.color
    }
    
    update(q) {
        let r = Math.sqrt((q.x - this.center.x)**2 + (q.y - this.center.y)**2)
        this.updateRadius(r)
        this.updateOuter(q)
    }
    
    updateRadius(r) {
        this.circle.radius = r
        this.radius = r
    }
    
    updateOuter(q) {
        this.outer = q
        this.outerPoint.midPoint = q
        
    }
    
}


class DrawnRectangle extends MGroup {
    
    constructor(p) {
        super()
        this.p1 = new Vertex(p)
        this.p2 = new Vertex(p)
        this.p3 = new Vertex(p)
        this.p4 = new Vertex(p)
        this.startPoint = new Vertex(p)
        this.top = new Line([p, p])
        this.bottom = new Line([p, p])
        this.left = new Line([p, p])
        this.right = new Line([p, p])
        this.top.strokeColor = rgb(1, 1, 1)
        this.bottom.strokeColor = rgb(1, 1, 1)
        this.left.strokeColor = rgb(1, 1, 1)
        this.right.strokeColor = rgb(1, 1, 1)
        this.add(this.top)
        this.add(this.bottom)
        this.add(this.left)
        this.add(this.right)
    }
    
    update(q) {
        let xMin = Math.min(this.startPoint.x, q.x)
        let xMax = Math.max(this.startPoint.x, q.x)
        let yMin = Math.min(this.startPoint.y, q.y)
        let yMax = Math.max(this.startPoint.y, q.y)
        this.p1.x = xMin
        this.p1.y = yMin
        this.p2.x = xMax
        this.p2.y = yMin
        this.p3.x = xMax
        this.p3.y = yMax
        this.p4.x = xMin
        this.p4.y = yMax
        this.top.vertices = [this.p1, this.p2]
        this.bottom.vertices = [this.p3, this.p4]
        this.left.vertices = [this.p1, this.p4]
        this.right.vertices = [this.p2, this.p3]
    }
}


class CindyCanvas {
    
    constructor(p, width, height) {


        let script = document.createElement('script')
        script.setAttribute('type', 'text/x-cindyscript')
        let scriptID = 'csdraw' // + paper.cindyPorts.length
        script.setAttribute('id', scriptID)
        script.textContent = 'W(x, p) := 0.5*(1+sin(100*|x-p|)); colorplot([0,W(#, A0)+W(#, A1),0]);'
        //script.textContent = 'colorplot(seconds());'

        this.view = document.createElement('div')
        this.view.style.position = 'absolute'
        this.view.style.left =  p.x + "px"
        this.view.style.top = p.y + "px"
        
        let csView = document.createElement('div')
        let canvasID = 'CSCanvas' + paper.cindyPorts.length
        csView.setAttribute('id', canvasID)
        this.view.appendChild(csView)
        
        document.querySelector('#paper-container').insertBefore(this.view, document.querySelector('#paper-console'))
        document.body.appendChild(script)

        paper.cindyPorts.push({
            id: canvasID,
            width: width,
            height: height,
            transform: [{
              visibleRect: [0, 1, 1, 0]
            }]
          })

        this.points = [[0.4, 0.4], [0.3, 0.8]]


        CindyJS({
          scripts: "cs*",
          autoplay: true,
          ports: paper.cindyPorts,
            geometry: this.geometry()
        });
        
    }


    geometry() {
        let ret = []
        let i = 0
        for (let point of this.points) {
            ret.push({name: "A" + i, kind:"P", type:"Free", pos: point})
            i += 1
        }
        return ret
    }
    
    update() {
        
    }
    

}



function drag(e) {
    let dragPoint = new Vertex(pointerEventPageLocation(e))
    let mob = paper.constructedObjects[0]
    mob.view.style.left = (dragPoint.x + paper.mobOffsetFromCursor.x) + 'px'
    mob.view.style.top = (dragPoint.y + paper.mobOffsetFromCursor.y) + 'px'
}

function endDragging(e) {
    removePointerMove(paper, drag)
    removePointerUp(paper, endDragging)
}

function startDragging(p, mob) {
    console.log('startDragging of paper')
    let oldX = parseInt(mob.view.style.left.replace('px', ''))
    let oldY = parseInt(mob.view.style.top.replace('px', ''))
    let q = new Vertex(oldX, oldY)
    paper.mobOffsetFromCursor = q.subtract(p)
    
    addPointerMove(paper, drag)
    addPointerUp(paper, endDragging)
}

function startCreating(e) {
    e.preventDefault()
    e.stopPropagation()
    
    let p = new Vertex(pointerEventPageLocation(e))
    let mob = paper.constructedObjects[0] // the Cindy canvas (works only for one)

    if (paper.mode == 'drag') {
        startDragging(p, mob)
        return
    }
    
    
    removePointerDown(paper, startCreating)
    addPointerMove(paper, creativeMove)
    addPointerUp(paper, endCreating)

    creating = true
   
    paper.createdMobjects['freehand'] = new Freehand(p)
    p = snap(p)
    paper.createdMobjects['segment'] = new DrawnSegment(p)
    paper.createdMobjects['halfline'] = new DrawnHalfLine(p)
    paper.createdMobjects['fullline'] = new DrawnFullLine(p)
    paper.createdMobjects['circle'] = new DrawnCircle(p)
    paper.createdMobjects['cindy'] = new DrawnRectangle(p)
    
    paper.changeMode(paper.mode)
    paper.startPoint = p
    paper.currentPoint = p

}

function snap(p) {
    for (let q of paper.constructedPoints) {
        if (p.subtract(q).norm() < 10) { return q }
    }
    return p
    
}

function creativeMove(e) {
    e.preventDefault()
    e.stopPropagation()

    let p = new Vertex(pointerEventPageLocation(e))
    
    for (let mode of paper.modes) {
        if (mode == 'freehand') {
            paper.createdMobjects['freehand'].update(p)
        } else if (mode != 'drag') {
            paper.createdMobjects[mode].update(snap(p))
        }
    }

    
    paper.currentPoint = p
}



function endCreating(e) {
    
    e.preventDefault()
    e.stopPropagation()
    
    let p = paper.currentPoint
    
    removePointerMove(paper, creativeMove)
    removePointerUp(paper, endCreating)
    addPointerDown(paper, startCreating)

    creating = false

    
    if (['point', 'segment', 'halfline', 'fullline', 'circle'].includes(paper.mode)) {
        //paper.constructedObjects.push(paper.createdMobjects[paper.mode])
        paper.constructedPoints.push(paper.startPoint)
        paper.constructedPoints.push(p)
    }

    if (paper.mode == 'cindy') {
        let origin = paper.createdMobjects['cindy'].p1
        let lrCorner = paper.createdMobjects['cindy'].p3
        let cindyWidth = lrCorner.x - origin.x
        let cindyHeight = lrCorner.y - origin.y
        paper.createdMobjects['cindy'].view.remove()
        paper.constructedObjects.push(new CindyCanvas(origin, cindyWidth, cindyHeight))
    }

    for (let mode of paper.modes) {
        if (mode == 'drag') { continue }
        if (paper.mode != mode) {
            paper.createdMobjects[mode].hide()
        } else {
            paper.createdMobjects[mode].show()
        }
    }
    paper.createdMobjects = {}
    
}

let useCapture = true
addPointerDown(paper, startCreating, useCapture)

import { pointerEventPageLocation, rgb, addPointerDown, removePointerDown, addPointerMove, removePointerMove, addPointerUp, removePointerUp, logInto, isTouchDevice } from './modules/helpers.js'
import { Vertex } from './modules/transform.js'
import { MGroup } from './modules/mobject.js'
import { Circle } from './modules/shapes.js'
import { Line } from './modules/arrows.js'

let creating = false
let paper = document.querySelector('#paper')
paper.mode = 'freehand'
paper.modes = ['freehand', 'segment'] //, 'halfline', 'fullline', 'circle', 'cindy']
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
        this.strokeColor = paper.colors[paper.color]
        this.updateWithLines(q)
    }
}


class DrawnPoint extends Circle {
    constructor(pos) {
        super(5)
        this.midPoint = pos
        this.draggable = true
    }
}

class DrawnSegment extends Line {
}

class DrawnHalfLine extends Line {
    constructor(vertices) {
        let startPoint = vertices[0]
        let endPoint = DrawnHalfLine.farOffEndPoint(vertices[0], vertices[1])
        super([startPoint, endPoint])
    }

    static farOffEndPoint(p, q) {
        return p.add(q.subtract(q.multiply(100)))
    }
}

function updateColor(newColor) {
    paper.color = newColor
    for (let mode in paper.modes) {
        let mobject = paper.createdMobjects[mode]
        if (mobject == undefined) { continue }
        mobject.strokeColor = paper.colors[paper.color]
        mobject.fillColor = paper.colors[paper.color]
        mobject.updateView()
    }
    return
}

function changeMode(newMode) {
    if (paper.colors[newMode] != undefined) {
        changeColor(newMode)
        return
    }

    paper.mode = newMode

    if (['segment', 'halfline', 'fullline', 'circle'].includes(newMode)) {
            for (let p of paper.createdPoints) { p.show() }
    } else {
        for (let p of paper.createdPoints) { p.hide() }
    }
    for (let mode of paper.modes) {
        

        let createdMobject = paper.createdMobjects[mode]
        if (createdMobject != undefined) {
            if (mode == paper.mode) { createdMobject.show() }
            else { createdMobject.hide() }
        }
    }
}


paper.changeMode = changeMode
paper.constructedObjects = []
paper.constructedPoints = []

let p0 = new Vertex([50, 50])
let q0 = p0
let dp0 = new DrawnPoint(p0)
let dq0 = new DrawnPoint(q0)
paper.constructedPoints = [dp0.midPoint, dq0.midPoint]
let l = new DrawnSegment([dp0.midPoint, dq0.midPoint])

addPointerMove(paper, function() {
        l.updateView.bind(l)
        console.log(paper.constructedPoints)
    }
)



function startCreating(e) {
    e.preventDefault()
    e.stopPropagation()
    
    let p = new Vertex(pointerEventPageLocation(e))
    let q = p.copy()

    removePointerDown(paper, startCreating)
    addPointerMove(paper, creativeMove)
    addPointerUp(paper, endCreating)

    creating = true

    paper.createdMobjects['freehand'] = new Freehand(p)
    let dp = new DrawnPoint()
    console.log(p, p.x, p.y)
    console.log(dp.midPoint, dp.midPoint.x, dp.midPoint.y)
    dp.midPoint = p
    console.log(dp.midPoint, dp.midPoint.x, dp.midPoint.y)

    let dq = new DrawnPoint()
    dq.midPoint.copyFrom(q)
    paper.add(dp)
    paper.add(dq)
    paper.createdPoints = [dp, dq]
    paper.createdMobjects['segment'] = new DrawnSegment([p, q])
    paper.createdMobjects['halfline'] = new DrawnHalfLine([p, q])

    paper.changeMode(paper.mode)
    paper.startPoint = p
    paper.currentPoint = p

}


function creativeMove(e) {
    e.preventDefault()
    e.stopPropagation()

    let q = new Vertex(pointerEventPageLocation(e))
    
    paper.createdPoints[1].midPoint.copyFrom(q)
    paper.createdMobjects['segment'].endPoint.copyFrom(q)
    paper.createdMobjects['halfline'].endPoint.copyFrom(q)

    for (let mode of paper.modes) {
        if (mode == 'freehand') {
            paper.createdMobjects[mode].update(q)
        } else {
            paper.createdMobjects[mode].updateView()
        }
    }
    
    paper.currentPoint = q
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
        paper.constructedObjects.push(paper.createdMobjects[paper.mode])
        paper.constructedPoints.push(paper.startPoint)
        paper.constructedPoints.push(p)
    }

}








addPointerDown(paper, startCreating)


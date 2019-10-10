import { pointerEventPageLocation, rgb, addPointerDown, removePointerDown, addPointerMove, removePointerMove, addPointerUp, removePointerUp, logInto, isTouchDevice } from './modules/helpers.js'
import { Vertex } from './modules/transform.js'
import { MGroup } from './modules/mobject.js'
import { Circle } from './modules/shapes.js'
import {Segment } from './modules/arrows.js'

export class Freehand extends MGroup {
    
    updateWithPoints(q) {
        let nbDrawnPoints = this.submobjects.length
        if (nbDrawnPoints > 0) {
            p = this.children[nbDrawnPoints - 1].midPoint
        }
        let pointDistance = 10
        let distance = ((p.x - q.x)**2 + (p.y - q.y)**2)**0.5
        let unitVector = new Vertex([(q.x - p.x)/distance, (q.y - p.y)/distance])
        for (var step = pointDistance; step < distance; step += pointDistance) {
            let x = p.x + step * unitVector.x + 0.5 * Math.random()
            let y = p.y + step * unitVector.y + 0.5 * Math.random()
            let newPoint = new Vertex([x, y])
            let c = new Circle({radius: 2})
            c.fillColor = this.strokeColor
            c.midPoint = new Vertex(newPoint)
            this.add(c)
        }
        let t = Math.random()
        let r = (1 - t) * 0.5 + t * 0.75
        let c = new Circle({radius: r, midPoint: new Vertex(q)})
        this.add(c)
    }
    
    updateWithLines(q) {

        let nbDrawnPoints = this.children.length
        let p = null
        if (nbDrawnPoints == 0) {
            p = q
        } else {
            p = this.children[nbDrawnPoints - 1].endPoint
        }
        let newLine = new Segment({startPoint: p, endPoint: q})
        newLine.strokeColor = this.strokeColor
        this.add(newLine)

    }
    
    updateFromTip(q) {
        this.updateWithLines(q)
    }
}

export class DrawnPoint extends Circle {

    constructor(argsDict) {
        super(argsDict)
        this.setDefaults({
            midPoint: Vertex.origin()
        })
        this.radius = 5
        this.draggable = true
    }

    updateFromTip(q) {
        if (q == undefined) { return }
        this.update({midPoint: q})
    }

    update(argsDict) {
        super.update(argsDict)
    }

}

export class DrawnSegment extends MGroup {
    
    constructor(argsDict) {
        super(argsDict)
        if (this.c1 == undefined) { this.c1 = new DrawnPoint({midPoint: this.startPoint}) }
        if (this.c2 == undefined) { this.c2 = new DrawnPoint({midPoint: this.startPoint}) }
        this.startPoint = this.c1.midPoint
        this.endPoint = this.c2.midPoint

        this.line = new Segment({startPoint: this.startPoint, endPoint: this.endPoint})

        this.dependents.push({
            dependent: this.line,
            properties: ['startPoint', 'endPoint'],
            function: this.drawingStartPoint,
            as: 'startPoint'
        })
        this.dependents.push({
            dependent: this.line,
            properties: ['startPoint', 'endPoint'],
            function: this.drawingEndPoint,
            as: 'endPoint'
        })

        this.c1.dependents.push({
            dependent: this,
            properties: ['anchor'],
            as: 'startPoint'
        })
        this.c2.dependents.push({
            dependent: this,
            properties: ['anchor'],
            as: 'endPoint'
        })

        this.add(this.c1)
        this.add(this.c2)
        this.add(this.line)
    }

    drawingStartPoint(args) { return args[0] }
    drawingEndPoint(args) { return args[1] }

    updateFromTip(q) {
        if (q == undefined) { return }
        this.c2.update({midPoint: q})
        //this.update()
    }

    update(argsDict) {
        this.vertices = [this.c1.midPoint, this.c2.midPoint]
        this.line.startPoint = this.drawingStartPoint(this.vertices)
        this.line.endPoint = this.drawingEndPoint(this.vertices)
        super.update(argsDict)
        // this.line.vertices = [this.drawingStartPoint(), this.drawingEndPoint()]
        // this.line.updateView()
    }
}

export class DrawnRay extends DrawnSegment {

    drawingEndPoint([p, q]) {
        if (p == q) {
            return p
        }
        let farOffX = p.x + 100 * (q.x - p.x)
        let farOffY = p.y + 100 * (q.y - p.y)
        return new Vertex(farOffX, farOffY)
    }

}

export class DrawnLine extends DrawnRay {

    drawingStartPoint() {
        if (this.startPoint == this.endPoint) {
            return this.startPoint
        }
        let farOffX = this.endPoint.x + 100 * (this.startPoint.x - this.endPoint.x)
        let farOffY = this.endPoint.y + 100 * (this.startPoint.y - this.endPoint.y)
        return new Vertex(farOffX, farOffY)
    }

}

export class DrawnCircle extends MGroup {
    
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


export class DrawnRectangle extends MGroup {
    
    constructor(p) {
        super()
        this.p1 = new Vertex(p)
        this.p2 = new Vertex(p)
        this.p3 = new Vertex(p)
        this.p4 = new Vertex(p)
        this.startPoint = new Vertex(p)
        this.top = new Segment([p, p])
        this.bottom = new Segment([p, p])
        this.left = new Segment([p, p])
        this.right = new Segment([p, p])
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


export class CindyCanvas {
    
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
        
        this.boundDragStart = this.dragStart.bind(this)
        this.boundDrag = this.drag.bind(this)
        this.boundDragEnd = this.dragEnd.bind(this)

        this.draggable = false
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

    get draggable() { return this._draggable }
    set draggable(newValue) {
        this._draggable = newValue
        if (this._draggable) {
            log('setting draggable')
            let useCapture = true
            addPointerDown(this.view, this.boundDragStart, useCapture)
        } else {
            removePointerDown(this.view, this.boundDragStart)
        }
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
    

    dragStart(e) {
        e.preventDefault()
        e.stopPropagation()
        this.dragStartX = e.clientX - parseInt(this.view.style.left.replace('px', ''))
        this.dragStartY = e.clientY - parseInt(this.view.style.top.replace('px', ''))

        let useCapture = true
        removePointerDown(this.view, this.boundDragStart)
        addPointerMove(this.view, this.boundDrag, useCapture)
        addPointerUp(this.view, this.boundDragEnd)
        
        log(e.clientX)
        log(e.clientY)
        log(this.dragStartX)
        log(this.dragStartY)
    }

    drag(e) {
        e.preventDefault()
        e.stopPropagation()
        let newX = e.clientX
        let newY = e.clientY
        this.view.style.left = (newX - this.dragStartX) + 'px'
        this.view.style.top = (newY - this.dragStartY) + 'px'
        log(newX)
        log(newY)
    }

    dragEnd(e) {
        e.preventDefault()
        e.stopPropagation()
        removePointerUp(this.view, this.boundDragEnd)
        removePointerMove(this.view, this.boundDrag)
        let useCapture = true
        addPointerDown(this.view, this.boundDragStart, useCapture)

    }
}




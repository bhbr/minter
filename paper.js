import { pointerEventPageLocation, rgb, addPointerDown, removePointerDown, addPointerMove, removePointerMove, addPointerUp, removePointerUp, logInto, isTouchDevice } from './modules/helpers.js'
import { Vertex } from './modules/transform.js'
import { Mobject, MGroup } from './modules/mobject.js'
import { Circle } from './modules/shapes.js'
import {Segment } from './modules/arrows.js'
import { Freehand, DrawnPoint, DrawnSegment, DrawnRay, DrawnLine } from './creating.js'


class Paper {

    constructor() {
        this.view = document.querySelector('#paper')
        this.view.mobject = this
        this.useCapture = true
        this.isCreating = false
        this.modes = ['freehand', 'point', 'segment', 'ray', 'line'] //, 'fullline', 'circle', 'cindy', 'drag']
        this.currentMode = 'freehand'
        this.colorPalette = {
            'black': rgb(0, 0, 0),
            'white': rgb(1, 1, 1),
            'red': rgb(1, 0, 0),
            'orange': rgb(1, 0.5, 0),
            'yellow': rgb(1, 1, 0),
            'green': rgb(0, 1, 0),
            'blue': rgb(0, 0, 1),
            'indigo': rgb(0.5, 0, 1),
            'violet': rgb(1, 0, 1)
        }
        this.currentColor = this.colorPalette['white']
        this.mobjectsCurrentlyBeingDrawn = {}
        this.constructedObjects = []
        this.snappablePoints = []
        this.cindyPorts = []
        this.boundStartCreating = this.startCreating.bind(this)
        this.boundCreativeMove = this.creativeMove.bind(this)
        this.boundEndCreating = this.endCreating.bind(this)
        this.boundDrag = this.drag.bind(this)
        this.boundEndDragging = this.endDragging.bind(this)
        addPointerDown(this.view, this.boundStartCreating, this.useCapture)
    }

    changeColorByName(newColorName) {
        let newColor = this.colorPalette[newColorName]
        this.changeColor(newColor)
    }

    changeColor(newColor) {
        this.currentColor = newColor
        for (let [key, mob] of this.mobjectsCurrentlyBeingDrawn.entries()) {
                mob.strokeColor = this.currentColor
                mob.fillColor = this.currentColor
            }
    }

    changeMode(newMode) {
        this.currentMode = newMode
        
        if (newMode == 'drag') {
            // forbid all objects to handle input themselves
            for (let mob of this.constructedObjects) {
                mob.view.style['pointer-events'] = 'none'
            }
            return
        } else {
            // give  them back input control
            for (let mob of this.constructedObjects) {
                mob.view.style['pointer-events'] = 'auto'
            }
        }

        for (let mob of Object.values(this.mobjectsCurrentlyBeingDrawn)) {
            mob.hide()
        }
        try {
            this.mobjectsCurrentlyBeingDrawn[this.currentMode].show()
        } catch { }
    }

    snap(p) {
        for (let q of this.snappablePoints) {
            if (p.subtract(q.anchor).norm() < 10) { return q.anchor }
        }
        return p
    }

    targetMobject(e) {
        let targetMobjectView = e.target
        while (targetMobjectView.mobject == undefined) {
            targetMobjectView = targetMobjectView.parentNode
        }
        return targetMobjectView.mobject
    }

    startCreating(e) {
        e.preventDefault()

        let mob = this.targetMobject(e)
        let p = new Vertex(pointerEventPageLocation(e))

        if (mob != this) {
            if ((mob.draggable && this.currentMode == 'freehand') || this.currentMode == 'drag') {
                this.startDragging(p, mob)
                return
            }
        }
        
        e.stopPropagation()
        
        this.isCreating = true
        
        removePointerDown(this.view, this.boundStartCreating)
        addPointerMove(this.view, this.boundCreativeMove)
        addPointerUp(this.view, this.boundEndCreating)
       
        let freehand = new Freehand({startPoint: p, endPoint: p})
        this.mobjectsCurrentlyBeingDrawn['freehand'] = freehand
        p = this.snap(p)
        let point = undefined
        if (mob instanceof DrawnPoint) { point = mob }
        else { point = new DrawnPoint({midPoint: p}) }


        this.mobjectsCurrentlyBeingDrawn['point'] = point
        let segment = new DrawnSegment({c1: point, c2: point})
        this.mobjectsCurrentlyBeingDrawn['segment'] = segment
        let ray = new DrawnRay({c1: point, c2: point})
        this.mobjectsCurrentlyBeingDrawn['ray'] = ray
        let line = new DrawnLine({c1: point, c2: point})
        this.mobjectsCurrentlyBeingDrawn['line'] = line
        // paper.createdMobjects['circle'] = new DrawnCircle(p)
        // paper.createdMobjects['cindy'] = new DrawnRectangle(p)
        
        this.add(freehand)
        this.add(point)
        this.add(segment)
        this.add(ray)
        this.add(line)

        this.changeMode(this.currentMode)
        this.startPoint = p
        this.currentPoint = p

    }


    creativeMove(e) {
        e.preventDefault()
        e.stopPropagation()

        let p = new Vertex(pointerEventPageLocation(e))
        
        for (let mode of this.modes) {
            if (mode == 'freehand') {
                this.mobjectsCurrentlyBeingDrawn['freehand'].updateFromTip(p)
            } else if (mode != 'drag') {
                this.mobjectsCurrentlyBeingDrawn[mode].updateFromTip(this.snap(p))
            }
        }

        this.currentPoint = p
    }


    endCreating(e) {
        
        e.preventDefault()
        e.stopPropagation()
        
        let p = this.currentPoint
        
        removePointerMove(this.view, this.boundCreativeMove)
        removePointerUp(this.view, this.boundEndCreating)
        addPointerDown(this.view, this.boundStartCreating)

        this.isCreating = false

        switch (this.currentMode) {
        case 'point':
            this.constructedObjects.push(this.mobjectsCurrentlyBeingDrawn['point'])
            this.snappablePoints.push(this.mobjectsCurrentlyBeingDrawn['point'])
            break
        case 'segment':
        case 'ray':
        case 'line':
            let mob = this.mobjectsCurrentlyBeingDrawn[this.currentMode]
            this.constructedObjects.push(mob.c1)
            this.constructedObjects.push(mob.c2)
            this.constructedObjects.push(mob.line)
            this.snappablePoints.push(mob.c1)
            this.snappablePoints.push(mob.c2)
            break
        }

        // if (this.currentMode == 'cindy') {
        //     let origin = this.createdMobjects['cindy'].p1
        //     let lrCorner = this.createdMobjects['cindy'].p3
        //     let cindyWidth = lrCorner.x - origin.x
        //     let cindyHeight = lrCorner.y - origin.y
        //     this.createdMobjects['cindy'].view.remove()
        //     this.constructedObjects.push(new CindyCanvas(origin, cindyWidth, cindyHeight))
        // }

        for (let mode of this.modes) {
            if (mode == 'drag') { continue }
            if (this.currentMode != mode) {
                this.mobjectsCurrentlyBeingDrawn[mode].hide()
            } else {
                this.mobjectsCurrentlyBeingDrawn[mode].show()
            }
        }
        this.mobjectsCurrentlyBeingDrawn = {}
        
    }

    add(mobject) {
        this.view.appendChild(mobject.view)
    }






    startDragging(p, mob) {
        let q = mob.anchor
        this.mobOffsetFromCursor = q.subtract(p)
        this.draggedMobject = mob
        
        addPointerMove(this.view, this.boundDrag)
        addPointerUp(this.view, this.boundEndDragging)
    }


    drag(e) {
        let dragPoint = new Vertex(pointerEventPageLocation(e))
        let anchor = this.draggedMobject.anchor
        anchor.copyFrom(dragPoint.add(this.mobOffsetFromCursor))
        // we may need the next two lines for Cindy canvases
        // mob.view.style.left = (dragPoint.x + this.mobOffsetFromCursor.x) + 'px'
        // mob.view.style.top = (dragPoint.y + this.mobOffsetFromCursor.y) + 'px'
        this.draggedMobject.anchor = anchor
        this.draggedMobject.update()
    }

    endDragging(e) {
        removePointerMove(this.view, this.boundDrag)
        removePointerUp(this.view, this.boundEndDragging)
        this.draggedMobject = undefined
    }

}


let paper = new Paper({view: document.querySelector('#paper')})










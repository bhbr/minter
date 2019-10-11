import { pointerEventPageLocation, rgb, addPointerDown, removePointerDown, addPointerMove, removePointerMove, addPointerUp, removePointerUp, logInto, isTouchDevice } from './modules/helpers.js'
import { Vertex } from './modules/transform.js'
import { Mobject, MGroup } from './modules/mobject.js'
import { Circle, DrawnCircle } from './modules/shapes.js'
import { Segment, Ray, Line } from './modules/arrows.js'
import { Freehand, FreePoint } from './creating.js'


class Paper {

    constructor() {
        this.view = document.querySelector('#paper')
        this.view.mobject = this
        this.useCapture = true
        this.isCreating = false
        this.modes = ['freehand', 'drag', 'segment', 'ray', 'line'] //, 'fullline', 'circle', 'cindy', 'drag']
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
        this.cindyPorts = []
        this.boundPointerDown = this.pointerDown.bind(this)
        this.boundPointerMove = this.pointerMove.bind(this)
        this.boundPointerUp = this.pointerUp.bind(this)
        this.boundDrag = this.drag.bind(this)
        this.boundEndDragging = this.endDragging.bind(this)
        addPointerDown(this.view, this.boundPointerDown, this.useCapture)
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

    targetMobject(e) {
        let targetMobjectView = e.target
        while (targetMobjectView.mobject == undefined) {
            targetMobjectView = targetMobjectView.parentNode
        }
        return targetMobjectView.mobject
    }

    createMobject(dp, dq) {
        switch (this.currentMode) {
        case 'segment':
            return new Segment({startPoint: dp.anchor, endPoint: dq.anchor})
        }
        return undefined
    }

    pointerDown(e) {
        e.preventDefault()
        e.stopPropagation()
        let target = this.targetMobject(e)
        let p = new Vertex(pointerEventPageLocation(e))

        if (target != this && ['freehand', 'drag'].includes(this.currentMode)) {
            this.startDragging(p, target)

            return
        }

        if (target instanceof FreePoint) {
            this.createFromExistingPoint(e, target)
        }

        if (target == this) {
            if (this.currentMode == 'freehand') {
                let freehand = new Freehand({startPoint: p, endPoint: p.copy()})
                console.log(freehand)
                this.mobjectsCurrentlyBeingDrawn['freehand'] = freehand
                this.add(freehand)
                addPointerMove(this.view, this.boundPointerMove)
                addPointerUp(this.view, this.boundPointerUp)
            } else {
                let dp = new FreePoint({anchor: p})
                this.add(dp)
                this.createFromExistingPoint(e, dp)
            }
        }

    }

    createFromExistingPoint(e, dp) {

        let p = new Vertex()
        p.copyFrom(dp.anchor)
        let dq = new FreePoint({anchor: p})

        switch (this.currentMode) {
        case 'segment':
            let s = new Segment({startPoint: dp.anchor, endPoint: dq.anchor})
            this.add(dq)
            this.add(s)
            this.update()
            this.startDragging(new Vertex(pointerEventPageLocation(e)), dq)
            break

        case 'ray':
            let r = new Ray({startPoint: dp.anchor, endPoint: dq.anchor})
            this.add(dq)
            this.add(r)
            this.update()
            this.startDragging(new Vertex(pointerEventPageLocation(e)), dq)
            break

        case 'line':
            let l = new Line({startPoint: dp.anchor, endPoint: dq.anchor})
            this.add(dq)
            this.add(l)
            this.update()
            this.startDragging(new Vertex(pointerEventPageLocation(e)), dq)
            break

        case 'circle':
            let c = new DrawnCircle({midPoint: dp.anchor, outerPoint: dq.anchor})
            this.add(dq)
            this.add(c)
            this.update()
            this.startDragging(new Vertex(pointerEventPageLocation(e)), dq)
            break
        }
    }

    pointerMove(e) {
        let p = new Vertex(pointerEventPageLocation(e))
        let fh = this.mobjectsCurrentlyBeingDrawn['freehand']
        fh.updateFromTip(p)
    }

    pointerUp(e) {
        removePointerMove(this.view, this.boundPointerMove)
        this.mobjectsCurrentlyBeingDrawn = {}
    }

    snappablePoints() {
        let retArr = []
        for (let mob of this.constructedObjects) {
            if (mob instanceof FreePoint) {
                retArr.push(mob.anchor)
            }
        }
        console.log(retArr)
        return retArr
    }

    snap(dp) {
        let p = dp.anchor
        for (let q of this.snappablePoints()) {
            let d = p.subtract(q).norm()
            if (d < 10 && q != p) {
                p.copyFrom(q)
            }
        }
    }

    // startCreating(e) {
    //     console.log('starting')
    //     e.preventDefault()
    //     let mob = this.targetMobject(e)
    //     let p = new Vertex(pointerEventPageLocation(e))
    //     let dp = new FreePoint({anchor: p})

    //     let freehand = new Freehand({startPoint: p, endPoint: p})
    //     this.mobjectsCurrentlyBeingDrawn['freehand'] = freehand
    //     this.add(freehand)

    //     if (mob != this) {
    //         if (['freehand', 'drag'].includes(this.currentMode)) {
    //             this.startDragging(p, mob)
    //         } else {
    //             dp = mob
    //         }
    //     }

    //     let dq = new FreePoint({anchor: p.copy()})
    //     let createdMob = this.createMobject(dp, dq)
    //     if (createdMob == undefined) { return }
    //     this.add(dp)
    //     this.add(dq)
    //     this.add(createdMob)
    //     this.constructedObjects.push(dp)
    //     this.constructedObjects.push(dq)
    //     this.constructedObjects.push(createdMob)
    //     this.mobjectsCurrentlyBeingDrawn[this.currentMode] = createdMob
    //     this.startDragging(p, dq)
        
    //     removePointerDown(this.view, this.boundStartCreating)
    //     addPointerMove(this.view, this.boundCreativeMove)
    //     addPointerUp(this.view, this.boundEndCreating)






    //     // if (mob != this) {
    //     //     if ((mob.draggable && this.currentMode == 'freehand') || this.currentMode == 'drag') {
    //     //         this.startDragging(p, mob)
    //     //         return
    //     //     }
    //     // } else {
    //     //     let dp = new FreePoint({anchor: p})
    //     //     this.add(dp)
    //     //     this.constructedObjects.push(dp)
    //     // }

    //     // this.isCreating = true
    //     // let dq = new FreePoint({anchor: p})
    //     // this.add(dq)
    //     // this.constructedObjects.push(dq)
    //     // this.startDragging(p, dq)
        
    //     // e.stopPropagation()
        
    //     // this.isCreating = true
       

        
    //     // let dp = new FreePoint({anchor: p})
    //     // let segment = new Segment({startPoint: dp.anchor, endPoint: dq.anchor})

        
    //     // this.add(freehand)
    //     // this.add(segment)
    //     // this.constructedObjects.push(segment)

    //     this.changeMode(this.currentMode)

    // }


    // creativeMove(e) {
    //     console.log('moving')
    //     e.preventDefault()
    //     e.stopPropagation()


    //     for (let mode of this.modes) {
    //         if (mode == 'freehand') {
    //             let p = pointerEventPageLocation(e)
    //             this.mobjectsCurrentlyBeingDrawn['freehand'].updateFromTip(p)
    //         } else if (mode != 'drag') {
    //             console.log('not dragging')
    //             let targetMobject = this.targetMobject(e)
    //             if (targetMobject == this) { return }
    //             this.snap(targetMobject)
    //         }
    //     }

    //     for (let mob of this.constructedObjects) { mob.update() }
    // }


    // endCreating(e) {
        
    //     e.preventDefault()
    //     e.stopPropagation()

    //     let p = pointerEventPageLocation(e)
        
    //     removePointerMove(this.view, this.boundCreativeMove)
    //     removePointerUp(this.view, this.boundEndCreating)
    //     addPointerDown(this.view, this.boundStartCreating)

    //     this.isCreating = false

    //     switch (this.currentMode) {
    //     case 'point':
    //         this.constructedObjects.push(this.mobjectsCurrentlyBeingDrawn['point'])
    //         this.snappablePoints.push(this.mobjectsCurrentlyBeingDrawn['point'])
    //         break
    //     case 'segment':
    //     case 'ray':
    //     case 'line':
    //         break
    //     }

    //     // if (this.currentMode == 'cindy') {
    //     //     let origin = this.createdMobjects['cindy'].p1
    //     //     let lrCorner = this.createdMobjects['cindy'].p3
    //     //     let cindyWidth = lrCorner.x - origin.x
    //     //     let cindyHeight = lrCorner.y - origin.y
    //     //     this.createdMobjects['cindy'].view.remove()
    //     //     this.constructedObjects.push(new CindyCanvas(origin, cindyWidth, cindyHeight))
    //     // }

    //     for (let mode of this.modes) {
    //         if (mode == 'drag') { continue }
    //         if (this.currentMode != mode) {
    //             this.mobjectsCurrentlyBeingDrawn[mode].hide()
    //         } else {
    //             this.mobjectsCurrentlyBeingDrawn[mode].show()
    //         }
    //     }
    //     this.mobjectsCurrentlyBeingDrawn = {}
        
    // }

    add(mobject) {
        this.view.appendChild(mobject.view)
        this.constructedObjects.push(mobject)
    }


    startDragging(p, mob) {
        if (!mob.draggable) { return }
        let q = mob.anchor
        this.mobOffsetFromCursor = q.subtract(p)
        this.draggedMobject = mob
        
        addPointerMove(this.view, this.boundDrag)
        addPointerUp(this.view, this.boundEndDragging)
    }


    drag(e) {
        let dragPoint = new Vertex(pointerEventPageLocation(e))
        //this.draggedMobject.update({anchor: dragPoint.add(this.mobOffsetFromCursor)})
        
        this.draggedMobject.anchor = dragPoint.add(this.mobOffsetFromCursor)
        this.snap(this.draggedMobject)
        // we may need the next two lines for Cindy canvases
        // mob.view.style.left = (dragPoint.x + this.mobOffsetFromCursor.x) + 'px'
        // mob.view.style.top = (dragPoint.y + this.mobOffsetFromCursor.y) + 'px'
        this.update()
    }

    update() {
        for (let mob of this.constructedObjects) { mob.update() }
    }

    endDragging(e) {
        removePointerMove(this.view, this.boundDrag)
        removePointerUp(this.view, this.boundEndDragging)
        this.draggedMobject = undefined
    }

}


let paper = new Paper({view: document.querySelector('#paper')})









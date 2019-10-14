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
        this.draggedPoint = undefined
        this.constructionModes = ['segment']
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

        this.freehands = []
        this.freePoints = []
        this.constructions = []
        this.cindyPorts = []

        this.newFreehand = undefined
        this.newPoints = []
        this.newConstructions = {}
        this.newCindyPort = undefined

        this.boundPointerDown = this.pointerDown.bind(this)
        this.boundPointerMove = this.pointerMove.bind(this)
        this.boundPointerUp = this.pointerUp.bind(this)
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
        if (!this.isCreating) { return }
        for (let mob of Object.values(this.newConstructions)) {
            mob.hide()
        }
        switch (this.currentMode) {
        case 'freehand':
            this.newPoints[0].hide()
            this.newPoints[1].hide()
            this.newFreehand.show()
            break

        case 'segment':
            fp1.show()
            fp2.show()
            this.newFreehand.hide()
            this.newConstructions['segment'].show()
            break
        }
    }


    targetMobject(e) {
    // which mobject have we clicked on?
    // (event detection completely handled by paper except maybe for Cindy)
        //if (!(e.target.mobject instanceof CindyCanvas || e.target.mobject instanceof FreePoint)) {
        let tm = undefined
        if (this.draggedPoint != undefined) {
            tm = this.draggedPoint
            console.log('found a dragged point: ', tm)
            return tm
        }
        let p = new Vertex(pointerEventPageLocation(e))
        console.log(p)
        console.log(this.freePoints)
        for (let point of this.freePoints) {
            if (point.anchor.subtract(p).norm() < 10) {
                tm = point
                console.log('found a close point:', tm)
                return tm
            }
        }
        tm = e.target.parentNode.mobject
        if (tm != undefined) {
            // maybe the event got detected by a point, but by its path
            console.log('event on path, target is ', tm)
            return tm
        } else {
            // paper or Cindy canvas
            tm = e.target.mobject
            console.log('should be paper or Cindy canvas: ', e, tm)
            return tm
        }
    }

    pointerDown(e) {
        e.preventDefault()
        e.stopPropagation()
        let target = this.targetMobject(e)
        let p = new Vertex(pointerEventPageLocation(e))

        switch (target.constructor.name) {
        case 'Paper':
            this.handlePointerDownOnPaper(target, p)
            // meaning we create two new points
            break
        case 'FreePoint':
            this.handlePointerDownOnFreePoint(target, p)
            // meaning we either drag a point or create something starting there
            break
        }
        this.update()

        addPointerMove(this.view, this.boundPointerMove)
        addPointerUp(this.view, this.boundPointerUp)
        removePointerDown(this.view, this.boundPointerDown)
    }

    pointerMove(e) {
        e.preventDefault()
        e.stopPropagation()
        let target = this.targetMobject(e)
        let p = new Vertex(pointerEventPageLocation(e))

        this.handlePointerMove(target, p)
    }

    pointerUp(e) {
        e.preventDefault()
        e.stopPropagation()
        let target = this.targetMobject(e)
        let p = new Vertex(pointerEventPageLocation(e))

        this.handlePointerUp(target, p)

        addPointerDown(this.view, this.boundPointerDown)
        removePointerMove(this.view, this.boundPointerMove)
        removePointerUp(this.view, this.boundPointerUp)
    }





    handlePointerDownOnPaper(target, p) {
        // start a new construction from nowhere
        // including a freehand drawing)
        console.log('handling pointer down on paper')
        let fp1 = new FreePoint({anchor: p})
        let fp2 = new FreePoint({anchor: p.copy()})
        let fh = new Freehand({anchor: Vertex.origin()})
        let s = new Segment({startPoint: fp1.anchor, endPoint: fp2.anchor})
        // more geometric objects to follow
        this.add(fp1)
        this.add(fp2)
        this.add(fh)
        this.add(s)

        this.newPoints = [fp1, fp2]
        this.newFreehand = fh
        this.newConstructions['segment'] = s

        for (let mob of Object.values(this.newConstructions)) {
            mob.hide()
        }
        for (let point of Object.values(this.newPoints)) {
            point.hide()
        }

        // show the relevant objects
        this.changeMode(this.currentMode)



    }

    handlePointerDownOnFreePoint(target, p) {
        console.log('handling pointer down on freepoint', target)
        switch (this.currentMode) {
        case 'freehand':
        case 'drag':
            this.draggedPoint = target
            this.currentMode = 'drag'
            break
        case 'segment':

            break
        }        
    }

    handlePointerMove(target, p) {
        console.log('handling pointer move')
        switch (this.currentMode) {
        case 'freehand':
            this.newFreehand.updateFromTip(p)
            // the constructions (old and new) should self-update
            break
        case 'drag':
            this.draggedPoint.anchor.copyFrom(p)
        case 'segment':
            // shouldn't happen
            break
        }
        this.update()
    }


    handlePointerUp(target, p) {
        console.log('handling pointer up')
        this.draggedPoint = undefined
        console.log(this.currentMode)
        switch (this.currentMode) {
        case 'freehand':
            this.freehands.push(this.newFreehand)
            this.newFreehand = undefined
            this.newPoints[0].view.remove()
            this.newPoints[1].view.remove()
            this.newPoints = []
            for (let mob of Object.values(this.newConstructions)) {
                mob.view.remove()
            }
            this.newConstructions = {}
            break
        case 'segment':
        case 'drag':
            this.currentMode = 'freehand'
            break
        }
        this.update()
    }







    add(mobject) {
        this.view.appendChild(mobject.view)
    }



    update() {
        for (let point of this.freePoints) { point.update() }
        for (let point of this.newPoints) { point.update() }
        for (let mob of this.constructions) { mob.update() }
        for (let mob of Object.values(this.newConstructions)) { mob.update() }
    }


}


let paper = new Paper({view: document.querySelector('#paper')})




let a = new FreePoint({anchor: new Vertex(50, 50)})
paper.add(a)
paper.freePoints.push(a)
let b = new FreePoint({anchor: new Vertex(150, 200)})
paper.add(b)
paper.freePoints.push(b)
let c = new DrawnCircle({midPoint: a.anchor, outerPoint: b.anchor})
paper.add(c)
paper.constructions.push(c)





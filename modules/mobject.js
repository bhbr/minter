import { Vertex, Transform } from './transform.js'
import { remove, logInto, stringFromPoint, rgb, pointerEventPageLocation, addPointerDown, removePointerDown, addPointerMove, removePointerMove, addPointerUp, removePointerUp } from './helpers.js'

export class Mobject {

    constructor(argsDict) {
        this.view = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        this.view.setAttribute('class', this.constructor.name)
        this.view.mobject = this
        this.eventTarget = null
        this.setAttributes(argsDict)
        this.setDefaults({
            transform: Transform.identity(),
            anchor: Vertex.origin(),
            vertices: [],
            children: [],
            dependents: [],
            strokeWidth: 1,
            strokeColor: rgb(1, 1, 1),
            fillColor: rgb(1, 1, 1),
            passAlongEvents: false, // to event target
            visible: true,
            draggable: false // by outisde forces
        })
        this.show()

        this.boundPointerDown = this.pointerDown.bind(this)
        this.boundPointerMove = this.pointerMove.bind(this)
        this.boundPointerUp = this.pointerUp.bind(this)
        this.boundEventTargetMobject = this.eventTargetMobject.bind(this)
        addPointerDown(this.view, this.boundPointerDown)

        this.savedSelfHandlePointerDown = this.selfHandlePointerDown
        this.savedSelfHandlePointerMove = this.selfHandlePointerMove
        this.savedSelfHandlePointerUp = this.selfHandlePointerUp
        this.disableDragging()

        // this.boundCreatePopover = this.createPopover.bind(this)
        // this.boundDismissPopover = this.dismissPopover.bind(this)
        // this.boundMouseUpAfterCreatingPopover = this.mouseUpAfterCreatingPopover.bind(this)

    }

    enableDragging() {
        this.savedSelfHandlePointerDown = this.selfHandlePointerDown
        this.savedSelfHandlePointerMove = this.selfHandlePointerMove
        this.savedSelfHandlePointerUp = this.selfHandlePointerUp
        this.selfHandlePointerDown = this.startSelfDragging
        this.selfHandlePointerMove = this.selfDragging
        this.selfHandlePointerUp = this.endSelfDragging
    }

    disableDragging() {
        this.selfHandlePointerDown = this.savedSelfHandlePointerDown
        this.selfHandlePointerMove = this.savedSelfHandlePointerMove
        this.selfHandlePointerUp = this.savedSelfHandlePointerUp
    }

    eventTargetMobject(e) {
        let t = e.target
        if (t.tagName == 'path') { t = t.parentNode }
        if (t == this.view) { return this }
        let targetViewChain = [t]
        while (t != undefined && t != this.view) {
            t = t.parentNode
            targetViewChain.push(t)
        }
        t = targetViewChain.pop()
        t = targetViewChain.pop()
        while (t != undefined) {
            if (t.mobject != undefined) { return t.mobject }
            t = targetViewChain.pop() 
        }
        return this
    }

    pointerDown(e) {
        e.stopPropagation()
        removePointerDown(this.view, this.boundPointerDown)
        addPointerMove(this.view, this.boundPointerMove)
        addPointerUp(this.view, this.boundPointerUp)

        this.eventTarget = this.boundEventTargetMobject(e)
        if (this.eventTarget != this && this.passAlongEvents) {
            this.eventTarget.pointerDown(e)
        } else {
            this.selfHandlePointerDown(e)
        }
        this.update()
    }

    pointerMove(e) {
        e.stopPropagation()

        if (this.eventTarget != this && this.passAlongEvents) {
            this.eventTarget.pointerMove(e)
        } else {
            this.selfHandlePointerMove(e)
        }
        this.update()
    }

    pointerUp(e) {
        e.stopPropagation()
        removePointerMove(this.view, this.boundPointerMove)
        removePointerUp(this.view, this.boundPointerUp)
        addPointerDown(this.view, this.boundPointerDown)

        if (this.eventTarget != this && this.passAlongEvents) {
            this.eventTarget.pointerUp(e)
        } else {
            this.selfHandlePointerUp(e)
        }
        this.eventTarget = null
        this.update()
    }


    selfHandlePointerDown(e) { }
    selfHandlePointerMove(e) { }
    selfHandlePointerUp(e) { }

    setAttributes(argsDict) {
        argsDict = argsDict || {}
        for (let [key, value] of Object.entries(argsDict)) {
            if (this[key] instanceof Vertex) { this[key].copyFrom(value) }
            else { this[key] = value }
        }
    }

    setDefaults(argsDict) {
        for (let [key, value] of Object.entries(argsDict)) {
            if (this[key] != undefined) { continue }
            if (this[key] instanceof Vertex) { this[key].copyFrom(value) }
            else { this[key] = value }
        }

    }

    get parent() { return this._parent }
    set parent(newValue) {
        this.view.remove()
        this._parent = newValue
        if (newValue == undefined) { return }
        newValue.add(this)
        if (this.parent.visible) { this.show() }
        else { this.hide() }
    }

    globalTransform() {
        let t = Transform.identity()
        let mob = this
        while (mob && mob.transform instanceof Transform) {
            t.leftComposeWith(mob.transform)
            mob = mob.parent
        }
        return t
    }

    globalVertices() {
        let returnValue = this.globalTransform().appliedTo(this.vertices)
        if (returnValue == undefined) { return [] }
        else { return returnValue }
    }

    update(argsDict) {
        this.setAttributes(argsDict || {})

        if (Object.values(this).includes(undefined)) { return }

        for (let submob of this.children || []) { submob.update() }
        for (let mob of this.dependents || []) { mob.update() }

        if (this.popover != undefined) {
            this.popover.anchor = this.anchor.translatedBy(this.rightEdge())
        }

        //this.transform.recenter()
        this.transform.e = this.anchor.x
        this.transform.f = this.anchor.y
        this.updateView()
    }


    updateView() {
        if (this.view == undefined) { return }
    }


    get fillColor() { return this.view.fill }
    set fillColor(newValue) {
        this.view.fill = newValue
        if (this.children == undefined) { return }
        for (let submob of this.children || []) {
            submob.fillColor = newValue
        }
        this.updateView()
    }

    get fillOpacity() { return this.view.fillOpacity }
    set fillOpacity(newValue) {
        this.view.fillOpacity = newValue

        // TODO: rethink this (commented out for circles)

//         for (let submob of this.submobjects) {
//             submob.fillOpacity = newValue
//         }
        this.updateView()
    }

    get strokeColor() { return this.view.style.stroke }
    set strokeColor(newValue) {
        this.view.style.stroke = newValue
        if (this.children == undefined) { return }
        for (let submob of this.children || []) {
            submob.strokeColor = newValue
        }
        this.updateView()
    }

    get strokeWidth() { return this.view.strokeWidth }
    set strokeWidth(newValue) {
        this.view.strokeWidth = newValue
        for (let submob of this.children || []) {
            submob.strokeWidth = newValue
        }
        this.updateView()
    }


    add(submob) {
        if (submob.parent != this) { submob.parent = this }
        if (!this.children.includes(submob)) {
            this.children.push(submob)
        }
        this.view.appendChild(submob.view)
        submob.updateView()
    }

    remove(submob) {
        submob.view.remove()
        remove(this.children, submob)
        submob.parent = undefined
    }

    get transform() {
        if (this._transform == undefined) {
            this._transform = Transform.identity()
        }
        return this._transform
    }
    set transform(newValue) { this._transform.copyFrom(newValue) }

    get anchor() {
        return this._anchor
    }
    set anchor(newValue) {
        if (this._anchor == undefined) { this._anchor = newValue }
        else { this._anchor.copyFrom(newValue) }
        this.transform.centerAt(newValue)
        //this.update()
    }



    hide() {
        this.visible = false
        if (this.view != undefined) {
            this.view.style["visibility"] = "hidden"
        }
        for (let submob of this.children) { submob.hide() } // we have to propagate invisibility
        this.updateView()
    }

    show() {
        this.visible = true
        if (this.view != undefined) {
            this.view.style["visibility"] = "visible"
        }
        for (let submob of this.children) { submob.show() } // we have to propagate visibility bc we have to for invisibility
        this.updateView()
    }

    rightEdge() { return Vertex.origin() }



    startSelfDragging(e) {
        this.dragPointStart = new Vertex(pointerEventPageLocation(e))
        this.dragAnchorStart = this.anchor.copy()
    }

    selfDragging(e) {
        let dragPoint = new Vertex(pointerEventPageLocation(e))
        let dr = dragPoint.subtract(this.dragPointStart)
        this.anchor.copyFrom(this.dragAnchorStart.add(dr))
        this.update()
    }

    endSelfDragging(e) {
        this.dragPointStart = undefined
        this.dragAnchorStart = undefined
    }





    createPopover(e) {
        this.popover = new Popover(this, 200, 300, 'right')
        paper.add(this.popover)
        //paper.addEventListener('mousedown', this.boundDismissPopover)
        this.view.removeEventListener('dblclick', this.boundCreatePopover)
        this.view.removeEventListener('mousedown', this.boundDragStart)
        paper.removeEventListener('mousemove', this.boundDrag)
        removeLongPress(this.view)
        this.view.addEventListener('mouseup', this.boundMouseUpAfterCreatingPopover)
    }

    mouseUpAfterCreatingPopover(e) {
        this.view.addEventListener('mousedown', this.boundDragStart)
        this.view.removeEventListener('mouseup', this.boundMouseUpAfterCreatingPopover)
    }

    dismissPopover(e) {
        if (this.popover == undefined) { return }
        if (this.popover.view.contains(e.target)
            && !this.popover.closeButton.view.contains(e.target)
            && !this.popover.deleteButton.view.contains(e.target))
            { return }
        this.popover.view.remove()
        //paper.removeEventListener('mousedown', this.boundDismissPopover)
        this.view.addEventListener('dblclick', this.boundCreatePopover)
        addLongPress(this.view, this.boundCreatePopover)
        this.popover = undefined
    }
                                                   
    registerTouchStart(e) {
        this.touchStart = new Vertex(pointerEventPageLocation(e))
    }
           
    closeTo(otherMobject) {
        return (this.anchor.subtract(otherMobject.anchor).norm() < 10)
    }
}



export class MGroup extends Mobject {

    constructor(argsDict) {
        super(argsDict)
        for (let submob of this.children) {
            this.add(submob)
        }
    }

}












export class Polygon extends Mobject {

    constructor(argsDict) {
        super(argsDict)
        this.vertices = []
        this.path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        this.path.mobject = this
        this.view.appendChild(this.path) // why not just add?
        this.update()
    }

    updateView() {
        let globalVertices = this.globalVertices()
        let pathString = Polygon.pathString(globalVertices)
        
        if (this.path == undefined || this.vertices.length == 0) { return }
        this.path.setAttribute('d', pathString)
        this.path.setAttribute('fill', this.fillColor || rgb(1, 1, 1))
        this.path.setAttribute('stroke', this.strokeColor || rgb(1, 1, 1))
        this.path.setAttribute('stroke-width', this.strokeWidth || 1)
        super.updateView()
    }

    static pathString(points) {
        let pathString = ''
        for (let point of points) {
            if (point.isNaN()) {
                pathString = ''
                return pathString
            }
            let prefix = (pathString == '') ? 'M' : 'L'
            pathString += prefix + stringFromPoint(point)
        }
        pathString += 'Z'
        return pathString
    }

    get strokeWidth() { return super.strokeWidth }
    set strokeWidth(newValue) {
        super.strokeWidth = newValue
        if (this.path != undefined) {
            this.path.setAttribute('stroke-width', newValue)
        }
    }
    
    get strokeColor() { return super.strokeColor }
    set strokeColor(newValue) {
        super.strokeColor = newValue
        if (this.path != undefined) {
            this.path.setAttribute('stroke', newValue)
        }
    }
    
}














export class CurvedShape extends Mobject {

    constructor(argsDict) {
        super(argsDict)
        this.bezierPoints = []
        this.path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        this.path.mobject = this
        this.view.appendChild(this.path)
    }

    updateBezierPoints() { }
    // implemented by subclasses

    globalBezierPoints() {
        let ret = this.globalTransform().appliedTo(this.bezierPoints)
        return ret
    }

    updateView() {
        this.updateBezierPoints()
        let pathString = CurvedShape.pathString(this.globalBezierPoints())
        if (this.path && this.bezierPoints.length > 0) {
            this.path.setAttribute('d', pathString)
            this.path.setAttribute('fill', this.fillColor)
            this.path.setAttribute('fill-opacity', this.fillOpacity)
        }
        super.updateView()
    }

    static pathString(points) {
        if (points.length == 0) { return '' }

        // there should be 3n+1 points
        let nbCurves = (points.length - 1)/3
        if (nbCurves % 1 != 0) { throw 'Incorrect number of Bézier points' }

        let pathString = 'M' + stringFromPoint(points[0])
        for (let i = 0; i < nbCurves; i++) {
            let point1str = stringFromPoint(points[3*i + 1])
            let point2str = stringFromPoint(points[3*i + 2])
            let point3str = stringFromPoint(points[3*i + 3])
            pathString += 'C' + point1str + ' ' + point2str + ' ' + point3str
        }
        pathString += 'Z'
        return pathString
    }

    get strokeWidth() { return super.strokeWidth }
    set strokeWidth(newValue) {
        super.strokeWidth = newValue
        if (this.path != undefined) {
            this.path.setAttribute('stroke-width', newValue)
        }
    }

    get strokeColor() { return super.strokeColor }
    set strokeColor(newValue) {
        super.strokeColor = newValue
        if (this.path != undefined) {
            this.path.setAttribute('stroke', newValue)
        }
    }
}





export class TextLabel extends Mobject {

    constructor(argsDict) {
        super(argsDict)
        this.setDefaults({
            text: ''
        })
        this.view = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        this.view.setAttribute('class', this.constructor.name + ' unselectable')
        this.view.setAttribute('text-anchor', 'middle')
        this.view.setAttribute('alignment-baseline', 'middle')
        this.view.setAttribute('fill', 'white')
        this.view.setAttribute('font-family', 'Helvetica')
        this.view.setAttribute('font-size', '12')
        this.view.mobject = this

        this.view.setAttribute('x', 0)
        this.view.setAttribute('y', 0)
    }

    get text() { return this._text }
    set text(newText) {
        this._text = newText
        if (this.view != undefined) { this.view.textContent = newText }
    }

    updateView() {
        this.view.setAttribute('x', this.globalTransform().e)
        this.view.setAttribute('y', this.globalTransform().f)
        super.updateView()
    }

}













// export class Popover extends CurvedShape {
//     constructor(sourceMobject, width, height, direction = 'right') {
//         super()
//         this.sourceMobject = sourceMobject
//         this.anchor = sourceMobject.anchor.translatedBy(sourceMobject.rightEdge())
//         // sourceMobject != parentMobject because using the latter
//         // conflicts with the z hierarchy

//         let tipSize = 10
//         let cornerRadius = 30
//         this.fillColor = 'white'
//         this.strokeColor = 'black'
//         this.strokeWidth = 1
//         if (direction == 'right') {
//             let bezierPoints = Vertex.vertices([
//                 [0, 0], [0, 0],
//                 [tipSize, tipSize], [tipSize, tipSize], [tipSize, tipSize],
//                 [tipSize, height/2 - cornerRadius], [tipSize, height/2 - cornerRadius], [tipSize, height/2],
//                 [tipSize, height/2], [tipSize + cornerRadius, height/2], [tipSize + cornerRadius, height/2],
//                 [tipSize + width - cornerRadius, height/2], [tipSize + width - cornerRadius, height/2], [tipSize + width, height/2],
//                 [tipSize + width, height/2], [tipSize + width, height/2 - cornerRadius], [tipSize + width, height/2 - cornerRadius],
//                 [tipSize + width, -height/2 + cornerRadius], [tipSize + width, -height/2 + cornerRadius], [tipSize + width, -height/2],
//                 [tipSize + width, -height/2], [tipSize + width - cornerRadius, -height/2], [tipSize + width - cornerRadius, -height/2],
//                 [tipSize + cornerRadius, -height/2], [tipSize + cornerRadius, -height/2], [tipSize, -height/2], 
//                 [tipSize, -height/2], [tipSize, -height/2 + cornerRadius], [tipSize, -height/2 + cornerRadius],
//                 [tipSize, -tipSize], [tipSize, -tipSize], [tipSize, -tipSize],
//                 [0, 0], [0, 0]
//             ])
//             // let translatedBezierPoints = []
//             // for (let point of bezierPoints) {
//             //     point.translateBy(this.anchor)
//             // }
//             this.bezierPoints = bezierPoints
//         }
        
//         this.closeButton = new TextLabel('X')
//         this.closeButton.anchor = new Vertex(70, -130)
//         this.boundDismiss = this.dismiss.bind(this)
//         this.closeButton.view.addEventListener('click', this.boundDismiss)
//         this.add(this.closeButton)

//         this.deleteButton = new TextLabel('🗑')
//         this.deleteButton.anchor = new Vertex(65, 140)
//         this.boundDelete = this.delete.bind(this)
//         this.deleteButton.view.addEventListener('click', this.boundDelete)
//         this.add(this.deleteButton)

//     }

//     dismiss(e) {
//         this.sourceMobject.dismissPopover(e)
//     }

//     delete(e) {
//         this.dismiss(e)
//     }
                                                                                            
// }












// class ScrubbableMobject extends Mobject {

//  constructor(anchor, quantity = null) {
//      super(anchor)
//      this.quantity = quantity
//      this.boundMakeScrubbable = this.makeScrubbable.bind(this)
//      this.boundUnmakeScrubbable = this.unmakeScrubbable.bind(this)
//  }

//  makeScrubbable(e) {
//      this.scrub_indicator = new Circle(this.radius + 5)
//      this.scrub_indicator.midPoint = this.midPoint
//      this.scrub_indicator.fillColor = rgba(0, 0, 0, 0.2)
//      this.add(this.scrub_indicator)
//      this.view.removeEventListener('mousedown', this.boundDragStart)
//      this.view.addEventListener('mousedown', this.boundScrubStart)

//      this.scrubbingBackground = new Circle(1000)
//      this.scrubbingBackground.midPoint = this.midPoint
//      this.scrubbingBackground.fillColor = rgba(0,0,0,0)
//      this.add(this.scrubbingBackground)
//      paper.addEventListener('mousedown', this.boundUnmakeScrubbable)
//  }

//  unmakeScrubbable(e) {
//      this.remove(this.scrubrub_indicator)
//      this.remove(this.scrubbingBackground)
//      this.view.removeEventListener('mousedown', this.boundScrubStart)
//      this.view.addEventListener('mousedown', this.boundDragStart)
//      paper.removeEventListener('mousedown', this.boundUnmakeScrubbable)
//  }

//  scrubStart(e) {
//      this.scrubStartingPoint = [e.x, e.y]
//      this.quantityBeforeScrubbing = this.quantity
//      this.scrubbingBackground.view.addEventListener('mousemove', this.boundScrub)
//      this.scrubbingBackground.view.addEventListener('mouseup', this.boundScrubEnd)
//  }

//  scrub(e) {
//      let scrubVector = vsub([e.x, e.y], this.scrubStartingPoint)
//      this.quantity = this.quantityBeforeScrubbing - 0.1*scrubVector[1]
//      this.updateView()
//  }

//  scrubEnd(e) {
//      this.scrubStartingPoint = undefined
//      this.quantityBeforeScrubbing = undefined
//      this.scrubbingBackground.view.removeEventListener('mousemove', this.boundScrub)
//      this.scrubbingBackground.view.removeEventListener('mouseup', this.boundScrubEnd)
//  }

// }

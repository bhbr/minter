import { Vertex, Transform } from './transform.js'
import { stringFromPoint, rgb, pointerEventPageLocation, addPointerDown, removePointerDown, addPointerMove, removePointerMove, addPointerUp, removePointerUp } from './helpers.js'


export class Mobject {

    constructor() {
        this.view = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        this.view.setAttribute('class', this.constructor.name)
        this.view.mobject = this
        this.transform = Transform.identity()
        this.submobjects = []
        this.childMobjects = []
        this.vertices = []
        try {
            this.parentMobject = paper // default
        } catch {
            this.parentMobject = sidebar // if no paper
        }

        this.draggable = false
        this.isDragged = false
        this.strokeColor = rgb(1, 1, 1)
        this.fillColor = rgb(1, 1, 1)
        this.show()

        // give event-triggered methods reference to this = self (instead of window)
        // also, they need proper names to refer to them
        // when removing the event listeners
        this.boundDragStart = this.dragStart.bind(this)
        this.boundDrag = this.drag.bind(this)
        this.boundDragEnd = this.dragEnd.bind(this)
        // this.boundScrubStart = this.scrubStart.bind(this)
        // this.boundScrub = this.scrub.bind(this)
        // this.boundScrubEnd = this.scrubEnd.bind(this)
        this.boundCreatePopover = this.createPopover.bind(this)
        this.boundDismissPopover = this.dismissPopover.bind(this)
        this.boundMouseUpAfterCreatingPopover = this.mouseUpAfterCreatingPopover.bind(this)

        //this.view.addEventListener('mousedown', this.boundDragStart)
        //this.view.addEventListener('dblclick', this.boundMakeScrubbable)

    }

    get parentMobject() { return this._parentMobject }
    set parentMobject(newValue) {
        this.view.remove()
        this._parentMobject = newValue
        if (newValue == undefined) { return }
        if (newValue.id == 'paper' || newValue.id == 'sidebar') {
            newValue.add(this)
        } else {
            newValue.view.appendChild(this.view)
        }
        if (this.parentMobject.visible || newValue.id == 'paper') {
            this.show()
        } else {
            this.hide()
        }
    }

    globalTransform() {
        let t = Transform.identity()
        let mob = this
        while (mob && mob.transform instanceof Transform) {
            t.leftComposeWith(mob.transform)
            mob = mob.parentMobject
        }
        return t
    }

    globalVertices() {
        return this.globalTransform().appliedTo(this.vertices)
    }

    updateView() {
        if (this.view == undefined) { return }

        for (let submob of this.submobjects) {
            submob.updateView()
        }

        if (this.popover != undefined) {
            this.popover.anchor = this.anchor.translatedBy(this.rightEdge())
        }
    }

    get fillColor() { return this.view.fill }
    set fillColor(newValue) {
        this.view.fill = newValue
        for (let submob of this.submobjects) {
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

    get strokeColor() { return this.view.stroke }
    set strokeColor(newValue) {
        this.view.stroke = newValue
        for (let submob of this.submobjects) {
            submob.strokeColor = newValue
        }
        this.updateView()
    }

    get strokeWidth() { return this.view.strokeWidth }
    set strokeWidth(newValue) {
        this.view.strokeWidth = newValue
        for (let submob of this.submobjects) {
            submob.strokeWidth = newValue
        }
        this.updateView()
    }

    get draggable() { return this._draggable }
    set draggable(newValue) {
        this._draggable = newValue
        if (this._draggable) {
            addPointerDown(this.view, this.boundDragStart)
        } else {
            removePointerDown(this.view, this.boundDragStart)
        }
    }

    dragStart(e) {
        e.preventDefault()
        e.stopPropagation()
        this.draggable = true
        this.isDragged = true
        this.dragStartingPoint = new Vertex(e.x, e.y)
        this.anchorBeforeDragging = Object.create(this.anchor)
        if (this.popover != undefined) {
            this.popover.anchorBeforeDragging = Object.create(this.popover.anchor)
        }
        addPointerMove(paper, this.boundDrag)
        addPointerUp(paper, this.boundDragEnd)
    }

    drag(e) {
        e.preventDefault()
        e.stopPropagation()
        //if (!(this.draggable && this.isDragged)) { return }
        let dragVector = new Vertex(e.x, e.y).subtract(this.dragStartingPoint)
        this.anchor.copyFrom(this.anchorBeforeDragging.add(dragVector))
        if (this.popover != undefined) {
            this.popover.anchor.copyFrom(this.popover.anchorBeforeDragging.add(dragVector))
        }
        this.updateView()
    }

    dragEnd(e) {
        e.preventDefault()
        e.stopPropagation()
        this.isDragged = false
        this.dragStartingPoint = undefined
        this.anchorBeforeDragging = undefined
        if (this.popover != undefined) {
            this.popover.anchorBeforeDragging = undefined
        }
        removePointerMove(paper, this.boundDrag)
        removePointerUp(paper, this.boundDragEnd)
    }

    add(submob) {
        submob.draggable = false
        submob.parentMobject = this
        this.submobjects.push(submob)
        this.view.appendChild(submob.view)
        submob.updateView()
    }

    remove(submob) {
        submob.view.remove()
        remove(this.submobjects, submob)
        submob.parentMobject = undefined
    }

    get anchor() {
        return new Vertex(this.transform.e, this.transform.f)
    }
    set anchor(newValue) {
        this.transform.centerAt(newValue)
        this.updateView()
    }

    hide() {
        this.visible = false
        if (this.view != undefined) {
            this.view.style["visibility"] = "hidden"
        }
        for (let submob of this.submobjects) {
            submob.hide() // we have to propagate invisibility
        }
        this.updateView()
    }

    show() {
        this.visible = true
        if (this.view != undefined) {
            this.view.style["visibility"] = "visible"
        }
        for (let submob of this.submobjects) {
            submob.show() // we have to propagate visibility bc we have to for invisibility
        }
        this.updateView()
    }

    rightEdge() { return Vertex.origin() }


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

    update(data) {
        for (let child of this.childMobjects) {
            child.update(data)
        }
        this.updateView()
    }
           
}



export class MGroup extends Mobject {

    constructor(submobs = []) {
        super()
        for (let submob of submobs) {
            submob.draggable = false
            this.add(submob)
        }
    }

}















export class Polygon extends Mobject {

    constructor(vertices) {
        super()
        this.vertices = vertices
        this.path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        this.view.appendChild(this.path)
        this.updateView()
    }

    updateView() {
        let pathString = Polygon.pathString(this.globalVertices())
        if (this.path == undefined) { return }
        this.path.setAttribute('d', pathString)
        //console.log(this.vertices)
        if (this.fillColor != undefined) {
            this.path.setAttribute('fill', this.fillColor)
        }
        if (this.strokeColor != undefined) {
            this.path.setAttribute('stroke', this.strokeColor)
        }
        if (this.strokeWidth != undefined) {
            this.path.setAttribute('stroke-width', this.strokeWidth)
        }
        super.updateView()
    }

    get vertices() { return this._vertices }
    set vertices(newVertices) {
        this._vertices = newVertices
        this.updateView()
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

    constructor(bezierPoints = []) {
        super()
        this.bezierPoints = bezierPoints
        this.path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        this.view.appendChild(this.path)
    }

    get bezierPoints() { return this._bezierPoints }
    set bezierPoints(newBezierPoints) {
        this._bezierPoints = newBezierPoints
        // do NOT update view, because updateView calls updateBezierPoints
    }

    updateBezierPoints() { }
    // implemented by subclasses

    globalBezierPoints() {
        return this.globalTransform().appliedTo(this.bezierPoints)
    }

    updateView() {
        this.updateBezierPoints()
        let pathString = CurvedShape.pathString(this.globalBezierPoints())
        if (this.path) {
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

    constructor(text) {
        super()
        this.view = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        this.view.setAttribute('class', this.constructor.name + ' unselectable')
        this.view.setAttribute('text-anchor', 'middle')
        this.view.setAttribute('alignment-baseline', 'middle')
        this.view.setAttribute('fill', 'white')
        this.view.setAttribute('font-family', 'Helvetica')
        this.view.setAttribute('font-size', '12')
        this.view.mobject = this
        this.text = text
        this.transform = Transform.identity()
        this.submobjects = []
        //this.parentMobject = paper // default

        this.isDraggable = false
        this.isDragged = false
        this.visible = true

        this.view.setAttribute('x', 0)
        this.view.setAttribute('y', 0)
    }

    get text() { return this._text }
    set text(newText) {
        this._text = newText
        if (this.view != undefined) { this.view.textContent = newText }
    }

    set anchor(newValue) {
        this.transform.centerAt(newValue)
        this.updateView()
    }

    updateView() {
        this.view.setAttribute('x', this.globalTransform().e)
        this.view.setAttribute('y', this.globalTransform().f)
        super.updateView()
    }

}













export class Popover extends CurvedShape {
    constructor(sourceMobject, width, height, direction = 'right') {
        super()
        this.sourceMobject = sourceMobject
        this.anchor = sourceMobject.anchor.translatedBy(sourceMobject.rightEdge())
        // sourceMobject != parentMobject because using the latter
        // conflicts with the z hierarchy

        let tipSize = 10
        let cornerRadius = 30
        this.fillColor = 'white'
        this.strokeColor = 'black'
        this.strokeWidth = 1
        if (direction == 'right') {
            let bezierPoints = Vertex.vertices([
                [0, 0], [0, 0],
                [tipSize, tipSize], [tipSize, tipSize], [tipSize, tipSize],
                [tipSize, height/2 - cornerRadius], [tipSize, height/2 - cornerRadius], [tipSize, height/2],
                [tipSize, height/2], [tipSize + cornerRadius, height/2], [tipSize + cornerRadius, height/2],
                [tipSize + width - cornerRadius, height/2], [tipSize + width - cornerRadius, height/2], [tipSize + width, height/2],
                [tipSize + width, height/2], [tipSize + width, height/2 - cornerRadius], [tipSize + width, height/2 - cornerRadius],
                [tipSize + width, -height/2 + cornerRadius], [tipSize + width, -height/2 + cornerRadius], [tipSize + width, -height/2],
                [tipSize + width, -height/2], [tipSize + width - cornerRadius, -height/2], [tipSize + width - cornerRadius, -height/2],
                [tipSize + cornerRadius, -height/2], [tipSize + cornerRadius, -height/2], [tipSize, -height/2], 
                [tipSize, -height/2], [tipSize, -height/2 + cornerRadius], [tipSize, -height/2 + cornerRadius],
                [tipSize, -tipSize], [tipSize, -tipSize], [tipSize, -tipSize],
                [0, 0], [0, 0]
            ])
            // let translatedBezierPoints = []
            // for (let point of bezierPoints) {
            //     point.translateBy(this.anchor)
            // }
            this.bezierPoints = bezierPoints
        }
        
        this.closeButton = new TextLabel('X')
        this.closeButton.anchor = new Vertex(70, -130)
        this.boundDismiss = this.dismiss.bind(this)
        this.closeButton.view.addEventListener('click', this.boundDismiss)
        this.add(this.closeButton)

        this.deleteButton = new TextLabel('🗑')
        this.deleteButton.anchor = new Vertex(65, 140)
        this.boundDelete = this.delete.bind(this)
        this.deleteButton.view.addEventListener('click', this.boundDelete)
        this.add(this.deleteButton)

    }

    dismiss(e) {
        this.sourceMobject.dismissPopover(e)
    }

    delete(e) {
        this.dismiss(e)
    }
                                                                                            
}




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
//      this.remove(this.scrub_indicator)
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

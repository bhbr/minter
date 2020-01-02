import { Vertex, pointerEventVertex } from './transform.js'
import { Polygon, CurvedShape, Circle, MGroup } from './mobject.js'
import { Segment } from './arrows.js'
import { rgb, gray } from './helpers.js'

export class TwoPointCircle extends Circle {

    constructor(argsDict) {
        super(argsDict)
        this.setAttributes({
            strokeColor: rgb(1, 1, 1),
            fillOpacity: 0
        })
        this.view.style['pointer-events'] = 'none'
        this.radius = this.midPoint.subtract(this.outerPoint).norm()
    }

    update(argsDict) {
        this.radius = this.midPoint.subtract(this.outerPoint).norm()
        super.update(argsDict)
    }

}

export class Ellipse extends CurvedShape {
    
    constructor(midPoint, majorAxis, minorAxis, tilt) {
        super()
        this.majorAxis = majorAxis
        this.minorAxis = minorAxis
        this.tilt = tilt

    }

    get midPoint() { return this.anchor }
    set midPoint(newValue) { this.anchor = newValue }


}




export class Rectangle extends Polygon {
    constructor(argsDict) {
        super(argsDict)
        this.setDefaults({
            width: 100,
            height: 100
        })
        this.p1 = Vertex.origin()
        this.p2 = new Vertex([this.width, 0])
        this.p3 = new Vertex([this.width, this.height])
        this.p4 = new Vertex([0, this.height])
        this.vertices = [this.p1, this.p2, this.p3, this.p4]
    }

    update(argsDict) {
        try {
            this.p2.x = this.width
            this.p3.x = this.width
            this.p3.y = this.height
            this.p4.y = this.height
            super.update(argsDict)
        } catch { }
    }
}














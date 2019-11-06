import { Vertex } from './transform.js'
import { Polygon, CurvedShape, MGroup } from './mobject.js'
import { Segment } from './arrows.js'
import { rgb } from './helpers.js'

export class Circle extends CurvedShape {
    
    constructor(argsDict) {
        super(argsDict)
        this.setDefaults({
            radius: 10,
            midPoint: Vertex.origin()
        })
    }

    // midPoint is a synonym for anchor
    get midPoint() { return this.anchor }
    set midPoint(newValue) {
        this.anchor = newValue // updates automatically
    }

    updateBezierPoints() {
        let newBezierPoints = []
        let n = 8
        for (let i = 0; i <= n; i++) {
            let theta = i/n * 2 * Math.PI
            let d = this.radius * 4/3 * Math.tan(Math.PI/(2*n))
            let radialUnitVector = new Vertex(Math.cos(theta), Math.sin(theta))
            let tangentUnitVector = new Vertex(-Math.sin(theta), Math.cos(theta))
            let anchorPoint = radialUnitVector.scaledBy(this.radius)

            let leftControlPoint = anchorPoint.translatedBy(tangentUnitVector.scaledBy(-d))
            let rightControlPoint = anchorPoint.translatedBy(tangentUnitVector.scaledBy(d))

            if (i != 0) { newBezierPoints.push(leftControlPoint) }
            newBezierPoints.push(anchorPoint)
            if (i != n) { newBezierPoints.push(rightControlPoint) }
        }
        this.bezierPoints = newBezierPoints

        // do NOT update the view, because updateView called updateBezierPoints
    }

    rightEdge() {
        return new Vertex(this.radius, 0)
    }

}

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




export class Rectangle extends MGroup {
    constructor(argsDict) {
        super(argsDict)
        this.setDefaults({
            width: 100,
            height: 100
        })
        this.p1 = this.anchor
        this.p2 = this.p1.translatedBy(new Vertex([this.width, 0]))
        this.p3 = this.p1.translatedBy(new Vertex([this.width, this.height]))
        this.p4 = this.p1.translatedBy(new Vertex([0, this.height]))
        this.s1 = new Segment({startPoint: this.p1, endPoint: this.p2})
        this.s2 = new Segment({startPoint: this.p2, endPoint: this.p3})
        this.s3 = new Segment({startPoint: this.p3, endPoint: this.p4})
        this.s4 = new Segment({startPoint: this.p4, endPoint: this.p1})
        this.add(this.s1)
        this.add(this.s2)
        this.add(this.s3)
        this.add(this.s4)
    }
}













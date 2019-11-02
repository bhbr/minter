import { Vertex } from './transform.js'
import { Polygon, CurvedShape } from './mobject.js'
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


















import { rgb, addPointerDown, removePointerDown, addPointerMove, removePointerMove, addPointerUp, removePointerUp, logInto, isTouchDevice } from './modules/helpers.js'
import { Vertex, pointerEventVertex } from './modules/transform.js'
import { Mobject, MGroup } from './modules/mobject.js'
import { Circle, TwoPointCircle } from './modules/shapes.js'
import { Segment, Ray, Line } from './modules/arrows.js'

const paperView = document.querySelector('#paper')
const paper = paperView.mobject

export class CreatedMobject extends MGroup {
    
    dissolveInto(superMobject) {
        superMobject.remove(this)
        if (!this.visible) { return }
        for (let submob of this.children) {
            superMobject.add(submob)
        }
    }

    updateFromTip(q) { }

}

export class Freehand extends CreatedMobject {
    
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

    dissolveInto(superMobject) {
        superMobject.remove(this)
        if (this.visible) {
            superMobject.add(this)
        }
    }
}



export class Point extends Circle {

    constructor(argsDict) {
        super(argsDict)
        this.view.setAttribute('class', this.constructor.name)
        this.setDefaults({
            midPoint: Vertex.origin(),
        })

        this.radius = 5
    }

    update(argsDict) {
        super.update(argsDict)
    }

}

export class FreePoint extends Point {
    constructor(argsDict) {
        super(argsDict)
        this.setAttributes({
            draggable: true
        })
        this.enableDragging()
    }
}

export class DrawnArrow extends CreatedMobject {

    constructor(argsDict) {
        super(argsDict)
        this.endPoint = this.endPoint || this.startPoint.copy()
        this.passAlongEvents = true
        this.startFreePoint = new FreePoint({
            midPoint: this.startPoint
        })
        this.endFreePoint = new FreePoint({
            midPoint: this.endPoint
        })
        this.add(this.startFreePoint)
        this.add(this.endFreePoint)
        
    }

    updateFromTip(q) {
        this.endPoint.copyFrom(q)
        this.update()
    }

    dissolveInto(superMobject) {
        superMobject.removeFreePoint(this.startFreePoint)
        superMobject.removeFreePoint(this.endFreePoint)

        for (let fq of superMobject.snappablePoints) {
            let q = fq.midPoint
            if (this.startPoint.x == q.x && this.startPoint.y == q.y) {
                this.startPoint = fq.midPoint
                this.startFreePoint = fq
                this.update()
                break
            }
        }
        for (let fq of superMobject.snappablePoints) {
            let q = fq.midPoint
            if (this.endPoint.x == q.x && this.endPoint.y == q.y) {
                this.endPoint = fq.midPoint
                this.endFreePoint = fq
                this.update()
                break
            }
        }

        superMobject.add(this.startFreePoint)
        superMobject.add(this.endFreePoint)
        
    }

}


export class DrawnSegment extends DrawnArrow {

    constructor(argsDict) {

        super(argsDict)
        this.segment = new Segment({
            startPoint: this.startFreePoint.midPoint,
            endPoint: this.endFreePoint.midPoint
        })
        this.add(this.segment)
        this.startFreePoint.dependents.push(this.segment)
        this.endFreePoint.dependents.push(this.segment)
    }

    dissolveInto(superMobject) {
        super.dissolveInto(superMobject)
        superMobject.remove(this.segment)
        this.segment = new Segment({
            startPoint: this.startPoint,
            endPoint: this.endPoint,
            strokeColor: this.strokeColor,
        })

        this.startFreePoint.dependents.push(this.segment)
        this.endFreePoint.dependents.push(this.segment)
        superMobject.add(this.segment)

    }
}

export class DrawnRay extends DrawnArrow {

    constructor(argsDict) {
        super(argsDict)
        this.ray = new Ray({
            startPoint: this.startFreePoint.midPoint,
            endPoint: this.endFreePoint.midPoint,
        })
        this.add(this.ray)
        this.startFreePoint.dependents.push(this.ray)
        this.endFreePoint.dependents.push(this.ray)
    }

    dissolveInto(superMobject) {
        super.dissolveInto(superMobject)
        superMobject.remove(this.ray)
        this.ray = new Ray({
            startPoint: this.startPoint,
            endPoint: this.endPoint,
            strokeColor: this.strokeColor
        })
        this.startFreePoint.dependents.push(this.ray)
        this.endFreePoint.dependents.push(this.ray)
        superMobject.add(this.ray)

    }
}


export class DrawnLine extends DrawnArrow {

    constructor(argsDict) {
        super(argsDict)
        this.line = new Line({
            startPoint: this.startFreePoint.midPoint,
            endPoint: this.endFreePoint.midPoint
        })
        this.add(this.line)
        this.startFreePoint.dependents.push(this.line)
        this.endFreePoint.dependents.push(this.line)
    }

    dissolveInto(superMobject) {
        super.dissolveInto(superMobject)
        superMobject.remove(this.line)
        this.line = new Line({
            startPoint: this.startPoint,
            endPoint: this.endPoint,
            strokeColor: this.strokeColor
        })
        this.startFreePoint.dependents.push(this.line)
        this.endFreePoint.dependents.push(this.line)
        superMobject.add(this.line)

    }


}

export class DrawnCircle extends CreatedMobject {

    constructor(argsDict) {
        super(argsDict)
        
        this.setDefaults({
            strokeColor: rgb(1, 1, 1),
            fillOpacity: 0
        })
        this.setAttributes({
            strokeWidth: 1
        })

        this.midPoint = this.midPoint || this.startPoint.copy()
        this.outerPoint = this.outerPoint || this.startPoint.copy()
        this.passAlongEvents = true
        this.freeMidpoint = new FreePoint({
            midPoint: this.midPoint
        })
        this.freeOuterPoint = new FreePoint({
            midPoint: this.outerPoint
        })
        this.circle = new TwoPointCircle({
            midPoint: this.midPoint,
            outerPoint: this.outerPoint
        })
        this.add(this.freeMidpoint)
        this.add(this.freeOuterPoint)
        this.add(this.circle)

        this.freeMidpoint.dependents.push(this.circle)
        this.freeOuterPoint.dependents.push(this.circle)

    }

    updateFromTip(q) {
        this.outerPoint.copyFrom(q)
        this.update()
    }

    dissolveInto(superMobject) {
        superMobject.removeFreePoint(this.freeMidpoint)
        superMobject.removeFreePoint(this.freeOuterPoint)

        for (let fq of superMobject.snappablePoints) {
            let q = fq.midPoint
            if (this.midPoint.x == q.x && this.midPoint.y == q.y) {
                this.midPoint = fq.midPoint
                this.freeMidpoint = fq
                this.update()
                break
            }
        }
        for (let fq of superMobject.snappablePoints) {
            let q = fq.midPoint
            if (this.outerPoint.x == q.x && this.outerPoint.y == q.y) {
                this.outerPoint = fq.midPoint
                this.freeOuterPoint = fq
                this.update()
                break
            }
        }

        superMobject.add(this.freeMidpoint)
        superMobject.add(this.freeOuterPoint)
        
        superMobject.remove(this.circle)
        this.circle = new TwoPointCircle({
            midPoint: this.midPoint,
            outerPoint: this.outerPoint
        })
        this.circle.strokeColor = this.strokeColor
        console.log(this.strokeColor)
        this.freeMidpoint.dependents.push(this.circle)
        this.freeOuterPoint.dependents.push(this.circle)
        superMobject.add(this.circle)
    }


}




export class CindyCanvas extends Mobject {
    
    constructor(paper, p, width, height) {
        super({anchor: p, width: width, height: height})
        this.script = document.createElement('script')
        this.script.setAttribute('type', 'text/x-cindyscript')
        let scriptID = 'csdraw' // + paper.cindyPorts.length
        this.script.setAttribute('id', scriptID)
        this.script.textContent = 'W(x, p) := 0.5*(1+sin(100*|x-p|)); colorplot([0,W(#, A0)+W(#, A1),0]);'
        //script.textContent = 'colorplot(seconds());'

        this.view = document.createElement('div')
        this.view.style.position = 'absolute'
        this.view.style.left =  p.x + "px"
        this.view.style.top = p.y + "px"

        this.csView = document.createElement('div')
        let canvasID = 'CSCanvas' + paper.cindyPorts.length
        this.csView.setAttribute('id', canvasID)
        this.view.appendChild(this.csView)

        this.view.style['pointer-events'] = 'auto'
       
        paper.add(this)

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

    geometry() {
        let ret = []
        let i = 0
        for (let point of this.points) {
            ret.push({name: "A" + i, kind:"P", type:"Free", pos: point})
            i += 1
        }
        return ret
    }
    
    update(argsDict) { }
    updateView() { }
    
}


export class DrawnRectangle extends CreatedMobject {
    
    constructor(argsDict) {
        super(argsDict)
        this.endPoint = this.endPoint || this.startPoint.copy()
        this.p1 = this.startPoint
        this.p2 = new Vertex(this.endPoint.x, this.startPoint.y)
        this.p3 = this.endPoint
        this.p4 = new Vertex(this.startPoint.x, this.endPoint.y)
        this.top = new Segment({startPoint: this.p1, endPoint: this.p2})
        this.bottom = new Segment({startPoint: this.p3, endPoint: this.p4})
        this.left = new Segment({startPoint: this.p1, endPoint: this.p4})
        this.right = new Segment({startPoint: this.p2, endPoint: this.p3})
        this.top.strokeColor = rgb(1, 1, 1)
        this.bottom.strokeColor = rgb(1, 1, 1)
        this.left.strokeColor = rgb(1, 1, 1)
        this.right.strokeColor = rgb(1, 1, 1)
        this.add(this.top)
        this.add(this.bottom)
        this.add(this.left)
        this.add(this.right)
    }

    updateFromTip(q) {
        this.endPoint.copyFrom(q)
        this.p2.x = this.endPoint.x
        this.p2.y = this.startPoint.y
        this.p4.x = this.startPoint.x
        this.p4.y = this.endPoint.y
        this.updateView()
    }

    dissolveInto(superMobject) {
        let w = this.p2.x - this.p1.x
        let h = this.p3.y - this.p1.y
        let cindy = new CindyCanvas(superMobject, this.p1, w, h)
        superMobject.add(cindy)
    }
    
}





export class CreationGroup extends CreatedMobject {

    constructor(argsDict) {
        super(argsDict)
        this.creations = { }
        this.creations['freehand'] = new Freehand()
        this.creations['segment'] = new DrawnSegment({startPoint: this.startPoint})
        this.creations['ray'] = new DrawnRay({startPoint: this.startPoint})
        this.creations['line'] = new DrawnLine({startPoint: this.startPoint})
        this.creations['circle'] = new DrawnCircle({startPoint: this.startPoint})
        this.creations['cindy'] = new DrawnRectangle({startPoint: this.startPoint})
        this.setVisibleCreation(this.visibleCreation)
        for (let creation of Object.values(this.creations)) {
            this.add(creation)
        }
        this.update()

    }

    updateFromTip(q) {
        for (let creation of Object.values(this.creations)) {
            creation.updateFromTip(q)
        }
    }


    setVisibleCreation(visibleCreation) {
        for (let mob of Object.values(this.creations)) {
            mob.hide()
        }
        this.visibleCreation = visibleCreation
        this.creations[visibleCreation].show()

        if (visibleCreation == 'cindy') {
            this.creations[visibleCreation].strokeColor = rgb(1, 1, 1)
        }
    }

    dissolveInto(superMobject) {
        superMobject.remove(this)
        this.creations[this.visibleCreation].dissolveInto(superMobject)
    }

}



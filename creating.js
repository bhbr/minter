import { rgb, addPointerDown, removePointerDown, addPointerMove, removePointerMove, addPointerUp, removePointerUp, logInto, isTouchDevice } from './modules/helpers.js'
import { Vertex, pointerEventVertex } from './modules/transform.js'
import { MGroup } from './modules/mobject.js'
import { Circle } from './modules/shapes.js'
import { Segment, Line } from './modules/arrows.js'

export class CreatedMobject extends MGroup {
    
    dissolveInto(superMobject) {
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
}



export class FreePoint extends Circle {

    constructor(argsDict) {
        super(argsDict)
        this.setAttributes(argsDict)
        this.view.setAttribute('class', this.constructor.name)
        this.setDefaults({
            midPoint: Vertex.origin(),
        })
        this.radius = 5
        this.enableDragging()
    }

}


export class DrawnSegment extends CreatedMobject {
    constructor(argsDict) {
        super(argsDict)
        this.endPoint = this.endPoint || this.startPoint.copy()
        this.passAlongEvents = true
        this.startFreePoint = new FreePoint({midPoint: this.startPoint})
        this.endFreePoint = new FreePoint({midPoint: this.endPoint})
        this.line = new Segment({startPoint: this.startPoint, endPoint: this.endPoint})
        this.add(this.line)
        this.add(this.startFreePoint)
        this.add(this.endFreePoint)
    }

    updateFromTip(q) {
        this.endPoint.copyFrom(q)
        this.update()
    }

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


    update(argsDict) {
        super.update(argsDict)
        this.p2.x = this.endPoint.x
        this.p2.y = this.startPoint.y
        this.p4.x = this.startPoint.x
        this.p4.y = this.endPoint.y
        this.updateView()
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

        this.view.style['pointer-events'] = 'auto'
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

    geometry() {
        let ret = []
        let i = 0
        for (let point of this.points) {
            ret.push({name: "A" + i, kind:"P", type:"Free", pos: point})
            i += 1
        }
        return ret
    }
    
    update(argsDict) {
        
    }
    
}



export class CreationGroup extends CreatedMobject {

    constructor(argsDict) {
        super(argsDict)
        this.creations = { }
        this.creations['segment'] = new DrawnSegment({startPoint: this.startPoint})
        //this.creations['cindy'] = new DrawnRectangle({startPoint: this.startPoint})
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
    }

    dissolveInto(mobject) {
        this.creations[this.visibleCreation].dissolveInto(mobject)
    }

}



import { rgb, addPointerDown, remove, removePointerDown, addPointerMove, removePointerMove, addPointerUp, removePointerUp, logInto, isTouchDevice } from './modules/helpers.js'
import { Vertex, pointerEventVertex } from './modules/transform.js'
import { Mobject, MGroup } from './modules/mobject.js'
import { Circle, Rectangle } from './modules/shapes.js'
import { Segment, Ray, Line } from './modules/arrows.js'
import { FreePoint, CreationGroup, CindyCanvas } from './creating.js'


let log = function(msg) { logInto(msg, 'paper-console') }

function loadScript(url, completeCallback) {
   var script = document.createElement('script'), done = false,
       head = document.getElementsByTagName("head")[0]
   script.src = url
   script.onload = script.onreadystatechange = function(){
     if ( !done && (!this.readyState ||
          this.readyState == "loaded" || this.readyState == "complete") ) {
       done = true
       completeCallback()

      // IE memory leak
      script.onload = script.onreadystatechange = null
      head.removeChild( script )
    }
  };
  head.appendChild(script)
}

loadScript("./CindyJS/build/Cindy.js",
            function () { })


class Paper extends Mobject {

     constructor(argsDict) {
        super(argsDict)
        this.children = []
        this.cindys = []
        this.setDragging(false)
        this.visibleCreation = 'freehand'
        this.cindyPorts = []
        this.snappablePoints = []

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
     }

    changeColorByName(newColorName) {
        let newColor = this.colorPalette[newColorName]
        this.changeColor(newColor)
    }

    changeColor(newColor) {
        this.currentColor = newColor
        if (this.creationGroup == undefined) { return }
        this.creationGroup.strokeColor = this.currentColor
        this.creationGroup.fillColor = this.currentColor
        this.creationGroup.update()
    }

    setDragging(flag) {
        this.passAlongEvents = !flag
        for (let c of this.cindys) {
            c.draggable = flag
            c.view.style['pointer-events'] = (flag ? 'none' : 'auto')
        }
        if (flag) {
            this.selfHandlePointerDown = this.startDragging
            this.selfHandlePointerMove = this.dragging
            this.selfHandlePointerUp = this.endDragging
        } else {
            this.selfHandlePointerDown = this.startCreating
            this.selfHandlePointerMove = this.creativeMove
            this.selfHandlePointerUp = this.endCreating
        }
    }


    startDragging(e) {
        this.draggedMobject = this.eventTargetMobject(e)
        if (this.draggedMobject == this || !this.draggedMobject.draggable) {
            this.draggedMobject = undefined
            return
        }
        this.dragPointStart = pointerEventVertex(e)
        this.dragAnchorStart = this.draggedMobject.anchor.copy()
    }

    dragging(e) {
        if (this.draggedMobject == undefined) { return }
        let dragPoint = pointerEventVertex(e)
        let dr = dragPoint.subtract(this.dragPointStart)
        this.draggedMobject.anchor.copyFrom(this.dragAnchorStart.add(dr))
        if (this.draggedMobject instanceof CindyCanvas) {
            this.draggedMobject.view.style.left =  this.draggedMobject.anchor.x + "px"
            this.draggedMobject.view.style.top = this.draggedMobject.anchor.y + "px"
        }
        this.draggedMobject.update()
    }

    endDragging(e) {
        this.dragPointStart = undefined
        this.dragAnchorStart = undefined
        this.draggedMobject = undefined
    }

    handleMessage(message) {
        if (message == undefined || message == {}) { return }
        let key = Object.keys(message)[0]
        let value = Object.values(message)[0]

        switch (key) {
        case 'creating':
                this.changeVisibleCreation(value)
            if (value == 'freehand') {
                this.passAlongEvents = true
                break
            }
            if (this.creationGroup == undefined) {
                this.passAlongEvents = false
            }
            break
        case 'color':
            this.changeColor(value)
            break
        case 'drag':
            this.setDragging(value)
            break
        }


    }

    changeVisibleCreation(newVisibleCreation) {
        this.visibleCreation = newVisibleCreation
        if (this.creationGroup != undefined) {
            this.creationGroup.setVisibleCreation(newVisibleCreation)
        }
    }


    startCreating(e) {

        this.creationStartPoint = pointerEventVertex(e)
        for (let fp of this.snappablePoints) {
            if (this.creationStartPoint.subtract(fp.midPoint).norm() < 10) {
                this.creationStartPoint = fp.midPoint
            }
        }

        this.creationGroup = new CreationGroup({
            startPoint: this.creationStartPoint,
            visibleCreation: this.visibleCreation
        })
        this.creationGroup.strokeColor = this.currentColor
        this.creationGroup.fillColor = this.currentColor
        this.add(this.creationGroup)
        this.changeVisibleCreation(this.visibleCreation)
    }

    creativeMove(e) {
        let p = pointerEventVertex(e)
        for (let fq of this.snappablePoints) {
            let q = fq.midPoint
            if (p.subtract(q).norm() < 10) {
                p = q
                break
            }
        }

        this.creationGroup.updateFromTip(p)
    }

    endCreating(e) {
        this.creationGroup.dissolveInto(this)
        this.remove(this.creationGroup)
        this.creationGroup = undefined

    }

    addCindy(cindyCanvas) {
        document.querySelector('#paper-container').insertBefore(cindyCanvas.view, document.querySelector('#paper-console'))
        document.body.appendChild(cindyCanvas.script)
        this.cindys.push(cindyCanvas)
    }


    removeCindy(cindyCanvas) {
        cindyCanvas.view.remove()
        cindyCanvas.script.remove()
    }

    addFreePoint(fp) {
        this.snappablePoints.push(fp)
        super.add(fp)
    }

    removeFreePoint(fp) {
        remove(this.snappablePoints, fp)
        super.remove(fp)
    }

    add(mobject) {
        if (mobject instanceof CindyCanvas) {
            this.addCindy(mobject)
        } else if (mobject instanceof FreePoint) {
            this.addFreePoint(mobject)
        } else {
            super.add(mobject)
        }
    }

    remove(mobject) {
        if (mobject instanceof CindyCanvas) {
            this.removeCindy(mobject)
        } else if (mobject instanceof FreePoint) {
            this.removeFreePoint(mobject)
        } else {
            super.remove(mobject)
        }
    }



}

export const paper = new Paper({ view: document.querySelector('#paper'), passAlongEvents: true })

let c = new CindyCanvas(paper, new Vertex(100, 100), 200, 300)

log(paper.children.toString())

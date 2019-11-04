import { rgb, addPointerDown, remove, removePointerDown, addPointerMove, removePointerMove, addPointerUp, removePointerUp, logInto, isTouchDevice } from './modules/helpers.js'
import { Vertex, pointerEventVertex } from './modules/transform.js'
import { Mobject, MGroup } from './modules/mobject.js'
import { Circle } from './modules/shapes.js'
import { Segment, Ray, Line } from './modules/arrows.js'
import { FreePoint, CreationGroup, CindyCanvas } from './creating.js'


class Paper extends Mobject {

     constructor(argsDict) {
        super(argsDict)
        this.children = []
        this.cindys = []
        this.setDragging(false)
        this.visibleCreation = 'freehand'
        this.cindyPorts = []
        this.snappablePoints = []

//         this.colorPalette = {
//             'black': rgb(0, 0, 0),
//             'white': rgb(1, 1, 1),
//             'red': rgb(1, 0, 0),
//             'orange': rgb(1, 0.5, 0),
//             'yellow': rgb(1, 1, 0),
//             'green': rgb(0, 1, 0),
//             'blue': rgb(0, 0, 1),
//             'indigo': rgb(0.5, 0, 1),
//             'violet': rgb(1, 0, 1)
//         }
//         this.currentColor = this.colorPalette['white']




     }

//     changeColorByName(newColorName) {
//         let newColor = this.colorPalette[newColorName]
//         this.changeColor(newColor)
//     }

//     changeColor(newColor) {
//         this.currentColor = newColor
//         for (let mob of Object.values(this.newConstructions)) {
//             mob.strokeColor = this.currentColor
//             mob.fillColor = this.currentColor
//         }
//         for (let mob of Object.values(this.newPoints)) {
//             mob.strokeColor = this.currentColor
//             mob.fillColor = this.currentColor
//         }
//         try {
//             this.newFreehand.strokeColor = this.currentColor
//             this.newFreehand.fillColor = this.currentColor
//         } catch { }

//     }


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
        this.draggedMobject = this.cindys[0]// this.eventTargetMobject(e)
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









//     startDragging(p, mob) {
//         let oldX = parseInt(mob.view.style.left.replace('px', ''))
//         let oldY = parseInt(mob.view.style.top.replace('px', ''))
//         let q = new Vertex(oldX, oldY)
//         this.mobOffsetFromCursor = q.subtract(p)
        
//         addPointerMove(this.view, this.boundDrag)
//         addPointerUp(this.view, this.boundEndDragging)
//     }

//     drag(e) {
//         let dragPoint = new Vertex(pointerEventPageLocation(e))
//         let mob = null
//         for (let mob2 of this.constructions) {
//             if (mob2 instanceof CindyCanvas) {mob = mob2 }
//         }
//         mob.view.style.left = (dragPoint.x + this.mobOffsetFromCursor.x) + 'px'
//         mob.view.style.top = (dragPoint.y + this.mobOffsetFromCursor.y) + 'px'
//     }

//     endDragging(e) {
//         removePointerMove(this.view, this.boundDrag)
//         removePointerUp(this.view, this.boundEndDragging)
//         this.currentMode = 'freehand'
//         this.draggedMobject = undefined
//     }



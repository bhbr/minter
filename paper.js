import { rgb, addPointerDown, removePointerDown, addPointerMove, removePointerMove, addPointerUp, removePointerUp, logInto, isTouchDevice } from './modules/helpers.js'
import { Vertex, pointerEventVertex } from './modules/transform.js'
import { Mobject, MGroup } from './modules/mobject.js'
import { Circle, DrawnCircle } from './modules/shapes.js'
import { Segment, Ray, Line } from './modules/arrows.js'
import { CreationGroup, Freehand, FreePoint, DrawnSegment } from './creating.js'


class Paper extends Mobject {

     constructor(argsDict) {
        super(argsDict)
        this.children = []
        this.setDragging(false)
        this.visibleCreation = 'freehand'
        
//         this.useCapture = true
//         this.isCreating = false
//         this.draggedMobject = undefined
//         this.constructionModes = ['segment', 'ray', 'line', 'circle', 'cindy']

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




//         this.freehands = []
//         this.freePoints = []
//         this.constructions = []
//         this.cindyPorts = []

//         this.newFreehand = undefined
//         this.newPoints = []
//         this.newConstructions = {}
//         this.newCindyPort = undefined

//         this.boundStartDragging = this.startDragging.bind(this)
//         this.boundDrag = this.drag.bind(this)
//         this.boundEndDragging = this.endDragging.bind(this)

//         this.boundPointerDown = this.pointerDown.bind(this)
//         this.boundPointerMove = this.pointerMove.bind(this)
//         this.boundPointerUp = this.pointerUp.bind(this)
//         addPointerDown(this.view, this.boundPointerDown, this.useCapture)

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
            break
        case 'color':
            this.changeColor(value)
            break
        case 'drag':
            this.setDragging(value)
            break
        }



//         if (newMode == 'drag') {
//             for (let mob of this.constructions) {
//                 if (mob instanceof CindyCanvas) {
//                     mob.view.style['pointer-events'] = 'none'
//                 }
//             }
//         } else {
//             for (let mob of this.constructions) {
//                 if (mob instanceof CindyCanvas) {
//                     mob.view.style['pointer-events'] = 'auto'
//                 }
//             }
//         }
//         for (let mob of Object.values(this.newConstructions)) { mob.hide() }
//         for (let point of this.newPoints) { point.hide() }
//         if (this.newFreehand != undefined) { this.newFreehand.hide() }

//         switch (this.currentMode) {
//         case 'freehand':
//             try { this.newFreehand.show() } catch { }
//             break

//         case 'segment':
//         case 'ray':
//         case 'line':
//         case 'circle':
//             try { this.newPoints[0].show() } catch { }
//             try { this.newPoints[1].show() } catch { }
//             try { this.newConstructions[this.currentMode].show() } catch { }
//             break
//         case 'cindy':
//             try { this.newConstructions['cindy'].show() } catch { }
//             break
//         case 'drag':
//             break
//         }
    }

    changeVisibleCreation(newVisibleCreation) {
        this.visibleCreation = newVisibleCreation
        if (this.creationGroup != undefined) {
            this.creationGroup.setVisibleCreation(newVisibleCreation)
        }
    }


    startCreating(e) {
        this.creationStartPoint = pointerEventVertex(e)
        this.creationGroup = new CreationGroup({
            startPoint: this.creationStartPoint,
            visibleCreation: 'freehand'
        })
        this.add(this.creationGroup)
        this.changeVisibleCreation(this.visibleCreation)
    }

    creativeMove(e) {
        this.creationGroup.updateFromTip(pointerEventVertex(e))
    }

    endCreating(e) {
        this.creationGroup.dissolveInto(this)
        this.remove(this.creationGroup)
        this.creationGroup = undefined
    }

    // targetMobject(e) {
    // // which mobject have we clicked on?
    // // (event detection completely handled by paper except maybe for Cindy)
    //     //if (!(e.target.mobject instanceof CindyCanvas || e.target.mobject instanceof FreePoint))
    //     let tm = undefined
    //     if (this.draggedMobject != undefined) {
    //         tm = this.draggedMobject
    //         return tm
    //     }
    //     let p = new Vertex(pointerEventPageLocation(e))
    //     for (let point of this.freePoints) {
    //         if (point.anchor.subtract(p).norm() < 10) {
    //             tm = point
    //             return tm
    //         }
    //     }
    //     tm = e.target.parentNode.mobject
    //     if (tm != undefined) {
    //         // maybe the event got detected by a point, but through its path
    //         if (tm instanceof DrawnCircle) {
    //             return this // clicked inside a circle, but not on its center
    //         }
    //     } else {
    //         // paper or Cindy canvas
    //         tm = e.target.mobject
    //         return tm
    //     }
    // }

    // pointerDown(e) {
    //     e.preventDefault()
    //     e.stopPropagation()
    //     let target = this.targetMobject(e)
    //     let p = new Vertex(pointerEventPageLocation(e))
    //     switch (target.constructor.name) {
    //     case 'Paper':
    //         this.handlePointerDownOnPaper(target, p)
    //         // meaning we create two new points
    //         break
    //     case 'FreePoint':
    //         this.handlePointerDownOnFreePoint(target, p)
    //         // meaning we either drag a point or create something starting there
    //         break
    //     }
    //     this.update()

    //     addPointerMove(this.view, this.boundPointerMove)
    //     addPointerUp(this.view, this.boundPointerUp)
    //     removePointerDown(this.view, this.boundPointerDown)
    // }

    // pointerMove(e) {
    //     e.preventDefault()
    //     e.stopPropagation()
    //     let target = this.targetMobject(e)
    //     let p = new Vertex(pointerEventPageLocation(e))

    //     if (target != this && !this.isCreating) { this.currentMode = 'drag' }
    //     console.log(p, target)
    //     this.handlePointerMove(target, p)
    // }

    // pointerUp(e) {
    //     e.preventDefault()
    //     e.stopPropagation()
    //     let target = this.targetMobject(e)
    //     let p = new Vertex(pointerEventPageLocation(e))

    //     this.handlePointerUp(target, p)

    //     addPointerDown(this.view, this.boundPointerDown, this.useCapture)
    //     removePointerMove(this.view, this.boundPointerMove, this.useCapture)
    //     removePointerUp(this.view, this.boundPointerUp, this.useCapture)
    // }





    // handlePointerDownOnPaper(target, p) {
    //     if (this.currentMode == 'drag') {
    //         for (let mob of this.constructions) {
    //             if (mob instanceof CindyCanvas) { target = mob }
    //         }
    //         this.startDragging(p, target)
    //         return
    //     }
    //     // start a new construction from nowhere
    //     // including a freehand drawing)
    //     let fp1 = new FreePoint({anchor: p, strokeColor: this.currentColor, fillColor: this.currentColor})
    //     let fp2 = new FreePoint({anchor: p.copy(), strokeColor: this.currentColor, fillColor: this.currentColor})
    //     let fh = new Freehand({anchor: Vertex.origin(), strokeColor: this.currentColor, fillColor: this.currentColor})
    //     let s = new Segment({startPoint: fp1.anchor, endPoint: fp2.anchor, strokeColor: this.currentColor, fillColor: this.currentColor})
    //     let r = new Ray({startPoint: fp1.anchor, endPoint: fp2.anchor, strokeColor: this.currentColor, fillColor: this.currentColor})
    //     let l = new Line({startPoint: fp1.anchor, endPoint: fp2.anchor, strokeColor: this.currentColor, fillColor: this.currentColor})
    //     let c = new DrawnCircle({midPoint: fp1.anchor, outerPoint: fp2.anchor, strokeColor: this.currentColor, fillColor: this.currentColor})
    //     let cindyRect = new DrawnRectangle({startPoint: fp1.anchor, endPoint: fp2.anchor})
    //     // more geometric objects to follow
    //     this.add(fp1)
    //     this.add(fp2)
    //     this.add(fh)
    //     this.add(s)
    //     this.add(r)
    //     this.add(l)
    //     this.add(c)
    //     this.add(cindyRect)

    //     this.newPoints = [fp1, fp2]
    //     this.newFreehand = fh
    //     this.newConstructions['segment'] = s
    //     this.newConstructions['ray'] = r
    //     this.newConstructions['line'] = l
    //     this.newConstructions['circle'] = c
    //     this.newConstructions['cindy'] = cindyRect

    //     for (let mob of Object.values(this.newConstructions)) {
    //         mob.hide()
    //     }
    //     for (let point of Object.values(this.newPoints)) {
    //         point.hide()
    //     }

    //     // show the relevant objects
    //     this.changeMode(this.currentMode)

    //     this.draggedMobject = fp2
    //     this.isCreating = true

    // }

    // handlePointerDownOnFreePoint(target, p) {
    //     if (this.currentMode == 'freehand') {
    //         this.currentMode = 'drag'
    //         this.draggedMobject = target
    //         return
    //     }

    //     // else: create something
    //     let fp1 = target
    //     fp1.update({strokeColor: this.currentColor, fillColor: this.currentColor})
    //     let fp2 = new FreePoint({anchor: p, strokeColor: this.currentColor, fillColor: this.currentColor})
    //     let s = new Segment({startPoint: fp1.anchor, endPoint: fp2.anchor, strokeColor: this.currentColor, fillColor: this.currentColor})
    //     let r = new Ray({startPoint: fp1.anchor, endPoint: fp2.anchor, strokeColor: this.currentColor, fillColor: this.currentColor})
    //     let l = new Line({startPoint: fp1.anchor, endPoint: fp2.anchor, strokeColor: this.currentColor, fillColor: this.currentColor})
    //     let c = new DrawnCircle({midPoint: fp1.anchor, outerPoint: fp2.anchor, strokeColor: this.currentColor, fillColor: this.currentColor})
    //     this.add(fp2)
    //     this.add(s)
    //     this.add(r)
    //     this.add(l)
    //     this.add(c)

    //     this.newPoints = [fp2]
    //     this.newConstructions['segment'] = s
    //     this.newConstructions['ray'] = r
    //     this.newConstructions['line'] = l
    //     this.newConstructions['circle'] = c

    //     for (let mob of Object.values(this.newConstructions)) {
    //         mob.hide()
    //     }
    //     for (let point of Object.values(this.newPoints)) {
    //         point.hide()
    //     }

    //     // show the relevant objects
    //     this.changeMode(this.currentMode)

    //     this.draggedMobject = fp2
    //     this.isCreating = true
    // }

    // handlePointerMove(target, p) {
    //     this.draggedMobject.anchor.copyFrom(p)
    //     this.snap(this.draggedMobject)
    //     if (this.newFreehand != undefined) {
    //         this.newFreehand.updateFromTip(p)
    //     }
    //     this.update()

    //     this.changeMode(this.currentMode)
    // }

//     snap(mobject) {
//         if (!(mobject instanceof FreePoint)) { return }
//         for (let otherPoint of this.freePoints) {
//             if (otherPoint == mobject) { continue }
//             if (otherPoint.anchor.subtract(mobject.anchor).norm() < 10) {
//                 mobject.anchor.copyFrom(otherPoint.anchor)
//                 return
//             }
//         }
//     }


//     handlePointerUp(target, p) {
//         this.draggedMobject = undefined
//         for (let mob of Object.values(this.newConstructions)) {
//             mob.view.remove()
//         }
//         switch (this.currentMode) {
//         case 'freehand':
//             this.freehands.push(this.newFreehand)
//             for (let point of this.newPoints) { point.view.remove() }
//             break
//         case 'segment':
//         case 'ray':
//         case 'line':
//         case 'circle':
//             let newMob = this.newConstructions[this.currentMode]
//             console.log(newMob)
//             let fp1 = this.newPoints[0]
//             let fp2 = this.newPoints[1]

//             function replaceWithSnappedPoint(fp, newMob, freePoints, paper) {
//                 let snappedFP = undefined
//                 for (let point of freePoints) {
//                     if (point.anchor.subtract(fp.anchor).norm() < 1) {
//                         let color = fp.fillColor
//                         snappedFP = point
//                         snappedFP.update({strokeColor: color, fillColor: color})
//                         break
//                     }
//                 }
//                 if (snappedFP == undefined) { return fp }

//                 try {
//                 if (newMob.startPoint.subtract(fp.anchor).norm() < 1) { newMob.startPoint = snappedFP.anchor }
//                 } catch {}
//                 try {
//                 if (newMob.endPoint.subtract(fp.anchor).norm() < 1)  {
//                     newMob.endPoint = snappedFP.anchor
//                 }
//                 } catch {}
//                 try {
//                 if (newMob.midPoint.subtract(fp.anchor).norm() < 1)  { newMob.midPoint = snappedFP.anchor }
//                 } catch {}
//                 try {
//                     if (newMob.outerPoint.subtract(fp.anchor).norm() < 1)  { newMob.outerPoint = snappedFP.anchor }
//                 } catch {}
//                 fp.view.remove()
//                 paper.add(snappedFP)
//                 return snappedFP
//             }

//             if (this.isCreating) {
//                 if (fp1 != undefined) {
//                     fp1 = replaceWithSnappedPoint(fp1, newMob, this.freePoints, this)
//                     if (!this.freePoints.includes(fp1)) {
//                         this.freePoints.push(fp1)
//                     }
//                 }
//                 if (fp2 != undefined) {
//                     fp2 = replaceWithSnappedPoint(fp2, newMob, this.freePoints, this)
//                     if (!this.freePoints.includes(fp2)) {
//                         this.freePoints.push(fp2)
//                     }
//                 }
//             }
            

//             this.constructions.push(newMob)
//             this.add(newMob)
//             console.log('just added:', newMob)

//         case 'drag':
//             this.currentMode = 'freehand'
//             break
//         case 'cindy':
//             let origin = this.newConstructions['cindy'].p1
//             let lrCorner = this.newConstructions['cindy'].p3
//             let cindyWidth = lrCorner.x - origin.x
//             let cindyHeight = lrCorner.y - origin.y
//             this.newConstructions['cindy'].view.remove()
//             this.constructions.push(new CindyCanvas(origin, cindyWidth, cindyHeight))

//         }

//         this.isCreating = false
//         this.newFreehand = undefined
//         this.newPoints = []
//         this.newConstructions = {}
//         this.update()
//     }







//     update() {
//         for (let point of this.freePoints) { point.update() }
//         for (let point of this.newPoints) { point.update() }
//         for (let mob of this.constructions) { mob.update() }
//         for (let mob of Object.values(this.newConstructions)) { mob.update() }
//     }


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


}

export const paper = new Paper({view: document.querySelector('#paper'), passAlongEvents: true })





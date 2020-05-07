import { rgb, addPointerDown, remove, removePointerDown, addPointerMove, removePointerMove, addPointerUp, removePointerUp, logInto, isTouchDevice, pointerEventVertex, LocatedEvent } from './modules/helpers'
import { Vertex } from './modules/transform'
import { Mobject, MGroup } from './modules/mobject'
import { Circle, Rectangle } from './modules/shapes'
import { Segment, Ray, Line } from './modules/arrows'
import { FreePoint } from './modules/creating'
import { CindyCanvas, WaveCindyCanvas, DrawnRectangle } from './modules/cindycanvas'
import { CreationGroup } from './modules/creationgroup'
import { BoxSlider } from './modules/slider'
import { LinkableMobject, IOList, DependencyMap } from './modules/linkables'

declare var CindyJS: any

let log = function(msg: any) { } // logInto(msg.toString(), 'paper-console')

export class Paper extends LinkableMobject {

	visibleCreation: string
	cindys: Array<CindyCanvas>
	cindyPorts: Array<object>
	snappablePoints: Array<FreePoint>
	creationStartPoint: Vertex
	colorPalette: object
	currentColor: string
	creationGroup: CreationGroup
	dependencyMap: DependencyMap
	draggedMobject: Mobject
	dragPointStart: Vertex
	dragAnchorStart: Vertex
	draggedIOList: IOList
	dragIOListAnchorStart: Vertex

	constructor(argsDict) {
		super(argsDict)
		this.children = []
		this.cindys = []
		this.setDragging(false)
		this.visibleCreation = 'freehand'
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

	changeColorByName(newColorName: string) {
		let newColor: string = this.colorPalette[newColorName]
		this.changeColor(newColor)
	}

	changeColor(newColor: string) {
		this.currentColor = newColor
		if (this.creationGroup == undefined) { return }
		this.creationGroup.setStrokeColor(this.currentColor)
		this.creationGroup.setFillColor(this.currentColor)
		this.creationGroup.update()
	}

	setDragging(flag: boolean) {
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


	startDragging(e: LocatedEvent) {
		this.draggedMobject = this.eventTargetMobject(e)
		if (this.draggedMobject == this) {
			// check if we hit a CindyCanvas
			for (let c of this.cindys) {
				let p: Vertex = pointerEventVertex(e)
				let p1: boolean = (p.x > c.anchor.x)
				let p2: boolean = (p.y > c.anchor.y)
				let p3: boolean = (p.x < c.anchor.x + c.width)
				let p4: boolean = (p.y < c.anchor.y + c.height)
				log(p1)
				log(p2)
				log(p3)
				log(p4)
				if (p1 && p2 && p3 && p4) {
					this.draggedMobject = c
					break
				}
			}
		}
		if (this.draggedMobject == this || !this.draggedMobject.draggable) {
			this.draggedMobject = undefined
			return
		}
		this.dragPointStart = pointerEventVertex(e)
		this.dragAnchorStart = this.draggedMobject.anchor.copy()
		
		this.draggedIOList = undefined
		if (this.dependencyMap == undefined) { return }
		for (let ioList of this.dependencyMap.children) {
			if ((ioList as IOList).mobject == this.draggedMobject) {
				this.draggedIOList = ioList as IOList
				break
			}
		}
		this.dragIOListAnchorStart = this.draggedIOList.anchor.copy()
	}

	dragging(e: LocatedEvent) {
		if (this.draggedMobject == undefined) { return }
		let dragPoint = pointerEventVertex(e)
		let dr = dragPoint.subtract(this.dragPointStart)

		this.draggedMobject.anchor.copyFrom(this.dragAnchorStart.add(dr))
		
		if (this.draggedMobject instanceof CindyCanvas) {
			this.draggedMobject.view.style.left =  this.draggedMobject.anchor.x + "px"
			this.draggedMobject.view.style.top = this.draggedMobject.anchor.y + "px"
		}
		this.draggedMobject.update()

		if (this.dependencyMap == undefined) { return }
		this.draggedIOList.anchor.copyFrom(this.dragIOListAnchorStart.add(dr))
		this.draggedIOList.update()
		this.dependencyMap.update()
	}

	endDragging(e: LocatedEvent) {
		this.dragPointStart = undefined
		this.dragAnchorStart = undefined
		this.draggedMobject = undefined
	}

	handleMessage(message: object) {
		if (message == undefined || message == {}) { return }
		let key: string = Object.keys(message)[0]
		let value: string | boolean | number = Object.values(message)[0]
		if (value == "true") { value = true }
		if (value == "false") { value = false }

		switch (key) {
		case 'creating':
				this.changeVisibleCreation(value as string)
			if (value == 'freehand') {
				this.passAlongEvents = true
				break
			}
			if (this.creationGroup == undefined) {
				this.passAlongEvents = false
			}
			break
		case 'color':
			this.changeColor(value as string)
			break
		case 'drag':
			this.setDragging(value as boolean)
			break
		case 'toggleLinks':
			if (value == 1 || value == '1') { this.showAllLinks() }
			else { this.hideAllLinks() }
			break
		}

	}

	changeVisibleCreation(newVisibleCreation: string) {
		this.visibleCreation = newVisibleCreation
		if (this.creationGroup != undefined) {
			this.creationGroup.setVisibleCreation(newVisibleCreation)
		}
	}


	startCreating(e: LocatedEvent) {
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

	creativeMove(e: LocatedEvent) {
		let p: Vertex = pointerEventVertex(e)
		for (let fq of this.snappablePoints) {
			let q: Vertex = fq.anchor
			if (p.subtract(q).norm() < 10) {
				p = q
				break
			}
		}

		this.creationGroup.updateFromTip(p)
	}

	endCreating(e: LocatedEvent) {
		this.creationGroup.dissolveInto(this)
		this.remove(this.creationGroup)
		this.creationGroup = undefined
	}

	addCindy(cindyCanvas: CindyCanvas) {
		// document.querySelector('#paper-container').insertBefore(
		// 	cindyCanvas.view, document.querySelector('#paper-console')
		// )
		// document.body.appendChild(cindyCanvas.script)
		this.cindys.push(cindyCanvas)
	}

	removeCindy(cindyCanvas: CindyCanvas) {
		cindyCanvas.view.remove()
		cindyCanvas.initScript.remove()
		cindyCanvas.drawScript.remove()
	}

	addFreePoint(fp: FreePoint) {
		this.snappablePoints.push(fp)
		super.add(fp)
	}

	removeFreePoint(fp: FreePoint) {
		remove(this.snappablePoints, fp)
		super.remove(fp)
	}

	add(mobject: Mobject) {
		if (mobject instanceof CindyCanvas) {
			this.addCindy(mobject)
		} else if (mobject instanceof FreePoint) {
			this.addFreePoint(mobject)
		} else {
			super.add(mobject)
		}
	}

	remove(mobject: Mobject) {
		if (mobject instanceof CindyCanvas) {
			this.removeCindy(mobject)
		} else if (mobject instanceof FreePoint) {
			this.removeFreePoint(mobject)
		} else {
			super.remove(mobject)
		}
	}

	showAllLinks() {
		this.showLinksOfSubmobs()
	}

	hideAllLinks() {
		this.hideLinksOfSubmobs()
	}

	callCindyJS(argsDict: object) {
		return CindyJS(argsDict)
	}

}

export const paper = new Paper({ view: document.querySelector('#paper'), passAlongEvents: true })










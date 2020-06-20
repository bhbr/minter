import { addPointerDown, remove, removePointerDown, addPointerMove, removePointerMove, addPointerUp, removePointerUp, logInto, isTouchDevice, pointerEventVertex, LocatedEvent } from './modules/helpers'
import { Vertex } from './modules/transform'
import { Color, Mobject, MGroup } from './modules/mobject'
import { Circle, Rectangle, TwoPointCircle } from './modules/shapes'
import { Arrow, Segment, Ray, Line } from './modules/arrows'
import { Point, FreePoint } from './modules/creating'
import { CindyCanvas, WaveCindyCanvas, DrawnRectangle } from './modules/cindycanvas'
import { CreationGroup } from './modules/creationgroup'
import { BoxSlider } from './modules/slider'
import { LinkableMobject, IOList, DependencyMap } from './modules/linkables'
import { Construction } from './modules/construction'
import { Pendulum } from './modules/pendulum'

declare var CindyJS: any

let log = function(msg: any) { } // logInto(msg.toString(), 'paper-console')

export class Paper extends LinkableMobject {

	visibleCreation: string
	cindys: Array<CindyCanvas>
	cindyPorts: Array<object>
	snappablePoints: Array<Point>
	creationStartPoint: Vertex
	colorPalette: object
	currentColor: Color
	creationGroup: CreationGroup
	dependencyMap: DependencyMap
	draggedMobject: Mobject
	dragPointStart: Vertex
	dragAnchorStart: Vertex
	draggedIOList: IOList
	dragIOListAnchorStart: Vertex
	construction: Construction

	constructor(argsDict: object = {}) {
		super()
		this.children = []
		this.cindys = []
		this.visibleCreation = 'freehand'
		this.cindyPorts = []
		this.snappablePoints = []
		this.construction = new Construction()

		this.colorPalette = {
			'black': Color.black(),
			'white': Color.white(),
			'red': Color.red(),
			'orange': Color.orange(),
			'yellow': Color.yellow(),
			'green': Color.green(),
			'blue': Color.blue(),
			'indigo': Color.indigo(),
			'violet': Color.violet()
		}
		this.currentColor = this.colorPalette['white']
		this.setDragging(false)
		this.update(argsDict)
		this.add(this.construction)

	}

	changeColorByName(newColorName: string) {
		let newColor: Color = this.colorPalette[newColorName]
		this.changeColor(newColor)
	}

	changeColor(newColor: Color) {
		this.currentColor = newColor
		if (this.creationGroup == undefined) { return }
		this.creationGroup.update({
			strokeColor: this.currentColor,
			fillColor: this.currentColor
		})
	}

	setDragging(flag: boolean) {
		this.passAlongEvents = !flag
		for (let c of this.cindys) {
			c.draggable = flag
			c.csView.parentElement.style['pointer-events'] = (flag ? 'none' : 'auto')
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
		let newAnchor: Vertex = this.dragAnchorStart.add(dr)
		this.draggedMobject.update({ anchor: newAnchor })

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
		let value: string | boolean | number | Color = Object.values(message)[0]
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
			this.changeColor(value as Color)
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
		console.log('startCreating')
		this.creationStartPoint = pointerEventVertex(e)
		let drawFreehand = true
		for (let fp of this.construction.points) {
			if (this.creationStartPoint.subtract(fp.midPoint).norm() < 20) {
				this.creationStartPoint = fp.midPoint
				drawFreehand = false
			}
		}

		this.creationGroup = new CreationGroup({
			startPoint: this.creationStartPoint,
			visibleCreation: this.visibleCreation,
			drawFreehand: drawFreehand,
			strokeColor: this.currentColor,
			fillColor: this.currentColor
		})
		
		this.addDependency('currentColor',
			this.creationGroup, 'strokeColor')
		this.addDependency('currentColor',
			this.creationGroup, 'fillColor')
		this.add(this.creationGroup)
		this.changeVisibleCreation(this.visibleCreation)
	}

	creativeMove(e: LocatedEvent) {
		let p: Vertex = pointerEventVertex(e)
		if (['segment', 'ray', 'line', 'circle'].includes(this.creationGroup.visibleCreation)) {
			// snap to existing points
			for (let fq of this.construction.points) {
				let q: Vertex = fq.anchor
				if (p.subtract(q).norm() < 10) {
					p = q
					break
				}
			}
		}
		this.creationGroup.updateFromTip(p)
	}

	endCreating(e: LocatedEvent) {
		this.creationGroup.dissolveInto(this)
		this.creationGroup = undefined
	}



	addCindy(cindyCanvas: CindyCanvas) {
		this.cindys.push(cindyCanvas)
	}

	removeCindy(cindyCanvas: CindyCanvas) {
		cindyCanvas.view.remove()
		cindyCanvas.initScript.remove()
		cindyCanvas.drawScript.remove()
	}

	add(mobject: Mobject) {
		if (mobject instanceof CindyCanvas) {
			this.addCindy(mobject)
		} else {
			super.add(mobject)
		}
	}

	remove(mobject: Mobject) {
		if (mobject instanceof CindyCanvas) {
			this.removeCindy(mobject)
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

	redraw() {
		this.redrawSubmobs()
	}

}

export const paper = new Paper({
	view: document.querySelector('#paper'),
	passAlongEvents: true
})

// let p = new Pendulum({
// 	anchor: new Vertex(300, 150),
// 	length: 100,
// 	initialAngle: 2 * Math.PI / 8
// })
// paper.add(p)
// p.run()





















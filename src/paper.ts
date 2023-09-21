import { remove, log, copy, deepCopy } from './modules/helpers/helpers'
import { addPointerDown, removePointerDown, addPointerMove, removePointerMove, addPointerUp, removePointerUp, isTouchDevice, eventVertex, LocatedEvent, PointerEventPolicy } from './modules/mobject/pointer_events'
import { Vertex, Transform } from './modules/helpers/Vertex_Transform'
import { Mobject } from './modules/mobject/Mobject'
import { MGroup } from './modules/mobject/MGroup'
import { LinkableMobject } from './modules/mobject/linkable/LinkableMobject'
import { IOList } from './modules/mobject/linkable/IOList'
import { DependencyMap } from './modules/mobject/linkable/DependencyMap'
import { ExpandableMobject } from './modules/mobject/ExpandableMobject'
import { Color, COLOR_PALETTE } from './modules/helpers/Color'
import { Circle } from './modules/shapes/Circle'
import { Rectangle } from './modules/shapes/Rectangle'
import { RoundedRectangle } from './modules/shapes/RoundedRectangle'
import { TwoPointCircle } from './modules/shapes/TwoPointCircle'
import { Arrow } from './modules/arrows/Arrow'
import { Segment } from './modules/arrows/Segment'
import { Ray } from './modules/arrows/Ray'
import { Line } from './modules/arrows/Line'
import { Point } from './modules/creations/Point'
import { FreePoint } from './modules/creations/FreePoint'
import { CreationGroup } from './modules/creations/CreationGroup'
import { BoxSlider } from './modules/slider/BoxSlider'
import { Construction } from './modules/construction/Construction'
import { Pendulum } from './modules/pendulum/Pendulum'
import { CindyCanvas } from './modules/cindy/CindyCanvas'
import { DEGREES, TAU } from './modules/helpers/math'
import { WaveCindyCanvas } from './modules/cindy/WaveCindyCanvas'
import { CircularArc } from './modules/shapes/CircularArc'

declare var CindyJS: any

export class Paper extends ExpandableMobject {

	//visibleCreation: string
	cindyPorts: Array<object>
	//creationStartPoint: Vertex
	currentColor: Color
	//creationGroup?: CreationGroup
	construction: Construction
	expandedMobject: ExpandableMobject

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			children: [],
			//visibleCreation: 'freehand',
			draggable: false,
			draggedMobjects: [],
			pointerEventPolicy: PointerEventPolicy.Handle,
			expandedMobject: this
		})
	}

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			expanded: true,
			expandedPadding: 0,
		})
	}

	statelessSetup() {
		super.statelessSetup()
		this.currentColor = COLOR_PALETTE['white']
		this.background = new RoundedRectangle({
			cornerRadius: 0,
			fillColor: Color.clear(),
			fillOpacity: 1,
			strokeWidth: 0,
			draggable: false,
			pointerEventPolicy: PointerEventPolicy.Pass
		})
		this.construction = new Construction()
	}

	statefulSetup() {
		super.statefulSetup()
		// this.add(this.construction)
		// this.construction.update({
		// 	viewWidth: 300,
		// 	viewHeight: 200
		// }, false)
		this.setDragging(false)
	}

	// onPointerDown(e: LocatedEvent) { this.startCreating(e) }
	// onPointerMove(e: LocatedEvent) { this.creativeMove(e) }
	// onPointerUp(e: LocatedEvent) { this.endCreating(e) }

	changeColorByName(newColorName: string) {
		let newColor: Color = COLOR_PALETTE[newColorName]
		this.changeColor(newColor)
	}

	changeColor(newColor: Color) {
		// this.currentColor = newColor
		// if (this.creationGroup == undefined) { return }
		// this.creationGroup.update({
		// 	penColor: this.currentColor
		// })
	}


	getMessage(message: object) {
		if (message == undefined || message == {}) { return }
		let key: string = Object.keys(message)[0]
		let value: string | boolean | number = Object.values(message)[0]
		if (value == "true") { value = true }
		if (value == "false") { value = false }
		this.expandedMobject.handleMessage(key, value)
	}

	handleMessage(key: string, value: any) {
		switch (key) {
		// case 'creating':
			// 	this.changeVisibleCreation(value as string)
			// if (value == 'freehand') {
			// 	this.pointerEventPolicy = PointerEventPolicy.Pass
			// 	break
			// }
			// if (this.creationGroup == undefined) {
			// 	this.pointerEventPolicy = PointerEventPolicy.Handle
			// }
		// 	break
		// case 'color':
		// 	this.changeColor(COLOR_PALETTE[value as string] as Color)
		// 	break
		case 'drag':
			this.setDragging(value as boolean)
			break
		// case 'toggleLinks':
		// 	if (value == 1 || value == '1') { this.showAllLinks() }
		// 	else { this.hideAllLinks() }
		// 	break
		}

	}

	// changeVisibleCreation(newVisibleCreation: string) {
	// 	this.visibleCreation = newVisibleCreation
	// 	if (this.creationGroup != undefined) {
	// 		this.creationGroup.setVisibleCreation(newVisibleCreation)
	// 	}
	// }

	// startCreating(e: LocatedEvent) {
	// 	console.log('startCreating')
	// 	this.creationStartPoint = eventVertex(e)
	// 	let drawFreehand = true
	// 	for (let fp of this.construction.points) {
	// 		if (this.creationStartPoint.subtract(fp.midpoint).norm() < 20) {
	// 			this.creationStartPoint = fp.midpoint
	// 			drawFreehand = false
	// 		}
	// 	}

	// 	this.creationGroup = new CreationGroup({
	// 		viewWidth: this.viewWidth,
	// 		viewHeight: this.viewHeight,
	// 		startPoint: this.creationStartPoint,
	// 		visibleCreation: this.visibleCreation,
	// 		drawFreehand: drawFreehand,
	// 		penColor: this.currentColor
	// 	})
		
	// 	this.addDependency('currentColor', this.creationGroup, 'strokeColor')
	// 	this.add(this.creationGroup)
	// 	this.changeVisibleCreation(this.visibleCreation)
	// }

	// creativeMove(e: LocatedEvent) {
	// 	if (this.creationGroup == undefined) { return }
	// 	let p: Vertex = eventVertex(e)
	// 	if (['segment', 'ray', 'line', 'circle'].includes(this.creationGroup.visibleCreation)) {
	// 		// snap to existing points
	// 		for (let fq of this.construction.points) {
	// 			let q: Vertex = fq.midpoint
	// 			if (p.subtract(q).norm() < 10) {
	// 				p = q
	// 				break
	// 			}
	// 		}
	// 	}
	// 	this.creationGroup.updateFromTip(p)
	// }

	// endCreating(e: LocatedEvent) {
	// 	if (this.creationGroup == undefined) { return }
	// 	this.creationGroup.dissolveInto(this)
	// 	this.creationGroup = undefined
	// }


	showAllLinks() {
		this.showLinksOfSubmobs()
	}

	hideAllLinks() {
		this.hideLinksOfSubmobs()
	}

	// setDragging(flag: boolean) {
	// 	super.setDragging(flag)
	// 	if (!flag) {
	// 		//this.onPointerDown = this.startCreating
	// 		//this.onPointerMove = this.creativeMove
	// 		//this.onPointerUp = this.endCreating
	// 	}
	// }

	// dragging(e: LocatedEvent) {
	// 	super.dragging(e)
	// }

	get expandedAnchor(): Vertex {
		return isTouchDevice ? Vertex.origin() : new Vertex(150, 0)
	}

}

let paperDiv = document.querySelector('#paper') as HTMLElement
export const paper = new Paper({
	view: paperDiv,
	viewWidth: 1250,
	viewHeight: 1024,
})

let slider1 = new BoxSlider({
	anchor: new Vertex(200, 500),
})

paper.add(slider1)

let exp = new ExpandableMobject({
	compactAnchor: new Vertex(400, 100),
	compactWidth: 500,
	compactHeight: 200
})

let slider2 = new BoxSlider({
	anchor: new Vertex(100, 50)
})

exp.add(slider2)
paper.add(exp)

paper.setDragging(true)
slider1.setDragging(true)
exp.setDragging(true)
// slider2.setDragging(true)

log('done')







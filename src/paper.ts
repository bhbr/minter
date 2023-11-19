import { remove, log, copy, deepCopy } from './modules/helpers/helpers'
import { locatedEventDevice, addPointerDown, removePointerDown, addPointerMove, removePointerMove, addPointerUp, removePointerUp, isTouchDevice, eventVertex, LocatedEvent, PointerEventPolicy } from './modules/mobject/pointer_events'
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
	emulatePen: boolean

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			children: [],
			//visibleCreation: 'freehand',
			draggable: false,
			draggedMobjects: [],
			pointerEventPolicy: PointerEventPolicy.Handle,
			expandedMobject: this,
			emulatePen: false
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
			pointerEventPolicy: PointerEventPolicy.PassUp //?
		})
		this.construction = new Construction()
	}

	statefulSetup() {
		super.statefulSetup()
		this.setDragging(false)
		this.boundButtonUpByKey = this.buttonUpByKey.bind(this)
		this.boundButtonDownByKey = this.buttonDownByKey.bind(this)
		document.addEventListener('keydown', this.boundButtonDownByKey)
		document.addEventListener('keyup', this.boundButtonUpByKey)
	}

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

	boundButtonDownByKey(e: KeyboardEvent) { }
	boundButtonUpByKey(e: KeyboardEvent) { }

	buttonDownByKey(e: KeyboardEvent) {
		log('button down')
		e.preventDefault()
		e.stopPropagation()
		document.removeEventListener('keydown', this.boundButtonDownByKey)
		document.addEventListener('keyup', this.boundButtonUpByKey)
		if (e.key == 'Shift') {
			log('Shift')
			this.emulatePen = !this.emulatePen
			log(this.emulatePen)
		}
	}

	buttonUpByKey(e: KeyboardEvent) {
		log('button up')
		if (e.key == 'Shift') {
			log('Shift')
			document.removeEventListener('keyup', this.boundButtonUpByKey)
			document.addEventListener('keydown', this.boundButtonDownByKey)
			//this.emulatePen = false
		}
	}

	// handleMessage(key: string, value: any) {
	// 	log(`Paper got message ${key} ${value}`)
	// 	switch (key) {
	// 	// case 'color':
	// 	// 	this.changeColor(COLOR_PALETTE[value as string] as Color)
	// 	// 	break
	// 	// case 'toggleLinks':
	// 	// 	if (value == 1 || value == '1') { this.showAllLinks() }
	// 	// 	else { this.hideAllLinks() }
	// 	// 	break
	// 	}



	showAllLinks() {
		this.showLinksOfSubmobs()
	}

	hideAllLinks() {
		this.hideLinksOfSubmobs()
	}

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


let con = new Construction({
	compactAnchor: new Vertex(400, 100),
	compactWidth: 500,
	compactHeight: 200,
	contracted: true
})

paper.add(con)




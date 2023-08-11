import { remove, logInto, paperLog, copy, deepCopy } from './modules/helpers/helpers'
import { addPointerDown, removePointerDown, addPointerMove, removePointerMove, addPointerUp, removePointerUp, isTouchDevice, pointerEventVertex, LocatedEvent, PointerEventPolicy } from './modules/mobject/pointer_events'
import { Vertex } from './modules/helpers/Vertex_Transform'
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

declare var CindyJS: any

export class Paper extends ExpandableMobject {

	visibleCreation: string
	cindyPorts: Array<object>
	creationStartPoint: Vertex
	currentColor: Color
	creationGroup?: CreationGroup
	construction: Construction

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			children: [],
			visibleCreation: 'freehand',
			draggable: false,
			draggedMobjects: []
		})
	}

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			isExpanded: true
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

	savedOnPointerDown(e: LocatedEvent) { this.startCreating(e) }
	savedOnPointerMove(e: LocatedEvent) { this.creativeMove(e) }
	savedOnPointerUp(e: LocatedEvent) { this.endCreating(e) }

	changeColorByName(newColorName: string) {
		let newColor: Color = COLOR_PALETTE[newColorName]
		this.changeColor(newColor)
	}

	changeColor(newColor: Color) {
		this.currentColor = newColor
		if (this.creationGroup == undefined) { return }
		this.creationGroup.update({
			penColor: this.currentColor
		})
	}


	handleMessage(message: object) {
		if (message == undefined || message == {}) { return }
		let key: string = Object.keys(message)[0]
		let value: string | boolean | number = Object.values(message)[0]
		if (value == "true") { value = true }
		if (value == "false") { value = false }

		switch (key) {
		case 'creating':
				this.changeVisibleCreation(value as string)
			if (value == 'freehand') {
				this.pointerEventPolicy = PointerEventPolicy.Pass
				break
			}
			if (this.creationGroup == undefined) {
				this.pointerEventPolicy = PointerEventPolicy.Handle
			}
			break
		case 'color':
			this.changeColor(COLOR_PALETTE[value as string] as Color)
			break
		case 'drag':
			this.setDragging(value as boolean)
			break
		case 'toggleLinks':
			if (value == 1 || value == '1') { this.showAllLinks() }
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
		let drawFreehand = true
		for (let fp of this.construction.points) {
			if (this.creationStartPoint.subtract(fp.midpoint).norm() < 20) {
				this.creationStartPoint = fp.midpoint
				drawFreehand = false
			}
		}

		this.creationGroup = new CreationGroup({
			viewWidth: this.viewWidth,
			viewHeight: this.viewHeight,
			startPoint: this.creationStartPoint,
			visibleCreation: this.visibleCreation,
			drawFreehand: drawFreehand,
			penColor: this.currentColor
		})
		
		this.addDependency('currentColor', this.creationGroup, 'strokeColor')
		this.add(this.creationGroup)
		this.changeVisibleCreation(this.visibleCreation)
	}

	creativeMove(e: LocatedEvent) {
		if (this.creationGroup == undefined) { return }
		let p: Vertex = pointerEventVertex(e)
		if (['segment', 'ray', 'line', 'circle'].includes(this.creationGroup.visibleCreation)) {
			// snap to existing points
			for (let fq of this.construction.points) {
				let q: Vertex = fq.midpoint
				if (p.subtract(q).norm() < 10) {
					p = q
					break
				}
			}
		}
		this.creationGroup.updateFromTip(p)
	}

	endCreating(e: LocatedEvent) {
		if (this.creationGroup == undefined) { return }
		this.creationGroup.dissolveInto(this)
		this.creationGroup = undefined
	}


	showAllLinks() {
		this.showLinksOfSubmobs()
	}

	hideAllLinks() {
		this.hideLinksOfSubmobs()
	}

	setDragging(flag: boolean) {
		super.setDragging(flag)
		if (!flag) {
			//this.onPointerDown = this.startCreating
			//this.onPointerMove = this.creativeMove
			//this.onPointerUp = this.endCreating
		}
	}

	dragging(e: LocatedEvent) {
		super.dragging(e)

	}

}

var paperAnchor = Vertex.origin()
if (isTouchDevice === false) {
	paperAnchor = new Vertex(150, 0)
}

export const paper = new Paper({
	view: document.querySelector('#paper'),
	anchor: paperAnchor,
	pointerEventPolicy: PointerEventPolicy.Handle,
	viewWidth: 1250,
	viewHeight: 1200
})

let obj = new ExpandableMobject({
	viewWidth: 400,
	viewHeight: 300,
	anchor: new Vertex(500, 200),
	pointerEventPolicy: PointerEventPolicy.Handle
})
obj.background.view.setAttribute('id', 'background')

paper.add(obj)


let obj1 = new RoundedRectangle({
	width: 200,
	height: 100,
	cornerRadius: 50,
	fillColor: Color.red(),
	fillOpacity: 1.0,
	anchor: new Vertex(50, 50)
})

let submob = new Circle({
	anchor: new Vertex(100, 50),
	radius: 25
})

obj1.add(submob)

let obj2 = deepCopy(obj1)

console.log(obj1, obj2)//, obj3)

console.log(obj1.children === obj2.children)
console.log(obj1.children[0] === obj2.children[0])
console.log(obj1 === obj2)

//console.log(obj1['0'] === obj3['0'])

//paper.add(obj1)

// obj1.path.setAttribute('id', 'path1')
// obj2.path.setAttribute('id', 'path2')

// let d1: string = obj1.pathString()
// let d2: string = obj2.pathString()

// obj2.path.animate({
// 	strokeWidth: [1.0, 5.0],
// 	d: [d1, d2]
// }, 1000)

// let anim1 = document.createElementNS('http://www.w3.org/2000/svg', 'animate')
// anim1.setAttribute('attributeName', 'd')
// anim1.setAttribute('values', d1 + ';' + d2 + ';')
// anim1.setAttribute('dur', '1s')
// anim1.setAttribute('fill', 'freeze')

// let anim2 = document.createElementNS('http://www.w3.org/2000/svg', 'animate')
// anim2.setAttribute('attributeName', 'fill-opacity')
// anim2.setAttribute('attributeType', 'CSS')
// anim2.setAttribute('from', '1.0')
// anim2.setAttribute('to', '0.1')
// anim2.setAttribute('dur', '1s')
// anim2.setAttribute('fill', 'freeze')

// obj1.path.appendChild(anim1)
// obj1.path.appendChild(anim2)

// let timeoutID1 = window.setTimeout(() => {
// 	console.log(obj1.vertices)
// 	console.log(obj1.pathString())
// 	console.log(obj1.path.getAttribute('d'))
// 	obj1.updateFrom(obj2, ['width', 'height', 'cornerRadius', 'fillOpacity'])
// 	anim1.remove()
// 	anim2.remove()
// }, 1000)















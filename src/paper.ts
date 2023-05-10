import { addPointerDown, remove, removePointerDown, addPointerMove, removePointerMove, addPointerUp, removePointerUp, logInto, isTouchDevice, pointerEventVertex, LocatedEvent, PointerEventPolicy } from './modules/helpers'
import { Vertex } from './modules/vertex-transform'
import { Mobject, MGroup } from './modules/mobject'
import { LinkableMobject, IOList, DependencyMap } from './modules/linkables'
import { ExpandableMobject } from './modules/expandables'
import { Color, COLOR_PALETTE } from './modules/color'
import { Circle, Rectangle, TwoPointCircle } from './modules/shapes'
import { Arrow, Segment, Ray, Line } from './modules/arrows'
import { Point, FreePoint } from './modules/creating'
import { CreationGroup } from './modules/creationgroup'
import { BoxSlider } from './modules/slider'
import { Construction } from './modules/construction'
import { Pendulum } from './modules/pendulum'
import { CindyCanvas } from './modules/cindycanvas'

declare var CindyJS: any

export class Paper extends ExpandableMobject {

	visibleCreation: string
	cindyPorts: Array<object>
	//snappablePoints: Array<Point>
	creationStartPoint: Vertex
	currentColor: Color
	creationGroup: CreationGroup
	construction: Construction

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			children: [],
			visibleCreation: 'freehand',
			snappablePoints: [],
			interactive: true,
			draggable: true,
			draggedMobjects: []
		})
	}

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			isExpanded: true
			// interactive: true,
			// draggable: true,
		})
	}

	statelessSetup() {
		super.statelessSetup()
		this.currentColor = COLOR_PALETTE['white']
		this.background = new Rectangle({
			fillColor: Color.clear(),
			fillOpacity: 1,
			strokeWidth: 0,
			passAlongEvents: false,
			interactive: false,
			draggable: false,
			pointerEventPolicy: PointerEventPolicy.PassUp
		})


		this.construction = new Construction()
	}

	statefulSetup() {
		console.log('starting stateful setup')
		console.log(this.selfHandlePointerDown, this.savedSelfHandlePointerDown)
		super.statefulSetup()
		console.log(this.selfHandlePointerDown, this.savedSelfHandlePointerDown)

		this.add(this.construction)
		this.construction.update({
			viewWidth: 0, //this.viewWidth,
			viewHeight: 0 //this.viewHeight
		}, false)
		console.log('setting dragging 2...')
		this.setDragging(false)
	}

	updateModel(argsDict: object = {}) {
		super.updateModel(argsDict)

		this.background.updateModel({
			width: this.viewWidth,
			height: this.viewHeight,
			viewWidth: this.viewWidth,
			viewHeight: this.viewHeight
		})
	}

	savedSelfHandlePointerDown(e: LocatedEvent) { this.startCreating(e) }
	savedSelfHandlePointerMove(e: LocatedEvent) { this.creativeMove(e) }
	savedSelfHandlePointerUp(e: LocatedEvent) { this.endCreating(e) }

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
				this.pointerEventPolicy = PointerEventPolicy.PassDown
				//this.passAlongEvents = true
				break
			}
			if (this.creationGroup == undefined) {
				this.pointerEventPolicy = PointerEventPolicy.HandleYourself
				//this.passAlongEvents = false
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
		console.log('startCreating')
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
			this.selfHandlePointerDown = this.startCreating
			this.selfHandlePointerMove = this.creativeMove
			this.selfHandlePointerUp = this.endCreating
		}
	}

}

var paperAnchor = Vertex.origin()
if (isTouchDevice === false) {
	paperAnchor = new Vertex(150, 0)
}

export const paper = new Paper({
	view: document.querySelector('#paper'),
	anchor: paperAnchor,
	pointerEventPolicy: PointerEventPolicy.PassDown,
	//passAlongEvents: true,
	viewWidth: 1250,
	viewHeight: 1200
})

// let c = new Circle({
// 	radius: 100,
// 	anchor: new Vertex(200, 300)
// })

// let s = new BoxSlider({
// 	anchor: new Vertex(200, 300),
// 	height: 150
// })

// let r = new Rectangle({
// 	anchor: new Vertex(150, 150),
// 	fillColor: Color.red(),
// 	fillOpacity: 1,
// 	width: 220,
// 	height: 150,
// 	viewWidth: 220,
// 	viewHeight: 150,
// 	passAlongEvents: true
// })

// paper.add(c)
// paper.add(s)
// paper.add(r)








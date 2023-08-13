import { Mobject } from './Mobject'
import { LinkableMobject } from './linkable/LinkableMobject'
import { IOList } from 'linkable/IOList'
import { RoundedRectangle } from '../shapes/RoundedRectangle'
import { PointerEventPolicy, LocatedEvent, pointerEventVertex } from './pointer_events'
import { Vertex } from '../helpers/Vertex_Transform'
import { CindyCanvas } from '../cindy/CindyCanvas'
import { Color } from '../helpers/Color'
import { addLongPressListener, removeLongPressListener } from './long_press'

export class ExpandableMobject extends LinkableMobject {
	
	linkableChildren: Array<LinkableMobject>
	expanded: boolean
	background: RoundedRectangle
	draggedMobjects: Array<Mobject>
	dragPointStart?: Vertex
	contractedWidth: number
	contractedHeight: number

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			pointerEventPolicy: PointerEventPolicy.Handle,
			linkableChildren: [],
			expanded: false,
			draggedMobjects: [],
			viewWidth: 400,
			viewHeight: 300,
			contractedWidth: 400,
			contractedHeight: 300
		})
	}

	statefulSetup() {
		super.statefulSetup()
		this.background = new RoundedRectangle({
			width: this.viewWidth,
			height: this.viewHeight,
			cornerRadius: 50,
			fillColor: Color.gray(0.5),
			fillOpacity: 0.25,
			strokeColor: Color.clear(),
			anchor: Vertex.origin(),
			pointerEventPolicy: PointerEventPolicy.Pass
		})
		//this.add(this.background)

		this.setDragging(false)
	}

	getExpandedBackground(): RoundedRectangle {
		let ew = this.getPaper().viewWidth
		let eh = this.getPaper().viewHeight
		return new RoundedRectangle({
			width: 0.9 * ew,
			height: 0.9 * eh,
			cornerRadius: 50,
			anchor: new Vertex(0.05 * ew, 0.05 * eh)
		})
	}

	getExpandedPath(): Array<Vertex> {
		return this.getExpandedBackground().bezierPoints
	}

	getExpandedPathString(): string {
		return this.getExpandedBackground().pathString()
	}

	getContractedBackground(): RoundedRectangle {
		let ew = this.contractedWidth
		let eh = this.contractedHeight
		return new RoundedRectangle({
			width: ew,
			height: eh,
			cornerRadius: 50,
			anchor: this.anchor
		})
	}

	getContractedPath(): Array<Vertex> {
		return this.getContractedBackground().bezierPoints
	}

	getContractedPathString(): string {
		return this.getContractedBackground().pathString()
	}

	expand() {
		console.log('expanding')
		this.expanded = true
		this.background.animate({
			width: 100,
			height: 200,
			anchor: new Vertex(300, 100)
		}, 2)
		this.update({
			width: 100,
			height: 200,
			anchor: new Vertex(300, 100)	
		})
		this.background.update({
			anchor: Vertex.origin()
		})
	}

	contract() {
		console.log('contract')
		this.expanded = false
	}

	onDoubleTap(e: LocatedEvent) {
		if (this.expanded) {
			this.contract()
		} else {
			this.expand()
		}		
	}

	getCindys(): Array<CindyCanvas> {
		let ret: Array<CindyCanvas> = []
		for (let submob of this.submobs) {
			if (submob instanceof CindyCanvas) {
				ret.push(submob)
			}
		}
		return ret
	}

	setDragging(flag: boolean) {

		// this.pointerEventPolicy = (flag ? PointerEventPolicy.Handle : PointerEventPolicy.Pass)
		// console.log(this.pointerEventPolicy)

		// this.update({
		// 	draggable: flag
		// })
		// for (let submob of this.submobs) {
		// 	submob.update({
		// 		draggable: flag
		// 	})
		// }

		// if (flag) {
		// 	this.savedOnPointerDown = this.onPointerDown
		// 	this.savedOnPointerMove = this.onPointerMove
		// 	this.savedOnPointerUp = this.onPointerUp
		// 	this.onPointerDown = this.startDragging
		// 	this.onPointerMove = this.dragging
		// 	this.onPointerUp = this.endDragging

		// 	// for (let submob of this.getCindys()) {
		// 	// 	submob.pointerEventPolicy = PointerEventPolicy.Cancel //?
		// 	// }
		// } else {
		// 	this.onPointerDown = this.savedOnPointerDown
		// 	this.onPointerMove = this.savedOnPointerMove
		// 	this.onPointerUp = this.savedOnPointerUp
		// 	for (let submob of this.getCindys()) {
		// 		submob.pointerEventPolicy = PointerEventPolicy.Propagate
		// 	}
		// }
	}

	startDragging(e: LocatedEvent) {
		console.log('startDragging')
		let target = this.eventTargetMobject(e)
		if (target == this.background) {
			this.draggedMobjects = []
			for (let child of this.children) {
				if (child.draggable){
					this.draggedMobjects.push(child)
				}
			}
		} else if (target.draggable) {
			this.draggedMobjects = [target]
		} else {
			this.draggedMobjects = []
		}

		this.dragPointStart = pointerEventVertex(e)

		for (let mob of this.draggedMobjects) {
			mob.dragAnchorStart = mob.anchor.copy()
		}

		if (this.dependencyMap == undefined) { return }
		for (let ioList of this.dependencyMap.children) {
			if (this.draggedMobjects.includes((ioList as IOList).mobject)) {
				this.draggedMobjects.push(ioList as IOList)
				break
			}
		}
	}

	dragging(e: LocatedEvent) {
		let dragPoint = pointerEventVertex(e)
		let dr = dragPoint.subtract(this.dragPointStart)

		for (let mob of this.draggedMobjects) {
			let newAnchor: Vertex = mob.dragAnchorStart.add(dr)
			mob.update({ anchor: newAnchor })
			mob.view.style.left = `${newAnchor.x}px`
			mob.view.style.top = `${newAnchor.y}px`
		}

		if (this.dependencyMap == undefined) { return }
		this.dependencyMap.update()
	}

	endDragging(e: LocatedEvent) {
		this.draggedMobjects = []
	}

	updateModel(argsDict: object = {}) {
		//argsDict['viewWidth'] = this.viewWidth
		//argsDict['viewHeight'] = this.viewHeight
		super.updateModel(argsDict)
		this.background.updateModel({
			width: this.viewWidth,
			height: this.viewHeight,
			viewWidth: this.viewWidth,
			viewHeight: this.viewHeight
		})
	}

}
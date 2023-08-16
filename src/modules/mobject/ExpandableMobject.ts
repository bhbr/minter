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
	compactWidth: number
	compactHeight: number
	compactAnchor: Vertex

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			pointerEventPolicy: PointerEventPolicy.Handle,
			linkableChildren: [],
			expanded: false,
			draggedMobjects: [],
			viewWidth: 400,
			viewHeight: 300,
			compactWidth: 400,
			compactHeight: 300,
			compactAnchor: Vertex.origin()
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
		this.add(this.background)

		this.setDragging(false)
	}

	expand() {
		this.expanded = true
		this.animate({
			viewWidth: this.getPaper().viewWidth - 100,
			viewHeight: this.getPaper().viewHeight - 100,
			anchor: new Vertex(50, 50)
		}, 0.5)
	}

	contract() {
		console.log('contract')
		this.expanded = false
	}

	onDoubleTap(e: LocatedEvent) {
		console.log("onDoubleTap enter:", Date.now())
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
		//console.log('updating ExpandableMobject')
		super.updateModel(argsDict)
		this.background.updateModel({
			width: this.viewWidth,
			height: this.viewHeight,
			viewWidth: this.viewWidth,
			viewHeight: this.viewHeight
		})
	}

}
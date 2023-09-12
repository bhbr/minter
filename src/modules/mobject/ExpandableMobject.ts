import { Mobject } from './Mobject'
import { LinkableMobject } from './linkable/LinkableMobject'
import { IOList } from 'linkable/IOList'
import { RoundedRectangle } from '../shapes/RoundedRectangle'
import { PointerEventPolicy, LocatedEvent, pointerEventVertex } from './pointer_events'
import { Vertex } from '../helpers/Vertex_Transform'
import { CindyCanvas } from '../cindy/CindyCanvas'
import { Color } from '../helpers/Color'
import { addLongPressListener, removeLongPressListener } from './long_press'

declare var paper: any

export class ExpandableMobject extends LinkableMobject {
	
	linkableChildren: Array<LinkableMobject>
	expanded: boolean
	background: RoundedRectangle
	draggedMobjects: Array<Mobject>
	dragPointStart?: Vertex
	compactWidth: number
	compactHeight: number
	compactAnchor: Vertex
	expandedPadding: number

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			pointerEventPolicy: PointerEventPolicy.Handle,
			linkableChildren: [],
			expanded: false,
			draggedMobjects: [],
			compactWidth: 400,
			compactHeight: 300,
			compactAnchor: Vertex.origin(),
			expandedPadding: 50
		})
	}

	statefulSetup() {
		super.statefulSetup()
		
		this.viewWidth = this.expanded ? this.expandedWidth : this.compactWidth
		this.viewHeight = this.expanded ? this.expandedHeight : this.compactHeight
		this.anchor = this.expanded ? this.expandedAnchor : this.compactAnchor.copy()

		this.background = new RoundedRectangle({
			width: this.viewWidth,
			height: this.viewHeight,
			cornerRadius: 50,
			fillColor: Color.gray(0.1),
			fillOpacity: 0.8,
			strokeColor: Color.clear(),
			anchor: Vertex.origin(),
			pointerEventPolicy: PointerEventPolicy.Pass
		})
		this.view.style['clip-path'] = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
		// TODO: clip at rounded corners as well
		this.add(this.background)

		this.setDragging(false)
	}

	get expandedAnchor(): Vertex {
		return new Vertex(this.expandedPadding, this.expandedPadding)
	}

	get expandedWidth(): number {
		return this.getPaper().viewWidth - 2 * this.expandedPadding
	}

	get expandedHeight(): number {
		return this.getPaper().viewHeight - 2 * this.expandedPadding
	}

	expand() {
		this.expanded = true
		paper.mobject.expandedMobject = this
		this.animate({
			viewWidth: this.expandedWidth,
			viewHeight: this.expandedHeight,
			anchor: this.expandedAnchor
		}, 0.5)
	}

	contract() {
		this.expanded = false
		paper.mobject.expandedMobject = this.parent
		this.animate({
			viewWidth: this.compactWidth,
			viewHeight: this.compactHeight,
			anchor: this.compactAnchor
		}, 0.5)
	}

	toggleViewState() {
		if (this.expanded) {
			this.contract()
		} else {
			this.expand()
		}	
	}

	onDoubleTap(e: LocatedEvent) {
		console.log('double tap')
		this.toggleViewState()
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

	handleMessage(key: string, value: any) {
		console.log(key, value)
	}

	// setDragging(flag: boolean) {

	// 	this.pointerEventPolicy = (flag ? PointerEventPolicy.Handle : PointerEventPolicy.Pass)
	// 	console.log(this.pointerEventPolicy)

	// 	this.update({
	// 		draggable: flag
	// 	})
	// 	for (let submob of this.submobs) {
	// 		submob.update({
	// 			draggable: flag
	// 		})
	// 	}

	// 	if (flag) {
	// 		this.savedOnPointerDown = this.onPointerDown
	// 		this.savedOnPointerMove = this.onPointerMove
	// 		this.savedOnPointerUp = this.onPointerUp
	// 		this.onPointerDown = this.startDragging
	// 		this.onPointerMove = this.dragging
	// 		this.onPointerUp = this.endDragging

	// 		// for (let submob of this.getCindys()) {
	// 		// 	submob.pointerEventPolicy = PointerEventPolicy.Cancel //?
	// 		// }
	// 	} else {
	// 		this.onPointerDown = this.savedOnPointerDown
	// 		this.onPointerMove = this.savedOnPointerMove
	// 		this.onPointerUp = this.savedOnPointerUp
	// 		for (let submob of this.getCindys()) {
	// 			submob.pointerEventPolicy = PointerEventPolicy.Propagate
	// 		}
	// 	}
	// }

	startDragging(e: LocatedEvent) {
		if (!this.expanded) {
			console.log("is expanded")
			super.startDragging(e)
			return
		}
		console.log('startDragging')
		let target = this.eventTargetMobject(e)
		if (target == this) {
			this.draggedMobjects = []
			for (let child of this.children) {
				if (child instanceof LinkableMobject) {
					this.draggedMobjects.push(child)
				}
			}
		} else if (target instanceof LinkableMobject) {
			this.draggedMobjects = [target]
		} else {
			this.draggedMobjects = []
		}
		console.log(this.draggedMobjects)
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
		if (!this.expanded) {
			super.dragging(e)
			return
		}
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
		if (!this.expanded) {
			super.endDragging(e)
			return
		}
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
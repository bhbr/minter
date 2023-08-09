import { Mobject } from './Mobject'
import { LinkableMobject } from './linkable/LinkableMobject'
import { IOList } from './linkable/IOList'
import { RoundedRectangle } from '../shapes/RoundedRectangle'
import { PointerEventPolicy, LocatedEvent, pointerEventVertex } from './pointer_events'
import { Vertex } from '../helpers/Vertex_Transform'
import { CindyCanvas } from '../cindy/CindyCanvas'
import { Color } from '../helpers/Color'

export class ExpandableMobject extends LinkableMobject {
	
	linkableChildren: Array<LinkableMobject>
	expanded: boolean
	background: RoundedRectangle
	draggedMobjects: Array<Mobject>
	dragPointStart?: Vertex

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			pointerEventPolicy: PointerEventPolicy.HandleYourself,
			linkableChildren: [],
			expanded: false,
			draggedMobjects: [],
			viewWidth: 400,
			viewHeight: 300
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
			anchor: Vertex.origin()
		})
		this.add(this.background)
		this.setDragging(false)
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
		this.pointerEventPolicy = (flag ? PointerEventPolicy.HandleYourself : PointerEventPolicy.PassDown)

		this.update({
			draggable: flag
		})
		for (let submob of this.submobs) {
			submob.update({
				draggable: flag
			})
		}

		if (flag) {
			this.savedSelfHandlePointerDown = this.selfHandlePointerDown
			this.savedSelfHandlePointerMove = this.selfHandlePointerMove
			this.savedSelfHandlePointerUp = this.selfHandlePointerUp
			this.selfHandlePointerDown = this.startDragging
			this.selfHandlePointerMove = this.dragging
			this.selfHandlePointerUp = this.endDragging

			for (let submob of this.getCindys()) {
				submob.pointerEventPolicy = PointerEventPolicy.Cancel //?
			}
		} else {
			this.selfHandlePointerDown = this.savedSelfHandlePointerDown
			this.selfHandlePointerMove = this.savedSelfHandlePointerMove
			this.selfHandlePointerUp = this.savedSelfHandlePointerUp
			for (let submob of this.getCindys()) {
				submob.pointerEventPolicy = PointerEventPolicy.Propagate
			}
		}
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
		argsDict['viewWidth'] = this.viewWidth
		argsDict['viewHeight'] = this.viewHeight
		super.updateModel(argsDict)
		this.background.updateModel({
			width: this.viewWidth,
			height: this.viewHeight,
			viewWidth: this.viewWidth,
			viewHeight: this.viewHeight
		})
	}

}
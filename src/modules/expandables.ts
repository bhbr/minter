import { Mobject } from './mobject'
import { LinkableMobject, IOList } from './linkables'
import { Rectangle } from './shapes'
import { PointerEventPolicy, LocatedEvent, pointerEventVertex } from './helpers'
import { Vertex } from './vertex-transform'
import { CindyCanvas } from './cindycanvas'

export class ExpandableMobject extends LinkableMobject {
	
	linkableChildren: Array<LinkableMobject>
	isExpanded: boolean
	background: Rectangle
	dragPointStart?: Vertex
	//dependencyMap: DependencyMap
	draggedMobjects: Array<Mobject>

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			pointerEventPolicy: PointerEventPolicy.HandleYourself,
			linkableChildren: [],
			isExpanded: false
		})
	}

	statefulSetup() {
		super.statefulSetup()
		this.add(this.background)
		console.log('setting dragging 1...')
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
		console.log('...setting dragging')
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
			//console.log(this.selfHandlePointerDown)
			this.selfHandlePointerDown = this.savedSelfHandlePointerDown
			//console.log(this.selfHandlePointerDown)
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
		console.log('dragged:', this.draggedMobjects)

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



}
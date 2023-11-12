import { Mobject } from './Mobject'
import { LinkableMobject } from './linkable/LinkableMobject'
import { IOList } from 'linkable/IOList'
import { RoundedRectangle } from '../shapes/RoundedRectangle'
import { LocatedEventDevice, PointerEventPolicy, PointerEventAction, LocatedEvent, eventVertex, isTouchDevice } from './pointer_events'
import { Vertex } from '../helpers/Vertex_Transform'
import { CindyCanvas } from '../cindy/CindyCanvas'
import { Color } from '../helpers/Color'
import { addLongPressListener, removeLongPressListener } from './long_press'
import { log, remove } from '../helpers/helpers'
import { CreatedMobject } from '../creations/CreatedMobject'
import { Freehand } from '../creations/Freehand'

declare var paper: any
declare var sidebar: any

interface Window { webkit?: any }

export class ExpandableMobject extends LinkableMobject {
	
	linkableChildren: Array<LinkableMobject>
	expanded: boolean
	background: RoundedRectangle
	pannedMobjects: Array<Mobject>
	panPointStart?: Vertex
	compactWidth: number
	compactHeight: number
	compactAnchor: Vertex
	expandedPadding: number
	sidebar: any
	createdMobject?: CreatedMobject
	//pointerEventAction: PointerEventAction
	//savedPointerEventAction?: PointerEventAction
	dragEnabled: boolean

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			pointerEventPolicy: PointerEventPolicy.Handle,
			//pointerEventAction: PointerEventAction.Drag,
			//savedPointerEventAction: null,
			dragEnabled: false,
			linkableChildren: [],
			expanded: false,
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
			fillColor: Color.gray(0.2),
			fillOpacity: 0.8,
			strokeColor: Color.clear(),
			anchor: Vertex.origin()
		})

		this.createdMobject = null
		this.view.style['clip-path'] = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
		// TODO: clip at rounded corners as well
		this.add(this.background)

		if (this.expanded) {
			//this.pointerEventAction = PointerEventAction.Pan
		} else {
			//this.pointerEventAction = this.pointerEventAction | PointerEventAction.Drag
			this.disableLinkables()
		}

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

	get contracted(): boolean {
		return !this.expanded
	}

	set contracted(newValue: boolean) {
		this.expanded = !newValue
	}

	expand() {
		this.expanded = true
		paper.mobject.expandedMobject = this
		this.enableLinkables()
		//this.savedPointerEventAction = this.pointerEventAction
		//this.pointerEventAction = PointerEventAction.Pan
		this.animate({
			viewWidth: this.expandedWidth,
			viewHeight: this.expandedHeight,
			anchor: this.expandedAnchor
		}, 0.5)
		this.messageSidebar({'init': ['ArrowButton']})
	}

	contract() {
		this.expanded = false
		this.pointerEventPolicy = PointerEventPolicy.Handle
		//this.pointerEventAction = this.savedPointerEventAction | PointerEventAction.Drag

		this.disableLinkables()
		paper.mobject.expandedMobject = this.parent
		this.animate({
			viewWidth: this.compactWidth,
			viewHeight: this.compactHeight,
			anchor: this.compactAnchor
		}, 0.5)
	}

	addLinkable(mob: LinkableMobject) {
		this.add(mob)
		this.linkableChildren.push(mob)
		if (this.contracted) {
			this.disableLinkable(mob)
		}
	}

	disableLinkable(mob: LinkableMobject) {
		mob.savedPointerEventPolicy = mob.pointerEventPolicy
		mob.pointerEventPolicy = PointerEventPolicy.PassUp
	}

	disableLinkables() {
		for (let mob of this.linkableChildren) {
			this.disableLinkable(mob)
		}
	}

	enableLinkable(mob: LinkableMobject) {
		mob.pointerEventPolicy = mob.savedPointerEventPolicy
	}

	enableLinkables() {
		for (let mob of this.linkableChildren) {
			this.enableLinkable(mob)
		}
	}

	messageSidebar(message: object) {
		if (isTouchDevice) {
			(window as Window).webkit.messageHandlers.handleMessageFromPaper.postMessage(message)
		} else {
			sidebar.mobject.getMessage(message)
		}
	}

	toggleViewState() {
		if (this.expanded) {
			this.contract()
		} else {
			this.expand()
		}	
	}

	onDoubleTap(e: LocatedEvent) {
		this.toggleViewState()
	}


	removeLinkable(mob: LinkableMobject) {
		remove(this.linkableChildren, mob)
		this.remove(mob)
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
		switch (key) {
			case 'drag':
				this.dragEnabled = true
				for (let mob of this.linkableChildren) {
					log(mob)
					log(value)
					mob.setDragging(value as boolean)
				}
				break
		}
	}

	onPointerDown(e: LocatedEvent) {
		let isPen: boolean = (this.locatedEventDevice(e) == LocatedEventDevice.Pen)
		// log(`expanded: ${this.expanded}`)
		// log(`isPen: ${isPen}`)
		// log(`dragEnabled: ${this.dragEnabled}`)
		if (this.expanded && (this.dragEnabled || !isPen)) {
		//	log('pan')
			this.startPanning(e)
		} else if (this.contracted && this.dragEnabled) {
		//	log('drag')
			this.startDragging(e)
		} else if (this.expanded && isPen && !this.dragEnabled) {
		//	log('create')
			this.startCreating(e)
		} else if (this.contracted && !this.dragEnabled) {
		//	log('custom')
			this.customOnPointerDown(e)
		}

		// switch (this.pointerEventAction) {
		// case PointerEventAction.Drag:
		// 	this.startDragging(e)
		// 	break
		// case PointerEventAction.Pan:
		// 	this.startPanning(e)
		// 	break
		// case PointerEventAction.Create:
		// 	this.startCreating(e)
		// 	break
		// case PointerEventAction.Custom:
		// 	this.customOnPointerDown(e)
		// 	break
		// }
	}


	startCreating(e: LocatedEvent) {
		log('start creating')
	}

	customOnPointerDown(e: LocatedEvent) {
		log('customOnPointerDown')
	}

	onPointerMove(e: LocatedEvent) {
		let isPen: boolean = (this.locatedEventDevice(e) == LocatedEventDevice.Pen)
		if (this.expanded && (this.dragEnabled || !isPen)) {
			this.panning(e)
		} else if (this.contracted && this.dragEnabled) {
			this.dragging(e)
		} else if (this.expanded && isPen && !this.dragEnabled) {
			this.creating(e)
		} else if (this.contracted && !this.dragEnabled) {
			this.customOnPointerMove(e)
		}
		// switch (this.pointerEventAction) {
		// case PointerEventAction.Drag:
		// 	this.dragging(e)
		// 	break
		// case PointerEventAction.Pan:
		// 	this.panning(e)
		// 	break
		// case PointerEventAction.Create:
		// 	this.creating(e)
		// 	break
		// case PointerEventAction.Custom:
		// 	this.customOnPointerMove(e)
		// 	break
		// }
	}

	creating(e: LocatedEvent) {
		//log('creating')
	}

	customOnPointerMove(e: LocatedEvent) {
		//log('customOnPointerMove')
	}

	onPointerUp(e: LocatedEvent) {
		let isPen: boolean = (this.locatedEventDevice(e) == LocatedEventDevice.Pen)
		if (this.expanded && (this.dragEnabled || !isPen)) {
			this.endPanning(e)
		} else if (this.contracted && this.dragEnabled) {
			this.endDragging(e)
		} else if (this.expanded && isPen && !this.dragEnabled) {
			this.endCreating(e)
		} else if (this.contracted && !this.dragEnabled) {
			this.customOnPointerUp(e)
		}
		// switch (this.pointerEventAction) {
		// case PointerEventAction.Drag:
		// 	this.endDragging(e)
		// 	break
		// case PointerEventAction.Pan:
		// 	this.endPanning(e)
		// 	break
		// case PointerEventAction.Create:
		// 	this.endCreating(e)
		// 	break
		// case PointerEventAction.Custom:
		// 	this.customOnPointerUp(e)
		// 	break
		// }
	}

	endCreating(e: LocatedEvent) {
		log('end creating')
	}

	customOnPointerUp(e: LocatedEvent) {
		log('customOnPointerUp')
	}

	startPanning(e: LocatedEvent) {
		this.panPointStart = eventVertex(e)

		this.pannedMobjects = []
		for (let mob of this.linkableChildren) {
			this.pannedMobjects.push(mob)
			// add later: IOList, DependencyMap
			// so we can pan while showing links
		}

		for (let mob of this.pannedMobjects) {
			mob.dragAnchorStart = mob.anchor.copy()
		}
	}

	panning(e: LocatedEvent) {
		let panPoint = eventVertex(e)
		let dr = panPoint.subtract(this.panPointStart)

		for (let mob of this.pannedMobjects) {
			let newAnchor: Vertex = mob.dragAnchorStart.add(dr)
			mob.update({ anchor: newAnchor })
			mob.view.style.left = `${newAnchor.x}px`
			mob.view.style.top = `${newAnchor.y}px`
		}
	}

	endPanning(e: LocatedEvent) {
		this.pannedMobjects = []
	}

	setDragging(draggable: boolean) {
		super.setDragging(draggable)
		this.dragEnabled = draggable
		// if (draggable) {
		// 	this.savedPointerEventAction = this.pointerEventAction
		// 	this.pointerEventAction = PointerEventAction.Drag
		// } else {
		// 	if (this.savedPointerEventAction !== null) {
		// 		this.pointerEventAction = this.savedPointerEventAction
		// 	}
		// 	this.savedPointerEventAction = null
		// }
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


	// onPointerMove(e: LocatedEvent) {
	// 	log('moving')
	// 	if (this.createdMobject == null) {
	// 		log('start moving')
	// 		this.createdMobject = new Freehand()
	// 		this.add(this.createdMobject)
	// 		this.creating = true
	// 	}
	// 	this.createdMobject.updateFromTip(eventVertex(e))
	// }

	// onPointerUp(e: LocatedEvent) {
	// 	log('pointer up')
	// 	this.createdMobject.dissolveInto(this)
	// 	this.createdMobject = null
	// 	this.creating = false
	// }


























}
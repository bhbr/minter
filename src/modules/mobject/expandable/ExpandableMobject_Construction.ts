import { Mobject } from '../Mobject'
import { LinkableMobject } from '../linkable/LinkableMobject'
import { LinkMap } from '../linkable/LinkMap'
import { RoundedRectangle } from '../../shapes/RoundedRectangle'
import { ScreenEventDevice, screenEventDevice, ScreenEventHandler, ScreenEvent, eventVertex, isTouchDevice } from '../screen_events'
import { Vertex } from '../../helpers/Vertex'
import { VertexArray } from '../../helpers/VertexArray'
import { Color } from '../../helpers/Color'
import { log, remove } from '../../helpers/helpers'
import { CreatingMobject } from '../../creations/CreatingMobject'
import { CreatingExpandableMobject } from './CreatingExpandableMobject'
import { CreatingConstruction } from '../../construction/CreatingConstruction'
import { CreatingWaveCindyCanvas } from '../../cindy/CreatingWaveCindyCanvas'
import { CreatingBoxSlider } from '../../slider/CreatingBoxSlider'
import { CreatingFixedMobject } from '../../creations/CreatingFixedMobject'
import { CreatingValueBox } from '../../creations/CreatingValueBox'
import { CreatingInputValueBox } from '../../creations/CreatingInputValueBox'
import { CreatingAddBox, CreatingSubtractBox, CreatingMultiplyBox, CreatingDivideBox } from '../../creations/CreatingBinaryOperatorBox'
import { WaveCindyCanvas } from '../../cindy/WaveCindyCanvas'
import { BoxSlider } from '../../slider/BoxSlider'
import { Freehand } from '../../creations/Freehand'
import { ExpandButton } from './ExpandButton'
import { Sidebar } from '../../../sidebar/Sidebar'
import { convertArrayToString, getPaper } from '../../helpers/helpers'
import { LinkHook } from '../linkable/LinkHook'
import { CreatingSwing } from '../../swing/CreatingSwing'

// imports for Construction
import { ConstructionPoint } from '../../creations/ConstructionPoint'
import { FreePoint } from '../../creations/FreePoint'
import { ConstructingMobject } from '../../creations/ConstructingMobject'
import { ConstructingSegment } from '../../creations/ConstructingSegment'
import { ConstructingRay } from '../../creations/ConstructingRay'
import { ConstructingLine } from '../../creations/ConstructingLine'
import { ConstructingArrow } from '../../creations/ConstructingArrow'
import { ConstructingCircle } from '../../creations/ConstructingCircle'
import { Arrow } from '../../arrows/Arrow'
import { Segment } from '../../arrows/Segment'
import { Ray } from '../../arrows/Ray'
import { Line } from '../../arrows/Line'
import { Circle } from '../../shapes/Circle'
import { TwoPointCircle } from '../../shapes/TwoPointCircle'
import { IntersectionPoint } from '../../construction/IntersectionPoint'
import { CreatingColorSample } from '../../creations/CreatingColorSample'

/*
The classes ExpandableMobject and Construction need to be defined
in the same file, to resolve a circularity issue.
*/

///////////////////////////////////////////////////////////////
///////////////////// EXPANDABLE MOBJECT //////////////////////
///////////////////////////////////////////////////////////////

declare var paper: any
declare interface Window { webkit?: any }

export class ExpandableMobject extends LinkableMobject {
/*
An expandable mobject can be expanded into a full screen view,
in which submobjects ("contentChildren") can be created with
a pen and custom sidebar buttons.

In addition, the content children can be linked (those that
are linkable) together.

The content children can also be dragged and panned.
*/


	sidebar?: any
	buttonNames: Array<string>

	creatingMobject?: CreatingMobject
	creationStroke: VertexArray
	creationMode: string

	panPointStart?: Vertex

	//////////////////////////////////////////////////////////
	//                                                      //
	//                    INITIALIZATION                    //
	//                                                      //
	//////////////////////////////////////////////////////////

	background: RoundedRectangle
	expandButton: ExpandButton
	contentChildren: Array<Mobject>
	linkMap: LinkMap

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			screenEventHandler: ScreenEventHandler.Self,
			contentChildren: [],
			expanded: false,
			compactWidth: 400,
			compactHeight: 300,
			compactAnchor: Vertex.origin(),
			expandedPadding: 10,
			buttons: ['DragButton', 'LinkButton', 'ExpandableButton', 'SliderButton', 'ColorSampleButton'],
			creationStroke: [],
			creationMode: 'freehand',
			contentInset: 0,
			sidebar: null
		})
	}

	statelessSetup() {
		super.statelessSetup()
		this.background = new RoundedRectangle({
			cornerRadius: 50,
			fillColor: Color.gray(0.1),
			fillOpacity: 1.0,
			strokeColor: Color.white(),
			strokeWidth: 1.0,
			screenEventHandler: ScreenEventHandler.Parent
		})

		this.expandButton = new ExpandButton()
		this.creatingMobject = null
		this.linkMap = new LinkMap()
	}

	statefulSetup() {
		super.statefulSetup()
		
		this.viewWidth = this.expanded ? this.expandedWidth : this.compactWidth
		this.viewHeight = this.expanded ? this.expandedHeight : this.compactHeight
		this.anchor = this.expanded ? this.expandedAnchor : this.compactAnchor.copy()

		this.background.update({
			width: this.viewWidth - 2 * this.contentInset,
			height: this.viewHeight - 2 * this.contentInset,
			anchor: new Vertex(this.contentInset, this.contentInset)
		})

		this.view.style['clip-path'] = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
		// TODO: clip at rounded corners as well
		this.add(this.background)
		this.add(this.expandButton)

		this.linkMap.update({
			viewWidth: this.expandedWidth,
			viewHeight: this.expandedHeight
		})
		
		if (this.contracted) {
			this.contractStateChange()
		} else {
			this.expandStateChange()
		}
		this.hideLinksOfContent()
	}


	//////////////////////////////////////////////////////////
	//                                                      //
	//                  EXPAND AND CONTRACT                 //
	//                                                      //
	//////////////////////////////////////////////////////////

	compactWidth: number
	compactHeight: number
	compactAnchor: Vertex
	expandedPadding: number
	contentInset: number

	expanded: boolean

	get expandedAnchor(): Vertex {
		return new Vertex(this.expandedPadding, this.expandedPadding)
	}

	get expandedWidth(): number {
		return getPaper().viewWidth - 2 * this.expandedPadding
	}

	get expandedHeight(): number {
		return getPaper().viewHeight - 2 * this.expandedPadding
	}

	get contracted(): boolean {
		return !this.expanded
	}

	set contracted(newValue: boolean) {
		this.expanded = !newValue
	}

	expandStateChange() {
		this.expanded = true
		getPaper().expandedMobject = this
		this.enableContent()
		if (this.parent !== undefined) {
			this.parent.moveToTop(this)
		}
		this.expandButton.update({
			text: '–'
		})
		this.moveToTop(this.linkMap)
		this.sidebar = getPaper().sidebar
		if (this.sidebar === null || this.sidebar === undefined) {
			let sidebarView = document.querySelector('#sidebar_id')
			if (sidebarView !== null) {
				this.sidebar = (sidebarView as any)['mobject']
				getPaper().sidebar = this.sidebar
			}
		}
	}

	expand() {
		this.expandStateChange()
		this.animate({
			viewWidth: this.expandedWidth - 2 * this.contentInset,
			viewHeight: this.expandedHeight - 2 * this.contentInset,
			anchor: this.expandedAnchor
		}, 0.5)
		this.messageSidebar({ 'init': convertArrayToString(this.buttonNames) })
	}

	contractStateChange() {
		this.expanded = false
		this.disableContent()
		if (this.parent) {
			getPaper().expandedMobject = this.parent as ExpandableMobject
		}
		this.expandButton.update({
			text: '+'
		})
	}

	contract() {
		this.contractStateChange()
		this.animate({
			viewWidth: this.compactWidth - 2 * this.contentInset,
			viewHeight: this.compactHeight - 2 * this.contentInset,
			anchor: this.compactAnchor
		}, 0.5)
		if (this.parent instanceof ExpandableMobject) {
			this.messageSidebar({ 'init': convertArrayToString(this.parent.buttonNames) })
		}
		this.sidebar = null
	}

	addToContent(mob: Mobject) {
		this.add(mob)
		this.contentChildren.push(mob)
		if (this.contracted) {
			mob.disable()
		}
		if (this.expandButton.visible) {
			// exception: Paper
			this.moveToTop(this.expandButton)
		}
		if (mob instanceof LinkableMobject) {
			mob.hideLinks()
		}
		if (mob instanceof ExpandableMobject) {
			if (mob instanceof Construction) { return }
			mob.background.update({
				fillColor: this.background.fillColor.brighten(1.1)
			})
		}
	}

	disableContent() {
		//log(`disabling content of ${this}`)
		for (let mob of this.contentChildren) {
		//	log(`disabling ${mob}`)
			mob.disable()
		}
	}

	enableContent() {
		for (let mob of this.contentChildren) {
			mob.enable()
		}
	}

	messageSidebar(message: object) {
		if (isTouchDevice) {
			(window as Window).webkit.messageHandlers.handleMessageFromPaper.postMessage(message)
		} else {
			if (this.sidebar !== null && this.sidebar !== undefined) {
				this.sidebar.getMessage(message)
			}
		}
	}

	toggleViewState() {
		if (this.expanded) {
			this.contract()
		} else {
			this.expand()
		}	
	}

	removeFromContent(mob: LinkableMobject) {
		remove(this.contentChildren, mob)
		this.remove(mob)
	}

	handleMessage(key: string, value: any) {
		this.enableContent()
		switch (key) {
			case 'drag':
				this.setPanning(value as boolean)
				for (let mob of this.contentChildren) {
					mob.setDragging(value as boolean)
				}
				break
			case 'create':
				this.creationMode = value
				if (this.creatingMobject == null) {
					return
				}
				this.remove(this.creatingMobject)
				this.creatingMobject = this.createCreatingMobject(this.creationMode)
				this.add(this.creatingMobject)
				break
			case 'link':
				if (value) {
					this.showLinksOfContent()
				} else {
					this.hideLinksOfContent()
				}
		}
	}

	createCreatingMobject(type: string): CreatingMobject {
		switch (type) {
			case 'freehand':
				let fh = new Freehand()
				fh.line.update({
					vertices: this.creationStroke
				})
				return fh
			case 'cindy':
				let c = new CreatingWaveCindyCanvas({
					startPoint: this.creationStroke[0],
					endPoint: this.creationStroke[this.creationStroke.length - 1],
					nbSources: 1
				})
				return c
			case 'var1':
				let s = new CreatingBoxSlider({
					startPoint: this.creationStroke[0],
					endPoint: this.creationStroke[this.creationStroke.length - 1],
					min: 0,
					max: 1
				})
				s.protoSlider.hideLinks()
				return s
			case 'var10':
				let s2 = new CreatingBoxSlider({
					startPoint: this.creationStroke[0],
					endPoint: this.creationStroke[this.creationStroke.length - 1],
					min: 0,
					max: 10
				})
				s2.protoSlider.hideLinks()
				return s2
			case 'value':
				let v = new CreatingValueBox({
					startPoint: this.creationStroke[0],
					endPoint: this.creationStroke[this.creationStroke.length - 1]
				})
				v.creation.hideLinks()
				return v
			case 'input':
				let v5 = new CreatingInputValueBox({
					startPoint: this.creationStroke[0],
					endPoint: this.creationStroke[this.creationStroke.length - 1]
				})
				v5.creation.hideLinks()
				return v5
			case '+':
				let v1 = new CreatingAddBox({
					startPoint: this.creationStroke[0],
					endPoint: this.creationStroke[this.creationStroke.length - 1]
				})
				v1.creation.hideLinks()
				return v1
			case '–':
				let v2 = new CreatingSubtractBox({
					startPoint: this.creationStroke[0],
					endPoint: this.creationStroke[this.creationStroke.length - 1]
				})
				v2.creation.hideLinks()
				return v2
			case '&times;':
				let v3 = new CreatingMultiplyBox({
					startPoint: this.creationStroke[0],
					endPoint: this.creationStroke[this.creationStroke.length - 1]
				})
				v3.creation.hideLinks()
				return v3
			case '/':
				let v4 = new CreatingDivideBox({
					startPoint: this.creationStroke[0],
					endPoint: this.creationStroke[this.creationStroke.length - 1]
				})
				v4.creation.hideLinks()
				return v4
			case 'exp':
				let e = new CreatingExpandableMobject({
					startPoint: this.creationStroke[0],
					endPoint: this.creationStroke[this.creationStroke.length - 1]
				})
				return e
			case 'cons':
				let e2 = new CreatingConstruction({
					startPoint: this.creationStroke[0],
					endPoint: this.creationStroke[this.creationStroke.length - 1]
				})
				return e2
			case 'swing':
				let p = new CreatingSwing({
					startPoint: this.creationStroke[0],
					endPoint: this.creationStroke[this.creationStroke.length - 1]
				})
				return p
			case 'color':
				let c2 = new CreatingColorSample({
					startPoint: this.creationStroke[0],
					endPoint: this.creationStroke[this.creationStroke.length - 1]
				})
				return c2
		}
	}

	onPointerDown(e: ScreenEvent) {
		if (this.contracted) { return }
		this.startCreating(e)
	}

	onTap(e: ScreenEvent) { }

	customOnPointerDown(e: ScreenEvent) {
		log('customOnPointerDown')
	}

	startCreating(e: ScreenEvent) {
		this.creationStroke.push(this.localEventVertex(e))
		this.creatingMobject = this.createCreatingMobject(this.creationMode)
		this.add(this.creatingMobject)
	}

	onPointerMove(e: ScreenEvent) {
		if (this.contracted) { return }
		if (this.creationStroke.length == 0) { return }
		this.creating(e)
	}

	creating(e: ScreenEvent) {
		let v: Vertex = this.localEventVertex(e)
		this.creationStroke.push(v)
		this.creatingMobject.updateFromTip(v)
	}

	customOnPointerMove(e: ScreenEvent) {
	}

	onPointerUp(e: ScreenEvent) {
		if (this.contracted) { return }
		this.endCreating(e)
	}

	endCreating(e: ScreenEvent) {
		this.creatingMobject.dissolve()
		this.creatingMobject = null
		this.creationStroke = new VertexArray()
	}


	customOnPointerUp(e: ScreenEvent) {
		log('customOnPointerUp')
	}

	startPanning(e: ScreenEvent) {
		this.panPointStart = eventVertex(e)

		for (let mob of this.contentChildren) {
			mob.dragAnchorStart = mob.anchor.copy()
		}
	}

	panning(e: ScreenEvent) {
		let panPoint = eventVertex(e)
		let dr = panPoint.subtract(this.panPointStart)

		for (let mob of this.contentChildren) {
			let newAnchor: Vertex = mob.dragAnchorStart.add(dr)
			mob.update({ anchor: newAnchor })
			mob.view.style.left = `${newAnchor.x}px`
			mob.view.style.top = `${newAnchor.y}px`
		}
		this.linkMap.update()
	}

	endPanning(e: ScreenEvent) {
	}

	setPanning(flag: boolean) {
		if (flag) {
			this.savedOnPointerDown = this.onPointerDown
			this.savedOnPointerMove = this.onPointerMove
			this.savedOnPointerUp = this.onPointerUp
			this.onPointerDown = this.startPanning
			this.onPointerMove = this.panning
			this.onPointerUp = this.endPanning
		} else {
			this.onPointerDown = this.savedOnPointerDown
			this.onPointerMove = this.savedOnPointerMove
			this.onPointerUp = this.savedOnPointerUp
			this.savedOnPointerDown = (e: ScreenEvent) => { }
			this.savedOnPointerMove = (e: ScreenEvent) => { }
			this.savedOnPointerUp = (e: ScreenEvent) => { }
		}
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

	linkableChildren(): Array<LinkableMobject> {
		let arr: Array<LinkableMobject> = []
		for (let submob of this.contentChildren) {
			if (submob instanceof LinkableMobject) {
				arr.push(submob)
			}
		}
		return arr
	}

	showLinksOfContent() {
		this.add(this.linkMap)
		for (let submob of this.linkableChildren()) {
			submob.showLinks()
		}
	}
	
	hideLinksOfContent() {
		this.linkMap.abortLinkCreation()
		this.remove(this.linkMap)
		for (let submob of this.linkableChildren()) {
			submob.hideLinks()
		}
	}

	innerInputHookLocation(submob: LinkableMobject, name: string): Vertex {
		let hookLocation = submob.inputList.hookNamed(name).positionInLinkMap()
		return hookLocation
	}

	innerInputHooks(): Array<LinkHook> {
		let arr: Array<LinkHook>  = []
		for (let submob of this.linkableChildren()) {
			for (let inputName of submob.inputNames) {
				arr.push(submob.inputList.hookNamed(inputName))
			}
		}
		return arr
	}

	innerOutputHookLocation(submob: LinkableMobject, name: string): Vertex {
		let hookLocation = submob.outputList.hookNamed(name).positionInLinkMap()
		return hookLocation
	}

	innerOutputHooks(): Array<LinkHook> {
		let arr: Array<LinkHook>  = []
		for (let submob of this.linkableChildren()) {
			for (let outputName of submob.outputNames) {
				arr.push(submob.outputList.hookNamed(outputName))
			}
		}
		return arr
	}

}










//////////////////
// CONSTRUCTION //
//////////////////





export type ConstructedMobject = Arrow | TwoPointCircle

export class Construction extends ExpandableMobject {
	
	points: Array<ConstructionPoint>
	constructedMobjects: Array<ConstructedMobject>
	declare creatingMobject: ConstructingArrow | ConstructingCircle

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			points: [],
			constructedMobjects: []
		})
	}

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			buttons: ['DragButton', 'ArrowButton', 'CircleButton']
		})
	}

	statefulSetup() {
		super.statefulSetup()
		this.view.style.overflow = 'hidden'
		this.background.update({
			fillColor: Color.black()
		})
	}

	snapped(v1: Vertex, v2: Vertex): boolean {
		return v1.closeTo(v2, 10)
	}

	snappedPointForVertex(v: Vertex): ConstructionPoint | null {
		for (let p of this.points) {
			if (this.snapped(v, p.midpoint)) { return p }
		}
		return null
	}

	addPoint(p: ConstructionPoint): boolean {
		for (let q of this.points) {
			if (this.snapped(p.midpoint, q.midpoint)) {
				return false
			}
		}
		this.add(p)
		this.points.push(p)
		return true
	}

	freePoints(): Array<FreePoint> {
		let ret: Array<FreePoint> = []
		for (let p of this.points) {
			if (p instanceof FreePoint) {
				ret.push(p)
			}
		}
		return ret
	}

	createCreatingMobject(type: string): CreatingMobject {
		switch (type) {
			case 'segment':
				let sg = new ConstructingSegment({
					startPoint: this.creationStroke[0],
					endPoint: this.creationStroke[this.creationStroke.length - 1],
					construction: this
				})
				return sg
			case 'ray':
				let ray = new ConstructingRay({
					startPoint: this.creationStroke[0],
					endPoint: this.creationStroke[this.creationStroke.length - 1],
					construction: this
				})
				return ray
			case 'line':
				let line = new ConstructingLine({
					startPoint: this.creationStroke[0],
					endPoint: this.creationStroke[this.creationStroke.length - 1],
					construction: this
				})
				return line
			case 'circle':
				let c = new ConstructingCircle({
					startPoint: this.creationStroke[0],
					endPoint: this.creationStroke[this.creationStroke.length - 1],
					construction: this
				})
				return c
		}
		return super.createCreatingMobject(type)
	}

	startCreating(e: ScreenEvent) {
		let v = this.localEventVertex(e)
		let p: ConstructionPoint | null = this.snappedPointForVertex(v)
		log(`found point: ${p}`)
		if (this.creationMode == 'freehand') {
			if (p === null) { // starting a freehand drawing
				super.startCreating(e)
			} else if (p instanceof FreePoint) { // dragging a free point
				this.eventTarget = p
				p.startDragging(e)
			} // hitting any other point does nothing if in freehand mode
			return
		}
		this.creationStroke.push(v)
		this.creatingMobject = this.createCreatingMobject(this.creationMode) as ConstructingArrow | ConstructingCircle
		this.add(this.creatingMobject)

	}

	creating(e: ScreenEvent) {
		if (this.creationMode == 'freehand') {
			super.creating(e)
			return
		}
		let p: Vertex = this.localEventVertex(e)
		for (let fq of this.points) {
			let q: Vertex = fq.midpoint
			if (this.snapped(p, q)) {
				p = q
				break
			}
		}
		this.creatingMobject.updateFromTip(p)
	}

	addToContent(mob: Mobject) {
		super.addToContent(mob)
		if (mob instanceof ConstructionPoint) {
			this.points.push(mob)
			if (mob instanceof FreePoint && !this.points.includes(mob)) {
				this.points.push(mob)
			}
		}
	}




	integrate(mob: ConstructingArrow | ConstructingCircle) {
		this.remove(mob)
		let p1: ConstructionPoint = this.snappedPointForVertex(mob.startPoint) ?? new FreePoint({ midpoint: mob.startPoint })
		let p2: ConstructionPoint = this.snappedPointForVertex(mob.endPoint) ?? new FreePoint({ midpoint: mob.endPoint })
		this.addToContent(p1)
		this.addToContent(p2)

		let cm: ConstructedMobject
		if (mob instanceof ConstructingSegment) {
			cm = mob.segment
			p1.addDependency('midpoint', cm, 'startPoint')
			p2.addDependency('midpoint', cm, 'endPoint')
		} else if (mob instanceof ConstructingRay) {
			cm = mob.ray
			p1.addDependency('midpoint', cm, 'startPoint')
			p2.addDependency('midpoint', cm, 'endPoint')
		} else if (mob instanceof ConstructingLine) {
			cm = mob.line
			p1.addDependency('midpoint', cm, 'startPoint')
			p2.addDependency('midpoint', cm, 'endPoint')
		} else if (mob instanceof ConstructingCircle) {
			cm = mob.circle
			p1.addDependency('midpoint', cm, 'midpoint')
			p2.addDependency('midpoint', cm, 'outerPoint')
		}
		this.add(cm)
		this.intersectWithRest(cm)
		this.constructedMobjects.push(cm)
		p1.update({ strokeColor: mob.penStrokeColor, fillColor: mob.penFillColor })
		p2.update({ strokeColor: mob.penStrokeColor, fillColor: mob.penFillColor })
	}

	intersectWithRest(geomob1: ConstructedMobject) {
		for (let geomob2 of this.constructedMobjects) {
			if (geomob1 == geomob2) { continue }
			let nbPoints: number = (geomob1 instanceof Arrow && geomob2 instanceof Arrow) ? 1 : 2
			for (let i = 0; i < nbPoints; i++) {
				let p: IntersectionPoint = new IntersectionPoint({
					geomob1: geomob1,
					geomob2: geomob2,
					index: i
				})
				let isNewPoint: boolean = this.addPoint(p)
				if (isNewPoint) {
					geomob1.addDependent(p)
					geomob2.addDependent(p)
				}
			}
		}
	}

	onPointerDown(e: ScreenEvent) {
		if (this.creationMode != 'freehand') {
			super.onPointerDown(e)
			return
		}
		if (this.contracted) { return }
		let v = this.localEventVertex(e)
		let p = this.snappedPointForVertex(v)
		if (p !== null) {
			getPaper().eventTarget = p
			p.startDragging(e)
		} else {
			this.startCreating(e)
		}

	}



}







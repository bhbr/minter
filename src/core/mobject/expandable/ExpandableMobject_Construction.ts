import { Mobject } from '../Mobject'
import { LinkableMobject } from '../linkable/LinkableMobject'
import { LinkMap } from '../linkable/LinkMap'
import { RoundedRectangle } from 'base_extensions/mobjects/shapes/RoundedRectangle'
import { ScreenEventDevice, screenEventDevice, ScreenEventHandler, ScreenEvent, eventVertex, isTouchDevice } from '../screen_events'
import { Vertex } from '../../helpers/Vertex'
import { VertexArray } from '../../helpers/VertexArray'
import { Color } from '../../helpers/Color'
import { log, remove } from '../../helpers/helpers'
import { CreatingMobject } from '../creating/CreatingMobject'
import { CreatingExpandableMobject } from './CreatingExpandableMobject'
import { CreatingConstruction } from 'base_extensions/expandables/construction/CreatingConstruction'
import { CreatingWavy } from 'extensions/created_mobjects/Wavy/CreatingWavy'
import { CreatingBoxSlider } from 'base_extensions/created_mobjects/math/BoxSlider/CreatingBoxSlider'
import { CreatingBoxStepper } from 'base_extensions/created_mobjects/math/BoxStepper/CreatingBoxStepper'
import { CreatingFixedMobject } from '../creating/CreatingFixedMobject'
import { CreatingValueBox } from 'base_extensions/created_mobjects/math/ValueBox/CreatingValueBox'
import { CreatingInputValueBox } from 'base_extensions/created_mobjects/math/InputValueBox/CreatingInputValueBox'
import { CreatingAddBox, CreatingSubtractBox, CreatingMultiplyBox, CreatingDivideBox } from 'base_extensions/created_mobjects/math/BinaryOperatorBox/CreatingBinaryOperatorBox'
import { Wavy } from 'extensions/created_mobjects/Wavy/Wavy'
import { BoxSlider } from 'base_extensions/created_mobjects/math/BoxSlider/BoxSlider'
import { Freehand } from 'base_extensions/created_mobjects/Freehand/Freehand'
import { ExpandButton } from './ExpandButton'
import { Sidebar } from 'core/sidebar/Sidebar'
import { convertArrayToString, getPaper } from 'core/helpers/helpers'
import { LinkHook } from '../linkable/LinkHook'
import { CreatingSwing } from 'extensions/created_mobjects/Swing/CreatingSwing'

// imports for Construction
import { ConPoint } from 'base_extensions/expandables/construction/ConPoint'
import { FreePoint } from 'base_extensions/expandables/construction/FreePoint'
import { ConstructingMobject } from 'base_extensions/expandables/construction/ConstructingMobject'
import { ConstructingConLine } from 'base_extensions/expandables/construction/straits/ConLine/ConstructingConLine'
import { ConstructingConRay } from 'base_extensions/expandables/construction/straits/ConRay/ConstructingConRay'
import { ConstructingConSegment } from 'base_extensions/expandables/construction/straits/ConSegment/ConstructingConSegment'
import { ConstructingConStrait } from 'base_extensions/expandables/construction/straits/ConstructingConStrait'
import { ConstructingConCircle } from 'base_extensions/expandables/construction/ConCircle/ConstructingConCircle'
import { ConStrait } from 'base_extensions/expandables/construction/straits/ConStrait'
import { ConLine } from 'base_extensions/expandables/construction/straits/ConLine/ConLine'
import { ConRay } from 'base_extensions/expandables/construction/straits/ConRay/ConRay'
import { ConSegment } from 'base_extensions/expandables/construction/straits/ConSegment/ConSegment'
import { ConCircle } from 'base_extensions/expandables/construction/ConCircle/ConCircle'
import { Circle } from 'base_extensions/mobjects/shapes/Circle'
import { IntersectionPoint } from 'base_extensions/expandables/construction/IntersectionPoint'
import { CreatingColorSample } from 'base_extensions/created_mobjects/ColorSample/CreatingColorSample'

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
in which submobjects ('contentChildren') can be created with
a pen and custom sidebar buttons.

In addition, the content children can be linked (those that
are linkable) together.

The content children can also be dragged and panned.
*/

	// a reference to the sidebar so we can change it
	sidebar?: any
	// by creating buttons named this:
	buttonNames: Array<string>

	/*
	When starting to draw, a CreatingMobject is
	initialized, changing as the pen moves.
	When the creation mode changes via the buttons,
	it is replaced by a new creating mobject.
	*/
	creatingMobject?: CreatingMobject
	creationStroke: VertexArray
	creationMode: string

	panPointStart?: Vertex

	//////////////////////////////////////////////////////////
	//                                                      //
	//                    INITIALIZATION                    //
	//                                                      //
	//////////////////////////////////////////////////////////

	// the submobs that will pan along (not e. g. the window chrome)
	contentChildren: Array<Mobject>

	/*
	Window chrome
	*/
	background: RoundedRectangle
	expandButton: ExpandButton

	// the map of dependencies between the linkable content children
	linkMap: LinkMap

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			screenEventHandler: ScreenEventHandler.Self,
			contentChildren: [],
			expanded: false,
			compactWidth: 400, // defined below in the section 'expand and contract'
			compactHeight: 300, // idem
			compactAnchor: Vertex.origin(),
			expandedPadding: 20,
			buttonNames: ['DragButton', 'LinkButton', 'ExpandableButton', 'NumberButton', 'ArithmeticButton', 'ColorSampleButton'],
			creationStroke: [],
			creationMode: 'freehand',
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
			strokeWidth: 2.0,
			screenEventHandler: ScreenEventHandler.Parent
		})

		this.expandButton = new ExpandButton()
		this.creatingMobject = null
		this.linkMap = new LinkMap()

		this.constructors = {
			'wavy': CreatingWavy,
			'slider': CreatingBoxSlider,
			'stepper': CreatingBoxStepper,
			'value': CreatingValueBox,
			'input': CreatingInputValueBox,
			'+': CreatingAddBox,
			'–': CreatingSubtractBox,
			'&times;': CreatingMultiplyBox,
			'/': CreatingDivideBox,
			'exp': CreatingExpandableMobject,
			'cons': CreatingConstruction,
			'swing': CreatingSwing,
			'color': CreatingColorSample
		}
	}

	statefulSetup() {
		super.statefulSetup()
		
		this.viewWidth = this.expanded ? this.expandedWidth() : this.compactWidth
		this.viewHeight = this.expanded ? this.expandedHeight() : this.compactHeight
		this.anchor = this.expanded ? this.expandedAnchor() : this.compactAnchor.copy()

		this.background.update({
			width: this.viewWidth,
			height: this.viewHeight,
			anchor: Vertex.origin()
		})

		this.view.style['clip-path'] = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
		// TODO: clip at rounded corners as well
		this.add(this.background)
		this.add(this.expandButton)

		this.linkMap.update({
			viewWidth: this.expandedWidth(),
			viewHeight: this.expandedHeight()
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

	expanded: boolean

	expandedAnchor(): Vertex {
		return new Vertex(this.expandedPadding, this.expandedPadding)
	}

	expandedWidth(): number {
		return getPaper().viewWidth - 2 * this.expandedPadding
	}

	expandedHeight(): number {
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
			viewWidth: this.expandedWidth(),
			viewHeight: this.expandedHeight(),
			anchor: this.expandedAnchor()
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
			viewWidth: this.compactWidth,
			viewHeight: this.compactHeight,
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
		for (let mob of this.contentChildren) {
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


	constructors: object

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
			default:
				let cons = this.constructors[type]
				let cm = new cons({
					startPoint: this.creationStroke[0],
					endPoint: this.creationStroke[this.creationStroke.length - 1]
				})
				if (cm.creation instanceof LinkableMobject) {
					cm.creation.hideLinks()
				}
				return cm
		}
	}

	onPointerDown(e: ScreenEvent) {
		if (this.contracted) { return }
		this.startCreating(e)
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

	onPointerUp(e: ScreenEvent) {
		if (this.contracted) { return }
		this.endCreating(e)
	}

	endCreating(e: ScreenEvent) {
		this.creatingMobject.dissolve()
		this.creatingMobject = null
		this.creationStroke = new VertexArray()
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

	endPanning(e: ScreenEvent) { }

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
	// the content children that are linkable
	// counter-example: points etc. in a construction (for now)
		let arr: Array<LinkableMobject> = []
		for (let submob of this.contentChildren) {
			if (submob instanceof LinkableMobject) {
				arr.push(submob)
			}
		}
		return arr
	}

	showLinksOfContent() {
	// toggled by 'link' button in sidebar
		this.add(this.linkMap)
		for (let submob of this.linkableChildren()) {
			submob.showLinks()
		}
	}
	
	hideLinksOfContent() {
	// toggled by 'link' button in sidebar
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










///////////////////////////////////////////////////////////////
//////////////////////// CONSTRUCTION /////////////////////////
///////////////////////////////////////////////////////////////

export type ConMobject = ConStrait | ConCircle
export type ConstructingConMobject = ConstructingConStrait | ConstructingConCircle

export class Construction extends ExpandableMobject {
	
	points: Array<ConPoint>
	constructedMobjects: Array<ConMobject>
	declare creatingMobject: ConstructingConMobject

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			points: [],
			constructedMobjects: []
		})
	}

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			buttonNames: ['DragButton', 'StraitButton', 'CircleButton']
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

	snappedPointForVertex(v: Vertex): ConPoint | null {
		for (let p of this.points) {
			if (this.snapped(v, p.midpoint)) { return p }
		}
		return null
	}

	addPoint(p: ConPoint): boolean {
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
				let sg = new ConstructingConSegment({
					startPoint: this.creationStroke[0],
					endPoint: this.creationStroke[this.creationStroke.length - 1],
					construction: this
				})
				return sg
			case 'ray':
				let ray = new ConstructingConRay({
					startPoint: this.creationStroke[0],
					endPoint: this.creationStroke[this.creationStroke.length - 1],
					construction: this
				})
				return ray
			case 'line':
				let line = new ConstructingConLine({
					startPoint: this.creationStroke[0],
					endPoint: this.creationStroke[this.creationStroke.length - 1],
					construction: this
				})
				return line
			case 'circle':
				let c = new ConstructingConCircle({
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
		let p: ConPoint | null = this.snappedPointForVertex(v)
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
		this.creatingMobject = this.createCreatingMobject(this.creationMode) as ConstructingConMobject
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
		if (mob instanceof ConPoint) {
			this.points.push(mob)
			if (mob instanceof FreePoint && !this.points.includes(mob)) {
				this.points.push(mob)
			}
		}
	}




	integrate(mob: ConstructingConMobject) {
		this.remove(mob)
		let p1: ConPoint = this.snappedPointForVertex(mob.startPoint) ?? new FreePoint({ midpoint: mob.startPoint })
		let p2: ConPoint = this.snappedPointForVertex(mob.endPoint) ?? new FreePoint({ midpoint: mob.endPoint })
		this.addToContent(p1)
		this.addToContent(p2)

		let cm: ConMobject
		if (mob instanceof ConstructingConSegment) {
			cm = mob.segment
			p1.addDependency('midpoint', cm, 'startPoint')
			p2.addDependency('midpoint', cm, 'endPoint')
		} else if (mob instanceof ConstructingConRay) {
			cm = mob.ray
			p1.addDependency('midpoint', cm, 'startPoint')
			p2.addDependency('midpoint', cm, 'endPoint')
		} else if (mob instanceof ConstructingConLine) {
			cm = mob.line
			p1.addDependency('midpoint', cm, 'startPoint')
			p2.addDependency('midpoint', cm, 'endPoint')
		} else if (mob instanceof ConstructingConCircle) {
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

	intersectWithRest(geomob1: ConMobject) {
		for (let geomob2 of this.constructedMobjects) {
			if (geomob1 == geomob2) { continue }
			let nbPoints: number = (geomob1 instanceof ConStrait && geomob2 instanceof ConStrait) ? 1 : 2
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







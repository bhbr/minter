
import { Linkable } from 'core/linkables/Linkable'
import { LinkMap } from 'core/linkables/LinkMap'
import { RoundedRectangle } from 'core/shapes/RoundedRectangle'
import { VertexArray } from 'core/classes/vertex/VertexArray'
import { log } from 'core/functions/logging'
import { remove } from 'core/functions/arrays'
import { BoardCreator } from './BoardCreator'
import { DraggingCreator } from 'core/creators/DraggingCreator'
import { ConstructionCreator } from 'extensions/boards/construction/ConstructionCreator'
import { Freehand } from 'core/creators/Freehand'
import { ExpandButton } from './ExpandButton'
import { DragButton } from 'core/sidebar_buttons/DragButton'
import { LinkButton } from 'core/sidebar_buttons/LinkButton'
import { BoardButton } from 'core/sidebar_buttons/BoardButton'
import { Sidebar } from 'core/Sidebar'
import { LinkHook } from 'core/linkables/LinkHook'
import { SwingCreator } from 'extensions/creations/Swing/SwingCreator'
import { Color } from 'core/classes/Color'
import { Vertex } from 'core/classes/vertex/Vertex'
import { Creator } from 'core/creators/Creator'
import { ScreenEventDevice, screenEventDevice, ScreenEventHandler, ScreenEvent, eventVertex, isTouchDevice } from 'core/mobjects/screen_events'
import { Mobject } from 'core/mobjects/Mobject'
import { convertArrayToString } from 'core/functions/arrays'
import { getPaper } from 'core/functions/getters'
import { ColorSampleCreator } from 'extensions/creations/ColorSample/ColorSampleCreator'
import { ExpandedBoardInputList } from './ExpandedBoardInputList'
import { HOOK_HORIZONTAL_SPACING, EXPANDED_IO_LIST_HEIGHT, EXPANDED_IO_LIST_INSET } from './constants'
import { IO_LIST_OFFSET } from 'core/linkables/constants'

declare var paper: any
declare interface Window { webkit?: any }

export class Board extends Linkable {
/*
A board can be expanded into a full screen view, in which 
submobjects ('contentChildren') can be created with a pen
and custom sidebar buttons.

In addition, the content children can be linked (those that
are linkable) together.

The content children can also be dragged and panned.
*/

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			contentChildren: [],
			expandButton: new ExpandButton(),
			linkMap: new LinkMap(),
			background: new RoundedRectangle({
				anchor: Vertex.origin(),
				cornerRadius: 50,
				fillColor: Color.gray(0.1),
				fillOpacity: 1.0,
				strokeColor: Color.white(),
				strokeWidth: 2.0,
				screenEventHandler: ScreenEventHandler.Parent
			}),
			expandedPadding: 20,
			screenEventHandler: ScreenEventHandler.Self,
			expanded: false,
			compactWidth: 400, // defined below in the section 'expand and contract'
			compactHeight: 300, // idem
			compactAnchor: Vertex.origin(),
			creationConstructors: {
				'board': BoardCreator
			},
			buttonNames: [
				'DragButton',
				'LinkButton',
				'BoardButton'
			],
			creationStroke: [],
			creationMode: 'freehand',
			creator: null,
			sidebar: null,
			expandedInputList: new ExpandedBoardInputList()
		})
	}

	mutabilities(): object {
		return this.updateMutabilities(super.mutabilities(), {
			contentChildren: 'never',
			expandButton: 'never',
			linkMap: 'never',
			background: 'never',
			expandedPadding: 'in_subclass'
		})
	}

	// a reference to the sidebar so we can change it
	sidebar?: any
	// by creating buttons named this:
	buttonNames: Array<string>

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

	setup() {
		super.setup()
		
		this.update({
			viewWidth: this.expanded ? this.expandedWidth() : this.compactWidth,
			viewHeight: this.expanded ? this.expandedHeight() : this.compactHeight,
			anchor: this.expanded ? this.expandedAnchor() : this.compactAnchor.copy()
		})

		this.addDependency('viewWidth', this.background, 'width')
		this.addDependency('viewHeight', this.background, 'height')

		this.view.style['clip-path'] = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
		// TODO: clip at rounded corners as well
		this.add(this.background)
		this.moveToTop(this.inputList)
		this.moveToTop(this.outputList)
		this.add(this.expandButton)
		//this.expandButton.hide()

		this.addDependency('expandedWidth', this.linkMap, 'viewWidth')
		this.addDependency('expandedHeight', this.linkMap, 'viewHeight')

		this.expandedInputList.update({
			height: EXPANDED_IO_LIST_HEIGHT,
			width: this.expandedWidth() - this.expandButton.viewWidth - 2 * EXPANDED_IO_LIST_INSET,
			anchor: new Vertex(this.expandButton.viewWidth + EXPANDED_IO_LIST_INSET, EXPANDED_IO_LIST_INSET),
			mobject: this
		})
		this.add(this.expandedInputList)

		if (this.contracted) {
			this.contractStateChange()
			this.inputList.show()
			this.outputList.show()
			this.expandedInputList.hide()
		} else {
			this.expandStateChange()
			this.inputList.hide()
			this.outputList.hide()
			this.expandedInputList.show()
		}
		this.hideLinksOfContent()

	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, false)
		this.background.update({
			width: this.viewWidth,
			height: this.viewHeight,
			viewWidth: this.viewWidth,
			viewHeight: this.viewHeight
		})
		if  (redraw) { this.redraw() }
	}


	//////////////////////////////////////////////////////////
	//                                                      //
	//               EXPANDING AND CONTRACTING              //
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
		if (!this.expanded) { this.update({ expanded: true }) }
		getPaper().expandedMobject = this
		this.enableContent()
		if (this.parent != undefined) {
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
		this.expandedInputList.show()
	}

	expand() {
		this.expandStateChange()
		this.animate({
			viewWidth: this.expandedWidth(),
			viewHeight: this.expandedHeight(),
			anchor: this.expandedAnchor()
		}, 0.5)
		this.initSidebar()
	}

	initSidebar() {
		this.messageSidebar({ 'init': convertArrayToString(this.buttonNames) })
	}

	contractStateChange() {
		this.expanded = false
		this.disableContent()
		if (this.parent) {
			getPaper().expandedMobject = this.parent as Board
		}
		this.expandButton.update({
			text: '+'
		})
		this.expandedInputList.hide()
		this.inputList.update({
			anchor: new Vertex(0.5 * (this.compactWidth - this.inputList.viewWidth), IO_LIST_OFFSET)
		}, true)
		//this.outputList.positionSelf()
	}

	contract() {
		this.contractStateChange()
		this.animate({
			viewWidth: this.compactWidth,
			viewHeight: this.compactHeight,
			anchor: this.compactAnchor
		}, 0.5)
		if (this.parent instanceof Board) {
			this.messageSidebar({ 'init': convertArrayToString(this.parent.buttonNames) })
		}
		this.sidebar = null
	}

	toggleViewState() {
		if (this.expanded) {
			this.contract()
		} else {
			this.expand()
		}	
	}

	disableContent() {
		for (let mob of this.contentChildren) {
			if (mob.screenEventHandler == ScreenEventHandler.Self) {
				mob.disable()
			}
		}
	}

	enableContent() {
		for (let mob of this.contentChildren) {
			if (mob.savedScreenEventHandler == ScreenEventHandler.Self) {
				mob.enable()
			}
		}
	}



	//////////////////////////////////////////////////////////
	//                                                      //
	//                        CREATING                      //
	//                                                      //
	//////////////////////////////////////////////////////////

	/*
	When starting to draw, a Creator is
	initialized, changing as the pen moves.
	When the creation mode changes via the buttons,
	it is replaced by a new creating mobject.
	*/
	creator?: Creator
	creationStroke: VertexArray
	creationMode: string

	// a dictionary of constructors to use
	// for creating new mobjects
	creationConstructors: object

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
		if (mob instanceof Linkable) {
			mob.hideLinks()
		}
		if (mob instanceof Board) {
			if (mob.constructor.name == 'Construction') { return }
			mob.background.update({
				fillColor: this.background.fillColor.brighten(1.1)
			})
		}
	}

	removeFromContent(mob: Linkable) {
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
				if (this.creator == null) { return }
				this.remove(this.creator)
				this.creator = this.createCreator(this.creationMode)
				console.log(this.creationMode)
				this.add(this.creator)
				break
			case 'link':
				if (value) {
					this.showLinksOfContent()
				} else {
					this.hideLinksOfContent()
				}
		}
	}

	createCreator(type: string): Creator {

		switch (type) {
			case 'freehand':
				let fh = new Freehand()
				fh.line.update({
					vertices: this.creationStroke
				})
				return fh
			default:
				let cons = this.creationConstructors[type]
				let cm = new cons({
					creationStroke: this.creationStroke
				})
				if (cm.creation instanceof Linkable) {
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
		this.creator = this.createCreator(this.creationMode)
		this.add(this.creator)
	}

	onPointerMove(e: ScreenEvent) {
		if (this.contracted) { return }
		if (this.creationStroke.length == 0) { return }
		this.creating(e)
	}

	creating(e: ScreenEvent) {
		let v: Vertex = this.localEventVertex(e)
		this.creationStroke.push(v)
		this.creator.updateFromTip(v)
	}

	onPointerUp(e: ScreenEvent) {
		if (this.contracted) { return }
		this.endCreating(e)
	}

	endCreating(e: ScreenEvent) {
		this.creationStroke = new VertexArray()
		if (this.creator == null) { return }
		this.creator.dissolve()
	}


	//////////////////////////////////////////////////////////
	//                                                      //
	//                        PANNING                       //
	//                                                      //
	//////////////////////////////////////////////////////////

	panPointStart?: Vertex

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



	//////////////////////////////////////////////////////////
	//                                                      //
	//                        LINKING                       //
	//                                                      //
	//////////////////////////////////////////////////////////

	expandedInputList: ExpandedBoardInputList

	linkableChildren(): Array<Linkable> {
	// the content children that are linkable
	// counter-example: points etc. in a construction (for now)
		let arr: Array<Linkable> = []
		for (let submob of this.contentChildren) {
			if (submob instanceof Linkable) {
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

	innerInputHooks(): Array<LinkHook> {
		let arr: Array<LinkHook>  = []
		for (let submob of this.linkableChildren()) {
			for (let inputName of submob.inputNames) {
				arr.push(submob.inputList.hookNamed(inputName))
			}
		}
		return arr
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




	//////////////////////////////////////////////////////////
	//                                                      //
	//                       MESSAGING                      //
	//                                                      //
	//////////////////////////////////////////////////////////

	messageSidebar(message: object) {
		if (isTouchDevice) {
			(window as Window).webkit.messageHandlers.handleMessageFromPaper.postMessage(message)
		} else {
			if (this.sidebar !== null && this.sidebar !== undefined) {
				this.sidebar.getMessage(message)
			}
		}
	}

}




















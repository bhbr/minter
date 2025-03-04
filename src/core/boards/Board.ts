
import { Linkable } from 'core/linkables/Linkable'
import { DependencyLink } from 'core/linkables/DependencyLink'
import { LinkBullet } from 'core/linkables/LinkBullet'
import { RoundedRectangle } from 'core/shapes/RoundedRectangle'
import { vertex, vertexArray, vertexOrigin, vertexCopy, vertexAdd, vertexSubtract, vertexCloseTo } from 'core/functions/vertex'
import { log } from 'core/functions/logging'
import { remove } from 'core/functions/arrays'
import { BoardCreator } from './BoardCreator'
import { DraggingCreator } from 'core/creators/DraggingCreator'
import { Freehand } from 'core/creators/Freehand'
import { ExpandButton } from './ExpandButton'
import { DragButton } from 'core/sidebar_buttons/DragButton'
import { LinkButton } from 'core/sidebar_buttons/LinkButton'
import { BoardButton } from 'core/sidebar_buttons/BoardButton'
import { Sidebar } from 'core/Sidebar'
import { LinkHook } from 'core/linkables/LinkHook'
import { EditableLinkHook } from './EditableLinkHook'
import { InputValueBoxCreator } from 'extensions/creations/math/InputValueBox/InputValueBoxCreator'
import { BoxSliderCreator } from 'extensions/creations/math/BoxSlider/BoxSliderCreator'
import { BoxStepperCreator } from 'extensions/creations/math/BoxStepper/BoxStepperCreator'
import { Color } from 'core/classes/Color'
import { Creator } from 'core/creators/Creator'
import { ScreenEventDevice, screenEventDevice, screenEventDeviceAsString, ScreenEventHandler, ScreenEvent, eventVertex, isTouchDevice } from 'core/mobjects/screen_events'
import { Mobject } from 'core/mobjects/Mobject'
import { convertArrayToString } from 'core/functions/arrays'
import { getPaper } from 'core/functions/getters'
import { ColorSampleCreator } from 'extensions/creations/ColorSample/ColorSampleCreator'
import { ExpandedBoardInputList } from './ExpandedBoardInputList'
import { ExpandedBoardOutputList } from './ExpandedBoardOutputList'
import { HOOK_HORIZONTAL_SPACING, EXPANDED_IO_LIST_HEIGHT, EXPANDED_IO_LIST_INSET } from './constants'
import { IO_LIST_OFFSET, SNAPPING_DISTANCE } from 'core/linkables/constants'
import { Paper } from 'core/Paper'
import { MGroup } from 'core/mobjects/MGroup'

declare var paper: Paper
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

	ownDefaults(): object {
		return {
			contentChildren: [],
			content: new MGroup(),
			expandButton: new ExpandButton(),
			links: [],
			background: new RoundedRectangle({
				anchor: vertexOrigin(),
				cornerRadius: 25,
				fillColor: Color.gray(0.1),
				fillOpacity: 1.0,
				strokeColor: Color.gray(0.2),
				strokeWidth: 1.0,
				screenEventHandler: ScreenEventHandler.Parent,
				drawShadow: true
			}),
			expandedPadding: 20,
			screenEventHandler: ScreenEventHandler.Self,
			expanded: false,
			compactWidth: 400, // defined below in the section 'expand and contract'
			compactHeight: 300, // idem
			compactAnchor: vertexOrigin(),
			creationConstructors: {
				'board': BoardCreator,
				'input': InputValueBoxCreator,
				'slider': BoxSliderCreator,
				'stepper': BoxStepperCreator,
				'color': ColorSampleCreator
			},
			buttonNames: [
				'DragButton',
				'LinkButton',
				'BoardButton',
				'NumberButton',
				'ColorSampleButton'
			],
			creationStroke: [],
			creationMode: 'freehand',
			creator: null,
			sidebar: null,
			expandedInputList: new ExpandedBoardInputList(),
			expandedOutputList: new ExpandedBoardOutputList(),
			editingLinkName: false,
			openLink: null,
			openHook: null,
			openBullet: null,
			compatibleHooks: [],
			creationTool: null
		}
	}

	ownMutabilities(): object {
		return {
			contentChildren: 'never',
			content: 'never',
			expandButton: 'never',
			linkMap: 'never',
			background: 'never',
			expandedPadding: 'in_subclass'
		}
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
	content: MGroup

	/*
	Window chrome
	*/
	background: RoundedRectangle
	expandButton: ExpandButton

	setup() {
		super.setup()
		
		this.update({
			viewWidth: this.expanded ? this.expandedWidth() : this.compactWidth,
			viewHeight: this.expanded ? this.expandedHeight() : this.compactHeight,
			anchor: this.expanded ? this.expandedAnchor() : vertexCopy(this.compactAnchor)
		})

		this.addDependency('viewWidth', this.background, 'width')
		this.addDependency('viewHeight', this.background, 'height')

		this.content.view.style['clip-path'] = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
		// TODO: clip at rounded corners as well
		this.add(this.background)
		this.add(this.content)
		this.moveToTop(this.inputList)
		this.moveToTop(this.outputList)
		this.add(this.expandButton)

		this.expandedInputList.update({
			height: EXPANDED_IO_LIST_HEIGHT,
			width: this.expandedWidth() - this.expandButton.viewWidth - 2 * EXPANDED_IO_LIST_INSET,
			anchor: [this.expandButton.viewWidth + EXPANDED_IO_LIST_INSET, EXPANDED_IO_LIST_INSET],
			mobject: this
		})
		this.add(this.expandedInputList)

		this.expandedOutputList.update({
			height: EXPANDED_IO_LIST_HEIGHT,
			width: this.expandedWidth() - this.expandButton.viewWidth - 2 * EXPANDED_IO_LIST_INSET,
			anchor: [this.expandButton.viewWidth + EXPANDED_IO_LIST_INSET, this.expandedHeight() - EXPANDED_IO_LIST_INSET - EXPANDED_IO_LIST_HEIGHT],
			mobject: this
		})
		this.add(this.expandedOutputList)

		if (this.contracted) {
			this.contractStateChange()
			this.inputList.show()
			this.outputList.show()
			this.expandedInputList.hide()
			this.expandedOutputList.hide()
		} else {
			this.expandStateChange()
			this.inputList.hide()
			this.outputList.hide()
			this.expandedInputList.show()
			this.expandedOutputList.show()
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
		this.content.update({
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
	compactAnchor: vertex
	expandedPadding: number

	expanded: boolean

	expandedAnchor(): vertex {
		return [this.expandedPadding, this.expandedPadding]
	}

	expandedWidth(): number {
		return getPaper().viewWidth - 2 * this.expandedPadding
	}

	expandedHeight(): number {
		return getPaper().viewHeight - 2 * this.expandedPadding
	}

	getCompactWidth(): number {
		return this.compactWidth
	}

	getCompactHeight(): number {
		return this.compactHeight
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
		this.expandButton.label.update({
			text: '–'
		})
		for (let link of this.links) {
			this.moveToTop(link)
		}
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
		 this.animate({
		 	viewWidth: this.expandedWidth(),
		 	viewHeight: this.expandedHeight(),
		 	anchor: this.expandedAnchor()
		}, 0.5)
		this.expandStateChange()
		this.initSidebar()
	}

	initSidebar() {
		this.messageSidebar({ 'init': convertArrayToString(this.buttonNames) })
	}

	contractStateChange() {
		this.expanded = false
		this.disableContent()
		if (this.parent) {
			getPaper().expandedMobject = this.board
		}
		this.expandButton.label.update({
			text: '+'
		})
		this.expandedInputList.hide()
		this.expandedOutputList.hide()

		this.inputList.update({
			anchor: [0.5 * (this.compactWidth - this.inputList.viewWidth), -IO_LIST_OFFSET - this.inputList.viewHeight]
		}, true)
		this.outputList.update({
			anchor: [0.5 * (this.compactWidth - this.outputList.viewWidth), IO_LIST_OFFSET]
		}, true)

		if (this.board !== null) {
			this.messageSidebar({ 'init': convertArrayToString(this.board.buttonNames) })
		}
		this.sidebar = null
	}

	contract() {
		this.animate({
			viewWidth: this.compactWidth,
			viewHeight: this.compactHeight,
			anchor: this.compactAnchor
		}, 0.5)
		this.contractStateChange()
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


	enableShadow() {
		this.background.enableShadow()
		this.board.update()
	}

	disableShadow() {
		this.background.disableShadow()
		this.board.update()
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
	creationStroke: vertexArray
	creationMode: string
	creationTool: ScreenEventDevice | null

	// a dictionary of constructors to use
	// for creating new mobjects
	creationConstructors: object

	addToContent(mob: Mobject) {
		this.content.add(mob)
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
		this.content.remove(mob)
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
				this.add(this.creator)
				break
			case 'link':
				if (value) {
					this.showLinksOfContent()
				} else if (!this.editingLinkName) {
					this.hideLinksOfContent()
				}
				this.setLinking(value)
		}
	}

	createCreator(type: string): Creator {

		switch (type) {
			case 'freehand':
				if (this.creationTool == ScreenEventDevice.Finger) {
					return new Creator()
				}
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
		log("pointer down")
		//log(screenEventDeviceAsString(e))
		if (this.contracted) { return }
		this.startCreating(e)
	}

	startCreating(e: ScreenEvent) {
		this.creationTool = screenEventDevice(e)
		if (this.creationTool == ScreenEventDevice.Finger && this.creationMode == 'freehand') {
			return
		}
		this.creationStroke.push(this.localEventVertex(e))
		this.creator = this.createCreator(this.creationMode)
		this.add(this.creator)
	}

	onPointerMove(e: ScreenEvent) {
		log("pointer move")
		if (this.contracted) { return }
		if (this.creationStroke.length == 0) { return }
		this.creating(e)
	}

	creating(e: ScreenEvent) {
		if (this.creationTool == ScreenEventDevice.Finger && this.creationMode == 'freehand') {
			return
		}
		let v: vertex = this.localEventVertex(e)
		this.creationStroke.push(v)
		this.creator.updateFromTip(v)
	}

	onPointerUp(e: ScreenEvent) {
		log("pointer up")
		if (this.contracted) { return }
		this.endCreating(e)
	}

	endCreating(e: ScreenEvent) {
		this.creationStroke = []
		this.creationTool = null
		if (this.creator == null) { return }
		this.creator.dissolve()
	}


	//////////////////////////////////////////////////////////
	//                                                      //
	//                        PANNING                       //
	//                                                      //
	//////////////////////////////////////////////////////////

	panPointStart?: vertex

	startPanning(e: ScreenEvent) {
		this.panPointStart = this.localEventVertex(e)
		for (let mob of this.contentChildren) {
			mob.dragAnchorStart = vertexCopy(mob.anchor)
			mob.disableShadow()
		}
	}

	panning(e: ScreenEvent) {
		let panPoint = this.localEventVertex(e)
		let dr = vertexSubtract(panPoint, this.panPointStart)

		for (let mob of this.contentChildren) {
			let newAnchor: vertex = vertexAdd(mob.dragAnchorStart, dr)
			mob.update({ anchor: newAnchor })
			mob.view.style.left = `${newAnchor[0]}px`
			mob.view.style.top = `${newAnchor[1]}px`
		}
		this.updateLinks()
	}

	endPanning(e: ScreenEvent) { }

	setPanning(flag: boolean) {
		if (flag) {
			this.savedOnTouchDown = this.onTouchDown
			this.savedOnTouchMove = this.onTouchMove
			this.savedOnTouchUp = this.onTouchUp
			this.savedOnTouchTap = this.onTouchTap
			this.savedOnMereTouchTap = this.onMereTouchTap
			this.savedOnDoubleTouchTap = this.onDoubleTouchTap
			this.savedOnLongTouchDown = this.onLongTouchDown

			this.savedOnPenDown = this.onPenDown
			this.savedOnPenMove = this.onPenMove
			this.savedOnPenUp = this.onPenUp
			this.savedOnPenTap = this.onPenTap
			this.savedOnMerePenTap = this.onMerePenTap
			this.savedOnDoublePenTap = this.onDoublePenTap
			this.savedOnLongPenDown = this.onLongPenDown

			this.savedOnMouseDown = this.onMouseDown
			this.savedOnMouseMove = this.onMouseMove
			this.savedOnMouseUp = this.onMouseUp
			this.savedOnMouseClick = this.onMouseClick
			this.savedOnMereMouseClick = this.onMereMouseClick
			this.savedOnDoubleMouseClick = this.onDoubleMouseClick
			this.savedOnLongMouseDown = this.onLongMouseDown

			this.onTouchDown = this.startPanning
			this.onTouchMove = this.panning
			this.onTouchUp = this.endPanning
			this.onMereTouchTap = (e: ScreenEvent) => { }
			this.onDoubleTouchTap = (e: ScreenEvent) => { }
			this.onLongTouchDown = (e: ScreenEvent) => { }

			this.onPenDown = this.startPanning
			this.onPenMove = this.panning
			this.onPenUp = this.endPanning
			this.onMerePenTap = (e: ScreenEvent) => { }
			this.onDoublePenTap = (e: ScreenEvent) => { }
			this.onLongPenDown = (e: ScreenEvent) => { }

			this.onMouseDown = this.startPanning
			this.onMouseMove = this.panning
			this.onMouseUp = this.endPanning
			this.onMereMouseClick = (e: ScreenEvent) => { }
			this.onDoubleMouseClick = (e: ScreenEvent) => { }
			this.onLongMouseDown = (e: ScreenEvent) => { }
		} else {
			this.onTouchDown = this.savedOnTouchDown
			this.onTouchMove = this.savedOnTouchMove
			this.onTouchUp = this.savedOnTouchUp
			this.onTouchTap = this.savedOnTouchTap
			this.onMereTouchTap = this.savedOnMereTouchTap
			this.onDoubleTouchTap = this.savedOnDoubleTouchTap
			this.onLongTouchDown = this.savedOnLongTouchDown

			this.onPenDown = this.savedOnPenDown
			this.onPenMove = this.savedOnPenMove
			this.onPenUp = this.savedOnPenUp
			this.onPenTap = this.savedOnPenTap
			this.onMerePenTap = this.savedOnMerePenTap
			this.onDoublePenTap = this.savedOnDoublePenTap
			this.onLongPenDown = this.savedOnLongPenDown

			this.onMouseDown = this.savedOnMouseDown
			this.onMouseMove = this.savedOnMouseMove
			this.onMouseUp = this.savedOnMouseUp
			this.onMouseClick = this.savedOnMouseClick
			this.onMereMouseClick = this.savedOnMereMouseClick
			this.onDoubleMouseClick = this.savedOnDoubleMouseClick
			this.onLongMouseDown = this.savedOnLongMouseDown

			this.savedOnTouchDown = (e: ScreenEvent) => { }
			this.savedOnTouchMove = (e: ScreenEvent) => { }
			this.savedOnTouchUp = (e: ScreenEvent) => { }
			this.savedOnMereTouchTap = (e: ScreenEvent) => { }
			this.savedOnDoubleTouchTap = (e: ScreenEvent) => { }
			this.savedOnLongTouchDown = (e: ScreenEvent) => { }

			this.savedOnPenDown = (e: ScreenEvent) => { }
			this.savedOnPenMove = (e: ScreenEvent) => { }
			this.savedOnPenUp = (e: ScreenEvent) => { }
			this.savedOnMerePenTap = (e: ScreenEvent) => { }
			this.savedOnDoublePenTap = (e: ScreenEvent) => { }
			this.savedOnLongPenDown = (e: ScreenEvent) => { }

			this.savedOnMouseMove = (e: ScreenEvent) => { }
			this.savedOnMouseDown = (e: ScreenEvent) => { }
			this.savedOnMouseUp = (e: ScreenEvent) => { }
			this.savedOnMereMouseClick = (e: ScreenEvent) => { }
			this.savedOnDoubleMouseClick = (e: ScreenEvent) => { }
			this.savedOnLongMouseDown = (e: ScreenEvent) => { }
		}
		for (let mob of this.contentChildren) {
			mob.dragAnchorStart = null
			mob.enableShadow()
		}
	}

	// onTap(e: ScreenEvent) { log("tap") }
	// onMereTap(e: ScreenEvent) { log("mere tap") }
	// onDoubleTap(e: ScreenEvent) { log("double tap") }

	// onTouchTap(e: ScreenEvent) { log("touch tap") }
	// onMereTouchTap(e: ScreenEvent) { log("mere touch tap") }
	// onDoubleTouchTap(e: ScreenEvent) { log("double touch tap") }
	// onLongTouchPress(e: ScreenEvent) { log("long touch press") }

	// onPenTap(e: ScreenEvent) { log("pen tap") }
	// onMerePenTap(e: ScreenEvent) { log("mere pen tap") }
	// onDoublePenTap(e: ScreenEvent) { log("double pen tap") }
	// onLongPenPress(e: ScreenEvent) { log("long pen press") }

	// onMouseClick(e: ScreenEvent) { log("mouse click") }
	// onMereMouseClick(e: ScreenEvent) { log("mere mouse click") }
	// onDoubleMouseClick(e: ScreenEvent) { log("double mouse click") }
	// onLongMousePress(e: ScreenEvent) { log("long mouse press") }



	//////////////////////////////////////////////////////////
	//                                                      //
	//                        LINKING                       //
	//                                                      //
	//////////////////////////////////////////////////////////

	expandedInputList: ExpandedBoardInputList
	expandedOutputList: ExpandedBoardOutputList
	editingLinkName: boolean
	openLink?: DependencyLink
	openHook?: LinkHook
	openBullet?: LinkBullet
	compatibleHooks: Array<LinkHook>
	// the list of dependencies between the linkable content children
	links: Array<DependencyLink>

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
		for (let link of this.links) {
			this.add(link)
		}
		for (let submob of this.linkableChildren()) {
			submob.showLinks()
		}

		this.expandedInputList.show()
		this.expandedOutputList.show()
	}
	
	hideLinksOfContent() {
	// toggled by 'link' button in sidebar
		for (let link of this.links) {
			link.abortLinkCreation()
			this.remove(link)
		}
		for (let submob of this.linkableChildren()) {
			submob.hideLinks()
		}

		this.expandedInputList.hide()
		this.expandedOutputList.hide()
	}

	setLinking(flag: boolean) {
		if (flag) {
			this.savedOnTouchDown = this.onTouchDown
			this.savedOnTouchMove = this.onTouchMove
			this.savedOnTouchUp = this.onTouchUp
			this.savedOnTouchTap = this.onTouchTap
			this.savedOnMereTouchTap = this.onMereTouchTap
			this.savedOnDoubleTouchTap = this.onDoubleTouchTap
			this.savedOnLongTouchDown = this.onLongTouchDown

			this.savedOnPenDown = this.onPenDown
			this.savedOnPenMove = this.onPenMove
			this.savedOnPenUp = this.onPenUp
			this.savedOnPenTap = this.onPenTap
			this.savedOnMerePenTap = this.onMerePenTap
			this.savedOnDoublePenTap = this.onDoublePenTap
			this.savedOnLongPenDown = this.onLongPenDown

			this.savedOnMouseDown = this.onMouseDown
			this.savedOnMouseMove = this.onMouseMove
			this.savedOnMouseUp = this.onMouseUp
			this.savedOnMouseClick = this.onMouseClick
			this.savedOnMereMouseClick = this.onMereMouseClick
			this.savedOnDoubleMouseClick = this.onDoubleMouseClick
			this.savedOnLongMouseDown = this.onLongMouseDown

			this.onTouchDown = this.startLinking
			this.onTouchMove = this.linking
			this.onTouchUp = this.endLinking
			this.onMereTouchTap = (e: ScreenEvent) => { }
			this.onDoubleTouchTap = (e: ScreenEvent) => { }
			this.onLongTouchDown = (e: ScreenEvent) => { }

			this.onPenDown = this.startLinking
			this.onPenMove = this.linking
			this.onPenUp = this.endLinking
			this.onMerePenTap = (e: ScreenEvent) => { }
			this.onDoublePenTap = (e: ScreenEvent) => { }
			this.onLongPenDown = (e: ScreenEvent) => { }

			this.onMouseDown = this.startLinking
			this.onMouseMove = this.linking
			this.onMouseUp = this.endLinking
			this.onMereMouseClick = (e: ScreenEvent) => { }
			this.onDoubleMouseClick = (e: ScreenEvent) => { }
			this.onLongMouseDown = (e: ScreenEvent) => { }
			this.showLinksOfContent()
		} else if (!this.editingLinkName) {
			this.onTouchDown = this.savedOnTouchDown
			this.onTouchMove = this.savedOnTouchMove
			this.onTouchUp = this.savedOnTouchUp
			this.onTouchTap = this.savedOnTouchTap
			this.onMereTouchTap = this.savedOnMereTouchTap
			this.onDoubleTouchTap = this.savedOnDoubleTouchTap
			this.onLongTouchDown = this.savedOnLongTouchDown

			this.onPenDown = this.savedOnPenDown
			this.onPenMove = this.savedOnPenMove
			this.onPenUp = this.savedOnPenUp
			this.onPenTap = this.savedOnPenTap
			this.onMerePenTap = this.savedOnMerePenTap
			this.onDoublePenTap = this.savedOnDoublePenTap
			this.onLongPenDown = this.savedOnLongPenDown

			this.onMouseDown = this.savedOnMouseDown
			this.onMouseMove = this.savedOnMouseMove
			this.onMouseUp = this.savedOnMouseUp
			this.onMouseClick = this.savedOnMouseClick
			this.onMereMouseClick = this.savedOnMereMouseClick
			this.onDoubleMouseClick = this.savedOnDoubleMouseClick
			this.onLongMouseDown = this.savedOnLongMouseDown

			this.savedOnTouchDown = (e: ScreenEvent) => { }
			this.savedOnTouchMove = (e: ScreenEvent) => { }
			this.savedOnTouchUp = (e: ScreenEvent) => { }
			this.savedOnMereTouchTap = (e: ScreenEvent) => { }
			this.savedOnDoubleTouchTap = (e: ScreenEvent) => { }
			this.savedOnLongTouchDown = (e: ScreenEvent) => { }

			this.savedOnPenDown = (e: ScreenEvent) => { }
			this.savedOnPenMove = (e: ScreenEvent) => { }
			this.savedOnPenUp = (e: ScreenEvent) => { }
			this.savedOnMerePenTap = (e: ScreenEvent) => { }
			this.savedOnDoublePenTap = (e: ScreenEvent) => { }
			this.savedOnLongPenDown = (e: ScreenEvent) => { }

			this.savedOnMouseMove = (e: ScreenEvent) => { }
			this.savedOnMouseDown = (e: ScreenEvent) => { }
			this.savedOnMouseUp = (e: ScreenEvent) => { }
			this.savedOnMereMouseClick = (e: ScreenEvent) => { }
			this.savedOnDoubleMouseClick = (e: ScreenEvent) => { }
			this.savedOnLongMouseDown = (e: ScreenEvent) => { }
			this.hideLinksOfContent()
		}
	}

	linkingEnabled(): boolean {
		return (this.onPointerDown == this.startLinking)
	}

	startLinking(e: ScreenEvent) {
		var p = this.localEventVertex(e)
		this.openHook = this.hookAtLocation(p)
		if (this.openHook === null) { return }
		p = this.openHook.parent.transformLocalPoint(this.openHook.midpoint, this)
		let sb = new LinkBullet({ midpoint: p })
		let eb = new LinkBullet({ midpoint: p })
		this.openLink = new DependencyLink({
			startBullet: sb,
			endBullet: eb
		})
		this.add(this.openLink)
		this.openBullet = eb
		this.compatibleHooks = this.getCompatibleHooks(this.openHook)
	}

	linking(e: ScreenEvent) {
		if (this.openLink === null) { return }
		let p = this.localEventVertex(e)
		for (let hook of this.compatibleHooks) {
			let m = hook.positionInLinkMap()
			if (vertexCloseTo(p, m, SNAPPING_DISTANCE)) {
				this.openBullet.update({
					midpoint: m
				})
				return
			}
		}
		this.openBullet.update({
			midpoint: p
		})
	}

	endLinking(e: ScreenEvent) {
		let h = this.hookAtLocation(this.localEventVertex(e))
		if (this.openLink !== null) {
			this.remove(this.openLink)
		}
		if (h === null) {
			return
		} else if (h.constructor.name === 'EditableLinkHook' && h === this.openHook) {
			// click on a plus button to create a new hook
			let ed = h as EditableLinkHook
			ed.editName()
		} else if (h.constructor.name === 'EditableLinkHook') {
			// drag a link onto a plus button
			this.createNewDependency()
			this.links.push(this.openLink)
			let ed = h as EditableLinkHook
			ed.editName()
		} else {
			this.createNewDependency()
			this.links.push(this.openLink)
		}
		this.openLink = null
		this.openHook = null
		this.openBullet = null
		this.compatibleHooks = []
	}

	updateLinks() {
		for (let hook of this.allHooks()) {
			hook.update() // updates start and end points of links
		}
	}

	createNewDependency() {
		if (this.openBullet == this.openLink.startBullet) {
			let startHook = this.hookAtLocation(this.openBullet.positionInLinkMap())
			let endHook = this.hookAtLocation(this.openLink.endBullet.positionInLinkMap())
			this.createNewDependencyBetweenHooks(startHook, endHook)

		} else if (this.openBullet == this.openLink.endBullet) {
			let startHook = this.hookAtLocation(this.openLink.startBullet.positionInLinkMap())
			let endHook = this.hookAtLocation(this.openBullet.positionInLinkMap())
			this.createNewDependencyBetweenHooks(startHook, endHook)
		}
	}

	createNewDependencyBetweenHooks(startHook: LinkHook, endHook: LinkHook) {
		startHook.mobject.addDependency(startHook.name, endHook.mobject, endHook.name)
		startHook.addDependency('positionInLinkMap', this.openLink.startBullet, 'midpoint')
		endHook.addDependency('positionInLinkMap', this.openLink.endBullet, 'midpoint')
		startHook.mobject.update()
	}

	getCompatibleHooks(hook: LinkHook): Array<LinkHook> {
		if ((hook.type == 'output' && hook.constructor.name === 'LinkHook') || (hook.type == 'input' && hook.constructor.name === 'EditableLinkHook')) {
			return this.innerInputHooks().concat(this.outerOutputHooks())
		} else {
			return this.innerOutputHooks().concat(this.outerInputHooks())
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

	outerInputHooks(): Array<LinkHook> {
		return this.expandedInputList.linkHooks
	}

	outerOutputHooks(): Array<LinkHook> {
		return this.expandedOutputList.linkHooks
	}

	allHooks(): Array<LinkHook> {
		return this.innerInputHooks()
			.concat(this.innerOutputHooks())
			.concat(this.outerInputHooks())
			.concat(this.outerOutputHooks())
	}

	hookAtLocation(p: vertex): LinkHook | null {
		for (let h of this.allHooks()) {
			let q = h.positionInLinkMap()
			if (vertexCloseTo(p, q, SNAPPING_DISTANCE)) {
				return h
			}
		}
		return null
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





















import { Linkable } from 'core/linkables/Linkable'
import { DependencyLink } from 'core/linkables/DependencyLink'
import { LinkBullet } from 'core/linkables/LinkBullet'
import { RoundedRectangle } from 'core/shapes/RoundedRectangle'
import { vertex, vertexArray, vertexOrigin, vertexCopy, vertexEquals, vertexAdd, vertexSubtract, vertexCloseTo } from 'core/functions/vertex'
import { log } from 'core/functions/logging'
import { remove } from 'core/functions/arrays'
import { BoardCreator } from './BoardCreator'
import { Freehand } from 'core/creators/Freehand'
import { ExpandButton } from './ExpandButton'
import { LinkHook } from 'core/linkables/LinkHook'
//import { EditableLinkHook } from './EditableLinkHook'
import { Color } from 'core/classes/Color'
import { Creator } from 'core/creators/Creator'
import { ScreenEventDevice, screenEventDevice, screenEventDeviceAsString, ScreenEventHandler, ScreenEvent, eventVertex, isTouchDevice } from 'core/mobjects/screen_events'
import { Mobject } from 'core/mobjects/Mobject'
import { convertArrayToString } from 'core/functions/arrays'
import { getPaper } from 'core/functions/getters'
import { ExpandedBoardInputList } from './ExpandedBoardInputList'
import { ExpandedBoardOutputList } from './ExpandedBoardOutputList'
import { EXPANDED_IO_LIST_HEIGHT, EXPANDED_IO_LIST_INSET } from './constants'
import { IO_LIST_OFFSET, SNAPPING_DISTANCE } from 'core/linkables/constants'
import { Paper } from 'core/Paper'
import { MGroup } from 'core/mobjects/MGroup'
import { View } from 'core/mobjects/View'

declare var paper: Paper
export declare interface Window { webkit?: any }

export class BoardContent extends MGroup { }

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
		return {
			contentChildren: [],
			focusedChild: null,
			content: new BoardContent(),
			expandButton: new ExpandButton(),
			links: [],
			background: new RoundedRectangle({
				anchor: vertexOrigin(),
				cornerRadius: 25,
				screenEventHandler: ScreenEventHandler.Parent,
				fillColor: Color.gray(0.1),
				fillOpacity: 1.0,
				strokeColor: Color.gray(0.2),
				strokeWidth: 1.0,
				drawShadow: true
			}),
			expandedPadding: 20,
			screenEventHandler: ScreenEventHandler.Self,
			expanded: false,
			compactWidth: 400, // defined below in the section 'expand and contract'
			compactHeight: 300, // idem
			compactAnchor: vertexOrigin(),
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
			expandedInputList: new ExpandedBoardInputList(),
			expandedOutputList: new ExpandedBoardOutputList(),
			linksEditable: true,
			editingLinkName: false,
			openLink: null,
			openHook: null,
			openBullet: null,
			compatibleHooks: [],
			creationTool: null,
			isShowingLinks: false,
			allowingDrag: false
		}
	}

	mutabilities(): object {
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
	focusedChild?: Mobject
	content: MGroup

	/*
	Window chrome
	*/
	background: RoundedRectangle
	expandButton: ExpandButton

	setup() {
		super.setup()
		let w = window as Window
		
		this.update({
			frameWidth: this.expanded ? this.expandedWidth() : this.compactWidth,
			frameHeight: this.expanded ? this.expandedHeight() : this.compactHeight,
			anchor: this.expanded ? this.expandedAnchor() : vertexCopy(this.compactAnchor)
		})

		this.addDependency('frameWidth', this.background, 'width')
		this.addDependency('frameHeight', this.background, 'height')

		this.content.view.div.style['clip-path'] = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
		// TODO: clip at rounded corners as well
		this.add(this.background)
		this.add(this.content)
		this.moveToTop(this.inputList)
		this.moveToTop(this.outputList)
		this.add(this.expandButton)

		this.expandedInputList.update({
			height: EXPANDED_IO_LIST_HEIGHT,
			width: this.expandedWidth() - this.expandButton.view.frame.width - 2 * EXPANDED_IO_LIST_INSET,
			anchor: [this.expandButton.view.frame.width + EXPANDED_IO_LIST_INSET, EXPANDED_IO_LIST_INSET],
			mobject: this,
			outletProperties: this.inputProperties
		})
		this.add(this.expandedInputList)

		this.expandedOutputList.update({
			height: EXPANDED_IO_LIST_HEIGHT,
			width: this.expandedWidth() - this.expandButton.view.frame.width - 2 * EXPANDED_IO_LIST_INSET,
			anchor: [this.expandButton.view.frame.width + EXPANDED_IO_LIST_INSET, this.expandedHeight() - EXPANDED_IO_LIST_INSET - EXPANDED_IO_LIST_HEIGHT],
			mobject: this,
			outletProperties: this.outputProperties
		})
		this.add(this.expandedOutputList)

		if (this.contracted) {
			this.contractStateChange()
			this.inputList.view.show()
			this.outputList.view.show()
			this.expandedInputList.view.hide()
			this.expandedOutputList.view.hide()
		} else {
			this.expandStateChange()
			this.inputList.view.hide()
			this.outputList.view.hide()
			this.expandedInputList.view.show()
			this.expandedOutputList.view.show()
		}
		this.hideLinksOfContent()
		this.setButtonVisibility(false)
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, false)
		this.background.update({
			width: this.view.frame.width,
			height: this.view.frame.height,
			frameWidth: this.view.frame.width,
			frameHeight: this.view.frame.height
		})
		this.content.update({
			width: this.view.frame.width,
			height: this.view.frame.height,
			frameWidth: this.view.frame.width,
			frameHeight: this.view.frame.height
		})
		if  (redraw) { this.view.redraw() }
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
		return window.innerWidth - 2 * this.expandedPadding
	}

	expandedHeight(): number {
		return window.innerHeight - 2 * this.expandedPadding
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
			let sidebarDiv = document.querySelector('#sidebar_id')
			if (sidebarDiv != null) {
				let sidebarView = (sidebarDiv as any)['view']
				if (sidebarView != null) {
					this.sidebar = (sidebarView as View).mobject
				}
				getPaper().sidebar = this.sidebar
			}
		}
	}

	expand() {
		 this.animate({
		 	frameWidth: this.expandedWidth(),
		 	frameHeight: this.expandedHeight(),
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
		this.expandedInputList.view.hide()
		this.expandedOutputList.view.hide()

		this.inputList.update({
			anchor: [0.5 * (this.compactWidth - this.inputList.view.frame.width), -IO_LIST_OFFSET - this.inputList.view.frame.height]
		}, true)
		this.outputList.update({
			anchor: [0.5 * (this.compactWidth - this.outputList.view.frame.width), IO_LIST_OFFSET]
		}, true)

		if (this.board !== null) {
			this.messageSidebar({ 'init': convertArrayToString(this.board.buttonNames) })
		}
		this.sidebar = null
	}

	contract() {
		this.animate({
			frameWidth: this.compactWidth,
			frameHeight: this.compactHeight,
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
			if (mob.sensor.screenEventHandler == ScreenEventHandler.Self) {
				mob.disable()
			}
		}
	}

	enableContent() {
		for (let mob of this.contentChildren) {
			if (mob.sensor.savedScreenEventHandler == ScreenEventHandler.Self) {
				mob.enable()
			}
		}
	}


	showShadow() {
		super.showShadow()
		this.background.showShadow()
	}

	hideShadow() {
		super.hideShadow()
		this.background.hideShadow()
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
		if (this.expandButton.view.visible) {
			// exception: Paper
			this.moveToTop(this.expandButton)
		}
		if (mob instanceof Linkable) {
			mob.hideLinks()
		}
		if (mob instanceof Board) {
			if (mob.constructor.name == 'Construction') { return }
			mob.background.update({
				fillColor: this.background.view.fillColor.brighten(1.1)
			})
		}
	}

	removeFromContent(mob: Linkable) {
		remove(this.contentChildren, mob)
		this.content.remove(mob)
	}

	setInternalDragging(value: boolean) {
		if (value == this.allowingDrag) { return }
		this.allowingDrag = value
		this.setPanning(value)
		for (let mob of this.contentChildren) {
			mob.setDragging(value)
		}
	}

	handleMessage(key: string, value: any) {
		if (value === "0") { value = false }
		if (value === "1") { value = true }
		this.enableContent()
		switch (key) {
			case 'drag':
				this.setInternalDragging(value as boolean)
				break
			case 'link':
				this.setLinking(value as boolean)
				break
			case 'ctrl':
				this.setButtonVisibility(value as boolean)
				break
			case 'create':
				this.creationMode = value
				if (this.creator == null) { return }
				this.remove(this.creator)
				this.creator = this.createCreator(this.creationMode)
				this.add(this.creator)
				break
		}
	}


	setButtonVisibility(visible: boolean) {
		for (let mob of this.contentChildren) {
			if (mob instanceof Linkable) {
				mob.setButtonVisibility(visible)
			}
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
		if (this.focusedChild) {
			this.focusedChild.blur()
		}
		if (this.contracted) { return }
		this.startCreating(e)
	}

	focusOn(child: Mobject) {
		this.focusedChild = child
		getPaper().activeKeyboard = false
		if (!this.sidebar) { return }
		for (let button of this.sidebar.buttons) {
			button.activeKeyboard = false
		}
	}

	blurFocusedChild() {
		this.focusedChild = null
		getPaper().activeKeyboard = true
		if (!this.sidebar) { return }
		for (let button of this.sidebar.buttons) {
			button.activeKeyboard = true
		}
	}

	startCreating(e: ScreenEvent) {
		this.creationTool = screenEventDevice(e)
		if (this.creationTool == ScreenEventDevice.Finger && this.creationMode == 'freehand') {
			return
		}
		this.creationStroke.push(this.sensor.localEventVertex(e))
		this.creator = this.createCreator(this.creationMode)
		this.add(this.creator)
	}

	onPointerMove(e: ScreenEvent) {
		if (this.contracted) { return }
		if (this.creationStroke.length == 0) { return }
		this.creating(e)
	}

	creating(e: ScreenEvent) {
		if (this.creationTool == ScreenEventDevice.Finger && this.creationMode == 'freehand') {
			return
		}
		let v: vertex = this.sensor.localEventVertex(e)
		this.creationStroke.push(v)
		this.creator.updateFromTip(v)
	}

	onPointerUp(e: ScreenEvent) {
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

	allowingDrag: boolean
	panPointStart?: vertex

	startPanning(e: ScreenEvent) {
		this.panPointStart = this.sensor.localEventVertex(e)
		for (let mob of this.contentChildren) {
			mob.dragAnchorStart = vertexCopy(mob.view.frame.anchor)
			mob.hideShadow()
		}
	}

	panning(e: ScreenEvent) {
		let panPoint = this.sensor.localEventVertex(e)
		let dr = vertexSubtract(panPoint, this.panPointStart)

		for (let mob of this.contentChildren) {
			if (mob.dragAnchorStart == null) { return }
			let newAnchor: vertex = vertexAdd(mob.dragAnchorStart, dr)
			mob.update({ anchor: newAnchor })
			mob.view.div.style.left = `${newAnchor[0]}px`
			mob.view.div.style.top = `${newAnchor[1]}px`
		}
		this.updateLinks()
	}

	endPanning(e: ScreenEvent) {
		this.panPointStart = null
		for (let mob of this.contentChildren) {
			mob.dragAnchorStart = null
			mob.showShadow()
		}
	}

	setPanning(flag: boolean) {
		if (flag) {
			this.sensor.setTouchMethodsTo(this.startPanning.bind(this), this.panning.bind(this), this.endPanning.bind(this))
			this.sensor.setPenMethodsTo(this.startPanning.bind(this), this.panning.bind(this), this.endPanning.bind(this))
			this.sensor.setMouseMethodsTo(this.startPanning.bind(this), this.panning.bind(this), this.endPanning.bind(this))
		} else {
			this.sensor.restoreTouchMethods()
			this.sensor.restorePenMethods()
			this.sensor.restoreMouseMethods()
		}
	}


	//////////////////////////////////////////////////////////
	//                                                      //
	//                        LINKING                       //
	//                                                      //
	//////////////////////////////////////////////////////////

	expandedInputList: ExpandedBoardInputList
	expandedOutputList: ExpandedBoardOutputList
	// editingLinkName: boolean
	openLink?: DependencyLink
	openHook?: LinkHook
	openBullet?: LinkBullet
	compatibleHooks: Array<LinkHook>
	// the list of dependencies between the linkable content children
	links: Array<DependencyLink>
	isShowingLinks: boolean

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
		this.expandedInputList.view.show()
		this.expandedOutputList.view.show()
	}
	
	hideLinksOfContent() {
	// toggled by 'link' button in sidebar
		for (let link of this.links) {
			this.remove(link)
		}
		for (let submob of this.linkableChildren()) {
			submob.hideLinks()
		}

		this.expandedInputList.view.hide()
		this.expandedOutputList.view.hide()
	}

	renameLinkableProperty(kind: 'input' | 'output', oldName: string, newName: string) {
		super.renameLinkableProperty(kind, oldName, newName)
		let expandedList = (kind == 'input') ? this.expandedInputList : this.expandedOutputList
		expandedList.renameProperty(oldName, newName)	
	}

	setLinking(flag: boolean) {
		if (flag && !this.isShowingLinks) {
			this.showLinksOfContent()
			//if (isTouchDevice) {
				this.sensor.setTouchMethodsTo(this.startLinking.bind(this), this.linking.bind(this), this.endLinking.bind(this))
				this.sensor.setPenMethodsTo(this.startLinking.bind(this), this.linking.bind(this), this.endLinking.bind(this))
				this.sensor.setMouseMethodsTo(this.startLinking.bind(this), this.linking.bind(this), this.endLinking.bind(this))
			// } else {
			// 	this.sensor.setPointerMethodsTo(this.startLinking.bind(this), this.linking.bind(this), this.endLinking.bind(this))
			// }
		} else if (!flag && this.isShowingLinks) { // if (!this.editingLinkName) {
			this.hideLinksOfContent()
			//if (isTouchDevice) {
				this.sensor.restoreTouchMethods()
				this.sensor.restorePenMethods()
				this.sensor.restoreMouseMethods()
			// } else {
			// 	this.sensor.restorePointerMethods()
			// }
		}
		this.isShowingLinks = flag
	}

	startLinking(e: ScreenEvent) {
		var p = this.sensor.localEventVertex(e)
		let clickedHook = this.hookAtLocation(p)
		if (clickedHook == null) { return }
		p = this.locationOfHook(clickedHook)
		if (this.isFree(clickedHook)) {
			this.createNewOpenLink(clickedHook)
		} else {
			let link = this.linkForHook(clickedHook)
			link.dependency.source.removeDependency(link.dependency)
			remove(this.links, link)
			this.remove(link)
			clickedHook.outlet.removeHook()
			if (clickedHook.outlet.kind == 'output') {
				this.createNewOpenLink(link.endHook)
			} else {
				this.createNewOpenLink(link.startHook)
			}
		}
		this.compatibleHooks = this.getCompatibleHooks(this.openHook)
	}

	locationOfHook(hook: LinkHook): vertex {
		return hook.parent.view.frame.transformLocalPoint(hook.midpoint, this.view.frame)
	}

	linkForHook(hook: LinkHook): DependencyLink | null {
		for (let link of this.links) {
			if (link.startHook == hook || link.endHook == hook) {
				return link
			}
		}
		return null
	}

	isFree(hook: LinkHook): boolean {
		return this.linkForHook(hook) == null
	}

	createNewOpenLink(hook: LinkHook) {
		this.openHook = hook
		let p = this.locationOfHook(hook)
		let sb = new LinkBullet({ midpoint: p })
		let eb = new LinkBullet({ midpoint: p })
		if (this.openHook.outlet.kind == 'output') {
			this.openLink = new DependencyLink({
				startBullet: sb,
				endBullet: eb,
				startHook: hook
			})
			this.openBullet = eb
		} else {
			this.openLink = new DependencyLink({
				startBullet: sb,
				endBullet: eb,
				endHook: hook
			})
			this.openBullet = sb
		}
		this.add(this.openLink)
	}

	linking(e: ScreenEvent) {
		if (this.openLink === null) { return }
		var p = this.sensor.localEventVertex(e)
		let endHook = this.freeCompatibleHookAtLocation(p)
		if (endHook !== null) {
			p = this.locationOfHook(endHook)
		}
		this.openBullet.update({
			midpoint: p
		})
	}

	endLinking(e: ScreenEvent) {
		let h = this.freeCompatibleHookAtLocation(this.sensor.localEventVertex(e))
		if (h === null) {
			if (this.openLink) {
				this.remove(this.openLink)
			}
			this.openLink = null
			this.openHook = null
			this.openBullet = null
			this.compatibleHooks = []
			return
		}
		// if (h.constructor.name === 'EditableLinkHook' && h === this.openHook) {
		// 	// click on a plus button to create a new hook
		// 	let ed = h as EditableLinkHook
		// 	ed.editName()
		// } else if (h.constructor.name === 'EditableLinkHook') {
		// 	// drag a link onto a plus button
		if (this.openLink.startHook == null) {
			this.openLink.update({
				startHook: h
			})
		} else {
			this.openLink.update({
				endHook: h
			})
		}
		this.links.push(this.openLink)
		this.createNewDependency()
		this.openLink = null
		this.openHook = null
		this.openBullet = null
		this.compatibleHooks = []

	}

	getCompatibleHooks(startHook: LinkHook): Array<LinkHook> {
		return this.allHooks().filter((endHook) => this.areCompatibleHooks(startHook, endHook))
		// TODO: and endHook is not yet occupied!
	}

	areCompatibleHooks(startHook: LinkHook, endHook: LinkHook): boolean {
		if (startHook.outlet.kind == 'output' && endHook.outlet.kind == 'input') {
			let flag1 = (startHook.outlet.type == endHook.outlet.type)
				|| ((startHook.outlet.type == 'number' || startHook.outlet.type == 'Array<number>')
					&& endHook.outlet.type == 'number|Array<number>')
			let flag2 = (startHook.outlet.ioList.mobject !== endHook.outlet.ioList.mobject)
			let flag3 = (!startHook.outlet.ioList.mobject.dependsOn(endHook.outlet.ioList.mobject))
			return flag1 && flag2 && flag3
		} else if (startHook.outlet.kind == 'input' && endHook.outlet.kind == 'output'){
			return this.areCompatibleHooks(endHook, startHook)
		} else {
			return false
		}
	}

	updateLinks() {
		for (let hook of this.allHooks()) {
			hook.update() // this is supposed to update start and end points of links
		}
	}

	createNewDependency() {
			this.createNewDependencyBetweenHooks(this.openLink.startHook, this.openLink.endHook)
	}

	createNewDependencyBetweenHooks(startHook: LinkHook, endHook: LinkHook) {
		startHook.outlet.ioList.mobject.addDependency(
			startHook.outlet.name,
			endHook.outlet.ioList.mobject,
			endHook.outlet.name
		)
		this.openLink.update({
			startHook: startHook,
			endHook: endHook,
			dependency: startHook.outlet.ioList.mobject.dependencies[startHook.outlet.ioList.mobject.dependencies.length - 1]
		})
		startHook.addDependency('positionInBoard', this.openLink.startBullet, 'midpoint')
		endHook.addDependency('positionInBoard', this.openLink.endBullet, 'midpoint')
		startHook.outlet.addHook()
		startHook.outlet.ioList.mobject.update()
	}

	removeDependencyBetweenHooks(startHook: LinkHook, endHook: LinkHook) {
		startHook.outlet.ioList.mobject.removeDependencyBetween(
			startHook.outlet.name,
			endHook.outlet.ioList.mobject,
			endHook.outlet.name
		)
		startHook.removeDependencyBetween('positionInBoard', this.openLink.startBullet, 'midpoint')
		endHook.removeDependencyBetween('positionInBoard', this.openLink.endBullet, 'midpoint')
		startHook.outlet.removeHook()
		startHook.outlet.ioList.mobject.update()
	}


	// innerInputHooks(): Array<LinkHook> {
	// 	let arr: Array<LinkHook>  = []
	// 	for (let submob of this.linkableChildren()) {
	// 		for (let inputName of submob.inputNames) {
	// 			arr.push(submob.inputList.hookNamed(inputName))
	// 		}
	// 	}
	// 	return arr
	// }

	// innerOutputHooks(): Array<LinkHook> {
	// 	let arr: Array<LinkHook>  = []
	// 	for (let submob of this.linkableChildren()) {
	// 		for (let outputName of submob.outputNames) {
	// 			arr.push(submob.outputList.hookNamed(outputName))
	// 		}
	// 	}
	// 	return arr
	// }

	// outerInputHooks(): Array<LinkHook> {
	// 	return this.expandedInputList.linkHooks
	// }

	// outerOutputHooks(): Array<LinkHook> {
	// 	return this.expandedOutputList.linkHooks
	// }

	allHooks(): Array<LinkHook> {
		if (this.contracted) {
			return super.allHooks()
		}
		let ret: Array<LinkHook> = []
		for (let linkable of this.contentChildren) {
			if (linkable instanceof Linkable) {
				ret = ret.concat(linkable.allHooks())
			}
		}
		return ret
	}

	freeHooks(): Array<LinkHook> {
		return this.allHooks().filter((h: LinkHook) => this.isFree(h))
	}

	hookAtLocationFromList(p: vertex, hookList: Array<LinkHook>): LinkHook | null {
		for (let h of hookList) {
			let boardFrame = this.view.frame
			let outletFrame = h.parent.view.frame
			let q = outletFrame.transformLocalPoint(h.midpoint, boardFrame)
			if (vertexCloseTo(p, q, SNAPPING_DISTANCE)) {
				return h
			}
		}
		return null
	}

	freeCompatibleHooks(): Array<LinkHook> {
		return this.compatibleHooks.filter((h: LinkHook) => this.isFree(h))
	}

	hookAtLocation(p: vertex): LinkHook | null {
		return this.hookAtLocationFromList(p, this.allHooks())
	}

	freeHookAtLocation(p: vertex): LinkHook | null {
		return this.hookAtLocationFromList(p, this.freeHooks())
	}

	compatibleHookAtLocation(p: vertex): LinkHook | null {
		return this.hookAtLocationFromList(p, this.compatibleHooks)
	}

	freeCompatibleHookAtLocation(p: vertex): LinkHook | null {
		return this.hookAtLocationFromList(p, this.freeCompatibleHooks())
	}

	//////////////////////////////////////////////////////////
	//                                                      //
	//                       MESSAGING                      //
	//                                                      //
	//////////////////////////////////////////////////////////

	messageSidebar(message: object) {
		if (isTouchDevice) {
			let w = window as Window
			w.webkit.messageHandlers.handleMessageFromPaper.postMessage(message)
		} else {
			if (this.sidebar !== null && this.sidebar !== undefined) {
				this.sidebar.getMessage(message)
			}
		}
	}

}




















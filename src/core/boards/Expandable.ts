
import { Linkable } from 'core/linkables/Linkable'
import { vertex, vertexOrigin, vertexCopy } from 'core/functions/vertex'
import { ExpandButton } from './ExpandButton'
import { ScreenEventHandler, isTouchDevice, separateSidebar } from 'core/mobjects/screen_events'
import { RoundedRectangle } from 'core/shapes/RoundedRectangle'
import { Color } from 'core/classes/Color'
import { getPaper } from 'core/functions/getters'
import { convertArrayToString } from 'core/functions/arrays'
import { View } from 'core/mobjects/View'
import { IO_LIST_OFFSET } from 'core/linkables/constants'
import { log } from 'core/functions/logging'
import { EXPANDABLE_CORNER_RADIUS } from './constants'

interface Window { webkit?: any }

export class Expandable extends Linkable {

	compactWidth: number
	compactHeight: number
	compactAnchor: vertex
	expandedPadding: number
	expanded: boolean

	// Window chrome
	background: RoundedRectangle
	expandButton: ExpandButton

	// a reference to the sidebar so we can change it
	sidebar?: any
	// by creating buttons named this:
	buttonNames: Array<string>

	constructor(args: object = {}) {
		if (args['anchor'] !== undefined && args['compactAnchor'] === undefined) {
			console.warn('Are you sure you do not want to set compactAnchor instead of anchor on Expandable?')
		}
		super(args)
	}

	defaults(): object {
		return {
			expandButton: new ExpandButton({
				midpoint: [EXPANDABLE_CORNER_RADIUS, EXPANDABLE_CORNER_RADIUS]
			}),
			expandedPadding: 20,
			screenEventHandler: ScreenEventHandler.Self,
			expanded: false,
			compactWidth: 400, // defined below in the section 'expand and contract'
			compactHeight: 300, // idem
			compactAnchor: vertexOrigin(),
			borderRadius: EXPANDABLE_CORNER_RADIUS,
			background: new RoundedRectangle({
				anchor: vertexOrigin(),
				cornerRadius: EXPANDABLE_CORNER_RADIUS,
				screenEventHandler: ScreenEventHandler.Parent,
				fillColor: (isTouchDevice && separateSidebar) ? Color.clear() : Color.black(),
				fillOpacity: 1.0,
				strokeColor: Color.gray(0.2),
				strokeWidth: 1.0,
			}),
			buttonNames: [],
		}
	}


	mutabilities(): object {
		return {
			expandButton: 'never',
			expandedPadding: 'in_subclass'
		}
	}

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


		this.add(this.background)
		this.add(this.expandButton)
		this.expandButton.update({
			midpoint: [EXPANDABLE_CORNER_RADIUS, EXPANDABLE_CORNER_RADIUS]
		})

		if (this.contracted) {
			this.contractStateChange()
			this.inputList.view.show()
			this.outputList.view.show()
		} else {
			this.expandStateChange()
			this.inputList.view.hide()
			this.outputList.view.hide()
		}

		this.view.overflow = 'hidden'
	}


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
		if (this.parent != undefined) {
			this.parent.moveToTop(this)
		}
		this.expandButton.label.update({
			text: '–'
		})
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
		this.expandButton.enable()
		if (this.parent) {
			getPaper().expandedMobject = this.board
		}
		this.expandButton.label.update({
			text: '+'
		})

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

	messageSidebar(message: object) {
		try {
			let w = window as Window
			w.webkit.messageHandlers.handleMessageFromPaper.postMessage(message)
		} catch {
			this.sidebar.getMessage(message)
		}
	}




}
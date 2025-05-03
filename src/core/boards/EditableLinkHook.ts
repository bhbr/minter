





// import { LinkHook } from 'core/linkables/LinkHook'
// import { ScreenEvent, ScreenEventHandler, isTouchDevice } from 'core/mobjects/screen_events'
// import { getPaper, getSidebar } from 'core/functions/getters'
// import { ExpandedBoardIOList }  from './ExpandedBoardIOList'
// import { Color } from 'core/classes/Color'
// import { vertex } from 'core/functions/vertex'
// import { MGroup } from 'core/mobjects/MGroup'
// import { Line } from 'core/shapes/Line'
// import { Board } from './Board'
// import { EditableLinkHookView } from './EditableLinkHookView'

// export class EditableLinkHook extends LinkHook {
	
// 	declare _parent: ExpandedBoardIOList
// 	declare mobject: Board
// 	declare view: EditableLinkHookView
// 	previousValue: string
// 	index: number
// 	empty: boolean
// 	plusSign: MGroup
// 	signStrokeWidth: number
// 	signScale: number

// 	get parent(): ExpandedBoardIOList {
// 		return this._parent
// 	}

// 	set parent(newValue: ExpandedBoardIOList) {
// 		this._parent = newValue
// 	}

// 	defaults(): object {
// 		return {
// 			screenEventHandler: ScreenEventHandler.Parent,
// 			previousValue: '',
// 			index: 0,
// 			empty: false,
// 			signStrokeWidth: 2,
// 			signScale: 0.5,
// 			plusSign: new MGroup()
// 		}
// 	}

// 	mutabilities(): object {
// 		return {
// 			signStrokeWidth: 'never',
// 			signScale: 'never',
// 			plusSign: 'never'
// 		}
// 	}

// 	setup() {
// 		super.setup()
// 		this.boundKeyPressed = this.keyPressed.bind(this)
// 		this.boundActivateKeyboard = this.activateKeyboard.bind(this)
// 		this.setupPlusSign()
// 	}

// 	setupPlusSign() {
// 		let line1 = new Line({
// 			startPoint: [this.radius, (1 - this.signScale) * this.radius],
// 			endPoint: [this.radius, (1 + this.signScale) * this.radius],
// 			strokeWidth: this.signStrokeWidth
// 		})
// 		let line2 = new Line({
// 			startPoint: [(1 - this.signScale) * this.radius, this.radius],
// 			endPoint: [(1 + this.signScale) * this.radius, this.radius],
// 			strokeWidth: this.signStrokeWidth
// 		})
// 		this.plusSign.add(line1)
// 		this.plusSign.add(line2)
// 		if (this.empty) {
// 			this.add(this.plusSign)
// 		}
// 	}

// 	editName() {
// 		this.view.inputBox.style.visibility = 'visible'
// 		this.view.inputBox.focus()
// 		this.view.inputBox.style.backgroundColor = Color.black().toCSS()
// 		this.parent.parent.editingLinkName = true
// 		document.addEventListener('keyup', this.boundActivateKeyboard)
// 	}

// 	activateKeyboard() {
// 		document.removeEventListener('keyup', this.boundActivateKeyboard)
// 		document.addEventListener('keydown', this.boundKeyPressed)
// 		getPaper().activeKeyboard = false
// 		for (let button of getSidebar().buttons) {
// 			button.activeKeyboard = false
// 		}
// 	}

// 	boundActivateKeyboard() { }

// 	deactivateKeyboard() {
// 		document.removeEventListener('keydown', this.boundKeyPressed)
// 		getPaper().activeKeyboard = true
// 		for (let button of getSidebar().buttons) {
// 			button.activeKeyboard = true
// 		}
// 	}

// 	boundKeyPressed(e: ScreenEvent) { }

// 	keyPressed(e: KeyboardEvent) {
// 		if (e.which != 13) { return }
// 		this.empty = false
// 		if (this.view.inputBox.value == '') {
// 			this.view.inputBox.value = this.previousValue
// 			return
// 		}
// 		this.view.inputBox.blur()
// 		this.parent.parent.editingLinkName = false
// 		this.remove(this.plusSign)
// 		this.parent.parent.hideLinksOfContent()
// 		getPaper().activeKeyboard = true
// 		if (!isTouchDevice) {
// 			for (let button of getSidebar().buttons) {
// 				button.activeKeyboard = true
// 			}
// 		}
// 		if (this.view.inputBox.value == this.previousValue) { return }
// 		if (this.previousValue == '') {
// 			this.parent.createNewHook(true)
// 		}
// 		this.previousValue = this.view.inputBox.value
		
// 		this.update({
// 			name: this.view.inputBox.value
// 		})
// 		this.parent.updateLinkNames()
// 		this.mobject.setLinking(false)
// 		if (this.type === 'input') {
// 			this.mobject.inputList.update({
// 				linkNames: this.mobject.inputNames
// 			})
// 		} else if (this.type === 'output') {
// 			this.mobject.outputList.update({
// 				linkNames: this.mobject.outputNames
// 			})
// 		}
// 		this.deactivateKeyboard()
// 	}

// 	positionInBoard(): vertex {
// 	// used e. g. for snapping
// 		let p = this.parent.view.frame.transformLocalPoint(this.midpoint, this.parent.parent.view.frame)
// 		return p
// 	}




// }

import { LinkHook } from 'core/linkables/LinkHook'
import { ScreenEvent, ScreenEventHandler, isTouchDevice } from 'core/mobjects/screen_events'
import { getPaper, getSidebar } from 'core/functions/getters'
import { ExpandedBoardIOList }  from './ExpandedBoardIOList'
import { Color } from 'core/classes/Color'
import { vertex } from 'core/functions/vertex'
import { MGroup } from 'core/mobjects/MGroup'
import { Line } from 'core/shapes/Line'

export class EditableLinkHook extends LinkHook {
	
	inputBox: HTMLInputElement
	declare _parent: ExpandedBoardIOList
	previousValue: string
	index: number
	empty: boolean
	plusSign: MGroup
	signStrokeWidth: number
	signScale: number

	get parent(): ExpandedBoardIOList {
		return this._parent
	}

	set parent(newValue: ExpandedBoardIOList) {
		this._parent = newValue
	}

	ownDefaults(): object {
		return {
			inputBox: document.createElement('input'),
			screenEventHandler: ScreenEventHandler.Parent,
			previousValue: '',
			index: 0,
			empty: false,
			signStrokeWidth: 2,
			signScale: 0.5,
			plusSign: new MGroup()
		}
	}

	ownMutabilities(): object {
		return {
			inputBox: 'never',
			signStrokeWidth: 'never',
			signScale: 'never',
			plusSign: 'never'
		}
	}

	setup() {
		super.setup()
		this.inputBox.setAttribute('type', 'text')
		this.inputBox.style.width = '90%'
		this.inputBox.style.padding = '3px 3px'
		this.inputBox.style.color = 'white'
		this.inputBox.style.backgroundColor = Color.gray(0.2).toCSS()
		this.inputBox.style.textAlign = 'left'
		this.inputBox.style.verticalAlign = 'center'
		this.inputBox.style.fontSize = '20px'
		this.inputBox.style.position = 'absolute'
		this.inputBox.style.top = '-7px'
		this.inputBox.style.left = '30px'
		this.inputBox.style.width = '150px'
		if (!this.empty) {
			this.view.appendChild(this.inputBox)
		}
		this.boundKeyPressed = this.keyPressed.bind(this)
		this.boundActivateKeyboard = this.activateKeyboard.bind(this)
		this.setupPlusSign()
	}

	setupPlusSign() {
		let line1 = new Line({
			startPoint: [this.radius, (1 - this.signScale) * this.radius],
			endPoint: [this.radius, (1 + this.signScale) * this.radius],
			strokeWidth: this.signStrokeWidth
		})
		let line2 = new Line({
			startPoint: [(1 - this.signScale) * this.radius, this.radius],
			endPoint: [(1 + this.signScale) * this.radius, this.radius],
			strokeWidth: this.signStrokeWidth
		})
		this.plusSign.add(line1)
		this.plusSign.add(line2)
		if (this.empty) {
			this.add(this.plusSign)
		}
	}

	editName() {
		this.inputBox.focus()
		this.inputBox.style.backgroundColor = Color.black().toCSS()
		this.parent.parent.editingLinkName = true
		document.addEventListener('keyup', this.boundActivateKeyboard)
	}

	activateKeyboard() {
		document.removeEventListener('keyup', this.boundActivateKeyboard)
		document.addEventListener('keydown', this.boundKeyPressed)
		getPaper().activeKeyboard = false
		for (let button of getSidebar().buttons) {
			button.activeKeyboard = false
		}
	}

	boundActivateKeyboard() { }

	deactivateKeyboard() {
		document.removeEventListener('keydown', this.boundKeyPressed)
		getPaper().activeKeyboard = true
		for (let button of getSidebar().buttons) {
			button.activeKeyboard = true
		}
	}

	boundKeyPressed(e: ScreenEvent) { }

	keyPressed(e: KeyboardEvent) {
		if (e.which != 13) { return }
		if (this.inputBox.value == '') {
			this.inputBox.value = this.previousValue
			return
		}
		this.inputBox.blur()
		this.parent.parent.editingLinkName = false
		this.parent.parent.hideLinksOfContent()
		getPaper().activeKeyboard = true
		if (!isTouchDevice) {
			for (let button of getSidebar().buttons) {
				button.activeKeyboard = true
			}
		}
		if (this.inputBox.value == this.previousValue) { return }
		if (this.previousValue == '') {
			this.parent.createNewHook()
		}
		this.previousValue = this.inputBox.value
		
		this.update({
			name: this.inputBox.value
		})
		this.parent.updateLinkNames()
		this.deactivateKeyboard()
	}

	positionInLinkMap(): vertex {
	// used e. g. for snapping
		let p = this.parent.transformLocalPoint(this.midpoint, this.parent.parent)
		return p
	}




}

import { LinkHook } from 'core/linkables/LinkHook'
import { ScreenEvent, ScreenEventHandler, isTouchDevice } from 'core/mobjects/screen_events'
import { getPaper, getSidebar } from 'core/functions/getters'
import { ExpandedBoardInputList}  from './ExpandedBoardInputList'
import { Color } from 'core/classes/Color'
import { vertex } from 'core/functions/vertex'

export class EditableLinkHook extends LinkHook {
	
	inputBox: HTMLInputElement
	declare _parent: ExpandedBoardInputList
	previousValue: string
	index: number

	get parent(): ExpandedBoardInputList {
		return this._parent
	}

	set parent(newValue: ExpandedBoardInputList) {
		this._parent = newValue
	}

	ownDefaults(): object {
		return {
			inputBox: document.createElement('input'),
			screenEventHandler: ScreenEventHandler.Self,
			previousValue: '',
			index: 0
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
		this.view.appendChild(this.inputBox)
		this.boundKeyPressed = this.keyPressed.bind(this)
	}

	onPointerUp(e: ScreenEvent) {
		console.log('pointer up')
		this.inputBox.focus()
		this.inputBox.style.backgroundColor = Color.black().toCSS()
		this.activateKeyboard()
	}

	activateKeyboard() {
		document.addEventListener('keydown', this.boundKeyPressed)
		getPaper().activeKeyboard = false
		for (let button of getSidebar().buttons) {
			button.activeKeyboard = false
		}
	}

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
		this.parent.updateInputNames()
		this.deactivateKeyboard()
	}

	positionInLinkMap(): vertex {
	// used e. g. for snapping
		return this.parent.transformLocalPoint(this.midpoint, this.parent.parent)
	}




}
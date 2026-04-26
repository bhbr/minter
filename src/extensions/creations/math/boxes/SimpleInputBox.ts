
import { Rectangle } from 'core/shapes/Rectangle'
import { TextLabel } from 'core/mobjects/TextLabel'
import { Color } from 'core/classes/Color'
import { Mobject } from 'core/mobjects/Mobject'
import { log } from 'core/functions/logging'
import { vertex } from 'core/functions/vertex'
import { getPaper, getSidebar } from 'core/functions/getters'
import { ScreenEvent, ScreenEventHandler, isTouchDevice } from 'core/mobjects/screen_events'
import { SidebarButton } from 'core/sidebar_buttons/SidebarButton'
import { DependencyLink } from 'core/linkables/DependencyLink'
import { DraggingCreator } from 'core/creators/DraggingCreator'


export class SimpleInputBox extends Mobject {

	label: TextLabel
	inputElement: HTMLInputElement
	inputWidth: number
	background: Rectangle
	labelGap: number

	defaults(): object {
		return {
			label: new TextLabel({
				text: 'label',
				verticalAlign: 'middle',
				frameWidth: 60,
				frameHeight: 30,
			}),
			background: new Rectangle({
				width: 60,
				height: 30,
				anchor: [60, 0],
				fillColor: Color.black(),
				strokeWidth: 0
			}),
			inputElement: document.createElement('input'),
			inputWidth: 60,
			frameWidth: 120,
			frameHeight: 30,
			strokeWidth: 0.0,
			labelGap: 10.0,
			screenEventHandler: ScreenEventHandler.Self
		}
	}

	mutabilities(): object {
		return {
			background: 'never',
			inputElement: 'never',
			labelGap: 'never'
		}
	}

	onPointerUp(e: ScreenEvent) {
		this.focus()
	}

	get labelWidth(): number {
		return this.label.frameWidth
	}

	set labelWidth(newValue: number) {
		this.label.update({
			frameWidth: newValue
		})
	}

	get labelText(): string {
		return this.label.text
	}

	set labelText(newValue: string) {
		this.label.update({
			text: newValue
		})
	}

	focus() {
		super.focus()
		this.inputElement.focus()
		document.addEventListener('keydown', this.boundKeyPressed)
	}

	blur() {
		super.blur()
		this.inputElement.blur()
		document.removeEventListener('keydown', this.boundKeyPressed)
	}

	setup() {
		super.setup()
		this.add(this.background)
		this.add(this.label)
		this.inputElement.setAttribute('type', 'text')
		this.inputElement.style.left = `${this.labelWidth + this.labelGap}px`
		this.inputElement.style.width = `${this.inputWidth}px`
		this.inputElement.style.position = 'absolute'
		this.inputElement.style.height = '70%'
		this.inputElement.style.padding = '0px 0px'
		this.inputElement.style.color = 'white'
		this.inputElement.style.backgroundColor = 'rgba(50, 50, 50, 1)'
		this.inputElement.style.textAlign = 'center'
		this.inputElement.style.verticalAlign = 'center'
		this.inputElement.style.fontSize = '16px'
		this.inputElement.style.border = 'none'
		this.inputElement.style.outline = 'none'
		this.inputElement.value = this.inputElement.value.toString()
		this.view.div.appendChild(this.inputElement)
		this.background.update({
			width: this.inputWidth,
			height: this.frameHeight,
			anchor: [this.labelWidth + this.labelGap, 0]
		})
		this.label.update({
			frameHeight: this.frameHeight
		})
		this.boundKeyPressed = this.keyPressed.bind(this)
		document.addEventListener('keyup', this.boundActivateKeyboard)
	}

	boundKeyPressed(e: ScreenEvent) { }

	keyPressed(e: KeyboardEvent) {
		if (e.which != 13) { return }
		this.inputElement.blur()
		getPaper().activeKeyboard = true
		if (!isTouchDevice) {
			for (let button of getSidebar().buttons) {
				button.activeKeyboard = true
			}
		}
		this.update({ value: this.valueFromString(this.inputElement.value) })
		this.updateDependents()
		this.onReturn()
	}

	valueFromString(valueString: string): any {
		return valueString
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

	onReturn() { }

	update(args: object = {}, redraw: boolean = true) {
		let newLabelWidth = args['labelWidth']
		let newInputWidth = args['inputWidth']
		if (newLabelWidth !== undefined) {
			this.inputElement.style.left = `${newLabelWidth + this.labelGap}px`;
		}
		if (newLabelWidth !== undefined) {
			this.inputElement.style.width = `${newInputWidth}px`;
		}
		if (newLabelWidth !== undefined || newInputWidth !== undefined) {
			args['frameWidth'] = (newLabelWidth ?? this.labelWidth) + (newInputWidth ?? this.inputWidth)
		}
		super.update(args, redraw)
		if (args['value'] !== undefined) {
			this.inputElement.textContent = `${args['value']}`
		}
		this.background.update({
			anchor: [this.labelWidth + this.labelGap, 0],
			inputWidth: newInputWidth ?? this.inputWidth
		}, redraw)

	}

}


import { Mobject } from './mobject/Mobject'
import { Color } from './helpers/Color'

export class TextLabel extends Mobject {

	text: string
	horizontalAlign: string // 'left' | 'center' | 'right'
	verticalAlign: string // 'top' | 'center' | 'bottom'
	color?: Color
	borderColor: Color
	borderWidth: number
	fontSize: number

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			text: 'text',
			horizontalAlign: 'center',
			verticalAlign: 'center',
			color: Color.white(),
			borderColor: Color.white(),
			borderWidth: 1
		})
	}

	statefulSetup() {
		super.statefulSetup()
		this.view.setAttribute('class', this.constructor.name + ' unselectable mobject-div')
		this.view.style.display = 'flex'
		this.view.style.fontFamily = 'Helvetica'
		this.view.style.fontSize = `${this.fontSize}px`
	}

	redrawSelf() {
		if (this.anchor.isNaN()) { return }
		if (this.color == undefined) { this.color = Color.white() }
		super.redrawSelf()
	}

	updateModel(argsDict: object = {}) {
		super.updateModel(argsDict)

		//// internal dependencies
		this.view.innerHTML = this.text
		this.view.style.color = (this.color ?? Color.white()).toHex()
		this.view.style.borderColor = (this.borderColor ?? Color.white()).toHex()
		this.view.style.borderWidth = `${this.borderWidth}px`
		switch (this.verticalAlign) {
		case 'top':
			this.view.style.alignItems = 'flex-start'
			break
		case 'center':
			this.view.style.alignItems = 'center'
			break
		case 'bottom':
			this.view.style.alignItems = 'flex-end'
			break
		}
		switch (this.horizontalAlign) {
		case 'left':
			this.view.style.justifyContent = 'flex-start'
			break
		case 'center':
			this.view.style.justifyContent = 'center'
			break
		case 'right':
			this.view.style.justifyContent = 'flex-end'
			break
		}

	}

}
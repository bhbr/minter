
import { Mobject } from 'core/mobjects/Mobject'
import { Color } from 'core/classes/Color'

export class TextLabel extends Mobject {

	text: string
	horizontalAlign: 'left' | 'center' | 'right'
	verticalAlign: 'top' | 'center' | 'bottom'
	color?: Color
	borderColor: Color
	borderWidth: number
	fontSize: number

	ownDefaults(): object {
		return {
			text: 'text',
			horizontalAlign: 'center',
			verticalAlign: 'center',
			color: Color.white(),
			borderColor: Color.white(),
			borderWidth: 1,
			fontSize: 12
		}
	}

	setup() {
		super.setup()
		this.view.setAttribute('class', this.constructor.name + ' unselectable mobject-div')
		this.view.style.display = 'flex'
		this.view.style.fontFamily = 'Helvetica'
		this.view.style.fontSize = `${this.fontSize}px`
	}

	redraw() {
		super.redraw()
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






















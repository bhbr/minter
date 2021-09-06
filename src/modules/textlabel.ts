import { Mobject } from './mobject'
import { Color } from './color'

export class TextLabel extends Mobject {

	text = 'text'
	horizontalAlign = 'center' // 'left' | 'center' | 'right'
	verticalAlign = 'center' // 'top' | 'center' | 'bottom'
	color = Color.white()
	fontSize = 10
	fontFamily = 'Helvetica'

	constructor(args = {}, superCall = false) {
		super({}, true)
		if (!superCall) {
			this.setup()
			this.update(args)
		}
	}

	setup() {
		super.setup()
		this.view.setAttribute('class', this.constructor.name + ' unselectable mobject-div')
		this.view.style.display = 'flex'
		this.view.style.fontFamily = this.fontFamily
	}

	redrawSelf() {
		super.redrawSelf()
		this.view.style.fontSize = `${this.fontSize}px`

		this.view.innerHTML = this.text
		this.view.style.color = this.color.toHex()
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

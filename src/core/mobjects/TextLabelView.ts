
import { View } from './View'
import { TextLabel } from './TextLabel'
import { Color } from 'core/classes/Color'
import { log } from 'core/functions/logging'

export class TextLabelView extends View {

	declare mobject: TextLabel
	horizontalAlign: 'left' | 'center' | 'right'
	verticalAlign: 'top' | 'center' | 'bottom'
	color?: Color
	borderColor: Color
	borderWidth: number
	fontSize: number

	ownDefaults(): object {
		return {
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
		this.div.setAttribute('class', this.constructor.name + ' unselectable mobject-div')
		this.div.style.display = 'flex'
		this.div.style.fontFamily = 'Helvetica'
		this.div.style.fontSize = `${this.fontSize}px`
	}

	redraw() {
		super.redraw()
		//// internal dependencies
		this.div.innerHTML = this.mobject.text
		this.div.style.color = (this.color ?? Color.white()).toHex()
		this.div.style.borderColor = (this.borderColor ?? Color.white()).toHex()
		this.div.style.borderWidth = `${this.borderWidth}px`
		switch (this.verticalAlign) {
		case 'top':
			this.div.style.alignItems = 'flex-start'
			break
		case 'center':
			this.div.style.alignItems = 'center'
			break
		case 'bottom':
			this.div.style.alignItems = 'flex-end'
			break
		}
		switch (this.horizontalAlign) {
		case 'left':
			this.div.style.justifyContent = 'flex-start'
			break
		case 'center':
			this.div.style.justifyContent = 'center'
			break
		case 'right':
			this.div.style.justifyContent = 'flex-end'
			break
		}
	}
}
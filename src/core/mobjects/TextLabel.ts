
import { Mobject } from './Mobject'
import { TextLabelView } from './TextLabelView'
import { Color } from 'core/classes/Color'

export class TextLabel extends Mobject {

	text: string
	declare view: TextLabelView

	get textColor(): Color | null { return this.view.color }
	set textColor(newValue: Color) { this.view.color = newValue }
	get fontSize(): number { return this.view.fontSize }
	set fontSize(newValue: number) { this.view.fontSize = newValue }

	defaults(): object {
		return {
			text: 'text',
			textColor: Color.white(),
			view: new TextLabelView()
		}
	}
}
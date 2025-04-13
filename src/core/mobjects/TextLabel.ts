
import { Mobject } from './Mobject'
import { TextLabelView } from './TextLabelView'
import { Color } from 'core/classes/Color'

export class TextLabel extends Mobject {

	text: string
	textColor: Color
	declare view: TextLabelView

	defaults(): object {
		return {
			text: 'text',
			textColor: Color.white(),
			view: new TextLabelView()
		}
	}
}
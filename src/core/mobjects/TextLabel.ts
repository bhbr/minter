
import { Mobject } from './Mobject'
import { TextLabelView } from './TextLabelView'

export class TextLabel extends Mobject {

	text: string
	declare view: TextLabelView

	defaults(): object {
		return {
			text: 'text',
			view: new TextLabelView()
		}
	}
}
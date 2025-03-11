
import { View } from './View'
import { Color } from 'core/classes/Color'
import { Mobject } from './Mobject'
import { TextLabelView } from './TextLabelView'

export class TextLabel extends Mobject {

	text: string
	declare view: TextLabelView

	ownDefaults(): object {
		return {
			text: 'text',
			view: new TextLabelView()
		}
	}
}
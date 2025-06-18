
import { Mobject } from './Mobject'
import { TextLabelView } from './TextLabelView'
import { Color } from 'core/classes/Color'

export type HorizontalAlignment = 'left' | 'center' | 'right'
export type VerticalAlignment = 'top' | 'center' | 'bottom'

export class TextLabel extends Mobject {

	text: string
	declare view: TextLabelView

	get textColor(): Color | null { return this.view.color }
	set textColor(newValue: Color) { this.view.color = newValue }
	get fontSize(): number { return this.view.fontSize }
	set fontSize(newValue: number) { this.view.fontSize = newValue }
	get horizontalAlignment(): HorizontalAlignment { return this.view.horizontalAlignment }
	set horizontalAlignment(newValue: HorizontalAlignment) { this.view.horizontalAlignment = newValue }
	get verticalAlignment(): VerticalAlignment { return this.view.verticalAlignment }
	set verticalAlignment(newValue: VerticalAlignment) { this.view.verticalAlignment = newValue }
	

	defaults(): object {
		return {
			text: 'text',
			textColor: Color.white(),
			view: new TextLabelView()
		}
	}
}
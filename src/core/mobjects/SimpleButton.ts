
import { Mobject } from 'core/mobjects/Mobject'
import { TextLabel } from 'core/mobjects/TextLabel'
import { RoundedRectangle } from 'core/shapes/RoundedRectangle'
import { Color } from 'core/classes/Color'
import { ScreenEvent, ScreenEventHandler } from 'core/mobjects/screen_events'

export class SimpleButton extends RoundedRectangle {

	label: TextLabel

	defaults(): object {
		return {
			width: 50,
			height: 25,
			cornerRadius: 5,
			label: new TextLabel({
				textColor: Color.white()
			}),
			fillColor: Color.gray(0.3),
			strokeWidth: 0,
			screenEventHandler: ScreenEventHandler.Self,
			visible: false
		}
	}

	setup() {
		super.setup()
		this.add(this.label)
		this.label.update({
			frameWidth: this.width,
			frameHeight: this.height
		})
	}

	get text(): string {
		return this.label.text
	}

	set text(newValue: string) {
		this.label.update({
			text: newValue
		})
	}

	action() { } // reassigned on creation or overwritten in subclass

	onPointerUp(e: ScreenEvent) {
		this.update({
			fillColor: Color.gray(0.3)
		})
		this.label.update({
			textColor: Color.white()
		})
		this.action()
	}

	onPointerDown(e: ScreenEvent) {
		this.update({
			fillColor: Color.white()
		})
		this.label.update({
			textColor: Color.black()
		})
	}

}























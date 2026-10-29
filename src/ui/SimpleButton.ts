
import { Mobject } from 'minter/mobjects/Mobject.js'
import { TextLabel } from './TextLabel.js'
import { RoundedRectangle } from 'minter/shapes/RoundedRectangle.js'
import { Color } from 'minter/views/Color.js'
import { ScreenEvent, ScreenEventHandler } from 'minter/mobjects/screen_events.js'
import { log } from 'minter/functions/logging.js'

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
			strokeColor: Color.gray(0.4),
			strokeWidth: 1.0,
			screenEventHandler: ScreenEventHandler.Self
		}
	}

	setup() {
		super.setup()
		this.add(this.label)
		this.addDependency('width', this.label, 'frameWidth')
		this.addDependency('height', this.label, 'frameHeight')
	}

	get text(): string {
		return this.label.text
	}

	set text(newValue: string) {
		this.label.update({
			text: newValue
		})
	}

	get fontSize(): number {
		return this.label.fontSize
	}

	set fontSize(newValue: number) {
		this.label.update({
			fontSize: newValue
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























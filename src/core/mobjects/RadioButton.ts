
import { Circle } from 'core/shapes/Circle'
import { TextLabel } from 'core/mobjects/TextLabel'
import { RadioButtonList } from './RadioButtonList'
import { Color } from 'core/classes/Color'
import { ScreenEvent, ScreenEventHandler } from 'core/mobjects/screen_events'

export class RadioButton extends Circle {

	bullet: Circle
	label: TextLabel
	list: RadioButtonList

	defaults(): object {
		return {
			radius: 9,
			fillColor: Color.white(),
			fillOpacity: 0,
			bullet: new Circle({
				radius: 4,
				fillColor: Color.white(),
				fillOpacity: 1
			}),
			label: new TextLabel({
				text: 'bla'
			}),
			screenEventHandler: ScreenEventHandler.Self
		}
	}

	setup() {
		super.setup()
		this.bullet.update({
			midpoint: [this.radius, this.radius],
		})
		this.label.update({
			frameHeight: 2 * this.radius,
			anchor: [this.radius, 0]
		})
		this.add(this.label)
	}

	onPointerDown(e: ScreenEvent) {
		this.update({
			fillOpacity: 0.5
		})
	}

	onPointerUp(e: ScreenEvent) {
		this.select()
		this.list.buttonSelected(this)
	}

	select() {
		this.update({
			fillOpacity: 0
		})
		this.add(this.bullet)
	}

	unselect() {
		this.remove(this.bullet)
	}






















}
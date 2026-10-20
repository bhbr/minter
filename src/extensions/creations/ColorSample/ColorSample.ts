
import { Color } from 'classes/Color.js'
import { Circle } from 'shapes/Circle.js'
import { Linkable } from 'linkables/Linkable.js'
import { vertex } from '@bhbr/affr2'
import { ScreenEventHandler } from 'mobjects/screen_events.js'

export const COLOR_SAMPLE_RADIUS = 30

export class ColorSample extends Linkable {

	color: Color
	circle: Circle

	defaults(): object {
		return {
			circle : new Circle({
				radius: COLOR_SAMPLE_RADIUS,
				midpoint: [COLOR_SAMPLE_RADIUS, COLOR_SAMPLE_RADIUS],
				fillOpacity: 1
			}),
			color: Color.white(),
			frameWidth: 2 * COLOR_SAMPLE_RADIUS,
			frameHeight: 2 * COLOR_SAMPLE_RADIUS,
			outputProperties: [
				{ name: 'color', type: 'Color' }
			],
			screenEventHandler: ScreenEventHandler.Self
		}
	}

	mutabilities(): object {
		return {
			circle: 'never'
		}
	}

	setup() {
		super.setup()
		this.add(this.circle)
	}

	get red(): number { return this.color.red }
	set red(newValue: number) {
		this.color.red = newValue
	}
	get green(): number { return this.color.green }
	set green(newValue: number) {
		this.color.green = newValue
	}
	get blue(): number { return this.color.blue }
	set blue(newValue: number) {
		this.color.blue = newValue
	}
	get alpha(): number { return this.color.alpha }
	set alpha(newValue: number) {
		let c = this.color.alpha = newValue
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, redraw)
		this.circle.update({
			fillColor: this.color
		}, redraw)
	}

}





















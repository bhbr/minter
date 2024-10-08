
import { Color } from 'core/classes/Color'
import { Circle } from 'core/shapes/Circle'
import { Linkable } from 'core/linkables/Linkable'
import { Vertex } from 'core/classes/vertex/Vertex'
import { ScreenEventHandler } from 'core/mobjects/screen_events'

let RADIUS = 30

export class ColorSample extends Linkable {

	color: Color
	circle: Circle

	fixedValues(): object {
		return Object.assign(super.fixedValues(), {
			circle : new Circle({
				radius: RADIUS,
				midpoint: new Vertex(RADIUS, RADIUS),
				fillOpacity: 1
			})
		})
	}

	defaultValues(): object {
		return Object.assign(super.defaultValues(), {
			color: Color.white(),
			viewWidth: 2 * RADIUS,
			viewHeight: 2 * RADIUS,
			inputNames: ['red', 'green', 'blue', 'alpha'],
			outputNames: ['color'],
			screenEventHandler: ScreenEventHandler.Self,
		})
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





















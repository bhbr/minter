
import { ColorSample } from 'extensions/creations/ColorSample/ColorSample.js'
import { vertex, vertexSubtract, vertexNorm } from '@bhbr/affr2'
import { ScreenEvent } from 'mobjects/screen_events.js'
import { TAU, DEGREES } from 'constants.js'
import { Color } from 'classes/Color.js'
import { Circle } from 'shapes/Circle.js'
import { COLOR_SAMPLE_RADIUS } from './ColorSample.js'

export class WheelColorSample extends ColorSample {

	touchStartLocation?: vertex
	saturationShiftTime?: number
	hue: number
	saturation: number
	value: number
	marker: Circle

	defaults(): object {
		return {
			alpha: 1,
			outputProperties: [
				{ name: 'color', type: 'Color' },
				{ name: 'red', type: 'number' },
				{ name: 'green', type: 'number' },
				{ name: 'blue', type: 'number' }
			],
			touchStartLocation: null,
			saturationShiftTime: null,
			timeoutID: null,
			intervalID: null,
			hue: 0,
			saturation: 1,
			value: 1,
			marker: new Circle({
				midpoint: [COLOR_SAMPLE_RADIUS, 0.2 * COLOR_SAMPLE_RADIUS],
				radius: 3,
				fillColor: Color.black(),
				fillOpacity: 1,
				strokeWidth: 0
			})
		}
	}

	mutabilities(): object {
		return {
			alpha: 'never'
		}
	}

	setup() {
		super.setup()
		this.add(this.marker)
		this.updateHue(this.hue)
	}

	updateHue(newHue: number) {
		this.hue = newHue
		let rgb = Color.hsv_to_rgb(this.hue, this.saturation, this.value)
		this.update({
			red: rgb[0], green: rgb[1], blue: rgb[2]
		})
		this.updateDependents()
	}

	onPointerMove(e: ScreenEvent) {
		let p = this.sensor.localEventVertex(e)
		let t = Date.now()
		let dp = vertexSubtract(p, this.circle.midpoint)
		let angle = Math.atan2(dp[1], dp[0]) + TAU / 2
		this.updateHue(angle)
		this.marker.update({
			midpoint: [
				COLOR_SAMPLE_RADIUS * (1 - 0.8 * Math.cos(angle)),
				COLOR_SAMPLE_RADIUS * (1 - 0.8 * Math.sin(angle))
			]
		})
	}



}





















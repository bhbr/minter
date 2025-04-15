
import { ColorSample } from 'extensions/creations/ColorSample/ColorSample'
import { vertex, vertexSubtract, vertexNorm } from 'core/functions/vertex'
import { ScreenEvent } from 'core/mobjects/screen_events'
import { TAU, DEGREES } from 'core/constants'
import { Color } from 'core/classes/Color'

export class WheelColorSample extends ColorSample {

	touchStartLocation?: vertex
	saturationShiftTime?: number
	timeoutID?: number
	intervalID?: number
	hue: number
	saturation: number
	value: number

	defaults(): object {
		return {
			alpha: 1,
			outputNames: ['color', 'red', 'green', 'blue'],
			touchStartLocation: null,
			saturationShiftTime: null,
			timeoutID: null,
			intervalID: null,
			hue: 0,
			saturation: 1,
			value: 0.5
		}
	}

	mutabilities(): object {
		return {
			alpha: 'never'
		}
	}

	onPointerDown(e: ScreenEvent) {
		this.touchStartLocation = this.sensor.localEventVertex(e)
		this.timeoutID = window.setTimeout(this.startSaturationShift.bind(this), 1000)
	}

	onPointerMove(e: ScreenEvent) {
		if (this.touchStartLocation == null) { return }
		let p = this.sensor.localEventVertex(e)
		let t = Date.now()
		let dp = vertexSubtract(p, this.touchStartLocation)
		let angle = Math.atan2(dp[1], dp[0])
		let distance = vertexNorm(dp) / 100
		this.hue = angle + TAU / 2
		this.value = Math.min(distance, 1)
		let rgb = Color.hsv_to_rgb(this.hue, this.saturation, this.value)
		this.update({
			red: rgb[0], green: rgb[1], blue: rgb[2]
		})
	}

	onPointerUp(e: ScreenEvent) {
		window.clearTimeout(this.timeoutID)
		this.timeoutID = null
		window.clearInterval(this.intervalID)
		this.intervalID = null
	}

	startSaturationShift() {
		this.intervalID = window.setInterval(this.shiftSaturation.bind(this), 100)
		this.saturationShiftTime = 0.001 * Date.now()
	}

	shiftSaturation() {
		let t = 0.001 * Date.now()
		let dt = t - this.saturationShiftTime
		this.saturation = 0.5 * (1 + Math.sin(dt))
		let rgb = Color.hsv_to_rgb(this.hue, this.saturation, this.value)
		this.update({
			red: rgb[0], green: rgb[1], blue: rgb[2]
		})
	}

}





















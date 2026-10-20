
import { Slider } from 'extensions/creations/math/Slider/Slider.js'
import { ScreenEvent, eventVertex } from 'mobjects/screen_events.js'
import { MGroup } from 'mobjects/MGroup.js'
import { Line } from 'shapes/Line.js'
import { log } from 'functions/logging.js'

export class Stepper extends Slider {

	ticks: MGroup
	tickSize: number

	defaults(): object {
		return {
			min: 0,
			max: 10,
			value: 6,
			tickSize: 1,
			precision: 0,
			ticks: new MGroup()
		}
	}

	mutabilities(): object {
		return {
			precision: 'never'
		}
	}

	setup() {
		super.setup()
		this.add(this.ticks)
		this.createTicks()
	}

	createTicks() {
		let N = this.max - this.min
		let dy = this.height / N
		for (let i = 1; i < N; i += this.tickSize) {
			let tick = new Line({
				anchor: [0, i * dy],
				endPoint: [8, 0],
				frameWidth: 8,
				frameHeight: 1
			})
			this.ticks.add(tick)
		}
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, redraw)
		if (args['min'] !== undefined || args['max'] !== undefined) {
			this.ticks.removeAllChildren()
			this.createTicks()
		}
		if (args['height'] !== undefined) {
			let N = this.max - this.min
			let dy = this.height / N
			for (let i = 1; i < N; i++) {
				this.ticks.children[i - 1].update({
					anchor: [0, i * dy]
				})
			}
		}
	}















}
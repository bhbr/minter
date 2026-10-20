
import { AnimationSequence } from 'animation_sequence/AnimationSequence.js'
import { Circle } from 'shapes/Circle.js'
import { Color } from 'classes/Color.js'
import { log } from 'functions/logging.js'
import { ScreenEvent, ScreenEventHandler } from 'mobjects/screen_events.js'

export class TestAnimationSequence extends AnimationSequence {
	
	mob1: Circle

	defaults() {
		return {
			screenEventHandler: ScreenEventHandler.Self,
			mob1: new Circle({
				midpoint: [100, 100],
				radius: 25,
				fillOpacity: 0
			}),
			animations: [
				{ mobjectName: 'mob1',
					args: {
					fillColor: Color.red(),
					fillOpacity: 1,
					radius: 100,
					midpoint: [500, 200]
				}, duration: 1 },
				{ mobjectName: 'mob1',
					args: {
					fillColor: Color.blue(),
					fillOpacity: 0.5,
					radius: 25,
					midpoint: [100, 500]
				}, duration: 2 }
			]
		}
	}

	setup() {
		super.setup()
		this.add(this.mob1)
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, redraw)
		this.mob1.update(args)
	}



}

import { AnimationSequence } from 'core/animation_sequence/AnimationSequence'
import { Circle } from 'core/shapes/Circle'
import { Color } from 'core/classes/Color'
import { log } from 'core/functions/logging'
import { ScreenEvent, ScreenEventHandler } from 'core/mobjects/screen_events'

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

import { Paper } from 'Paper.js'
import { InclinedScene } from 'extensions/creations/inclined_plane/InclinedScene.js'
import { SliderCreator } from 'extensions/creations/math/Slider/SliderCreator.js'
import { StepperCreator } from 'extensions/creations/math/Stepper/StepperCreator.js'
import { Rectangle } from 'shapes/Rectangle.js'
import { DEGREES } from 'constants.js'
import { Color } from 'classes/Color.js'
import { Circle } from 'shapes/Circle.js'
import { Slider } from 'extensions/creations/math/Slider/Slider.js'

export class PhysicsPaper extends Paper {

	scene: InclinedScene

	defaults(): object {
		return {
			scene: new InclinedScene({
				anchor: [100, 100]
			}),
			creationConstructors: {
				'slider': SliderCreator,
				'stepper': StepperCreator,
			},
			buttonNames: [
				'DragButton',
				'LinkButton'
			]
		}
	}

	mutabilities(): object {
		return {
			scene: 'never',
			creationConstructors: 'never',
			buttonNames: 'never'
		}
	}

	setup() {
		super.setup()
		this.addToContent(this.scene)
	}

}

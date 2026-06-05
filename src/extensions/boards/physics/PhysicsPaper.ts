
import { Paper } from 'core/Paper'
import { InclinedScene } from 'extensions/creations/inclined_plane/InclinedScene'
import { Vertex } from 'core/classes/vertex/Vertex'
import { SliderCreator } from 'extensions/creations/math/Slider/SliderCreator'
import { StepperCreator } from 'extensions/creations/math/Stepper/StepperCreator'
import { ValueBoxCreator } from 'extensions/creations/math/ValueBox/ValueBoxCreator'
import { InputValueBoxCreator } from 'extensions/creations/math/InputValueBox/InputValueBoxCreator'
import { Rectangle } from 'core/shapes/Rectangle'
import { Transform } from 'core/classes/vertex/Transform'
import { DEGREES } from 'core/constants'
import { Color } from 'core/classes/Color'
import { Circle } from 'core/shapes/Circle'
import { Slider } from 'extensions/creations/math/Slider/Slider'

export class PhysicsPaper extends Paper {

	scene: InclinedScene

	defaults(): object {
		return {
			scene: new InclinedScene({
				anchor: new Vertex(100, 100)
			}),
			creationConstructors: {
				'slider': SliderCreator,
				'stepper': StepperCreator,
				'value': ValueBoxCreator,
				'input': InputValueBoxCreator
			},
			buttonNames: [
				'DragButton',
				'LinkButton',
				'NumberButton'
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

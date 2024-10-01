
import { Paper } from 'core/Paper'
import { InclinedScene } from 'extensions/creations/inclined_plane/InclinedScene'
import { Vertex } from 'core/classes/vertex/Vertex'
import { BoxSliderCreator } from 'extensions/creations/math/BoxSlider/BoxSliderCreator'
import { BoxStepperCreator } from 'extensions/creations/math/BoxStepper/BoxStepperCreator'
import { ValueBoxCreator } from 'extensions/creations/math/ValueBox/ValueBoxCreator'
import { InputValueBoxCreator } from 'extensions/creations/math/InputValueBox/InputValueBoxCreator'
import { Rectangle } from 'core/shapes/Rectangle'
import { Transform } from 'core/classes/vertex/Transform'
import { DEGREES } from 'core/constants'
import { Color } from 'core/classes/Color'
import { Circle } from 'core/shapes/Circle'
import { BoxSlider } from 'extensions/creations/math/BoxSlider/BoxSlider'

export class PhysicsPaper extends Paper {

	scene: InclinedScene

	defaults(): object {
		return Object.assign(super.defaults(), {
			scene: new InclinedScene({
			anchor: new Vertex(100, 100)
		}),
			creationConstructors: {
				'slider': BoxSliderCreator,
				'stepper': BoxStepperCreator,
				'value': ValueBoxCreator,
				'input': InputValueBoxCreator
			},
			buttonNames: [
				'DragButton',
				'LinkButton',
				'NumberButton'
			]
		})
	}

	setup() {
		super.setup()
		this.addToContent(this.scene)
	}

}

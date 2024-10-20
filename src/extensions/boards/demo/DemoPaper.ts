
import { Paper } from 'core/Paper'
import { WavyCreator } from 'extensions/creations/Wavy/WavyCreator'
import { BoxSliderCreator } from 'extensions/creations/math/BoxSlider/BoxSliderCreator'
import { BoxStepperCreator } from 'extensions/creations/math/BoxStepper/BoxStepperCreator'
import { ValueBoxCreator } from 'extensions/creations/math/ValueBox/ValueBoxCreator'
import { InputValueBoxCreator } from 'extensions/creations/math/InputValueBox/InputValueBoxCreator'
import { AddBoxCreator, SubtractBoxCreator, MultiplyBoxCreator, DivideBoxCreator } from 'extensions/creations/math/BinaryOperatorBox/BinaryOperatorBoxCreator'
import { BoardCreator } from 'core/boards/BoardCreator'
import { ConstructionCreator } from 'extensions/boards/construction/ConstructionCreator'
import { SwingCreator } from 'extensions/creations/Swing/SwingCreator'
import { ColorSampleCreator } from 'extensions/creations/ColorSample/ColorSampleCreator'
import { BoxStepper } from 'extensions/creations/math/BoxStepper/BoxStepper'
import { Swing } from 'extensions/creations/Swing/Swing'

import { Vertex } from 'core/classes/vertex/Vertex'
import { Color } from 'core/classes/Color'
import { ScreenEvent, ScreenEventHandler, screenEventTypeAsString, screenEventDeviceAsString } from 'core/mobjects/screen_events'
import { Rectangle } from 'core/shapes/Rectangle'
import { Circle } from 'core/shapes/Circle'
import { Board } from 'core/boards/Board'
import { Construction } from 'extensions/boards/construction/Construction'
import { Wavy } from 'extensions/creations/Wavy/Wavy'
import { BoxSlider } from 'extensions/creations/math/BoxSlider/BoxSlider'
import { Dependency } from 'core/mobjects/Dependency'
import { DependencyLink } from 'core/linkables/DependencyLink'

export class DemoPaper extends Paper {

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			creationConstructors: {
				'wavy': WavyCreator,
				'slider': BoxSliderCreator,
				'stepper': BoxStepperCreator,
				'value': ValueBoxCreator,
				'input': InputValueBoxCreator,
				'+': AddBoxCreator,
				'–': SubtractBoxCreator,
				'&times;': MultiplyBoxCreator,
				'/': DivideBoxCreator,
				'board': BoardCreator,
				'cons': ConstructionCreator,
				'swing': SwingCreator,
				'color': ColorSampleCreator
			},
			buttonNames: [
				'DragButton',
				'LinkButton',
				'ExtendedBoardButton',
				'NumberButton',
				'ArithmeticButton',
				'WavyButton',
				'SwingButton',
				'ColorSampleButton'
			]
		})
	}

	mutabilities(): object {
		return this.updateMutabilities(super.mutabilities(), {
			creationConstructors: 'never',
			buttonNames: 'never'
		})
	}

	setup() {
		super.setup()
		
		let board = new Board({
			compactAnchor: new Vertex(100, 100),
			compactWidth: 300,
			compactHeight: 200
		})

		this.addToContent(board)
	}
}











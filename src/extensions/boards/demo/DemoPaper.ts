
import { Paper } from 'core/Paper'
import { WavyCreator } from 'extensions/creations/Wavy/WavyCreator'
import { BoxSliderCreator } from 'extensions/creations/math/BoxSlider/BoxSliderCreator'
import { BoxStepperCreator } from 'extensions/creations/math/BoxStepper/BoxStepperCreator'
import { ValueBoxCreator } from 'extensions/creations/math/ValueBox/ValueBoxCreator'
import { InputValueBoxCreator } from 'extensions/creations/math/InputValueBox/InputValueBoxCreator'
import { AddBoxCreator, SubtractBoxCreator, MultiplyBoxCreator, DivideBoxCreator } from 'extensions/creations/math/BinaryOperatorBox/BinaryOperatorBoxCreator'
import { ConstructionCreator } from 'extensions/boards/construction/ConstructionCreator'
import { SwingCreator } from 'extensions/creations/Swing/SwingCreator'
import { ColorSampleCreator } from 'extensions/creations/ColorSample/ColorSampleCreator'

export class DemoPaper extends Paper {

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
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
				'cons': ConstructionCreator,
				'swing': SwingCreator,
				'color': ColorSampleCreator
			},
			buttonNames: [
				'DragButton',
				'LinkButton',
				'ConButton',
				'NumberButton',
				'ArithmeticButton',
				'WavyButton',
				'SwingButton',
				'ColorSampleButton'
			]

		})
	}
}

export const paper = new DemoPaper()

















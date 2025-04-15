
import { Paper } from 'core/Paper'
import { ValueBoxCreator } from 'extensions/creations/math/ValueBox/ValueBoxCreator'
import { InputValueBoxCreator } from 'extensions/creations/math/InputValueBox/InputValueBoxCreator'
import { BoxSliderCreator } from 'extensions/creations/math/BoxSlider/BoxSliderCreator'
import { BoxStepperCreator } from 'extensions/creations/math/BoxStepper/BoxStepperCreator'
import { AddBoxCreator, SubtractBoxCreator, MultiplyBoxCreator, DivideBoxCreator } from 'extensions/creations/math/BinaryOperatorBox/BinaryOperatorBoxCreator'
import { ColorSampleCreator } from 'extensions/creations/ColorSample/ColorSampleCreator'

export class CoinFlipPaper extends Paper {
	
	defaults(): object {
		return {
			creationConstructors: {
				'value': ValueBoxCreator,
				'input': InputValueBoxCreator,
				'slider': BoxSliderCreator,
				'stepper': BoxStepperCreator,
				'+': AddBoxCreator,
				'–': SubtractBoxCreator,
				'&times;': MultiplyBoxCreator,
				'/': DivideBoxCreator,
				'color': ColorSampleCreator,
			},
			buttonNames: [
				'DragButton',
				'LinkButton',
				'NumberButton',
				'ArithmeticButton',
				'ColorSampleButton'
			]
		}
	}

}
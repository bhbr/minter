
import { Paper } from 'core/Paper'
import { PlayableCoinCreator } from 'extensions/creations/CoinFlipper/PlayableCoinCreator'
import { CoinRowCreator } from 'extensions/creations/CoinFlipper/CoinRowCreator'
import { NumberBoxCreator } from 'extensions/creations/math/ValueBox/NumberBoxCreator'
import { InputNumberBoxCreator } from 'extensions/creations/math/InputNumberBox/InputNumberBoxCreator'
import { BoxSliderCreator } from 'extensions/creations/math/BoxSlider/BoxSliderCreator'
import { BoxStepperCreator } from 'extensions/creations/math/BoxStepper/BoxStepperCreator'
import { AddBoxCreator, SubtractBoxCreator, MultiplyBoxCreator, DivideBoxCreator } from 'extensions/creations/math/BinaryOperatorBox/BinaryOperatorBoxCreator'
import { SumBoxCreator, AverageBoxCreator, CumSumBoxCreator, CumAverageBoxCreator } from 'extensions/creations/math/FunctionBox/ListOperationBoxCreators'
import { RGBAColorSampleCreator } from 'extensions/creations/ColorSample/RGBAColorSampleCreator'
import { WheelColorSampleCreator } from 'extensions/creations/ColorSample/WheelColorSampleCreator'

export class CoinFlipPaper extends Paper {
	
	defaults(): object {
		return {
			creationConstructors: {
				'number': NumberBoxCreator,
				'input': InputNumberBoxCreator,
				'slider': BoxSliderCreator,
				'stepper': BoxStepperCreator,
				'coin': PlayableCoinCreator,
				'coin row': CoinRowCreator,
				'+': AddBoxCreator,
				'–': SubtractBoxCreator,
				'&times;': MultiplyBoxCreator,
				'/': DivideBoxCreator,
				'sum': SumBoxCreator,
				'avg': AverageBoxCreator,
				'cumsum': CumSumBoxCreator,
				'cumavg': CumAverageBoxCreator,
				'rgb': RGBAColorSampleCreator,
				'wheel': WheelColorSampleCreator,
			},
			buttonNames: [
				'DragButton',
				'LinkButton',
				'CoinButton',
				'NumberButton',
				'ArithmeticButton',
				'ListOperationsButton',
				'ColorSampleButton'
			]
		}
	}

}
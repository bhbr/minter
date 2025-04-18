
import { Paper } from 'core/Paper'
import { PlayableCoinCreator } from 'extensions/creations/CoinFlipper/PlayableCoinCreator'
import { CoinRowCreator } from 'extensions/creations/CoinFlipper/CoinRowCreator'
import { NumberBoxCreator } from 'core/boxes/NumberBox/NumberBoxCreator'
import { NumberListBoxCreator } from 'core/boxes/lists/NumberListBoxCreator'
import { InputNumberBoxCreator } from 'extensions/creations/math/InputNumberBox/InputNumberBoxCreator'
import { BoxSliderCreator } from 'extensions/creations/math/BoxSlider/BoxSliderCreator'
import { BoxStepperCreator } from 'extensions/creations/math/BoxStepper/BoxStepperCreator'
import { AddBoxCreator, SubtractBoxCreator, MultiplyBoxCreator, DivideBoxCreator } from 'core/boxes/binary_operators/BinaryOperatorBoxCreator'
import { SumBoxCreator, AverageBoxCreator, CumSumBoxCreator, CumAverageBoxCreator } from 'core/boxes/list_functions/ListFunctionBoxCreator'
import { SequencePlotCreator } from 'extensions/creations/DesmosCalculator/SequencePlotCreator'
import { HistogramCreator } from 'extensions/creations/DesmosCalculator/HistogramCreator'
import { RGBAColorSampleCreator } from 'extensions/creations/ColorSample/RGBAColorSampleCreator'
import { WheelColorSampleCreator } from 'extensions/creations/ColorSample/WheelColorSampleCreator'

export class CoinFlipPaper extends Paper {
	
	defaults(): object {
		return {
			creationConstructors: {
				'num': NumberBoxCreator,
				'numlist': NumberListBoxCreator,
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
				'plot': SequencePlotCreator,
				'hist': HistogramCreator,
				'rgb': RGBAColorSampleCreator,
				'wheel': WheelColorSampleCreator,
			},
			buttonNames: [
				'DragButton',
				'LinkButton',
				'CoinButton',
				'NumberButton',
				'ArithmeticButton',
				'ListFunctionsButton',
				'PlotButton',
				'ColorSampleButton'
			]
		}
	}

}
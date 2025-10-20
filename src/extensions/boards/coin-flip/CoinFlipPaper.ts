
import { Paper } from 'core/Paper'
import { PlayableCoinCreator } from 'extensions/creations/CoinFlipper/PlayableCoinCreator'
import { CoinRowCreator } from 'extensions/creations/CoinFlipper/CoinRowCreator'
import { CoinSetCreator } from 'extensions/creations/CoinFlipper/CoinSetCreator'
import { NumberBoxCreator } from 'extensions/creations/math/boxes/NumberBox'
import { NumberListBoxCreator } from 'extensions/creations/math/boxes/NumberListBox'
import { BoxSliderCreator } from 'extensions/creations/math/BoxSlider/BoxSliderCreator'
import { BoxStepperCreator } from 'extensions/creations/math/BoxStepper/BoxStepperCreator'
import { AddBoxCreator, SubtractBoxCreator, MultiplyBoxCreator, DivideBoxCreator } from 'extensions/creations/math/box_functions/BinaryOperatorBoxCreator'
import { LessThanBoxCreator, LessThanOrEqualBoxCreator,GreaterThanBoxCreator, GreaterThanOrEqualBoxCreator, EqualsBoxCreator, NotEqualsBoxCreator } from 'extensions/creations/math/box_functions/ComparisonBoxCreator'
import { SumBoxCreator } from 'extensions/creations/math/box_functions/SumBox'
import { AverageBoxCreator } from 'extensions/creations/math/box_functions/AverageBox'
import { CumSumBoxCreator } from 'extensions/creations/math/box_functions/CumSumBox'
import { CumAverageBoxCreator } from 'extensions/creations/math/box_functions/CumAverageBox'
import { SequencePlotCreator } from 'extensions/creations/DesmosCalculator/SequencePlotCreator'
import { HistogramCreator } from 'extensions/creations/DesmosCalculator/HistogramCreator'
import { RGBAColorSampleCreator } from 'extensions/creations/ColorSample/RGBAColorSampleCreator'
import { WheelColorSampleCreator } from 'extensions/creations/ColorSample/WheelColorSampleCreator'
import { DesmosExpressionCreator } from 'extensions/creations/DesmosCalculator/DesmosExpressionCreator'
import { DesmosExpressionSheetCreator } from 'extensions/creations/DesmosCalculator/DesmosExpressionSheetCreator'

export class CoinFlipPaper extends Paper {
	
	defaults(): object {
		return {
			creationConstructors: {
				'number': NumberBoxCreator,
				'list': NumberListBoxCreator,
				'num': NumberBoxCreator,
				'slider': BoxSliderCreator,
				'stepper': BoxStepperCreator,
				'coin': PlayableCoinCreator,
				'coinrow': CoinRowCreator,
				'coinset': CoinSetCreator,
				'+': AddBoxCreator,
				'–': SubtractBoxCreator,
				'&times;': MultiplyBoxCreator,
				'/': DivideBoxCreator,
				'<': LessThanBoxCreator,
				'≤': LessThanOrEqualBoxCreator,
				'>': GreaterThanBoxCreator,
				'≥': GreaterThanOrEqualBoxCreator,
				'=': EqualsBoxCreator,
				'≠': NotEqualsBoxCreator,
				'expr': DesmosExpressionCreator,
				'exprs': DesmosExpressionSheetCreator,
				'sum': SumBoxCreator,
				'mean': AverageBoxCreator,
				'plot': SequencePlotCreator,
				'hist': HistogramCreator,
				'rgb': RGBAColorSampleCreator,
				'wheel': WheelColorSampleCreator,
			},
			buttonNames: [
				'DragButton',
				'LinkButton',
				'ControlsButton',
				'CoinButton',
				'NumberButton',
				'ArithmeticButton',
				'ComparisonButton',
				'AlgebraButton',
				'ListFunctionsButton',
				'PlotButton',
				'ColorSampleButton',
				'RestartButton'
			]
		}
	}

}
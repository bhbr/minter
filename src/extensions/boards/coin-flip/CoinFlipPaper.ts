
import { Paper } from 'core/Paper'
import { PlayableCoinCreator } from 'extensions/creations/CoinFlipper/PlayableCoinCreator'
import { CoinRowCreator } from 'extensions/creations/CoinFlipper/CoinRowCreator'
import { CoinStackCreator } from 'extensions/creations/CoinFlipper/CoinStackCreator'
import { NumberBoxCreator } from 'extensions/creations/math/boxes/NumberBox'
import { NumberListBoxCreator } from 'extensions/creations/math/boxes/NumberListBox'
import { SliderCreator } from 'extensions/creations/math/Slider/SliderCreator'
import { StepperCreator } from 'extensions/creations/math/Stepper/StepperCreator'
import { AddBoxCreator, SubtractBoxCreator, MultiplyBoxCreator, DivideBoxCreator } from 'extensions/creations/math/boxes/BinaryOperatorBoxCreator'
import { LessThanBoxCreator, LessThanOrEqualBoxCreator,GreaterThanBoxCreator, GreaterThanOrEqualBoxCreator, EqualsBoxCreator, NotEqualsBoxCreator } from 'extensions/creations/math/boxes/ComparisonBoxCreator'
import { SumBoxCreator } from 'extensions/creations/math/boxes/SumBox'
import { AverageBoxCreator } from 'extensions/creations/math/boxes/AverageBox'
import { CumSumBoxCreator } from 'extensions/creations/math/boxes/CumSumBox'
import { CumAverageBoxCreator } from 'extensions/creations/math/boxes/CumAverageBox'
import { ScatterPlotCreator } from 'extensions/creations/DesmosCalculator/ScatterPlotCreator'
import { HistogramCreator } from 'extensions/creations/DesmosCalculator/HistogramCreator'
import { RGBAColorSampleCreator } from 'extensions/creations/ColorSample/RGBAColorSampleCreator'
import { WheelColorSampleCreator } from 'extensions/creations/ColorSample/WheelColorSampleCreator'
import { DesmosLoader } from 'extensions/apis/DesmosLoader'
import { PascalsBrickWall } from 'extensions/animation_sequences/PascalsBrickWall/PascalsBrickWall'
import { Partition } from 'extensions/animation_sequences/PascalsBrickWall/Partition'
import { PascalsTriangle } from 'extensions/animation_sequences/PascalsBrickWall/PascalsTriangle'
import { PascalsTriangleCell } from 'extensions/animation_sequences/PascalsBrickWall/PascalsTriangleCell'
import { Color } from 'core/classes/Color'
import { log } from 'core/functions/logging'
import { binomial } from 'core/functions/math'
import { RoundedRectangle } from 'core/shapes/RoundedRectangle'

export class CoinFlipPaper extends Paper {
	
	defaults(): object {
		return {
			creationConstructors: {
				'number': NumberBoxCreator,
				'list': NumberListBoxCreator,
				'slider': SliderCreator,
				'stepper': StepperCreator,
				'coin': PlayableCoinCreator,
				'coin row': CoinRowCreator,
				'coin stack': CoinStackCreator,
				'add': AddBoxCreator,
				'subtract': SubtractBoxCreator,
				'multiply': MultiplyBoxCreator,
				'divide': DivideBoxCreator,
				'less than': LessThanBoxCreator,
				'less or equal': LessThanOrEqualBoxCreator,
				'greater than': GreaterThanBoxCreator,
				'greater or equal': GreaterThanOrEqualBoxCreator,
				'equal': EqualsBoxCreator,
				'not equal': NotEqualsBoxCreator,
				'sum': SumBoxCreator,
				'mean': AverageBoxCreator,
				'plot': ScatterPlotCreator,
				'histogram': HistogramCreator,
				'rgb color': RGBAColorSampleCreator,
				'color wheel': WheelColorSampleCreator,
			},
			buttonNames: [
				'DragButton',
				'LinkButton',
				'ControlsButton',
				'CoinButton',
				'NumberButton',
				'ArithmeticButton',
				'ComparisonButton',
				//'AlgebraButton',
				'ListFunctionsButton',
				'PlotButton',
				//'ColorSampleButton',
				'EraseButton'
			],
			apiLoaders: [
				new DesmosLoader()
			]
		}
	}

	loadContent() {
	}

}


let p = new CoinFlipPaper()

let c = new PascalsTriangle({
	anchor: [500, 100]
})




p.addToContent(c)




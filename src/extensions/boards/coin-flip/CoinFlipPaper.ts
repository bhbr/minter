
import { Paper } from 'Paper.js'
import { PlayableCoinCreator } from 'extensions/creations/CoinFlipper/PlayableCoinCreator.js'
import { CoinRowCreator } from 'extensions/creations/CoinFlipper/CoinRowCreator.js'
import { CoinStackCreator } from 'extensions/creations/CoinFlipper/CoinStackCreator.js'
import { NumberBoxCreator } from 'extensions/creations/math/boxes/NumberBox.js'
import { NumberListBoxCreator } from 'extensions/creations/math/boxes/NumberListBox.js'
import { SliderCreator } from 'extensions/creations/math/Slider/SliderCreator.js'
import { StepperCreator } from 'extensions/creations/math/Stepper/StepperCreator.js'
import { AddBoxCreator, SubtractBoxCreator, MultiplyBoxCreator, DivideBoxCreator } from 'extensions/creations/math/boxes/BinaryOperatorBoxCreator.js'
import { LessThanBoxCreator, LessThanOrEqualBoxCreator,GreaterThanBoxCreator, GreaterThanOrEqualBoxCreator, EqualsBoxCreator, NotEqualsBoxCreator } from 'extensions/creations/math/boxes/ComparisonBoxCreator.js'
import { SumBoxCreator } from 'extensions/creations/math/boxes/SumBox.js'
import { AverageBoxCreator } from 'extensions/creations/math/boxes/AverageBox.js'
import { CumSumBoxCreator } from 'extensions/creations/math/boxes/CumSumBox.js'
import { CumAverageBoxCreator } from 'extensions/creations/math/boxes/CumAverageBox.js'
//import { ScatterPlotCreator } from 'extensions/creations/DesmosCalculator/ScatterPlotCreator.js'
//import { HistogramCreator } from 'extensions/creations/DesmosCalculator/HistogramCreator.js'
import { RGBAColorSampleCreator } from 'extensions/creations/ColorSample/RGBAColorSampleCreator.js'
import { WheelColorSampleCreator } from 'extensions/creations/ColorSample/WheelColorSampleCreator.js'
import { PartitionCreator } from 'extensions/animation_sequences/PascalsBrickWall/PartitionCreator.js'
import { BrickWallCreator } from 'extensions/animation_sequences/PascalsBrickWall/BrickWallCreator.js'
//import { DesmosLoader } from 'extensions/apis/DesmosLoader.js'
import { PascalsBrickWall } from 'extensions/animation_sequences/PascalsBrickWall/PascalsBrickWall.js'
import { Partition } from 'extensions/animation_sequences/PascalsBrickWall/Partition.js'
import { PascalsTriangle } from 'extensions/animation_sequences/PascalsBrickWall/PascalsTriangle.js'
import { TriangleCell } from 'extensions/animation_sequences/PascalsBrickWall/TriangleCell.js'
import { Color } from 'classes/Color.js'
import { log } from 'functions/logging.js'
import { binomial } from 'functions/math.js'
import { RoundedRectangle } from 'shapes/RoundedRectangle.js'
import { CurvedArrow } from 'shapes/CurvedArrow.js'
import { CircularArc } from 'shapes/CircularArc.js'
import { PolygonalLine } from 'vmobjects/PolygonalLine.js'
import { CurvedLine } from 'vmobjects/CurvedLine.js'
import { TAU } from 'constants.js'
import { Slider } from 'extensions/creations/math/Slider/Slider.js'
import { InputBox } from 'extensions/ui/InputBox/InputBox.js'
import { IntegerInputBox } from 'extensions/ui/InputBox/IntegerInputBox.js'
import { SimpleButton } from 'ui/SimpleButton.js'
import { Mobject } from 'mobjects/Mobject.js'

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
				//'plot': ScatterPlotCreator,
				//'histogram': HistogramCreator,
				'rgb color': RGBAColorSampleCreator,
				'color wheel': WheelColorSampleCreator,
				'partition': PartitionCreator,
				'wall': BrickWallCreator
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
				//'PartitionButton',
				//'PlotButton',
				//'ColorSampleButton',
				'EraseButton'
			],
			apiLoaders: [
				//new DesmosLoader()
			]
		}
	}

	loadContent() {
	}

}


let p = new CoinFlipPaper()

let t = new PascalsTriangle({
	anchor: [500, 100],
	nbFlips: 3
})

p.addToContent(t)














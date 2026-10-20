
import { Paper } from 'Paper.js'
import { WavyCreator } from 'extensions/creations/Wavy/WavyCreator.js'
import { DesmosCalculatorCreator } from 'extensions/creations/DesmosCalculator/DesmosCalculatorCreator.js'
import { SliderCreator } from 'extensions/creations/math/Slider/SliderCreator.js'
import { StepperCreator } from 'extensions/creations/math/Stepper/StepperCreator.js'
import { NumberBoxCreator } from 'extensions/creations/math/boxes/NumberBox.js'
import { AddBoxCreator, SubtractBoxCreator, MultiplyBoxCreator, DivideBoxCreator } from 'extensions/creations/math/boxes/BinaryOperatorBoxCreator.js'
import { BoardCreator } from 'boards/BoardCreator.js'
import { ConstructionCreator } from 'extensions/boards/construction/ConstructionCreator.js'
import { SwingCreator } from 'extensions/creations/Swing/SwingCreator.js'
import { RGBAColorSampleCreator } from 'extensions/creations/ColorSample/RGBAColorSampleCreator.js'
import { WheelColorSampleCreator } from 'extensions/creations/ColorSample/WheelColorSampleCreator.js'
import { Stepper } from 'extensions/creations/math/Stepper/Stepper.js'
import { Swing } from 'extensions/creations/Swing/Swing.js'
import { ConLineConstructor } from 'extensions/boards/construction/straits/ConLine/ConLineConstructor.js'
import { ConRayConstructor } from 'extensions/boards/construction/straits/ConRay/ConRayConstructor.js'
import { ConSegmentConstructor } from 'extensions/boards/construction/straits/ConSegment/ConSegmentConstructor.js'
import { ConCircleConstructor } from 'extensions/boards/construction/ConCircle/ConCircleConstructor.js'

import { vertex } from '@bhbr/affr2'
import { Color } from 'classes/Color.js'
import { ScreenEvent, ScreenEventHandler, screenEventTypeAsString, screenEventDeviceAsString } from 'mobjects/screen_events.js'
import { Rectangle } from 'shapes/Rectangle.js'
import { Circle } from 'shapes/Circle.js'
import { Board } from 'boards/Board.js'
import { Construction } from 'extensions/boards/construction/Construction.js'
import { Wavy } from 'extensions/creations/Wavy/Wavy.js'
import { Slider } from 'extensions/creations/math/Slider/Slider.js'
import { Dependency } from 'mobjects/Dependency.js'
import { DependencyLink } from 'linkables/DependencyLink.js'
import { RoundedRectangle } from 'shapes/RoundedRectangle.js'
import { CindyLoader } from 'extensions/apis/CindyLoader.js'
import { DesmosLoader } from 'extensions/apis/DesmosLoader.js'
import { MathQuillLoader } from 'extensions/apis/MathQuillLoader.js'
import { PolypadLoader } from 'extensions/apis/PolypadLoader.js'
import { PolypadCreator } from 'extensions/creations/Polypad/PolypadCreator.js'
import { MathExpressionFieldCreator } from 'extensions/creations/MathExpressionField/MathExpressionFieldCreator.js'
import { EquationCreator } from 'extensions/creations/VisualAlgebra/view/EquationCreator.js'
import { PlayableCoinCreator } from 'extensions/creations/CoinFlipper/PlayableCoinCreator.js'
import { CoinRowCreator } from 'extensions/creations/CoinFlipper/CoinRowCreator.js'
import { CoinStackCreator } from 'extensions/creations/CoinFlipper/CoinStackCreator.js'

import { log } from 'functions/logging.js'
import { Popover } from 'ui/Popover.js'

export class DemoPaper extends Paper {

	defaults(): object {
		return {
			creationConstructors: {
				'wavy': WavyCreator,
				'slider': SliderCreator,
				'stepper': StepperCreator,
				'number': NumberBoxCreator,
				'add': AddBoxCreator,
				'subtract': SubtractBoxCreator,
				'multiply': MultiplyBoxCreator,
				'divide': DivideBoxCreator,
				'swing': SwingCreator,
				'color-rgba': RGBAColorSampleCreator,
				'color-wheel': WheelColorSampleCreator,
				'polypad': PolypadCreator,
				'construction': ConstructionCreator,
				'line': ConLineConstructor,
				'ray': ConRayConstructor,
				'segment': ConSegmentConstructor,
				'circle': ConCircleConstructor,
				'expression': MathExpressionFieldCreator,
				'equation': EquationCreator,
				'coin': PlayableCoinCreator,
				'coin row': CoinRowCreator,
				'coin stack': CoinStackCreator
			},
			buttonNames: [
				'DragButton',
				'LinkButton',
				'ControlsButton',
				'NumberButton',
				'ArithmeticButton',
				'AlgebraButton',
//				'ConButton',
				'CoinButton',
				'PolypadButton',
				'WavyButton',
				'SwingButton',
				'ColorSampleButton'
			],
			apiLoaders: [
				new CindyLoader(),
				new DesmosLoader(),
				new MathQuillLoader(),
				new PolypadLoader()
			]
		}
	}

	mutabilities(): object {
		return {
			creationConstructors: 'never',
			buttonNames: 'never'
		}
	}

	loadContent() {


	}



}

let d = new DemoPaper()




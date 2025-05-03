
import { Paper } from 'core/Paper'
import { WavyCreator } from 'extensions/creations/Wavy/WavyCreator'
import { DesmosCalculatorCreator } from 'extensions/creations/DesmosCalculator/DesmosCalculatorCreator'
import { BoxSliderCreator } from 'extensions/creations/math/BoxSlider/BoxSliderCreator'
import { BoxStepperCreator } from 'extensions/creations/math/BoxStepper/BoxStepperCreator'
import { NumberBoxCreator } from 'core/boxes/NumberBox'
import { InputNumberBoxCreator } from 'extensions/creations/math/InputNumberBox/InputNumberBoxCreator'
import { AddBoxCreator, SubtractBoxCreator, MultiplyBoxCreator, DivideBoxCreator } from 'core/boxes/BinaryOperatorBoxCreator'
import { BoardCreator } from 'core/boards/BoardCreator'
import { ConstructionCreator } from 'extensions/boards/construction/ConstructionCreator'
import { SwingCreator } from 'extensions/creations/Swing/SwingCreator'
import { RGBAColorSampleCreator } from 'extensions/creations/ColorSample/RGBAColorSampleCreator'
import { BoxStepper } from 'extensions/creations/math/BoxStepper/BoxStepper'
import { Swing } from 'extensions/creations/Swing/Swing'
import { ConLineConstructor } from 'extensions/boards/construction/straits/ConLine/ConLineConstructor'
import { ConRayConstructor } from 'extensions/boards/construction/straits/ConRay/ConRayConstructor'
import { ConSegmentConstructor } from 'extensions/boards/construction/straits/ConSegment/ConSegmentConstructor'
import { ConCircleConstructor } from 'extensions/boards/construction/ConCircle/ConCircleConstructor'

import { vertex } from 'core/functions/vertex'
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
import { RoundedRectangle } from 'core/shapes/RoundedRectangle'

export class DemoPaper extends Paper {

	defaults(): object {
		return {
			creationConstructors: {
				'wavy': WavyCreator,
				'desmos': DesmosCalculatorCreator,
				'slider': BoxSliderCreator,
				'stepper': BoxStepperCreator,
				'num': NumberBoxCreator,
				'input': InputNumberBoxCreator,
				'+': AddBoxCreator,
				'–': SubtractBoxCreator,
				'&times;': MultiplyBoxCreator,
				'/': DivideBoxCreator,
				'board': BoardCreator,
				'swing': SwingCreator,
				'color': RGBAColorSampleCreator,
				'geo': ConstructionCreator,
				'line': ConLineConstructor,
				'ray': ConRayConstructor,
				'segment': ConSegmentConstructor,
				'circle': ConCircleConstructor
			},
			buttonNames: [
				'CommandButton',
				'ExtendedBoardButton',
				'NumberButton',
				'ArithmeticButton',
				'WavyButton',
				'SwingButton',
				'ColorSampleButton'
			]
		}
	}

	mutabilities(): object {
		return {
			creationConstructors: 'never',
			buttonNames: 'never'
		}
	}

}












import { Paper } from 'core/Paper'
import { WavyCreator } from 'extensions/creations/Wavy/WavyCreator'
import { DesmosCalculatorCreator } from 'extensions/creations/DesmosCalculator/DesmosCalculatorCreator'
import { SliderCreator } from 'extensions/creations/math/Slider/SliderCreator'
import { StepperCreator } from 'extensions/creations/math/Stepper/StepperCreator'
import { NumberBoxCreator } from 'extensions/creations/math/boxes/NumberBox'
import { AddBoxCreator, SubtractBoxCreator, MultiplyBoxCreator, DivideBoxCreator } from 'extensions/creations/math/boxes/BinaryOperatorBoxCreator'
import { BoardCreator } from 'core/boards/BoardCreator'
import { ConstructionCreator } from 'extensions/boards/construction/ConstructionCreator'
import { SwingCreator } from 'extensions/creations/Swing/SwingCreator'
import { RGBAColorSampleCreator } from 'extensions/creations/ColorSample/RGBAColorSampleCreator'
import { WheelColorSampleCreator } from 'extensions/creations/ColorSample/WheelColorSampleCreator'
import { Stepper } from 'extensions/creations/math/Stepper/Stepper'
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
import { Slider } from 'extensions/creations/math/Slider/Slider'
import { Dependency } from 'core/mobjects/Dependency'
import { DependencyLink } from 'core/linkables/DependencyLink'
import { RoundedRectangle } from 'core/shapes/RoundedRectangle'
import { CindyLoader } from 'extensions/apis/CindyLoader'
import { PolypadLoader } from 'extensions/apis/PolypadLoader'
import { PolypadCreator } from 'extensions/creations/Polypad/PolypadCreator'

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
				'circle': ConCircleConstructor
			},
			buttonNames: [
				'DragButton',
				'LinkButton',
				'ControlsButton',
				'NumberButton',
				'ArithmeticButton',
				'ConButton',
				'PolypadButton',
				'WavyButton',
				'SwingButton',
				'ColorSampleButton'
			],
			apiLoaders: [
				new CindyLoader(),
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



}

let d = new DemoPaper()








import { Paper } from 'core/Paper'
import { BoardCreator } from 'core/boards/BoardCreator'
import { ConstructionCreator } from './ConstructionCreator'
import { ConLineConstructor } from './straits/ConLine/ConLineConstructor'
import { ConRayConstructor } from './straits/ConRay/ConRayConstructor'
import { ConSegmentConstructor } from './straits/ConSegment/ConSegmentConstructor'
import { ConCircleConstructor } from './ConCircle/ConCircleConstructor'
import { log } from 'core/functions/logging'
import { Board } from 'core/boards/Board'
import { Linkable } from 'core/linkables/Linkable'
import { Rectangle } from 'core/shapes/Rectangle'
import { ScreenEvent } from 'core/mobjects/screen_events'
import { Color } from 'core/classes/Color'
import { NumberBoxCreator } from 'extensions/creations/math/boxes/NumberBox'
import { SliderCreator } from 'extensions/creations/math/Slider/SliderCreator'
import { StepperCreator } from 'extensions/creations/math/Stepper/StepperCreator'
import { ScreenEventHandler } from 'core/mobjects/screen_events'

export class ConstructionPaper extends Paper {

	defaults(): object {
		return {
			creationConstructors: {
				'board': BoardCreator,
				'construction': ConstructionCreator,
				'line': ConLineConstructor,
				'ray': ConRayConstructor,
				'segment': ConSegmentConstructor,
				'circle': ConCircleConstructor,
				'number': NumberBoxCreator,
				'slider': SliderCreator,
				'stepper': StepperCreator
			},
			buttonNames: [
				'DragButton',
				'ConButton',
				'NumberButton'
			],
		}
	}
}

let p = new ConstructionPaper({
	name: 'p'
})

let b = new Board({
	name: 'b',
	compactAnchor: [100, 100],
	compactWidth: 300,
	compactHeight: 200
})

p.addToContent(b)
log(b)




class MyMob extends Linkable {

	defaults(): object {
		return {
			frameWidth: 300,
			frameHeight: 200,
			backgroundColor: Color.blue(),
			opacity: 0.5
		}
	}

	onPointerDown(e: ScreenEvent) {
		log('click')
	}

}


let r = new MyMob({
	anchor: [450, 100]
})

p.addToContent(r)
r.blockScreenEvents()
r.unblockScreenEvents()

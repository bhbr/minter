
import { Paper } from 'core/Paper'

// import { vertex } from 'core/functions/vertex'
import { Color } from 'core/classes/Color'
import { ScreenEvent, ScreenEventHandler, screenEventTypeAsString, screenEventDeviceAsString } from 'core/mobjects/screen_events'
import { Rectangle } from 'core/shapes/Rectangle'
import { TextLabel } from 'core/ui/TextLabel'
import { SimpleButton } from 'core/ui/SimpleButton'

import { Expandable } from 'core/boards/Expandable'
import { ImageView } from 'core/mobjects/ImageView'

import { log } from 'core/functions/logging'

export class DemoPaper extends Paper {

	defaults(): object {
		return {
			creationConstructors: {
			},
			buttonNames: [
				//'DragButton',
				//'LinkButton',
				//'ControlsButton'
			],
			apiLoaders: [
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

let im = new ImageView({
	imageLocation: '../../assets/test_image.jpg',
	anchor: [100, 100],
	frameWidth: 500,
	frameHeight: 200,
	drawBorder: true
})


d.view.add(im)

//im.fitHorizontally()
//im.alignVertically()

im.fitVertically()
im.alignHorizontally()










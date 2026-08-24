
import { Paper } from 'core/Paper'

// import { vertex } from 'core/functions/vertex'
import { Color } from 'core/classes/Color'
import { ScreenEvent, ScreenEventHandler, screenEventTypeAsString, screenEventDeviceAsString } from 'core/mobjects/screen_events'
import { Rectangle } from 'core/shapes/Rectangle'
import { TextLabel } from 'core/ui/TextLabel'
import { SimpleButton } from 'core/ui/SimpleButton'
import { ExpandableImage } from 'core/boards/ExpandableImage'

import { Expandable } from 'core/boards/Expandable'

import { log } from 'core/functions/logging'

export class DemoPaper extends Paper {

	defaults(): object {
		return {
			creationConstructors: {
			},
			buttonNames: [
				'DragButton',
				'LinkButton',
				'ControlsButton'
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

let im = new ExpandableImage({
	location: `../../assets/test_image.jpg`,
	frameWidth: 300,
	frameHeight: 500,
	compactAnchor: [100, 100]
})

d.addToContent(im)




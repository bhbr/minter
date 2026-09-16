
import { Paper } from 'core/Paper'

import { Color } from 'core/classes/Color'
import { ScreenEvent, ScreenEventHandler, screenEventTypeAsString, screenEventDeviceAsString } from 'core/mobjects/screen_events'
import { Rectangle } from 'core/shapes/Rectangle'
import { TextLabel } from 'core/ui/TextLabel'
import { SimpleButton } from 'core/ui/SimpleButton'

import { ExpandableImage } from 'core/boards/ExpandableImage'
import { ImageView } from 'core/mobjects/ImageView'
import { ImageMobject } from 'core/mobjects/ImageMobject'
import { NewBoard } from 'core/boards/NewBoard'

import { log } from 'core/functions/logging'

export class DemoPaper extends Paper {

	defaults(): object {
		return {
			creationConstructors: {
			},
			buttonNames: [
				'DragButton',
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

let nb = new NewBoard({
	compactAnchor: [300, 300],
	compactWidth: 300,
	compactHeight: 200
})

let im = new ExpandableImage({
	imageLocation: '../../assets/test_image.jpg',
	compactAnchor: [50, 50],
	compactWidth: 150,
	compactHeight: 100
})

//im.view.div.style.overflow = 'visible'

nb.addToContent(im)
d.addToContent(nb)











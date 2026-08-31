
import { Paper } from 'core/Paper'

import { Color } from 'core/classes/Color'
import { ScreenEvent, ScreenEventHandler, screenEventTypeAsString, screenEventDeviceAsString } from 'core/mobjects/screen_events'
import { Rectangle } from 'core/shapes/Rectangle'
import { TextLabel } from 'core/ui/TextLabel'
import { SimpleButton } from 'core/ui/SimpleButton'

import { ExpandableImage } from 'core/boards/ExpandableImage'
import { ImageView } from 'core/mobjects/ImageView'
import { ImageMobject } from 'core/mobjects/ImageMobject'

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

let im = new ExpandableImage({
	imageLocation: '../../assets/test_image.jpg',
	compactAnchor: [300, 300],
	compactWidth: 200,
	compactHeight: 500
})

// let im = new ImageMobject({
// 	imageLocation: '../../assets/test_image.jpg',
// 	anchor: [300, 300],
// 	frameWidth: 500,
// 	frameHeight: 200,
// 	scalingMethod: 'fit',
// 	alignment: 'center',
// 	drawBorder: true
// })

//im.view.div.style.overflow = 'visible'

d.addToContent(im)











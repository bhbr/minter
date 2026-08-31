
import { ImageMobject} from 'core/mobjects/ImageMobject'
import { Expandable } from 'core/boards/Expandable'
import { log } from 'core/functions/logging'
import { EXPANDABLE_CORNER_RADIUS } from './constants'

export class ExpandableImage extends Expandable {

	imageMobject: ImageMobject

	defaults(): object {
		return {
			imageMobject: new ImageMobject()
		}
	}

	get imageLocation(): string | null {
		return this.imageMobject.imageLocation
	}

	set imageLocation(newValue: string | null) {
		this.imageMobject.imageLocation = newValue ?? ''
	}

	setup() {
		super.setup()
		this.add(this.imageMobject)
		this.imageMobject.update({
			borderRadius: EXPANDABLE_CORNER_RADIUS
		})
		this.syncFrames()
		this.moveToTop(this.expandButton)
		this.addDependency('frameWidth', this.imageMobject, 'frameWidth')
		this.addDependency('frameHeight', this.imageMobject, 'frameHeight')
	}

	syncFrames() {
		this.imageMobject.update({
			frameWidth: this.frameWidth,
			frameHeight: this.frameHeight
		})
		this.imageMobject.view.frameImage()
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, redraw)
		if (args['imageLocation'] !== undefined || args['frameWidth'] !== undefined || args['frameWidth'] !== undefined) {
			this.syncFrames()
		}
	}

}
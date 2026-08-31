
import { ImageView, ImageScalingMethod, ImageAlignment } from 'core/mobjects/ImageView'
import { Mobject } from 'core/mobjects/Mobject'

export class ImageMobject extends Mobject {
	
	declare view: ImageView

	defaults(): object {
		return {
			view: new ImageView()
		}
	}

	get imageLocation(): string {
		return this.view.imageLocation
	}

	set imageLocation(newValue: string) {
		this.view.imageLocation = newValue
	}

	get scalingMethod(): ImageScalingMethod {
		return this.view.scalingMethod
	}

	set scalingMethod(newValue: ImageScalingMethod) {
		this.view.scalingMethod = newValue
	}

	get alignment(): ImageAlignment {
		return this.view.alignment
	}

	set alignment(newValue: ImageAlignment) {
		this.view.alignment = newValue
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, redraw)
		if (args['imageLocation'] !== undefined) {
			this.view.frameImage()
		}
	}
}
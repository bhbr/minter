
import { ImageView } from 'core/mobjects/ImageView'
import { Mobject } from 'core/mobjects/Mobject'

export class Image extends Mobject {

	declare view: ImageView

	defaults(): object {
		return {
			view: new ImageView()
		}
	}

	get location(): string | null {
		return this.view.imageLocation
	}

	set location(newValue: string | null) {
		this.view.imageLocation = newValue
	}
	
}
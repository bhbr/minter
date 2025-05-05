
import { View } from 'core/mobjects/View'

export class ImageView extends View {
	
	imageLocation?: string
	imageElement: HTMLImageElement

	defaults(): object {
		return {
			imageLocation: null,
			imageElement: document.createElement('img')
		}
	}

	setup() {
		super.setup()
		this.div.appendChild(this.imageElement)
		this.imageElement.src = this.imageLocation
	}

	redraw() {
		super.redraw()
		this.imageElement.width = this.frameWidth
		this.imageElement.height = this.frameHeight
	}

}
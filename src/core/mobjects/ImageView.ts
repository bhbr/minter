
import { View } from 'core/mobjects/View'
import { log } from 'core/functions/logging'

export class ImageView extends View {
	
	imageElement: HTMLImageElement

	get imageLocation(): string | null {
		return (this.imageElement.src == '') ? null : this.imageElement.src
	}

	set imageLocation(newValue: string | null) {
		this.imageElement.src = newValue ?? ''
	}

	defaults(): object {
		return {
			imageLocation: null,
			imageElement: document.createElement('img'),
			overflow: 'hidden'
		}
	}

	setup() {
		super.setup()
		this.div.appendChild(this.imageElement)
		this.div.style['pointer-events'] = 'none'
	}

	redraw() {
		super.redraw()
		this.imageElement.width = this.frameWidth
		this.imageElement.height = this.frameHeight
	}

	update(args: object = {}) {
		super.update(args)
	}

}
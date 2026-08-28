
import { View } from 'core/mobjects/View'
import { log } from 'core/functions/logging'
import { HorizontalAlignment, VerticalAlignment } from 'core/ui/TextLabel'

export type ImageScalingMethod = 'none' | 'fit' | 'fill'
export type ImageAlignment = 'start' | 'center' | 'end'

export class ImageView extends View {
	
	imageElement: HTMLImageElement
	scalingMethod: ImageScalingMethod
	alignment: ImageAlignment

	get imageLocation(): string | null {
		return (this.imageElement.src == '') ? null : this.imageElement.src
	}

	set imageLocation(newValue: string | null) {
		this.imageElement.src = newValue ?? ''
		//this.fitHorizontally() //this.fitIntoFrame()
		//this.alignVertically()
	}

	defaults(): object {
		return {
			imageLocation: null,
			imageElement: document.createElement('img'),
			scalingMethod: 'fill',
			alignment: 'center',
			overflow: 'visible'
		}
	}

	setup() {
		log(`setup for image with location ${this.imageLocation}`)
		super.setup()
		this.div.appendChild(this.imageElement)
		this.div.style['pointer-events'] = 'none'
		//this.fitHorizontally() //this.fitIntoFrame()
		//this.alignVertically()

	}

	redraw() {
		super.redraw()
	}

	fitHorizontally() {
		this.imageElement.style.width = `${this.frameWidth}px`
		this.imageElement.style.height = ''
	}

	fitVertically() {
		log(this.imageElement.style.width)
		this.imageElement.style.width = ''
		this.imageElement.style.height = `${this.frameHeight}px`	
		log(this.imageElement.style.width)
	}


	alignVertically() {
		let scaleFactor = this.frameWidth / this.imageElement.naturalWidth
		let H = this.imageElement.naturalHeight * scaleFactor
		let h = this.frameHeight

		var yOffset = 0
		if (this.alignment == 'center') {
			yOffset = (h - H) / 2
		} else if (this.alignment == 'end') {
			yOffset = h - H
		}
		this.imageElement.style.objectPosition = `0px ${yOffset}px`
	}

	alignHorizontally() {
		log(`this.frameHeight = ${this.frameHeight}`)
		let scaleFactor = this.frameHeight / this.imageElement.naturalHeight
		log(`scaleFactor = ${scaleFactor}`)
		let W = this.imageElement.naturalWidth * scaleFactor
		log(`W = ${W}`)
		let w = this.frameWidth
		log(`w = ${w}`)
		
		var xOffset = 0
		if (this.alignment == 'center') {
			xOffset = (w - W) / 2
		} else if (this.alignment == 'end') {
			xOffset = w - W
		}
		log(`xOffset = ${xOffset}`)
		this.imageElement.style.objectPosition = `${xOffset}px 0px`
	}

}

import { View } from 'core/mobjects/View'
import { log } from 'core/functions/logging'
import { HorizontalAlignment, VerticalAlignment } from 'core/ui/TextLabel'

export type ImageScalingMethod = 'none' | 'fit' | 'fill'
export type ImageAlignment = 'start' | 'center' | 'end'

export class ImageView extends View {
	
	aligningDiv: HTMLDivElement
	imageElement: HTMLImageElement
	scalingMethod: ImageScalingMethod
	alignment: ImageAlignment
	scaleFactor: number

	get imageLocation(): string | null {
		return (this.imageElement.src == '') ? null : this.imageElement.src
	}

	set imageLocation(newValue: string | null) {
		this.imageElement.src = newValue ?? ''
		this.frameImage()
	}

	defaults(): object {
		return {
			imageLocation: null,
			aligningDiv: document.createElement('div'),
			imageElement: document.createElement('img'),
			scalingMethod: 'fill',
			scaleFactor: 1,
			alignment: 'center',
			overflow: 'hidden'
		}
	}

	setup() {
		super.setup()
		this.scaleFactor = this.getScaleFactor()
		this.div.appendChild(this.aligningDiv)
		this.aligningDiv.appendChild(this.imageElement)
		this.div.style['pointer-events'] = 'none'
		this.aligningDiv.style.position = 'absolute'
		this.frameImage()
	}

	imageWidthToHeightRatio(): number {
		return this.imageElement.naturalWidth / this.imageElement.naturalHeight
	}

	frameWidthToHeightRatio(): number {
		return this.frameWidth / this.frameHeight
	}

	getScaleFactor(): number {
		let imageWiderThanFrame = (this.imageWidthToHeightRatio() > this.frameWidthToHeightRatio())
		if (imageWiderThanFrame && this.scalingMethod == 'fit'
			|| !imageWiderThanFrame && this.scalingMethod == 'fill') {
			return this.frameWidth / this.imageElement.naturalWidth
		} else if (imageWiderThanFrame && this.scalingMethod == 'fill'
			|| !imageWiderThanFrame && this.scalingMethod == 'fit') {
			return this.frameHeight / this.imageElement.naturalHeight
		}
	}

	resizeImage() {
		this.scaleFactor = this.getScaleFactor()
		this.aligningDiv.style.width = `${this.scaleFactor * this.imageElement.naturalWidth}px`
		this.aligningDiv.style.height = `${this.scaleFactor * this.imageElement.naturalHeight}px`
		this.imageElement.style.width = `${this.scaleFactor * this.imageElement.naturalWidth}px`
		this.imageElement.style.height = `${this.scaleFactor * this.imageElement.naturalHeight}px`
	}

	alignHorizontally() {
		let W = this.imageElement.naturalWidth * this.scaleFactor
		let w = this.frameWidth
		
		let xOffset: number
		switch (this.alignment) {
		case 'start':
			xOffset = 0
			break
		case 'center':
			xOffset = (w - W) / 2
			break
		case 'end':
			xOffset = w - W
			break
		default:
			throw 'Unknown image alignment (must be start, center or end)'
		}

		this.aligningDiv.style.left = `${xOffset}px`
		this.aligningDiv.style.top = `0px`
	}

	alignVertically() {
		log(`scale factor: ${this.scaleFactor}`)
		let H = this.imageElement.naturalHeight * this.scaleFactor
		let h = this.frameHeight

		log(`scaled image height: ${H}`)
		log(`frame height: ${h}`)

		let yOffset: number
		switch (this.alignment) {
		case 'start':
			yOffset = 0
			break
		case 'center':
			yOffset = (h - H) / 2
			break
		case 'end':
			yOffset = h - H
			break
		default:
			throw 'Unknown image alignment (must be start, center or end)'
		}

		this.aligningDiv.style.left = `0px`
		this.aligningDiv.style.top = `${yOffset}px`
	}

	frameImage() {
		this.resizeImage()
		let imageWiderThanFrame = (this.imageWidthToHeightRatio() > this.frameWidthToHeightRatio())
		if (imageWiderThanFrame && this.scalingMethod == 'fit'
			|| !imageWiderThanFrame && this.scalingMethod == 'fill') {
			this.alignVertically()
		} else if (imageWiderThanFrame && this.scalingMethod == 'fill'
			|| !imageWiderThanFrame && this.scalingMethod == 'fit') {
			this.alignHorizontally()
		}
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, redraw)
		if (args['imageLocation'] !== undefined) {
			this.frameImage()
		}
	}





}
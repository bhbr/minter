
// import { Image } from 'core/mobjects/Image'
// import { Expandable } from 'core/boards/Expandable'
// import { log } from 'core/functions/logging'

// export class ExpandableImage extends Expandable {

// 	internalImage: Image

// 	defaults(): object {
// 		return {
// 			internalImage: new Image()
// 		}
// 	}

// 	get location(): string | null {
// 		return this.internalImage.location
// 	}

// 	set location(newValue: string | null) {
// 		this.internalImage.update({
// 			location: newValue ?? ''
// 		})
// 	}

// 	setup() {
// 		super.setup()
// 		this.internalImage.view.div.style.overflow = 'hidden'
// 		this.addDependency('frameWidth', this.internalImage, 'frameWidth')
// 		this.addDependency('frameHeight', this.internalImage, 'frameHeight')
// 		this.add(this.internalImage)
// 		this.moveToTop(this.expandButton)
// 	}

// }

// import { ImageView } from 'core/mobjects/ImageView'
// import { Mobject } from 'core/mobjects/Mobject'
// import { ImageScalingMethod, ImageAlignment } from 'ImageView'

// export class Image extends Mobject {

// 	declare view: ImageView

// 	defaults(): object {
// 		return {
// 			view: new ImageView()
// 		}
// 	}

// 	get location(): string | null {
// 		return this.view.imageLocation
// 	}

// 	set location(newValue: string | null) {
// 		this.view.imageLocation = newValue
// 	}
	
// 	get scalingMethod(): ImageScalingMethod {
// 		return this.view.scalingMethod
// 	}

// 	set scalingMethod(newValue: ImageScalingMethod) {
// 		this.view.update({
// 			scalingMethod: newValue
// 		})
// 	}

// 	get alignment(): ImageAlignment {
// 		return this.view.alignment
// 	}

// 	set alignment(newValue: ImageAlignment) {
// 		this.view.update({
// 			alignment: newValue
// 		})
// 	}
// }
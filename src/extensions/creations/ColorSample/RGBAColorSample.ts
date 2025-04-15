
import { ColorSample } from 'extensions/creations/ColorSample/ColorSample'

export class RGBAColorSample extends ColorSample {

	defaults(): object {
		return {
			inputNames: ['red', 'green', 'blue', 'alpha'],
		}
	}


}

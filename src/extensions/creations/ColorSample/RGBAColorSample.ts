
import { ColorSample } from 'extensions/creations/ColorSample/ColorSample'

export class RGBAColorSample extends ColorSample {

	defaults(): object {
		return {
			inputProperties: [
				{ name: 'red', type: 'number' },
				{ name: 'green', type: 'number' },
				{ name: 'blue', type: 'number' },
				{ name: 'alpha', type: 'number' }
			]
		}
	}


}


import { ColorSample } from 'extensions/creations/ColorSample/ColorSample'

export class RGBAColorSample extends ColorSample {

	defaults(): object {
		return {
			inputProperties: [
				{ name: 'red', displayName: null, type: 'number' },
				{ name: 'green', displayName: null, type: 'number' },
				{ name: 'blue', displayName: null, type: 'number' },
				{ name: 'alpha', displayName: null, type: 'number' }
			]
		}
	}


}

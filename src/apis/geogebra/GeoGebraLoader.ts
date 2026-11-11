
import { APILoader } from '../APILoader.js'

export class GeoGebraLoader extends APILoader {

	defaults(): object {
		return {
			scriptLocations: [
				'https://www.geogebra.org/apps/deployggb.js'
			]
		}
	}

}
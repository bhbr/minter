
import { APILoader } from '../APILoader.js'
import { log } from '../../functions/logging.js'
import { getPaper } from '../../paper/getPaper.js'

export class CindyLoader extends APILoader {

	defaults(): object {
		return {
			scriptLocations: [
				'../node_modules/cindyjs/build/js/Cindy.js',
				'../node_modules/cindyjs/build/js/CindyGL.js'
			]
		}
	}

}

import { APILoader } from '../APILoader.js'
import { log } from '../../functions/logging.js'
import { getPaper } from '../../paper/getPaper.js'

export class DesmosLoader extends APILoader {

	apiKey: string
	
	defaults(): object {
		return {
			scriptLocations: [
				'https://www.desmos.com/api/v1.10/calculator.js'
			],
			apiKey: 'dcb31709b452b1cf9dc26972add0fda6'
		}
	}

	load() {
		this.scriptLocations[0] = `${this.scriptLocations[0]}?apiKey=${this.apiKey}`
		super.load()
	}



}
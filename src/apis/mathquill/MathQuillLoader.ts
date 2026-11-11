
import { APILoader } from '../APILoader.js'
import { log } from '../../functions/logging.js'
import { getPaper } from '../../paper/getPaper.js'

export class MathQuillLoader extends APILoader {

	defaults(): object {
		return {
			scriptLocations: [
				'../node_modules/jQuery/dist/jquery.min.js',
				'../node_modules/mathquill/build/mathquill.js'
			],
			styleSheetLocations: [
				'../node_modules/mathquill/build/mathquill.css'
			]
		}
	}
	

}
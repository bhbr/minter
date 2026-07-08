
import { APILoader } from 'core/apis/APILoader'
import { log } from 'core/functions/logging'
import { getPaper } from 'core/functions/getters'

export class DesmosLoader extends APILoader {
	
	load() {
		this.update({
			status: 'loading'
		})
		let scriptTag = document.createElement('script')
		scriptTag.type = 'text/javascript'
		scriptTag.src = 'https://www.desmos.com/api/v1.10/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6'
		scriptTag.onload = function() {
			getPaper().loadedAPI(this)
		}.bind(this)
		document.head.append(scriptTag)
	}

}

import { APILoader } from 'core/apis/APILoader'
import { log } from 'core/functions/logging'
import { getPaper } from 'core/functions/getters'

export class CindyLoader extends APILoader {
	
	load() {
		this.update({
			status: 'loading'
		})

		let scriptTag1 = document.createElement('script')
		scriptTag1.type = 'text/javascript'
		scriptTag1.src = '../../../CindyJS/build/js/Cindy.js'
		let scriptTag2 = document.createElement('script')
		scriptTag2.type = 'text/javascript'
		scriptTag2.src = '../../../CindyJS/build/js/CindyGL.js'
		scriptTag2.onload = function() {
			getPaper().loadedAPI(this)
		}.bind(this)

		scriptTag1.onload = function() {
			document.head.append(scriptTag2)
		}.bind(this)

		document.head.append(scriptTag1)
	}

}
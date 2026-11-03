
import { APILoader } from '../APILoader.js'
import { log } from '../../functions/logging.js'
import { getPaper } from '../../paper/getPaper.js'

export class CindyLoader extends APILoader {
	
	load() {
		this.update({
			status: 'loading'
		})

		let scriptTag1 = document.createElement('script')
		scriptTag1.type = 'text/javascript'
		scriptTag1.src = '../node_modules/cindyjs/build/js/Cindy.js'
		let scriptTag2 = document.createElement('script')
		scriptTag2.type = 'text/javascript'
		scriptTag2.src = '../node_modules/cindyjs/build/js/CindyGL.js'
		scriptTag2.onload = function() {
			this.onload()
			getPaper().loadedAPI(this)
		}.bind(this)

		scriptTag1.onload = function() {
			document.head.append(scriptTag2)
		}.bind(this)

		document.head.append(scriptTag1)
	}

	onload() {
		
	}

}
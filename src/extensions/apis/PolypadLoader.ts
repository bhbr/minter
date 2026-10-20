
import { APILoader } from 'apis/APILoader.js'
import { log } from 'functions/logging.js'
import { getPaper } from 'functions/getters.js'


export class PolypadLoader extends APILoader {
	
	load() {
		this.update({
			status: 'loading'
		})
		let scriptTag = document.createElement('script')
		scriptTag.type = 'text/javascript'
		scriptTag.src = 'https://polypad.amplify.com/api/latest/polypad.js?lang=en&apiKey=0mAb5qoXgVBG5Xc0xOSYbQ'
		scriptTag.onload = function() {
			getPaper().loadedAPI(this)
		}.bind(this)
		document.body.append(scriptTag)
	}

}
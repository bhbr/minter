
import { APILoader } from 'apis/APILoader.js'
import { log } from 'functions/logging.js'
import { getPaper } from 'functions/getters.js'

export class MathQuillLoader extends APILoader {
	
	load() {
		this.update({
			status: 'loading'
		})
		let cssLinkTag = document.createElement('link')
		cssLinkTag.rel = 'stylesheet'
		cssLinkTag.href = '../../mathquill-0.10.1/mathquill.css'
		cssLinkTag.onload = function() {

			let jQueryScriptTag = document.createElement('script')
			//jQueryScriptTag.src = 'https://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js'
			jQueryScriptTag.src = '../../jQuery/jquery.min.js'
			jQueryScriptTag.onload = function() {

				let mqScriptTag = document.createElement('script')
				mqScriptTag.type = 'text/javascript'
				mqScriptTag.src = '../../mathquill-0.10.1/mathquill.js'
				mqScriptTag.onload = function() {
					getPaper().loadedAPI(this)
				}.bind(this)
				document.head.append(mqScriptTag)

			}.bind(this)
			document.head.append(jQueryScriptTag)

		}.bind(this)
		document.head.append(cssLinkTag)
	}

}
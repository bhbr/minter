
import { APILoader } from '../APILoader.js'
import { log } from '../../functions/logging.js'
import { getPaper } from '../../paper/getPaper.js'

export class MathQuillLoader extends APILoader {
	
	load() {
		this.update({
			status: 'loading'
		})
		let cssLinkTag = document.createElement('link')
		cssLinkTag.rel = 'stylesheet'
		cssLinkTag.href = '../node_modules/mathquill/build/mathquill.css'
		cssLinkTag.onload = function() {

			let jQueryScriptTag = document.createElement('script')
			jQueryScriptTag.src = '../node_modules/jQuery/dist/jquery.min.js'
			jQueryScriptTag.onload = function() {

				let mqScriptTag = document.createElement('script')
				mqScriptTag.type = 'text/javascript'
				mqScriptTag.src = '../node_modules/mathquill/build/mathquill.js'
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
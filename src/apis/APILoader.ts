
import { BetterObject } from '@bhbr/better-things'
import { getPaper } from '../paper/getPaper.js'

type APILoadStatus = 'pending' | 'loading' | 'loaded'

export class APILoader extends BetterObject {
	
	status: APILoadStatus
	styleSheetLocations: Array<string>
	scriptLocations: Array<string>

	defaults(): object {
		return {
			status: 'pending',
			styleSheetLocations: [],
			scriptLocations: []
		}
	}

	load() {
		this.update({
			status: 'loading'
		})

		this.loadStyleSheets()
	}

	loadStyleSheets() {
		let cssTags: Array<HTMLElement> = []
		let nbSheets = this.styleSheetLocations.length
		if (nbSheets == 0) {
			this.loadScripts()
			return
		}
		for (let i = 0; i < nbSheets; i++) {
			let tag = document.createElement('link')
			tag.rel = 'stylesheet'
			tag.href = this.styleSheetLocations[i]
			cssTags.push(tag)
			if (i > 0) {
				cssTags[i - 1].onload = function() { document.head.append(tag) }
			}
			if (i == nbSheets - 1) {
				cssTags[i].onload = this.loadScripts.bind(this)
			}
		}
		if (nbSheets > 0) {
			document.head.append(cssTags[0])
		}

	}

	loadScripts() {
		let scriptTags: Array<HTMLElement> = []
		let nbScripts = this.scriptLocations.length
		for (let i = 0; i < nbScripts; i++) {
			let tag = document.createElement('script')
			tag.type = 'text/javascript'
			tag.src = this.scriptLocations[i]
			scriptTags.push(tag)
			if (i > 0) {
				scriptTags[i - 1].onload = function() { document.head.append(tag) }
			}
			if (i == nbScripts - 1) {
				scriptTags[i].onload = function() {
					this.update({
						status: 'loaded'
					})
					this.onload()
					getPaper().loadedAPI(this)
				}.bind(this)
			}
		}
		if (nbScripts > 0) {
			document.head.append(scriptTags[0])
		}

	}

	onload() {

	}

}

import { Linkable } from 'core/linkables/Linkable'
import { getPaper } from 'core/functions/getters'
import { View } from 'core/mobjects/View'

declare var Desmos: any

export class DesmosCalculator extends Linkable {


	defaults(): object {
		return {
			view: new View({
				div: document.createElement('div')
			})
		}
	}

	setup() {
		super.setup()
		if (!getPaper().loadedAPIs.includes('desmos-calc')) {
			this.loadDesmosAPI()
		}
		this.view.div.id = 'desmos-calc'
		window.setTimeout(this.createCalculator.bind(this), 5000)

	}

	loadDesmosAPI() {
		let paper = getPaper()

		let scriptTag = document.createElement('script')
		scriptTag.type = 'text/javascript'
		scriptTag.src = 'https://www.desmos.com/api/v1.10/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6'
		document.head.append(scriptTag)

		paper.loadedAPIs.push('desmos-calc')
	}

	createCalculator() {
		let calculator = Desmos.GraphingCalculator(this.view.div)
	}


}
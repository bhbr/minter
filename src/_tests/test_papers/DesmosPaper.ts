
import { Paper } from '../../paper/Paper.js'
import { log } from '../../functions/logging.js'
import { DesmosLoader } from '../../apis/desmos/DesmosLoader.js'
import { DesmosCalculator } from '../../apis/desmos/DesmosCalculator.js'

export class DesmosPaper extends Paper {

	defaults(): object {
		return {
			apiLoaders: [
				new DesmosLoader()
			]
		}
	}

	loadContent() {
		let c = new DesmosCalculator({
			anchor: [100, 100],
			frameWidth: 700,
			frameHeight: 400
		})
		this.addToContent(c)
	}


}

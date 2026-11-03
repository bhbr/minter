
import { Paper } from '../../../paper/Paper.js'
import { log } from '../../../functions/logging.js'
import { CindyLoader } from '../../../apis/cindyjs/CindyLoader.js'
import { Wavy } from './Wavy.js'

export class CindyPaper extends Paper {

	defaults(): object {
		return {
			apiLoaders: [
				new CindyLoader()
			]
		}
	}

	loadContent() {
		let w = new Wavy({
			anchor: [100, 100],
			frameWidth: 500,
			frameHeight: 200,
			nbSources: 2
		})
		this.addToContent(w)
		w.play()
	}


}

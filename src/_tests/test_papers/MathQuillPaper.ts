
import { Paper } from '../../paper/Paper.js'
import { log } from '../../functions/logging.js'
import { MathQuillLoader } from '../../apis/mathquill/MathQuillLoader.js'
import { MathQuillInputField } from '../../apis/mathquill/MathQuillInputField.js'

export class MathQuillPaper extends Paper {

	defaults(): object {
		return {
			apiLoaders: [
				new MathQuillLoader()
			]
		}
	}

	loadContent() {
		let f = new MathQuillInputField({
			anchor: [100, 100],
			tex: '\\sqrt 2'
		})
		this.add(f)
	}


}

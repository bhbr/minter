
import { IOList } from './IOList.js'
import { vertex } from '@bhbr/affr2'
import { IO_LIST_OFFSET } from './constants.js'
import { log } from 'minter/functions/logging.js'

export class OutputList extends IOList {

	defaults(): object {
		return {
			kind: 'output'
		}
	}

	getAnchor(): vertex {
		return [
			0.5 * (this.mobject.getCompactWidth() - this.view.frame.width),
			this.mobject.getCompactHeight() + IO_LIST_OFFSET
		]
	}

}




























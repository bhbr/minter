
import { IOList } from './IOList.js'
import { vertex } from '@bhbr/affr2'
import { IO_LIST_OFFSET, IO_LIST_WIDTH } from './constants.js'
import { log } from '../functions/logging.js'

export class InputList extends IOList {

	defaults(): object {
		return {
			kind: 'input'
		}
	}

	getAnchor(): vertex {
		return [0.5 * (this.mobject.getCompactWidth() - IO_LIST_WIDTH), -IO_LIST_OFFSET - this.getHeight()]
	}

}



























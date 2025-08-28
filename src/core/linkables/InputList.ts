
import { IOList } from './IOList'
import { vertex } from 'core/functions/vertex'
import { IO_LIST_OFFSET, IO_LIST_WIDTH } from './constants'
import { log } from 'core/functions/logging'

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



























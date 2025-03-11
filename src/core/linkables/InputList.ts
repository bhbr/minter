
import { IOList } from './IOList'
import { vertex } from 'core/functions/vertex'
import { IO_LIST_OFFSET } from './constants'

export class InputList extends IOList {

	ownDefaults(): object {
		return {
			type: 'input'
		}
	}

	getAnchor(): vertex {
		return [0.5 * (this.mobject.getCompactWidth() - this.view.frame.width), -IO_LIST_OFFSET - this.getHeight()]
	}

}



























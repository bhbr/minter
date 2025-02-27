
import { IOList } from './IOList'
import { vertex } from 'core/functions/vertex'
import { IO_LIST_OFFSET } from './constants'

export class OutputList extends IOList {

	ownDefaults(): object {
		return {
			type: 'output'
		}
	}

	getAnchor(): vertex {
		return [
			0.5 * (this.mobject.getCompactWidth() - this.viewWidth),
			this.mobject.getCompactHeight() + IO_LIST_OFFSET + 15
		]
		// TODO: replace the hacky 15px
	}

}




























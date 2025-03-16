
import { ExpandedBoardIOList } from './ExpandedBoardIOList'


export class ExpandedBoardInputList extends ExpandedBoardIOList {

	defaults(): object {
		return {
			type: 'input'
		}
	}

	updateLinkNames() {
		this.mobject.update({
			inputNames: this.getLinkNames()
		})
	}

}

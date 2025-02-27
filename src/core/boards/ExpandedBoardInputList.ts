
import { ExpandedBoardIOList } from './ExpandedBoardIOList'


export class ExpandedBoardInputList extends ExpandedBoardIOList {

	ownDefaults(): object {
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

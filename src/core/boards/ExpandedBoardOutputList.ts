
import { ExpandedBoardIOList } from './ExpandedBoardIOList'


export class ExpandedBoardOutputList extends ExpandedBoardIOList {

	ownDefaults(): object {
		return {
			type: 'output'
		}
	}

}
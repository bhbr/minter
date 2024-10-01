
import { Construction } from './Construction'

export class ConPaper extends Construction {

	defaults(): object {
		return {
			buttonNames: [
				'DragButton',
				'StraitButton',
				'ConCircleButton'
			]
		}
	}

}


import { Construction } from './Construction'

export class ConPaper extends Construction {

	defaults(): object {
		return Object.assign(super.defaults(), {
			buttonNames: [
				'DragButton',
				'StraitButton',
				'ConCircleButton'
			]
		})
	}

}

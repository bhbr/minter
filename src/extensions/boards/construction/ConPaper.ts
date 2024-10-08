
import { Construction } from './Construction'

export class ConPaper extends Construction {

	defaultValues(): object {
		return Object.assign(super.defaultValues(), {
			buttonNames: [
				'DragButton',
				'StraitButton',
				'ConCircleButton'
			]
		})
	}

}

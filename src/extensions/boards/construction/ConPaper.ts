
import { Construction } from './Construction'

export class ConPaper extends Construction {

	ownDefaults(): object {
		return {
			buttonNames: [
				'DragButton',
				'StraitButton',
				'ConCircleButton'
			]
		}
	}

	ownMutabilities(): object {
		return {
			buttonNames: 'never'
		}
	}

}

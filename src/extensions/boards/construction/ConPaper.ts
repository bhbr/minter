
import { Construction } from './Construction'

export class ConPaper extends Construction {

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			buttonNames: [
				'DragButton',
				'StraitButton',
				'ConCircleButton'
			]
		})
	}

	mutabilities(): object {
		return this.updateMutabilities(super.mutabilities(), {
			buttonNames: 'never'
		})
	}

}

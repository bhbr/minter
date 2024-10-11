
import { Construction } from './Construction'

export class ConPaper extends Construction {

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			readonly: {
				buttonNames: [
					'DragButton',
					'StraitButton',
					'ConCircleButton'
				]
			}
		})
	}

}

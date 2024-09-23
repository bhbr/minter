
import { Construction } from './Construction'

export class ConPaper extends Construction {

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			buttonNames: [
				'DragButton',
				'StraitButton',
				'ConCircleButton'
			],
		})
	}

}

export const paper = new ConPaper()

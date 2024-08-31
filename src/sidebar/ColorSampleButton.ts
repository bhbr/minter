import { CreativeButton } from './CreativeButton'

export class ColorSampleButton extends CreativeButton {

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			creations: ['color'],
			key: 'u'
		})
	}

}
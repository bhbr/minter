
import { View } from 'core/mobjects/View'

export class PaperView extends View {
	
	ownDefaults(): object {
		return {
			div: document.querySelector('#paper_id') as HTMLDivElement
		}
	}

}
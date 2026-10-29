
import { View } from '../views/View.js'

export class PaperView extends View {
	
	defaults(): object {
		return {
			div: document.querySelector('#paper_id') as HTMLDivElement
		}
	}


}
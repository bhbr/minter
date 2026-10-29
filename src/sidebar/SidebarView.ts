
import { View } from '../views/View.js'

export class SidebarView extends View {
	
	defaults(): object {
		return {
			div: document.querySelector('#sidebar_id') as HTMLDivElement
		}
	}

}
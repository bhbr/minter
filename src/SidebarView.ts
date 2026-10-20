
import { View } from 'mobjects/View.js'

export class SidebarView extends View {
	
	defaults(): object {
		return {
			div: document.querySelector('#sidebar_id') as HTMLDivElement
		}
	}

}
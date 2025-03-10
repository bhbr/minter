
import { View } from 'core/mobjects/View'

export class SidebarView extends View {
	
	ownDefaults(): object {
		return {
			div: document.querySelector('#sidebar_id') as HTMLDivElement
		}
	}

}
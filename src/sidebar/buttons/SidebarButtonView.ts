
import { VView } from 'minter/vmobjects/VView.js'

export class SidebarButtonView extends VView {

	radius: number

	setup() {
		super.setup()
		this.div.style.transformOrigin = `${this.radius}px ${this.radius}px`
	}
}
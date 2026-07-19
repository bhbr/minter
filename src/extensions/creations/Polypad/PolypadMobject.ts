
import { Linkable } from 'core/linkables/Linkable'

declare var Polypad: any

export class PolypadMobject extends Linkable {

	innerDiv: HTMLDivElement

	defaults(): object {
		return {
			innerDiv: document.createElement('div')
		}
	}
	
	setup() {
		super.setup()
		this.innerDiv.id = `polypad`
		this.innerDiv.style.width = `${this.frameWidth}px`
		this.innerDiv.style.height = `${this.frameHeight}px`
		this.view.div.appendChild(this.innerDiv)
		window.setTimeout(function() {
			Polypad.create(this.innerDiv)
		}.bind(this), 1000)
	}
}
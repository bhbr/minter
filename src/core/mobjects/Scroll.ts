
import { Mobject } from 'core/mobjects/Mobject'
import { ScreenEvent } from 'core/mobjects/screen_events'
import { prettyPrint } from 'core/functions/various'

export class Scroll extends Mobject {

	list: Array<any>
	fontSize: number
	fontFamily: string

	defaults(): object {
		return {
			list: [],
			fontSize: 16,
			fontFamily: 'Helvetica',
			preventDefault: false
		}
	}

	setup() {
		super.setup()
		this.view.div.style['overflow-y'] = 'auto'
		this.view.div.style['text-align'] = 'center'
		this.view.div.style.fontFamily = this.fontFamily
		this.view.div.style.fontSize = `${this.fontSize}px`
	}

	update(args: object = {}, redraw: boolean = false) {
		super.update(args, redraw)
		var innerHTML = ''
		for (var i = 0; i < this.list.length; i++) {
			innerHTML += (prettyPrint(this.list[i]) + `<br>`)
		}
		this.view.div.innerHTML = innerHTML
	}


}
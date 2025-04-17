
import { Rectangle } from 'core/shapes/Rectangle'
import { Color } from 'core/classes/Color'
import { ValueBox } from '../ValueBox'
import { log } from 'core/functions/logging'
import { Scroll } from './Scroll'

export class ListBox extends ValueBox {

	declare value: Array<any>
	scroll: Scroll

	get list(): Array<any> { return this.value }
	set list(newValue: Array<any>) { this.value = newValue }

	defaults(): object {
		return {
			scroll: new Scroll(),
			frameHeight: 200,
			strokeWidth: 0.0,
			value: []
		}
	}

	setup() {
		super.setup()
		this.add(this.scroll)
		this.scroll.update({
			frameWidth: this.view.frame.width,
			frameHeight: this.view.frame.height,
			list: this.list
		})
		this.scroll.view.div.style.fontSize = '20px'
		this.scroll.view.div.style.color = Color.white().toCSS()
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, false)
		this.scroll.update({
			width: this.view.frame.width,
			height: this.view.frame.height,
			list: this.list
		}, redraw)
	}


















}
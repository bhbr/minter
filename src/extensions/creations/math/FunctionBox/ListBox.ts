
import { Rectangle } from 'core/shapes/Rectangle'
import { Color } from 'core/classes/Color'
import { Linkable } from 'core/linkables/Linkable'
import { log } from 'core/functions/logging'
import { Scroll } from './Scroll'

export class ListBox extends Linkable {

	list: Array<any>
	scroll: Scroll
	background: Rectangle

	defaults(): object {
		return {
			scroll: new Scroll(),
			background: new Rectangle({
				fillColor: Color.black()
			}),
			frameWidth: 80,
			frameHeight: 200,
			inputNames: ['list'],
			outputNames: ['list'],
			strokeWidth: 0.0,
			list: []
		}
	}

	setup() {
		super.setup()
		this.add(this.background)
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
		this.background.update({
			width: this.view.frame.width,
			height: this.view.frame.height
		}, redraw)

		this.scroll.update({
			width: this.view.frame.width,
			height: this.view.frame.height,
			list: this.list
		}, redraw)

		if (redraw) { this.view.redraw() }
	}


















}
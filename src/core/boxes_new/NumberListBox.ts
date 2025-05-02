
import { Linkable } from 'core/linkables/Linkable'
import { Scroll } from './Scroll'
import { Rectangle } from 'core/shapes/Rectangle'
import { Color } from 'core/classes/Color'

export class NumberListBox extends Linkable {
	
	value: Array<number>
	background: Rectangle
	scroll: Scroll

	defaults(): object {
		return {
			background: new Rectangle({
				fillColor: Color.black()
			}),
			scroll: new Scroll(),
			frameWidth: 80,
			frameHeight: 200,
			value: [],
		}
	}

	get list(): Array<number> { return this.value }
	set list(newValue: Array<number>) { this.value = newValue }


	setup() {
		super.setup()
		this.background.update({
			width: this.view.frame.width,
			height: this.view.frame.height
		})
		this.add(this.background)
		this.scroll.update({
			frameWidth: this.view.frame.width,
			frameHeight: this.view.frame.height,
			list: this.list
		})
		this.add(this.scroll)
		this.scroll.view.div.style.fontSize = '20px'
		this.scroll.view.div.style.color = Color.white().toCSS()
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, false)
		this.scroll.update({
			width: this.view.frame.width,
			height: this.view.frame.height,
			list: this.list
		}, redraw)}

}

export class LinkableNumberListBox extends NumberListBox {

	defaults(): object {
		return {
			inputProperties: [
				{ name: 'value', type: 'Array<number>' }
			],
			outputProperties: [
				{ name: 'value', type: 'Array<number>' }
			]
		}
	}




}
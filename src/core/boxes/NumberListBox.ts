
import { Linkable } from 'core/linkables/Linkable'
import { Scroll } from './Scroll'
import { Rectangle } from 'core/shapes/Rectangle'
import { Color } from 'core/classes/Color'
import { DraggingCreator } from 'core/creators/DraggingCreator'
import { vertex } from 'core/functions/vertex'
import { log } from 'core/functions/logging'

export class NumberListBox extends Linkable {
	
	value: Array<number>
	background: Rectangle
	scroll: Scroll

	defaults(): object {
		return {
			background: new Rectangle({
				fillColor: Color.black(),
				fillOpacity: 1
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
		super.update(args, redraw)
		this.scroll.update({
			width: this.view.frame.width,
			height: this.view.frame.height,
			list: this.list
		}, redraw)
		this.scroll.view.div.style['overflow-y'] = 'auto'
	}

}

export class LinkableNumberListBox extends NumberListBox {

	defaults(): object {
		return {
			inputProperties: [
				{ name: 'value', displayName: null, type: 'Array<number>' },
				{ name: 'nextEntry', displayName: 'next entry', type: 'number' },
			],
			outputProperties: [
				{ name: 'value', displayName: null, type: 'Array<number>' },
				{ name: 'length', displayName: null, type: 'number' },
			]
		}

	}

	length(): number {
		return this.list.length
	}

	get nextEntry(): number {
		return undefined // this.list[this.list.length - 1]
	}
	set nextEntry(newValue: number) {
		this.list.push(newValue)
		this.update()
	}


}


export class NumberListBoxCreator extends DraggingCreator {
	
	declare creation: LinkableNumberListBox

	createMobject() {
		return new LinkableNumberListBox({
			anchor: this.getStartPoint()
		})
	}

	updateFromTip(q: vertex, redraw: boolean = true) {
		super.updateFromTip(q, redraw)
		this.creation.hideLinks()
	}
}

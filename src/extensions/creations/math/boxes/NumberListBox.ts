
import { Linkable } from 'core/linkables/Linkable'
import { Scroll } from 'core/mobjects/Scroll'
import { Rectangle } from 'core/shapes/Rectangle'
import { Color } from 'core/classes/Color'
import { DraggingCreator } from 'core/creators/DraggingCreator'
import { vertex } from 'core/functions/vertex'
import { log } from 'core/functions/logging'
import { ScreenEvent } from 'core/mobjects/screen_events'
import { SimpleButton } from 'core/mobjects/SimpleButton'
import { DependencyLink } from 'core/linkables/DependencyLink'

export class NumberListBox extends Linkable {
	
	value: Array<number>
	background: Rectangle
	scroll: Scroll
	clearButton: SimpleButton

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
			preventDefault: false,
			inputProperties: [
				{ name: 'value', displayName: 'list', type: 'Array<number>' },
				{ name: 'newestEntry', displayName: 'add entry', type: 'number' },
			],
			outputProperties: [
				{ name: 'value', displayName: 'list', type: 'Array<number>' },
				{ name: 'length', displayName: null, type: 'number' },
			],
			clearButton: new SimpleButton({
				text: 'clear'
			})
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
		this.inputList.positionSelf()
		this.outputList.positionSelf()
		this.clearButton.update({
			anchor: [20, this.frameHeight + 10]
		})
		this.clearButton.action = this.clear.bind(this)
		this.add(this.clearButton)
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

	startDragging(e: ScreenEvent) {
		super.startDragging(e)
		this.preventDefault = true
		this.scroll.preventDefault = true
	}

	endDragging(e: ScreenEvent) {
		super.endDragging(e)
		this.preventDefault = false
		this.scroll.preventDefault = false
	}

	clear() {
		this.update({ value: [] })
		this.updateDependents()
		for (let dep of this.dependents()) {
			if (dep instanceof NumberListBox) {
				dep.clear()
			}
		}
	}

	length(): number {
		return this.list.length
	}

	get newestEntry(): number {
		return undefined // this.list[this.list.length - 1]
	}
	set newestEntry(newValue: number) {
		let isFalsy = [null, undefined, NaN, Infinity, -Infinity].includes(newValue)
		if (isFalsy) { return }
		this.list.push(newValue)
	}

	addedInputLink(link: DependencyLink) {
		log(link)
		if (link.endHook.outlet.name == 'newestEntry') {
			log('clearing')
			this.clear()
		}
	}

}


export class NumberListBoxCreator extends DraggingCreator {
	
	declare creation: NumberListBox

	createMobject() {
		return new NumberListBox({
			anchor: this.getStartPoint()
		})
	}

	updateFromTip(q: vertex, redraw: boolean = true) {
		super.updateFromTip(q, redraw)
		this.creation.hideLinks()
	}
}

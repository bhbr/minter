
import { Expandable } from './Expandable'
import { Mobject } from 'core/mobjects/Mobject'
import { MGroup } from 'core/mobjects/MGroup'
import { HELP_TEXT_LABEL_WIDTH, HELP_TEXT_LABEL_HEIGHT } from './constants'
import { remove } from 'core/functions/arrays'
import { vertex, vertexAdd, vertexSubtract, vertexCopy } from 'core/functions/vertex'
import { ScreenEvent } from 'core/mobjects/screen_events'
import { SIDEBAR_WIDTH } from 'core/constants'
import { Color } from 'core/classes/Color'
import { getPaper } from 'core/functions/getters'

export class BoardContent extends MGroup { }

export class NewBoard extends Expandable {

	focusedChild?: Mobject

	defaults(): object {
		return {
			contentChildren: [],
			content: new BoardContent(),
			buttonNames: [
				'DragButton'
			],
			panPointStart: null,
			backgroundColor: Color.gray(0.15),
			borderColor: Color.gray(0.3),
			borderWidth: 1,
			focusedChild: null
		}
	}
	
	mutabilities(): object {
		return {
			contentChildren: 'never',
			content: 'never'
		}
	}

	// the submobs that will pan along (not e. g. the window chrome)
	contentChildren: Array<Mobject>
	content: MGroup

	setup() {
		super.setup()
		this.content.view.div.style['clip-path'] = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
		this.add(this.content)
		this.moveToTop(this.expandButton)
		let newAnchor = [0.5 * (this.frameWidth - HELP_TEXT_LABEL_WIDTH - SIDEBAR_WIDTH), 20]
		this.helpTextLabel.update({
			anchor: newAnchor,
			frameWidth: HELP_TEXT_LABEL_WIDTH
		})
		this.add(this.helpTextLabel)
		this.helpTextLabel.view.hide()
		this.setupPanMethods()

		this.addDependency('frameWidth', this.content, 'frameWidth')
		this.addDependency('frameHeight', this.content, 'frameHeight')
	}

	addToContent(mob: Mobject) {
		this.content.add(mob)
		this.contentChildren.push(mob)
		if (this.contracted) {
			mob.disable()
		}
		if (this.expandButton.view.visible) {
			// exception: Paper
			this.moveToTop(this.expandButton)
		}
		if (mob instanceof NewBoard) {
			mob.update({
				backgroundColor: this.backgroundColor.brighten(0.5)
			})
		}
	}

	removeFromContent(mob: Mobject) {
		remove(this.contentChildren, mob)
		this.content.remove(mob)
	}

	contentChildrenContaining(p: vertex): Array<Mobject> {
		let mobs: Array<Mobject> = []
		for (let child of this.contentChildren) {
			if (child.frame.contains(p)) {
				mobs.push(child)
			}
		}
		return mobs
	}

	firstContentChildContaining(p: vertex): Mobject | null {
		for (let child of this.contentChildren) {
			if (child.frame.contains(p, 5)) {
				return child
			}
		}
		return null
	}

	panPointStart?: vertex

	startPanning(e: ScreenEvent) {
		let target = this.sensor.eventTarget
		this.panPointStart = this.sensor.localEventVertex(e)
		for (let mob of this.contentChildren) {
			mob.dragAnchorStart = vertexCopy(mob.view.frame.anchor)
		}
	}

	panning(e: ScreenEvent) {
		if (this.panPointStart == null) {
			this.startPanning(e)
			return
		}
		let panPoint = this.sensor.localEventVertex(e)
		let dr = vertexSubtract(panPoint, this.panPointStart)
		for (let mob of this.contentChildren) {
			if (mob.dragAnchorStart == null) { return }
			let newAnchor: vertex = vertexAdd(mob.dragAnchorStart, dr)
			mob.update({ anchor: newAnchor })
			mob.view.div.style.left = `${newAnchor[0]}px`;
			mob.view.div.style.top = `${newAnchor[1]}px`;
		}
	}

	endPanning(e: ScreenEvent) {
		this.panPointStart = null
		for (let mob of this.contentChildren) {
			mob.dragAnchorStart = null
		}
	}

	setPanning(flag: boolean) {
		this.sensor.update({
			screenEventState: flag ? 'pan' : 'default'
		})
	}

	handleMessage(key: string, value: any) {
		if (value === '0') { value = false }
		if (value === '1') { value = true }
		switch (key) {
		case 'drag':
			this.setInternalDragging(value as boolean)
			this.helpTextLabel.update({
				text: this.helpTexts['drag']
			})
			if (value) {
				this.helpTextLabel.view.show()
			} else {
				this.helpTextLabel.view.hide()
			}
			break
		}
	}

	setInternalDragging(value: boolean) {
		this.screenEventState = value ? 'pan' : 'default'
		for (let mob of this.contentChildren) {
			mob.setDragging(value)
		}
	}

	setupPanMethods() {
		this.sensor.screenEventMethods['pan'] = {
			onPointerDown: this.startPanning.bind(this),
			onTouchDown: this.startPanning.bind(this),
			onPenDown: this.startPanning.bind(this),
			onMouseDown: this.startPanning.bind(this),
			onPointerMove: this.panning.bind(this),
			onTouchMove: this.panning.bind(this),
			onPenMove: this.panning.bind(this),
			onMouseMove: this.panning.bind(this), // will only actually drag if mouse is pressed down
			onPointerUp: this.endPanning.bind(this),
			onTouchUp: this.endPanning.bind(this),
			onPenUp: this.endPanning.bind(this),
			onMouseUp: this.endPanning.bind(this)
		}
	}

	expandStateChange() {
		super.expandStateChange()
		this.setInternalDragging(true)
	}

	contractStateChange() {
		super.contractStateChange()
		this.setInternalDragging(false)
	}

	focusOn(child: Mobject) {
		this.focusedChild = child
		getPaper().activeKeyboard = false
		if (!this.sidebar) { return }
		for (let button of this.sidebar.buttons) {
			button.activeKeyboard = false
		}
	}

	blurFocusedChild() {
		this.focusedChild = null
		getPaper().activeKeyboard = true
		if (!this.sidebar) { return }
		for (let button of this.sidebar.buttons) {
			button.activeKeyboard = true
		}
	}




}

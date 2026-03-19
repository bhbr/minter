
import { ExtendedObject } from 'core/classes/ExtendedObject'
import { Frame } from './Frame'
import { vertex } from 'core/functions/vertex'
import { Transform } from 'core/classes/Transform'
import { Color } from 'core/classes/Color'
import { DRAW_BORDERS } from 'core/constants'
import { Mobject } from 'core/mobjects/Mobject'
import { log } from 'core/functions/logging'

export class View extends ExtendedObject {
	
	frame: Frame
	div: HTMLDivElement
	mobject?: Mobject
	// the following properties encode CSS properties
	opacity: number
	visible: boolean
	backgroundColor: Color
	borderColor: Color
	borderWidth: number
	borderRadius: number
	drawShadow: boolean
	savedDrawShadow: boolean | null
	drawBorder: boolean

	defaults(): object {
		return {
			div: document.createElement('div'),
			frame: new Frame(),
			visible: true,
			opacity: 1.0,
			backgroundColor: Color.clear(),
			borderColor: Color.clear(),
			borderWidth: 0,
			borderRadius: 0,
			drawBorder: DRAW_BORDERS,
			drawShadow: false,
			savedDrawShadow: null,
			mobject: null
		}
	}

	// this.anchor is a synonym for this.frame.anchor
	get anchor(): vertex {
		return this.frame.anchor
	}

	set anchor(newValue: vertex) {
		this.frame.anchor = newValue
	}

	// this.transform is a synonym for this.frame.transform
	get transform(): Transform {
		return this.frame.transform
	}

	set transform(newValue: Transform) {
		this.frame.transform = newValue
	}

	get frameWidth(): number {
		return this.frame.width
	}

	set frameWidth(newValue: number) {
		this.frame.width = newValue
	}
	
	get frameHeight(): number {
		return this.frame.height ?? 0
	}

	set frameHeight(newValue: number) {
		this.frame.height = newValue
	}


	// parent view = view of the mobject's parent
	// (not settable because that is the mobject's responsibility)
	get parent(): View | null {
		return this.mobject?.parent?.view
	}

	setup() {
		if (this.mobject) {
			this.div.setAttribute('class', 'mobject-div ' + this.mobject.constructor.name)
		} else {
			this.div.setAttribute('class', 'mobject-div ' + this.constructor.name)
		}
		this.div.style.transformOrigin = 'top left'
		this.div.style.position = 'absolute'
		// 'absolute' positions this mobject relative (sic) to its parent
		this.div.style.overflow = 'visible'
		// by default, the mobject can draw outside its view's borders
		this.div.style.border = this.drawBorder ? '1px dashed green' : 'solid'
		this.div.style.borderColor = this.borderColor.toCSS()
		this.div.style.borderWidth = this.drawBorder ? '1px' : `${this.borderWidth}px`
		this.div.style.borderRadius = `${this.borderRadius}px`
		this.div['view'] = this
		this.frame.view = this
		this.redraw()
		if (this.drawShadow) {
			this.showShadow()
		}
	}

	// called by mobject.add
	add(subview: View) {
		subview.setup()
		this.div.appendChild(subview.div)
	}

	// insertBefore(subview: View, beforeSubview: View) {
	// 	if (this.div.contains(subview.div)) {
	// 		subview.div.remove()
	// 	}
	// 	subview.setup()
	// 	this.div.insertBefore(subview.div, beforeSubview.div)
	// }

	redraw() {
		this.div.style.transform = this.transform.withoutAnchor().toCSSString()
		this.div.style.left = `${this.anchor[0].toString()}px`
		this.div.style.top = `${this.anchor[1].toString()}px`
		this.div.style.width = `${this.frame.width.toString()}px`
		this.div.style.height = `${this.frame.height.toString()}px`
		this.div.style.backgroundColor = this.backgroundColor.toCSS()
		this.div.style.borderColor = this.borderColor.toCSS()
		this.div.style.borderWidth = `${this.borderWidth}px`
		this.div.style.borderRadius = `${this.borderRadius}px`
		this.div.style.opacity = this.opacity.toString()

	}

	setCSSVisibility(visibility: boolean) {
		if (visibility) {
			this.div.style.display = 'flex'
		} else {
			this.div.style.display = 'none'
		}
	}

	setVisibility(visibility: boolean) {
		this.update({ visible: visibility })
		this.setCSSVisibility(this.shouldBeDrawn())
	}

	showShadow() {
		if (this.savedDrawShadow !== null) {
			this.drawShadow = this.savedDrawShadow
		}
		this.savedDrawShadow = null
		if (this.drawShadow) {
			this.div.style.filter = 'drop-shadow(2px 2px 5px)'
		}
	}

	hideShadow() {
		this.savedDrawShadow = this.drawShadow
		this.drawShadow = false
		this.div.style.filter = ''
	}

	shouldBeDrawn(): boolean {
		if (!this.visible) { return false }
		for (let v of this.superViews()) {
			if (!v.visible) {
				return false
			}
		}
		return true
	}

	superViews(): Array<View> | null {
		return this.mobject?.ancestors().map((mob) => mob.view) ?? []
	}

	visibilities(): Array<object> {
		let obj = {}
		obj[this.mobject.constructor.name] = this.visible
		let ret: Array<object> = [obj]
		var m: Mobject = this.mobject
		while (m.parent) {
			m = m.parent
			let obj2 = {}
			obj2[m.constructor.name] = m.view.visible
			ret.push(obj2)
		}
		return ret
	}

	// Show and hide //

	show() {
		this.setVisibility(true)
	}

	hide() {
		this.setVisibility(false)
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args)
		if (redraw) {
			this.redraw()
		}
	}















}
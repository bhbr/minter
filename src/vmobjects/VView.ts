
import { View } from 'minter/mobjects/View.js'
import { VMobject } from './VMobject.js'
import { Color } from 'minter/classes/Color.js'
import { log } from 'minter/functions/logging.js'
import { deepCopy } from '@bhbr/copycat'

export class VView extends View {
	
	declare mobject: VMobject
	svg?: SVGSVGElement // child of view
	path?: SVGElement // child of svg

	fillColor: Color
	fillOpacity: number // 0 to 1
	strokeColor: Color
	strokeWidth: number

	defaults(): object {
		return {
			svg: document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
			path: document.createElementNS('http://www.w3.org/2000/svg', 'path'),
			fillColor: Color.white(),
			fillOpacity: 1,
			strokeColor: Color.white(),
			strokeWidth: 1
		}
	}

	mutabilities(): object {
		return {
			svg: 'never',
			path: 'never'
		}
	}

	setup() {
		super.setup()
		this.svg.setAttribute('class', 'mobject-svg')
		this.svg.style.overflow = 'visible'
		if (!this.div.contains(this.svg)) {
			this.div.appendChild(this.svg)
		}
		if (!this.svg.contains(this.path)) {
			this.svg.appendChild(this.path)
		}
	}

	redraw() {
		super.redraw()
		if (!this.svg || !this.path) { return }
		let pathString: string = this.mobject.pathString()
		if (pathString.includes('NaN')) { return }
		this.updatePath(pathString)
	}

	updatePath(pathString: string) {
		this.path.setAttribute('d', pathString)
		this.path.style['fill'] = this.fillColor.toHex()
		this.path.style['fill-opacity'] = this.fillOpacity.toString()
		this.path.style['stroke'] = this.strokeColor.toHex()
		this.path.style['stroke-width'] = this.strokeWidth.toString()
	}

	deepCopy(): VView {
		let copy = deepCopy(this)
		copy['div'] = this.div.cloneNode()
		copy.div['view'] = copy
		copy['svg'] = this.svg.cloneNode()
		copy['path'] = this.path.cloneNode()
		copy['div'].appendChild(copy['svg'])
		copy['svg'].appendChild(copy['path'])
		return copy
	}

}














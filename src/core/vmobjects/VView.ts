import { View } from 'core/mobjects/View'
import { VMobject } from './VMobject'
import { Color } from 'core/classes/Color'

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
		this.div.appendChild(this.svg)
		this.svg.appendChild(this.path)
	}

	redraw() {
		super.redraw()
		if (!this.svg || !this.path) { return }
		let pathString: string = this.mobject.pathString()
		if (pathString.includes('NaN')) { return }
		this.path.setAttribute('d', pathString)

		this.path.style['fill'] = this.fillColor.toHex()
		this.path.style['fill-opacity'] = this.fillOpacity.toString()
		this.path.style['stroke'] = this.strokeColor.toHex()
		this.path.style['stroke-width'] = this.strokeWidth.toString()
	}

}













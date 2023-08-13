import { Mobject } from './Mobject'
import { MGroup } from './MGroup'
import { Color } from '../helpers/Color'
import { Vertex, Transform } from '../helpers/Vertex_Transform'
import { deepCopy, stringFromPoint } from '../helpers/helpers'

export class VMobject extends Mobject {

	svg: SVGSVGElement
	path: SVGElement // child of view
	vertices: Array<Vertex>

	fillColor: Color
	fillOpacity: number
	strokeColor: Color
	strokeWidth: number

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			fillColor: Color.white(),
			fillOpacity: 0,
			strokeColor: Color.white(),
			strokeWidth: 1,
		})
	}

	statelessSetup() {
		super.statelessSetup()
		this.vertices = []
		this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		this.path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
		this.svg['mobject'] = this
		this.path['mobject'] = this
		this.svg.appendChild(this.path)
		this.svg.setAttribute('class', 'mobject-svg')
		this.svg.style.overflow = 'visible'
	}

	statefulSetup() {
		super.statefulSetup()
		this.view.appendChild(this.svg) // why not just add?
		this.view.setAttribute('class', this.constructor.name + ' mobject-div')
	}

	redrawSelf() {
		let pathString: string = this.pathString()
		if (pathString.includes('NaN')) { return }

		this.path.setAttribute('d', pathString)
		this.path.style['fill'] = this.fillColor.toHex()
		this.path.style['fill-opacity'] = this.fillOpacity.toString()
		this.path.style['stroke'] = this.strokeColor.toHex()
		this.path.style['stroke-width'] = this.strokeWidth.toString()
	}

	pathString(): string {
		console.warn('please subclass pathString')
		return ''
	}

	relativeVertices(frame?: Mobject): Array<Vertex> {
		let returnValue: Array<Vertex> = this.relativeTransform(frame).appliedToVertices(this.vertices)
		if (returnValue == undefined) { return [] }
		else { return returnValue }
	}

	globalVertices(): Array<Vertex> {
		return this.relativeVertices() // uses default frame = paper
	}


	localXMin(): number {
		let xMin: number = Infinity
		if (this.vertices != undefined) {
			for (let p of this.vertices) { xMin = Math.min(xMin, p.x) }
		}
		if (this.children != undefined) {
			for (let mob of this.children) {
				xMin = Math.min(xMin, mob.localXMin() + mob.anchor.x)
			}
		}
		return xMin
	}

	localXMax(): number {
		let xMax: number = -Infinity
		if (this.vertices != undefined) {
			for (let p of this.vertices) { xMax = Math.max(xMax, p.x) }
		}
		if (this.children != undefined) {
			for (let mob of this.children) {
				xMax = Math.max(xMax, mob.localXMax() + mob.anchor.x)
			}
		}
		return xMax
	}

	localYMin(): number {
		let yMin: number = Infinity
		if (this.vertices != undefined) {
			for (let p of this.vertices) { yMin = Math.min(yMin, p.y) }
		}
		if (this.children != undefined) {
			for (let mob of this.children) {
				yMin = Math.min(yMin, mob.localYMin() + mob.anchor.y)
			}
		}
		return yMin
	}

	localYMax(): number {
		let yMax: number = -Infinity
		if (this instanceof MGroup) {

		}
		if (this.vertices != undefined) {
			for (let p of this.vertices) { yMax = Math.max(yMax, p.y) }
		}
		if (this.children != undefined) {
			for (let mob of this.children) {
				yMax = Math.max(yMax, mob.localYMax() + mob.anchor.y)
			}
		}
		return yMax
	}

	localULCorner(): Vertex {
		return new Vertex(this.localXMin(), this.localYMin())
	}

	getWidth(): number { return this.localXMax() - this.localXMin() }
	getHeight(): number { return this.localYMax() - this.localYMin() }

	adjustFrame() {
		let shift = new Transform({ shift: this.localULCorner() })
		let inverseShift = shift.inverse()
		let updateDict: object = {}
		for (let [key, value] of Object.entries(this)) {
			var newValue: any
			if (value instanceof Vertex) {
				newValue = inverseShift.appliedTo(value)
			} else if (value instanceof Array && value.length > 0) {
				newValue = []
				if (!(value[0] instanceof Vertex)) { continue }
				for (let v of value) {
					newValue.push(inverseShift.appliedTo(v))
				}
			} else {
				continue
			}
			updateDict[key] = newValue
		}

		updateDict['anchor'] = shift.appliedTo(this.anchor)
		updateDict['viewWidth'] = this.getWidth()
		updateDict['viewHeight'] = this.getHeight()
		this.update(updateDict)

	}


	///////////////
	// ANIMATION //
	///////////////

	animatableProperties(): Array<string> {
		return [
			'transform',
			'viewWidth',
			'viewHeight',
			'anchor',
			'opacity',
			'backgroundColor',
			'fillColor',
			'fillOpacity',
			'strokeColor',
			'strokeWidth'
		]
	}

	geometricProperties(): Array<string> {
		return []
	}

	static emptyAnimation(seconds: number) {
		let anim = document.createElementNS('http://www.w3.org/2000/svg', 'animate') as SVGAnimateElement
		anim.setAttribute('fill', 'freeze')
		return anim
	}



	animation(key: string, value: any, seconds: number): SVGAnimateElement {

		if (key == 'fillColor') {

			let anim = document.createElementNS('http://www.w3.org/2000/svg', 'animate') as SVGAnimateElement
			anim.setAttribute('attributeName', 'fill')
			anim.setAttribute('attributeType', 'CSS')
			anim.setAttribute('from', this.fillColor.toHex())
			anim.setAttribute('to', value.toHex())
			anim.setAttribute('begin', 'indefinite')
			anim.setAttribute('dur', seconds.toString() + 's')
			this.path.appendChild(anim)
			return anim

		} else if (key == 'fillOpacity') {

			let anim = document.createElementNS('http://www.w3.org/2000/svg', 'animate') as SVGAnimateElement
			anim.setAttribute('attributeName', 'fill-opacity')
			anim.setAttribute('attributeType', 'CSS')
			anim.setAttribute('from', this.fillOpacity.toString())
			anim.setAttribute('to', value.toString())
			anim.setAttribute('begin', 'indefinite')
			anim.setAttribute('dur', seconds.toString() + 's')
			this.path.appendChild(anim)
			return anim

		} else if (key == 'strokeColor') {

			let anim = document.createElementNS('http://www.w3.org/2000/svg', 'animate') as SVGAnimateElement
			anim.setAttribute('attributeName', 'stroke')
			anim.setAttribute('attributeType', 'CSS')
			anim.setAttribute('from', this.fillColor.toHex())
			anim.setAttribute('to', value.toHex())
			anim.setAttribute('begin', 'indefinite')
			anim.setAttribute('dur', seconds.toString() + 's')
			this.path.appendChild(anim)
			return anim

		} else if (key == 'strokeWidth') {

			let anim = document.createElementNS('http://www.w3.org/2000/svg', 'animate') as SVGAnimateElement
			anim.setAttribute('attributeName', 'stroke-width')
			anim.setAttribute('attributeType', 'CSS')
			anim.setAttribute('from', this.strokeWidth.toString())
			anim.setAttribute('to', value.toString())
			anim.setAttribute('begin', 'indefinite')
			anim.setAttribute('dur', seconds.toString() + 's')
			this.path.appendChild(anim)
			return anim

		} else if (key == 'anchor') {

			let anim = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion') as SVGAnimateMotionElement
			let dr = (value as Vertex).subtract(this.anchor)
			let pathString = 'M' + stringFromPoint(Vertex.origin()) + 'L' + stringFromPoint(dr)
			anim.setAttribute('path', pathString)
			anim.setAttribute('begin', 'indefinite')
			anim.setAttribute('dur', seconds.toString() + 's')
			this.path.appendChild(anim)
			return anim

		} else if ((key == 'bezierPoints' && this.constructor.name != 'CurvedShape')
					|| (key == 'vertices' && this.constructor.name != 'Polygon')) {

			console.error('unanimatable property', key, 'on', this)

		} else if (this.geometricProperties().includes(key)) {

			let newObj = deepCopy(this)
			let argsDict: object = {}
			argsDict[key] = value
			newObj.update(argsDict)

			let anim = document.createElementNS('http://www.w3.org/2000/svg', 'animate') as SVGAnimateElement
			anim.setAttribute('attributeName', 'd')
			anim.setAttribute('values', this.pathString() + ';' + newObj.pathString() + ';')
			anim.setAttribute('begin', 'indefinite')
			anim.setAttribute('dur', seconds.toString() + 's')
			this.path.appendChild(anim)
			return anim

		}

	}

	animations(argsDict: object = {}, seconds: number): Array<SVGAnimateElement> {
		let anims: Array<SVGAnimateElement> = []
		for (let [key, value] of Object.entries(argsDict)) {
			let anim: SVGAnimateElement = this.animation(key, value, seconds)
			anims.push(anim)
		}
		return anims
	}

	play(anims: Array<SVGAnimateElement>, seconds, argsDict: object = {}) {
		for (let anim of anims) {
			anim.setAttribute('begin', '0s')
		}
		let ts = window.setTimeout(() => {
			this.update(argsDict)
			for (let anim of anims) {
				anim.remove()
			}
		}, seconds * 1000)
	}

	animate(argsDict: object = {}, seconds: number) {
		super.animate(argsDict)
		let anims: Array<SVGAnimateElement> = this.animations(argsDict, seconds)
		this.play(anims, seconds, argsDict)
	}


























}
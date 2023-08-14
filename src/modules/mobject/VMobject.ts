import { Mobject } from './Mobject'
import { MGroup } from './MGroup'
import { Color } from '../helpers/Color'
import { Vertex, Transform } from '../helpers/Vertex_Transform'
import { VertexArray } from '../helpers/VertexArray'
import { deepCopy, stringFromPoint, remove, restrictedDict } from '../helpers/helpers'

export class VMobject extends Mobject {

	svg: SVGSVGElement
	path: SVGElement // child of view
	vertices: VertexArray

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
		this.vertices = new VertexArray()
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
		return this.animatableCSSProperties()
			.concat(this.animatableSVGProperties())
	}

	animatableSVGProperties(): Array<string> {
		return this.animatableSVGStyleProperties()
			.concat(this.animatableSVGPathProperties())
	}

	animatableSVGStyleProperties(): Array<string> {
		return [
			'fillColor',
			'fillOpacity',
			'strokeColor',
			'strokeWidth'
		]
	}

	animatableSVGPathProperties(): Array<string> {
		return []
	}

	static emptyAnimation(seconds: number) {
		let anim = document.createElementNS('http://www.w3.org/2000/svg', 'animate') as SVGAnimateElement
		anim.setAttribute('fill', 'freeze')
		return anim
	}

	nonPathSVGAnimation(key: string, value: any, seconds: number): SVGAnimateElement {
		//console.log("nonPathSVGAnimation (VMobject) enter:", Date.now())

		if (key == 'fillColor') {

			let anim = document.createElementNS('http://www.w3.org/2000/svg', 'animate') as SVGAnimateElement
			anim.setAttribute('attributeName', 'fill')
			anim.setAttribute('attributeType', 'CSS')
			anim.setAttribute('from', this.fillColor.toHex())
			anim.setAttribute('to', value.toHex())
			anim.setAttribute('begin', 'indefinite')
			anim.setAttribute('dur', seconds.toString() + 's')
			this.path.appendChild(anim)
			//console.log("nonPathSVGAnimation (VMobject) exit:", Date.now())
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
			//console.log("nonPathSVGAnimation (VMobject) exit:", Date.now())
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
			//console.log("nonPathSVGAnimation (VMobject) exit:", Date.now())
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
			//console.log("nonPathSVGAnimation (VMobject) exit:", Date.now())
			return anim

		} else if ((key == 'bezierPoints' && this.constructor.name != 'CurvedShape')
					|| (key == 'vertices' && this.constructor.name != 'Polygon')) {

			console.error('unanimatable property', key, 'on', this)

		} else {
			console.error("???")
		}

	}

	svgAnimations(argsDict: object = {}, seconds: number): Array<SVGAnimateElement> {
		//console.log("svgAnimation (VMobject) enter:", Date.now())

		let pathArgsDict = restrictedDict(argsDict, this.animatableSVGPathProperties())
		let styleArgsDict = restrictedDict(argsDict, this.animatableSVGStyleProperties())

		let anims = super.svgAnimations(argsDict, seconds)
		let newObj = deepCopy(this)
		newObj.update(pathArgsDict)

		let pathAnim = document.createElementNS('http://www.w3.org/2000/svg', 'animate') as SVGAnimateElement
		pathAnim.setAttribute('attributeName', 'd')
		pathAnim.setAttribute('values', this.pathString() + ';' + newObj.pathString() + ';')
		pathAnim.setAttribute('begin', 'indefinite')
		pathAnim.setAttribute('dur', seconds.toString() + 's')
		this.path.appendChild(pathAnim)
		anims.push(pathAnim)

		for (let [key, value] of Object.entries(styleArgsDict)) {
			let anim: SVGAnimateElement = this.nonPathSVGAnimation(key, value, seconds)
			anims.push(anim)
		}
		console.log("svgAnimation (VMobject) exit:", Date.now())
		return anims
	}

	animate(argsDict: object = {}, seconds: number) {
		//console.log("animate (VMobject) enter:", Date.now())

		let cssArgsDict = restrictedDict(argsDict, this.animatableCSSProperties())
		let svgArgsDict = restrictedDict(argsDict, this.animatableSVGProperties())

		let anims: Array<SVGAnimateElement> = this.svgAnimations(svgArgsDict, seconds)
		this.playSVG(anims, seconds, argsDict)
		super.animate(argsDict, seconds)
		//console.log("animate (VMobject) exit:", Date.now())
	}

	playSVG(anims: Array<SVGAnimateElement>, seconds: number, argsDict: object = {}) {
		//console.log("playSVG (VMobject) enter:", Date.now())
		for (let anim of anims) {
			//console.log(anim as SVGAnimateElement)
			anim.setAttribute('begin', '0s')
			console.log("adding SVG anim:", this.runningAnimations, "to", this)
			console.log("before:", this.runningAnimations)
			this.runningAnimations.push(anim)
			console.log("after:", this.runningAnimations)
			anim.addEventListener('endEvent', (event) => {
				console.log(event)
				if (!this.runningAnimations.includes(anim)) {
					return
				}
				console.log("removing SVG anim:", anim, "from", this)
				console.log("before:", this.runningAnimations)
				remove(this.runningAnimations, anim)
				console.log("after:", this.runningAnimations)
				if (this.runningAnimations.length == 0 && this.superMobject.runningAnimations.length == 0) {
					console.log("no more animations (SVG) on", this)
					var update = true
					for (let depmob of this.allDependents()) {
						if (depmob.runningAnimations.length > 0) {
							update = false
						}
					}
					for (let submob of this.submobs) {
						if (submob.runningAnimations.length > 0) {
							update = false
						}
					}
					if (update) {
						console.log('and we are free to update')
						console.log(this, argsDict)
						this.update(argsDict)
					}
				}
			})
//			anim.beginElement()
		}
		//console.log("playSVG (VMobject) exit:", Date.now())

	}

}











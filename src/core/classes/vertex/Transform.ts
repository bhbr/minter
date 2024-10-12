
import { ExtendedObject } from 'core/classes/ExtendedObject'
import { TAU, PI, DEGREES } from 'core/constants'
import { Vertex } from './Vertex'
import { VertexArray } from './VertexArray'

export class Transform extends ExtendedObject {

	anchor: Vertex
	angle: number
	scale: number
	shift: Vertex

	defaults(): object {
		let def = super.defaults()
		let newDef = this.updateDefaults(def, {
			readonly: {
				passedByValue: true
			},
			mutable: {
				anchor: Vertex.origin(),
				angle: 0,
				scale: 1,
				shift: Vertex.origin()
			}
		})
		return newDef
	}

	static identity(): Transform { return new Transform() }

	det(): number { return this.scale ** 2 }

	toCSSString(): string {
		let str1: string = this.shift.isZero() ? `` : `translate(${this.shift.x}px,${this.shift.y}px) `
		let str2: string = this.anchor.isZero() || (this.scale == 1 && this.angle == 0) ? `` : `translate(${-this.anchor.x}px,${-this.anchor.y}px) `
		let str3: string = this.scale == 1 ? `` : `scale(${this.scale}) `
		let str4: string = this.angle == 0 ? `` : `rotate(${-this.angle / DEGREES}deg) `
		let str5: string = this.anchor.isZero() || (this.scale == 1 && this.angle == 0) ? `` : `translate(${this.anchor.x}px,${this.anchor.y}px) `

		return (str1 + str2 + str3 + str4 + str5).replace(`  `, ` `).trim()
	}

	a(): number { return this.scale * Math.cos(this.angle) }
	b(): number { return this.scale * Math.sin(this.angle) }
	c(): number { return -this.scale * Math.sin(this.angle) }
	d(): number { return this.scale * Math.cos(this.angle) }
	e(): number { return (1 - this.a()) * this.anchor.x + (1 - this.b()) * this.anchor.y + this.shift.x }
	f(): number { return (1 - this.c()) * this.anchor.x + (1 - this.d()) * this.anchor.y + this.shift.y }

	inverse(): Transform {
		let t = new Transform({
			anchor: this.anchor,
			angle: -this.angle,
			scale: 1/this.scale
		})
		t.shift = t.appliedTo(this.shift).opposite()
		return t
	}

	appliedTo(p: Vertex): Vertex {
		return new Vertex(
			this.a() * p.x + this.b() * p.y + this.e(),
			this.c() * p.x + this.d() * p.y + this.f()
		)
	}

	appliedToVertices(vertices: Array<Vertex>): VertexArray {
	// This method accepts also an undertyped argument
		let ret = new VertexArray()
		for (let v of vertices) {
			ret.push(this.appliedTo(v))
		}
		return ret
	}

	copy(): Transform {
		let ct = new Transform()
		ct.copyFrom(this)
		return ct
	}

	rightComposedWith(t: Transform): Transform {
		let v: Vertex = t.shift.add(t.anchor).subtract(this.anchor)
		let w: Vertex = this.shift.add(this.anchor).subtract(t.anchor)
		return new Transform({
			anchor: t.anchor,
			scale: this.scale * t.scale,
			angle: this.angle + t.angle,
			shift: v.rotatedBy(this.angle).scaledBy(this.scale).translatedBy(w)
		})
	}

	rightComposeWith(t: Transform) {
		this.copyFrom(this.rightComposedWith(t))
	}

	leftComposeWith(t: Transform) {
		this.copyFrom(this.leftComposedWith(t))
	}

	leftComposedWith(t: Transform): Transform {
		return t.rightComposedWith(this)
	}

	interpolate(newTransform: Transform, weight: number) {
		return new Transform({
			anchor: this.anchor.interpolate(newTransform.anchor, weight),
			angle: (1 - weight) * this.angle + weight * newTransform.angle,
			scale: (1 - weight) * this.scale + weight * newTransform.scale,
			shift: this.shift.interpolate(newTransform.shift, weight)
		})
	}

	withoutAnchor(): Transform {
		let t = this.copy()
		t.anchor = Vertex.origin()
		return t
	}

	toString(): string {
		return `Transform(anchor: ${this.anchor}, angle: ${this.angle/DEGREES}°, scale: ${this.scale}, shift: ${this.shift})`
	}
}


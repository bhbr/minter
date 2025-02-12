
import { ExtendedObject } from 'core/classes/ExtendedObject'
import { TAU, PI, DEGREES } from 'core/constants'
import { vertex, vertexOrigin, vertexIsZero, vertexX, vertexY, vertexOpposite, vertexAdd, vertexSubtract, vertexCentrallyRotatedBy, vertexCentrallyScaledBy, vertexTranslatedBy, vertexInterpolate } from 'core/functions/vertex'

export class Transform extends ExtendedObject {

	anchor: vertex
	angle: number
	scale: number
	shift: vertex

	ownDefaults(): object {
		return {
			passedByValue: true,
			anchor: vertexOrigin(),
			angle: 0,
			scale: 1,
			shift: vertexOrigin()
		}
	}

	ownMutabilities(): object {
		return {
			passedByValue: 'never'
		}
	}

	static identity(): Transform { return new Transform() }

	det(): number { return this.scale ** 2 }

	toCSSString(): string {
		let str1: string = vertexIsZero(this.shift) ? `` : `translate(${this.shift[0]}px,${this.shift[1]}px) `
		let str2: string = vertexIsZero(this.anchor) || (this.scale == 1 && this.angle == 0) ? `` : `translate(${-this.anchor[0]}px,${-this.anchor[1]}px) `
		let str3: string = this.scale == 1 ? `` : `scale(${this.scale}) `
		let str4: string = this.angle == 0 ? `` : `rotate(${-this.angle / DEGREES}deg) `
		let str5: string = vertexIsZero(this.anchor) || (this.scale == 1 && this.angle == 0) ? `` : `translate(${this.anchor[0]}px,${this.anchor[1]}px) `

		return (str1 + str2 + str3 + str4 + str5).replace(`  `, ` `).trim()
	}

	toMatrix(): string {
		return `[[${this.a()} ${this.b()}] [${this.c()} ${this.d()}]]; [${this.e()} ${this.f()}]`
	}

	a(): number { return this.scale * Math.cos(this.angle) }
	b(): number { return this.scale * Math.sin(this.angle) }
	c(): number { return -this.scale * Math.sin(this.angle) }
	d(): number { return this.scale * Math.cos(this.angle) }
	e(): number { return (1 - this.a()) * this.anchor[0] - this.b() * this.anchor[1] + this.shift[0] }
	f(): number { return -this.c() * this.anchor[0] + (1 - this.d()) * this.anchor[1] + this.shift[1] }

	inverse(): Transform {
		let t = new Transform({
			angle: -this.angle,
			scale: 1 / this.scale
		})
		t.update({
			shift: vertexOpposite(t.appliedTo(this.shift)),
			anchor: this.anchor
		})
		return t
	}

	appliedTo(p: vertex): vertex {
		return [
			this.a() * p[0] + this.b() * p[1] + this.e(),
			this.c() * p[0] + this.d() * p[1] + this.f()
		]
	}

	appliedToVertices(vertices: Array<vertex>): Array<vertex> {
	// This method also accepts an undertyped argument
		let ret: Array<vertex> = []
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
		let v: vertex = vertexSubtract(vertexAdd(t.shift, t.anchor), this.anchor)
		let w: vertex = vertexSubtract(vertexAdd(this.shift, this.anchor), t.anchor)
		return new Transform({
			anchor: t.anchor,
			scale: this.scale * t.scale,
			angle: this.angle + t.angle,
			shift: vertexTranslatedBy(vertexCentrallyScaledBy(vertexCentrallyRotatedBy(v, this.angle), this.scale), w)
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
			anchor: vertexInterpolate(this.anchor, newTransform.anchor, weight),
			angle: (1 - weight) * this.angle + weight * newTransform.angle,
			scale: (1 - weight) * this.scale + weight * newTransform.scale,
			shift: vertexInterpolate(this.shift, newTransform.shift, weight)
		})
	}

	withoutAnchor(): Transform {
		let t = this.copy()
		t.anchor = vertexOrigin()
		return t
	}

	toString(): string {
		return `Transform(anchor: ${this.anchor}, angle: ${this.angle/DEGREES}°, scale: ${this.scale}, shift: ${this.shift})`
	}

	equals(t: Transform): boolean {
		let tolerance = 1e-6
		return (Math.abs(this.a() - t.a()) < tolerance
			 && Math.abs(this.b() - t.b()) < tolerance
			 && Math.abs(this.c() - t.c()) < tolerance
			 && Math.abs(this.d() - t.d()) < tolerance
			 && Math.abs(this.e() - t.e()) < tolerance
			 && Math.abs(this.f() - t.f()) < tolerance)
	}











}


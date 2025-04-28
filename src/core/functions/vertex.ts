
import { Transform } from 'core/classes/Transform'

export type vertex = Array<number>
export type vertexArray = Array<vertex>

export function isVertex(obj: any): boolean {
	if (!(obj instanceof Array)) { return false }
	if (obj.length != 2) { return false }
	return (typeof obj[0] == 'number') && (typeof obj[1] == 'number')
}

export function isVertexArray(obj: any): boolean {
	if (!(obj instanceof Array)) { return false }
	return obj.every((el) => isVertex(el))
}

export function vertexX(v: vertex): number { return v[0] }
export function vertexY(v: vertex): number { return v[1] }

export function vertexOrigin(): vertex { return [0, 0] }

export function vertexDot(v: vertex, w: vertex): number {
	return v[0] * w[0] + v[1] * w[1]
}

export function vertexNorm2(v: vertex): number {
	return v[0] ** 2 + v[1] ** 2
}

export function vertexNorm(v: vertex): number {
	return Math.sqrt(vertexNorm2(v))
}

export function vertexCloseTo(v: vertex, w: vertex, tolerance: number = 1e-6): boolean {
	if (vertexIsNaN(v)) { return false }
	if (vertexIsNaN(w)) { return false }
	if (!tolerance) { tolerance = 1 }
	return vertexNorm2(vertexSubtract(v, w)) < tolerance ** 2
}

export function vertexIsZero(v: vertex): boolean {
	return v[0] == 0 && v[1] == 0
}

export function vertexEquals(v: vertex, w: vertex): boolean {
	return vertexCloseTo(v, w, 1e-6)
}

export function vertexArrayEquals(va: vertexArray, wa: vertexArray): boolean {
	if (va.length != wa.length) { return false }
	for (let i = 0; i < va.length; i++) {
		if (!vertexEquals(va[i], wa[i])) { return false }
	}
	return true
}

export function vertexCopyFrom(v: vertex, w: vertex) {
	v[0] = w[0]
	v[1] = w[1]
}

export function vertexUpdate(v: vertex, w: vertex) {
	vertexCopyFrom(v, w)
}

export function vertexCopy(v: vertex): vertex {
	return [v[0], v[1]]
}

export function vertexImageUnder(v: vertex, t: Transform): vertex {
	return [t.a() * v[0] + t.b() * v[1] + t.e(), t.c() * v[0] + t.d() * v[1] + t.f()]
}

export function vertexApply(v: vertex, t: Transform) {
	vertexCopyFrom(v, vertexImageUnder(v, t))
}

export function vertexTranslatedBy(v: vertex, w: vertex): vertex {
	return vertexAdd(v, w)
}

export function vertexTranslateBy(v: vertex, w: vertex) {
	vertexCopyFrom(v, vertexTranslatedBy(v, w))
}

export function vertexCentrallyRotatedBy(v: vertex, angle: number): vertex {
	let c = Math.cos(angle)
	let s = Math.sin(angle)
	return [c * v[0] + s * v[1], -s * v[0] + c * v[1]]
}

export function vertexRotatedBy(v: vertex, angle: number, center: vertex): vertex {
	if (vertexIsZero(center)) {
		return vertexCentrallyRotatedBy(v, angle)
	}
	let w = vertexSubtract(v, center)
	let rw = vertexCentrallyRotatedBy(w, angle)
	return vertexAdd(rw, center)
}

export function vertexCentrallyRotateBy(v: vertex, angle: number) {
	vertexCopyFrom(v, vertexCentrallyRotatedBy(v, angle))
}

export function vertexRotateBy(v: vertex, angle: number, center: vertex) {
	if (vertexIsZero(center)) {
		vertexCopyFrom(v, vertexCentrallyRotatedBy(v, angle))
	}
	vertexCopyFrom(v, vertexRotatedBy(v, angle, center))
}

export function vertexCentrallyScaledBy(v: vertex, scale: number): vertex {
	return [scale * v[0], scale * v[1]]
}

export function vertexScaledBy(v: vertex, scale: number, center: vertex | undefined): vertex {
	if (center == undefined || vertexIsZero(center)) {
		return vertexCentrallyScaledBy(v, scale)
	}
	let w = vertexSubtract(v, center)
	let rw = vertexCentrallyScaledBy(w, scale)
	return vertexAdd(rw, center)
}

function vertexCentrallyScaleBy(v: vertex, scale: number) {
	vertexCopyFrom(v, vertexCentrallyScaledBy(v, scale))
}

export function vertexScaleBy(v: vertex, scale: number, center: vertex | undefined) {
	if (center == undefined) {
		vertexCopyFrom(v, vertexCentrallyScaledBy(v, scale))
	}
	vertexCopyFrom(v, vertexScaledBy(v, scale, center))
}

export function vertexNormalized(v: vertex): vertex {
	let l = 1 / vertexNorm(v)
	return vertexCentrallyScaledBy(v, l)
}

export function vertexNormalize(v: vertex) {
	vertexCopyFrom(v, vertexNormalized(v))
}


export function vertexAdd(v: vertex, w: vertex): vertex {
	return [v[0] + w[0], v[1] + w[1]]
}

export function vertexMultiply(v: vertex, factor: number): vertex {
	return [v[0] * factor, v[1] * factor]
}

export function vertexDivide(v: vertex, factor: number): vertex {
	return [v[0] / factor, v[1] / factor]
}

export function vertexOpposite(v: vertex): vertex {
	return [-v[0], -v[1]]
}

export function vertexSubtract(v: vertex, w: vertex): vertex {
	return [v[0] - w[0], v[1] - w[1]]
}

export function vertexIsNaN(v: vertex): boolean {
	return (isNaN(v[0]) || isNaN(v[1]))
}

export function vertexInterpolate(v: vertex, w: vertex, weight: number): vertex {
	return [v[0] + weight * (w[0] - v[0]), v[1] + weight * (w[1] - v[1])]
}

export function vertexToString(v: vertex): string {
	return `[${v[0]}, ${v[1]}]`
}

export function vertexInnerProduct(v: vertex, w: vertex): number {
	return vertexDot(v, w)
}

export function vertexOuterProduct(v: vertex, w: vertex): number {
	return v[0] * w[1] - v[1] * w[0]
}

export function vertexArrayInterpolate(vtxArray1: vertexArray, vtxArray2: vertexArray, weight): vertexArray {
	let interpolatedVertexArray: vertexArray = []
	for (let i = 0; i < vtxArray1.length; i++) {
		interpolatedVertexArray.push(
			vertexInterpolate(vtxArray1[i], vtxArray2[i], weight)
		)
	}
	return interpolatedVertexArray
}

export function vertexArrayImageUnder(vtxArray: vertexArray, transform: Transform): vertexArray {
	let image: vertexArray = []
	for (let i = 0; i < vtxArray.length; i++) {
		image.push(
			vertexImageUnder(vtxArray[i], transform)
		)
	}
	return image
}



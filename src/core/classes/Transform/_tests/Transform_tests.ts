
import { Transform } from '../Transform'
import { vertex, vertexEquals } from 'core/functions/vertex'
import { DEGREES } from 'core/constants'

export function A_transform_transforms_a_vertex_as_expected(): boolean {
	let t = new Transform({
		anchor: [1, 2],
		angle: 3 * DEGREES,
		scale: 4,
		shift: [5, 6]
	})
	let v = [7, 8]
	let w = t.appliedTo(v)
	let v1 = [v[0] - t.anchor[0], v[1] - t.anchor[1]]
	let cos = Math.cos(t.angle)
	let sin = Math.sin(t.angle)
	let v2 = [cos * v1[0] + sin * v1[1], -sin * v1[0] + cos * v1[1]]
	let v3 = [t.scale * v2[0], t.scale * v2[1]]
	let v4 = [v3[0] + t.anchor[0], v3[1] + t.anchor[1]]
	let v5 = [v4[0] + t.shift[0], v4[1] + t.shift[1]]
	return vertexEquals(w, v5)
}

export function The_identity_transform_leaves_a_vertex_unchanged(): boolean {
	let v = [1, 2]
	let t = Transform.identity()
	let w = t.appliedTo(v)
	return vertexEquals(v, w)
}

export function Even_an_identity_transform_with_nonzero_anchor_leaves_a_vertex_unchanged(): boolean {
	let t = new Transform({
		anchor: [1, 2]
	})
	let v = [3, 4]
	return vertexEquals(t.appliedTo(v), v)
}

export function Transforms_concatenate_properly() {
	let t1 = new Transform({
		anchor: [1, 2],
		angle: 3 * DEGREES,
		scale: 4,
		shift: [5, 6]
	})
	let t2 = new Transform({
		anchor: [7, 8],
		angle: 9 * DEGREES,
		scale: 10,
		shift: [11, 12]
	})
	let t12 = t2.rightComposedWith(t1)
	let v = [13, 14]
	let w1 = t2.appliedTo(t1.appliedTo(v))
	let w2 = t12.appliedTo(v)
	return vertexEquals(w1, w2)
}

export function A_transform_s_inverse_undoes_the_transform(): boolean {
	let t = new Transform({
		anchor: [1, 2],
		angle: 3 * DEGREES,
		scale: 4,
		shift: [5, 6]
	})
	let v = [7, 8]
	let v1 = t.appliedTo(v)
	let inv = t.inverse()
	let v2 = inv.appliedTo(v1)
	return vertexEquals(v2, v)
}

export function A_transform_times_its_inverse_equals_the_identity(): boolean {
	let t = new Transform({
		anchor: [50, -100],
		angle: 25 * DEGREES,
		scale: 2.5,
		shift: [-150, 200]
	})
	let inv = t.inverse()
	let prod = t.rightComposedWith(inv)
	let id = Transform.identity()
	return (prod.equals(id))
}

export function A_transform_equals_itself(): boolean {
	let t = new Transform({
		anchor: [1, 2],
		angle: 3 * DEGREES,
		scale: 4,
		shift: [5, 6]
	})
	return t.equals(t)
}

export function A_transform_s_inverse_s_inverse_is_the_original_transform(): boolean {
	let t = new Transform({
		anchor: [1, 2],
		angle: 3 * DEGREES,
		scale: 4,
		shift: [5, 6]
	})
	return t.inverse().inverse().equals(t)
}

export function A_transform_s_determinant_is_computed_properly(): boolean {
	let t = new Transform({
		anchor: [1, 2],
		angle: 3 * DEGREES,
		scale: 4,
		shift: [5, 6]
	})
	let d1 = t.det()
	let d2 = t.a() * t.d() - t.b() * t.c()
	return (Math.abs((d1 - d2) / d1) < 1e-6)
}










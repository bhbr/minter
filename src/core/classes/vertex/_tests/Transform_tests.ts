
import { Transform } from '../Transform'
import { Vertex } from '../Vertex'
import { DEGREES } from 'core/constants'

export function A_transform_transforms_a_vertex_as_expected(): boolean {
	let t = new Transform({
		anchor: new Vertex(1, 2),
		angle: 3 * DEGREES,
		scale: 4,
		shift: new Vertex(5, 6)
	})
	let v = new Vertex(7, 8)
	let w = t.appliedTo(v)
	let v1 = new Vertex(v.x - t.anchor.x, v.y - t.anchor.y)
	let cos = Math.cos(t.angle)
	let sin = Math.sin(t.angle)
	let v2 = new Vertex(cos * v1.x + sin * v1.y, -sin * v1.x + cos * v1.y)
	let v3 = new Vertex(t.scale * v2.x, t.scale * v2.y)
	let v4 = new Vertex(v3.x + t.anchor.x, v3.y + t.anchor.y)
	let v5 = new Vertex(v4.x + t.shift.x, v4.y + t.shift.y)
	return w.equals(v5)
}

export function The_identity_transform_leaves_a_vertex_unchanged(): boolean {
	let v = new Vertex(1, 2)
	let t = Transform.identity()
	let w = t.appliedTo(v)
	return v.equals(w)
}

export function Even_an_identity_transform_with_nonzero_anchor_leaves_a_vertex_unchanged(): boolean {
	let t = new Transform({
		anchor: new Vertex(1, 2)
	})
	let v = new Vertex(3, 4)
	return t.appliedTo(v).equals(v)
}

export function Transforms_concatenate_properly() {
	let t1 = new Transform({
		anchor: new Vertex(1, 2),
		angle: 3 * DEGREES,
		scale: 4,
		shift: new Vertex(5, 6)
	})
	let t2 = new Transform({
		anchor: new Vertex(7, 8),
		angle: 9 * DEGREES,
		scale: 10,
		shift: new Vertex(11, 12)
	})
	let t12 = t2.rightComposedWith(t1)
	let v = new Vertex(13, 14)
	let w1 = t2.appliedTo(t1.appliedTo(v))
	let w2 = t12.appliedTo(v)
	return w1.equals(w2)
}

export function A_transform_s_inverse_undoes_the_transform(): boolean {
	let t = new Transform({
		anchor: new Vertex(1, 2),
		angle: 3 * DEGREES,
		scale: 4,
		shift: new Vertex(5, 6)
	})
	let v = new Vertex(7, 8)
	let v1 = t.appliedTo(v)
	let inv = t.inverse()
	let v2 = inv.appliedTo(v1)
	return v2.equals(v)
}

export function A_transform_times_its_inverse_equals_the_identity(): boolean {
	let t = new Transform({
		anchor: new Vertex(50, -100),
		angle: 25 * DEGREES,
		scale: 2.5,
		shift: new Vertex(-150, 200)
	})
	let inv = t.inverse()
	let prod = t.rightComposedWith(inv)
	let id = Transform.identity()
	return (prod.equals(id))
}

export function A_transform_equals_itself(): boolean {
	let t = new Transform({
		anchor: new Vertex(1, 2),
		angle: 3 * DEGREES,
		scale: 4,
		shift: new Vertex(5, 6)
	})
	return t.equals(t)
}

export function A_transform_s_inverse_s_inverse_is_the_original_transform(): boolean {
	let t = new Transform({
		anchor: new Vertex(1, 2),
		angle: 3 * DEGREES,
		scale: 4,
		shift: new Vertex(5, 6)
	})
	return t.inverse().inverse().equals(t)
}

export function A_transform_s_determinant_is_computed_properly(): boolean {
	let t = new Transform({
		anchor: new Vertex(1, 2),
		angle: 3 * DEGREES,
		scale: 4,
		shift: new Vertex(5, 6)
	})
	let d1 = t.det()
	let d2 = t.a() * t.d() - t.b() * t.c()
	return Math.abs((d1 - d2) / d1) < 1e-6
}










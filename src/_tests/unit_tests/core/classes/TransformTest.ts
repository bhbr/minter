
import { Transform } from 'core/classes/Transform'
import { vertex, vertexEquals } from 'core/functions/vertex'
import { DEGREES } from 'core/constants'
import { AssertionTest, BundledTest } from '_tests/Tests'

export const TransformTest = new BundledTest({
	name: 'Transform test',
	tests: [

		new AssertionTest({
			name: 'A transform transforms a vertex as expected',
			function: function(): boolean {
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
		}),

		new AssertionTest({
			name: 'The identity transform leaves a vertex unchanged',
			function: function(): boolean {
				let v = [1, 2]
				let t = Transform.identity()
				let w = t.appliedTo(v)
				return vertexEquals(v, w)
			}
		}),

		new AssertionTest({
			name: 'Even an identity transform with nonzero anchor leaves a vertex unchanged',
			function: function(): boolean {
				let t = new Transform({
					anchor: [1, 2]
				})
				let v = [3, 4]
				return vertexEquals(t.appliedTo(v), v)
			}
		}),

		new AssertionTest({
			name: 'Transforms concatenate properly',
			function: function(): boolean {
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
		}),

		new AssertionTest({
			name: "A_transform's inverse undoes the transform",
			function: function(): boolean {
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
		}),

		new AssertionTest({
			name: 'A transform times its inverse equals the identity',
			function: function(): boolean {
				let t = new Transform({
					anchor: [50, -100],
					angle: 25 * DEGREES,
					scale: 2.5,
					shift: [-150, 200]
				})
				let inv = t.inverse()
				let prod = t.rightComposedWith(inv)
				let id = Transform.identity()
				return prod.equals(id)
			}
		}),

		new AssertionTest({
			name: 'A transform equals itself',
			function: function(): boolean {
				let t = new Transform({
					anchor: [1, 2],
					angle: 3 * DEGREES,
					scale: 4,
					shift: [5, 6]
				})
				return t.equals(t)
			}
		}),

		new AssertionTest({
			name: "A transform's inverse's inverse is the original transform",
			function: function(): boolean {
				let t = new Transform({
					anchor: [1, 2],
					angle: 3 * DEGREES,
					scale: 4,
					shift: [5, 6]
				})
				return t.inverse().inverse().equals(t)
			}
		}),

		new AssertionTest({
			name: "A transform's determinant is computed properly",
			function: function() {
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
		})
	]
})








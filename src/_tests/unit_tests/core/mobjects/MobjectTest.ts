import { Mobject } from 'core/mobjects/Mobject'
import { vertexAdd, vertexEquals } from 'core/functions/vertex'
import { Color } from 'core/classes/Color'
import { log } from 'core/functions/logging'
import { AssertionTest, ValueTest, BundledTest } from '_tests/Tests'

export const MobjectTest = new BundledTest({
	name: 'Mobject test',
	subtests: [

		new AssertionTest({
			name: 'Anchors of nested mobjects transform properly',
			function: function(): boolean {
				let parent = new Mobject({
					anchor: [100, 50]
				})
				let child = new Mobject({
					anchor: [25, 30]
				})
				parent.add(child)
				let v = [42, 96]
				let transformedAnchor = child.frame.transformLocalPoint(v, parent.frame)
				let addedAnchors = vertexAdd(v, child.anchor)
				return vertexEquals(transformedAnchor, addedAnchors)
			}
		}),

		new ValueTest({
			name: 'A mobject has_a fill color',
			function: function(): string {
				let mob = new Mobject({ backgroundColor: Color.green() })
				return mob.view.div.style.backgroundColor
			},
			value: 'rgb(0, 255, 0)'
		})
	]
})

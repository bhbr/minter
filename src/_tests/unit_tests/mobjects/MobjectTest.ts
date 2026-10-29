import { Mobject } from 'minter/mobjects/Mobject.js'
import { BetterObject } from '@bhbr/better-things'
import { View } from 'minter/views/View.js'
import { Frame } from 'minter/views/Frame.js'
import { vertexAdd, vertexEquals, Transform } from '@bhbr/affr2'
import { Color } from 'minter/views/Color.js'
import { log } from 'minter/functions/logging.js'
import { AssertionTest, ValueTest, BundledTest } from '@bhbr/tsts'

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
			name: 'A mobject has a fill color',
			function: function(): string {
				let mob = new Mobject({ backgroundColor: Color.green() })
				return mob.view.div.style.backgroundColor
			},
			value: 'rgb(0, 255, 0)'
		})
	]
})

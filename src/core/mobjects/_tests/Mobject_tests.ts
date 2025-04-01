import { Mobject } from '../Mobject'
import { vertex, vertexAdd, vertexEquals } from 'core/functions/vertex'
import { Color } from 'core/classes/Color'
import { log } from 'core/functions/logging'

export function Anchors_of_nested_mobjects_transform_properly(): boolean {
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

export function A_mobject_has_a_fill_color(): boolean {
	let mob = new Mobject({ backgroundColor: Color.green() })
	return (mob.view.div.style.backgroundColor === 'rgb(0, 255, 0)')
}
import { Mobject } from '../Mobject'
import { vertex, vertexAdd, vertexEquals } from 'core/functions/vertex'

export function Anchors_of_nested_mobjects_transform_properly(): boolean {
	let parent = new Mobject({
		anchor: [100, 50]
	})
	let child = new Mobject({
		anchor: [25, 30]
	})
	parent.add(child)
	let v = [42, 96]
	let transformedAnchor = child.transformLocalPoint(v, parent)
	let addedAnchors = vertexAdd(v, child.anchor)
	return vertexEquals(transformedAnchor, addedAnchors)
}


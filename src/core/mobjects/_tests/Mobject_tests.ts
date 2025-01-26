import { Mobject } from '../Mobject'
import { Vertex } from 'core/classes/vertex/Vertex'

export function Anchors_of_nested_mobjects_transform_properly(): boolean {
	let parent = new Mobject({
		anchor: new Vertex(100, 50)
	})
	let child = new Mobject({
		anchor: new Vertex(25, 30)
	})
	parent.add(child)
	let v = new Vertex(42, 96)
	let transformedAnchor = child.transformLocalPoint(v, parent)
	let addedAnchors = v.add(child.anchor)
	return transformedAnchor.equals(addedAnchors)
}


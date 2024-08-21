import { ExtendedObject } from '../modules/helpers/ExtendedObject'
import { Vertex } from '../modules/helpers/Vertex'
import { Transform } from '../modules/helpers/Transform'

// testing whether objects get created properly
// esp. passing properties by value (Vertex, Transform) of by reference (anything else)

class MyExtObject extends ExtendedObject {
	
	vertex: Vertex
	transform: Transform
	array: Array<string>

}

export function ExtendedObjectTest() {

	let v: Vertex = new Vertex(1, 2)
	let a: Vertex = new Vertex(3, 4)
	let t: Transform = new Transform({
		anchor: a,
		scale: 2
	})
	let arr: Array<string> = ['a', 'b']

	let eobj = new MyExtObject({
		vertex: v,
		transform: t,
		array: a
	})

	// testing which changes will stick to the original objects
	eobj.vertex.x = 7 // shouldn't affect v
	eobj.transform.scale = -1 // shouldn't affect t
	eobj.array.push('c') // should affect a

	console.log(v, t, a, eobj)

}

class MyExtObject2 extends MyExtObject {

	vertex = new Vertex(7, 8)
	blip: number = 1

}

let eobj2 = new MyExtObject2()
console.log(eobj2.vertex, eobj2.blip, eobj2)



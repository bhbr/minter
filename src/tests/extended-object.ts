
import { ExtendedObject } from '../modules/extended-object'
import { Vertex, Transform } from '../modules/vertex-transform'


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
		array: arr
	})

	eobj.vertex.x = 7
	eobj.transform.scale = -1
	eobj.array.push('c')

	console.log(v, t, arr, eobj)

}
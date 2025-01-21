
import { Vertex } from '../Vertex'

export function Vertex_called_with_no_args_is_zero_vertex(): boolean {
	let v = new Vertex()
	return (v.x == 0 && v.y == 0)
}

export function Vertex_origin_is_zero_vertex(): boolean {
	let v = Vertex.origin()
	return (v.x == 0 && v.y == 0)
}

export function Vertex_called_with_two_numbers_has_them_as_components(): boolean {
	let a = 1
	let b = 2
	let v = new Vertex(a, b)
	return (v.x == a && v.y == b)
}












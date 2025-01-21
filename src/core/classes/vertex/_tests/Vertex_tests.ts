
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

export function Vertex_called_with_array_has_its_entries_as_components(): boolean {
	let arr = [1, 2]
	let v = new Vertex(arr)
	return (v.x == arr[0] && v.y == arr[1])
}


export function Vertex_called_with_vertex_creates_a_copy(): boolean {
	let v = new Vertex(1, 2)
	let w = new Vertex(v)
	if (v.x != w.x) { return false }
	if (v.y != w.y) { return false }
	w.x = 3
	if (v.x == 3) { return false }
	return true
}

export function A_vertex_is_close_to_itself(): boolean {
	let v = new Vertex(1, 2)
	return v.closeTo(v)
}

export function A_vertex_equals_itself(): boolean {
	let v = new Vertex(1, 2)
	return v.equals(v)
}








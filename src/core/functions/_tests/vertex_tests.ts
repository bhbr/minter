
import { vertexCloseTo, vertexEquals } from '../vertex'

export function A_vertex_is_close_to_itself(): boolean {
	let v = [1, 2]
	return vertexCloseTo(v, v)
}

export function A_vertex_equals_itself(): boolean {
	let v = [1, 2]
	return vertexEquals(v, v)
}


import { equalObjects } from '../copying'

export function equalObjectsAreEqual(): boolean {
	let A = {'a': 1, 'b': 2 }
	let B = {'a': 1, 'b': 2 }
	return equalObjects(A, B)
}
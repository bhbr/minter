import { equalObjects } from '../copying'

export function Equal_objects_are_equal(): boolean {
	let A = {'a': 1, 'b': 2 }
	let B = {'a': 1, 'b': 2 }
	return equalObjects(A, B)
}
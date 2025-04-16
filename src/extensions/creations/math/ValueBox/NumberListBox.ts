
import { ValueBox } from './ValueBox'
import { log } from 'core/functions/logging'

export class NumberListBox extends ValueBox {

	declare value: Array<number>

	defaults(): object {
		return {
			value: []
		}
	}




















}
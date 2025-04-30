
import { ListBox } from './ListBox'
import { log } from 'core/functions/logging'

export class NumberListBox extends ListBox {

	declare value: Array<number>

	defaults(): object {
		return {
			outputProperties: [
				{ name: 'value', type: 'Array<number>' }
			]
		}
	}

}
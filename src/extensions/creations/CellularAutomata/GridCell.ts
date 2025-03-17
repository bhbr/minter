
import { Square } from 'core/shapes/Square'
import { Color } from 'core/classes/Color'
import { log } from 'core/functions/logging'

export class GridCell extends Square {

	defaults(): object {
		return {
			fillOpacity: 1,
			strokeWidth: 0
		}
	}

}
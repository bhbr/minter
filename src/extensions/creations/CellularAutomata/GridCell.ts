
import { Square } from 'shapes/Square.js'
import { Color } from 'classes/Color.js'
import { log } from 'functions/logging.js'

export class GridCell extends Square {

	defaults(): object {
		return {
			fillOpacity: 1,
			strokeWidth: 0
		}
	}

}
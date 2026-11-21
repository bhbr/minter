
import { PolygonalLine } from './PolygonalLine.js'

export class Polygon extends PolygonalLine {
	/*
	A Polygon is a closed PolygonalLine
	*/

	defaults(): object {
		return {
			closed: true
		}
	}

	mutabilities(): object {
		return {
			closed: 'never'
		}
	}
}
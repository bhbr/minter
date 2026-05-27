
import { PolygonalLine } from './PolygonalLine'

export class Polygon extends PolygonalLine {
	/*
	A Polygon is a closed PolygonalLine
	*/

	mutabilities(): object {
		return {
			closed: 'never'
		}
	}
}
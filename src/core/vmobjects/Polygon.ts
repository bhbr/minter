
import { PolygonalLine } from './PolygonalLine'

export class Polygon extends PolygonalLine {
	/*
	A Polygon is a closed PolygonalLine
	*/

	ownMutabilities(): object {
		return {
			closed: 'never'
		}
	}
}
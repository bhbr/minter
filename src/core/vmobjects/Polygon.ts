
import { PolygonalLine } from './PolygonalLine'

export class Polygon extends PolygonalLine {
	/*
	A Polygon is a closed PolygonalLine
	*/

	mutabilities(): object {
		return this.updateMutabilities(super.mutabilities(), {
			closed: 'never'
		})
	}
}
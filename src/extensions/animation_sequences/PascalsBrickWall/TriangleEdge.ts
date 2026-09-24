
import { EDGE_COLOR, EDGE_WIDTH, EDGE_HIGHLIGHT_COLOR, EDGE_HIGHLIGHT_WIDTH } from './constants'
import { Line } from 'core/shapes/Line'

export class TriangleEdge extends Line {
	
	highlighted: boolean

	defaults(): object {
		return {
			highlighted: false,
			color: EDGE_COLOR,
			strokeWidth: EDGE_WIDTH
		}
	}

	highlight() {
		this.highlighted = true
		this.update({
			strokeWidth: EDGE_HIGHLIGHT_WIDTH,
			color: EDGE_HIGHLIGHT_COLOR
		})
	}

	unhighlight() {
		this.highlighted = false
		this.update({
			strokeWidth: EDGE_WIDTH,
			color: EDGE_COLOR
		})
	}
}

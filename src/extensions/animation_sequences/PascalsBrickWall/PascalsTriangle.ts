
import { MGroup } from 'core/mobjects/MGroup'
import { Line } from 'core/shapes/Line'
import { Linkable } from 'core/linkables/Linkable'
import { PascalsTriangleCell } from './PascalsTriangleCell'
import { SimpleButton } from 'core/ui/SimpleButton'
import { CELL_START_OPACITY, CELL_SIZE, CELL_PADDING } from './constants'
import { vertexAdd } from 'core/functions/vertex'

export class PascalsTriangle extends Linkable {
	
	cells: Array<Array<PascalsTriangleCell>>
	nbFlips: 0
	splitButton: SimpleButton
	isSplitting: boolean
	edges: MGroup

	defaults(): object {
		return {
			cells: [[]],
			nbFlips: 0,
			splitButton: new SimpleButton({
				anchor: [-25, CELL_SIZE + CELL_PADDING],
				text: 'flip'
			}),
			isSplitting: false,
			edges: new MGroup()
		}
	}

	setup() {
		super.setup()
		let baseCell = new PascalsTriangleCell({
			nbHeads: 0,
			nbTails: 0
		})
		baseCell.update({
			anchor: [-baseCell.width / 2, 0]
		})
		this.cells[0] = [baseCell]
		this.add(baseCell)
		this.moveToBack(this.edges)
		this.splitButton.action = this.splitCells.bind(this)
		this.controls.add(this.splitButton)
	}

	splitCells() {
		if (this.isSplitting) { return }
		this.update({ isSplitting: true })
		this.cells.push([])
		for (let i = 0; i <= this.nbFlips; i++) {
			let cell = this.cells[this.nbFlips][i]
			let leftCopy = new PascalsTriangleCell({
				nbHeads: cell.nbHeads,
				nbTails: cell.nbTails,
				anchor: cell.anchor,
				opacity: CELL_START_OPACITY
			})
			let rightCopy = new PascalsTriangleCell({
				nbHeads: cell.nbHeads,
				nbTails: cell.nbTails,
				anchor: cell.anchor,
				opacity: CELL_START_OPACITY
			})
			this.add(leftCopy)
			this.add(rightCopy)

			let leftEdge = new Line({
				startPoint: [cell.anchor[0] + cell.width / 2, cell.anchor[1] + cell.height / 2],
				endPoint: [cell.anchor[0] + cell.width / 2, cell.anchor[1] + cell.height / 2],
			})
			this.edges.add(leftEdge)

			let rightEdge = new Line({
				startPoint: [cell.anchor[0] + cell.width / 2, cell.anchor[1] + cell.height / 2],
				endPoint: [rightCopy.anchor[0] + rightCopy.width / 2, rightCopy.anchor[1] + rightCopy.height / 2]
			})
			this.edges.add(rightEdge)

			leftCopy.animatedAddHeadsCoin(i != 0 ? function() { this.remove(leftCopy) }.bind(this) : () => {})
			leftEdge.animate({
				endPoint: [cell.anchor[0] - 5, cell.anchor[1] + 1.5 * cell.height + 10]
			}, 1)
			rightCopy.animatedAddTailsCoin(i == this.nbFlips ? this.endSplitting.bind(this): () => {})
			rightEdge.animate({
				endPoint: [cell.anchor[0] + cell.width + 5, cell.anchor[1] + 1.5 * cell.height + 10]
			}, 1)
			if (i == 0) {
				this.cells[this.nbFlips + 1].push(leftCopy)
			}
			this.cells[this.nbFlips + 1].push(rightCopy)
		}
		this.splitButton.animate({
			anchor: vertexAdd(this.splitButton.anchor, [0, CELL_SIZE + CELL_PADDING])
		}, 1)

	}

	endSplitting() {
		this.update({
			isSplitting: false,
			nbFlips: this.nbFlips + 1
		})

	}


}

import { Linkable } from 'core/linkables/Linkable'
import { PascalsTriangleCell } from './PascalsTriangleCell'
import { SimpleButton } from 'core/ui/SimpleButton'

export class PascalsTriangle extends Linkable {
	
	cells: Array<Array<PascalsTriangleCell>>
	nbFlips: 0
	splitButton: SimpleButton
	isSplitting: boolean

	defaults(): object {
		return {
			cells: [[]],
			nbFlips: 0,
			splitButton: new SimpleButton({
				anchor: [-25, -35],
				text: 'flip'
			}),
			isSplitting: false
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
				anchor: cell.anchor
			})
			let rightCopy = new PascalsTriangleCell({
				nbHeads: cell.nbHeads,
				nbTails: cell.nbTails,
				anchor: cell.anchor
			})
			this.add(leftCopy)
			this.add(rightCopy)
			leftCopy.animatedAddHeadsCoin(i != 0 ? function() { this.remove(leftCopy) }.bind(this) : () => {})
			rightCopy.animatedAddTailsCoin(i == this.nbFlips ? this.endSplitting.bind(this): () => {})
			if (i == 0) {
				this.cells[this.nbFlips + 1].push(leftCopy)
			}
			this.cells[this.nbFlips + 1].push(rightCopy)
		}

	}

	endSplitting() {
		this.update({
			isSplitting: false,
			nbFlips: this.nbFlips + 1
		})

	}


}
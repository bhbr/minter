
import { MGroup } from 'core/mobjects/MGroup'
import { Line } from 'core/shapes/Line'
import { Linkable } from 'core/linkables/Linkable'
import { PascalsTriangleCell } from './PascalsTriangleCell'
import { SimpleButton } from 'core/ui/SimpleButton'
import { CELL_START_OPACITY, CELL_SIZE, CELL_PADDING, SLOW_CELL_ANIMATION_DURATION, FAST_CELL_ANIMATION_DURATION } from './constants'
import { vertexAdd } from 'core/functions/vertex'
import { RadioButtonList } from 'core/ui/RadioButtonList'
import { log } from 'core/functions/logging'
import { TextLabel } from 'core/ui/TextLabel'
import { Transform } from 'core/classes/Transform'
import { TAU } from 'core/constants'
import { ScreenEvent } from 'core/mobjects/screen_events'
import { vertex } from 'core/functions/vertex'

export class PascalsTriangle extends Linkable {
	
	cells: Array<Array<PascalsTriangleCell>>
	nbFlips: number
	splitButton: SimpleButton
	isSplitting: boolean
	edges: MGroup
	presentationFormsList: RadioButtonList
	presentation: 'stacks' | 'combinations'
	nbFlipsLabels: MGroup
	nbFlipsText: TextLabel
	nbPossibilitiesLabels: MGroup
	nbPossibilitiesText: TextLabel
	selectedPath: Array<vertex>
	selectedCells: Array<PascalsTriangleCell>

	defaults(): object {
		return {
			cells: [[]],
			nbFlips: 0,
			splitButton: new SimpleButton({
				anchor: [-25, CELL_SIZE + CELL_PADDING],
				text: 'flip'
			}),
			presentation: 'stacks',
			isSplitting: false,
			edges: new MGroup(),
			presentationFormsList: new RadioButtonList({
				anchor: [-100, CELL_SIZE + CELL_PADDING + 50],
				options: [
					'# flips',
					'# possibilities'
				]
			}),
			nbFlipsLabels: new MGroup(),
			nbFlipsText: new TextLabel({
				text: '# flips',
				frameWidth: 50,
				frameHeight: 25,
				transform: new Transform({
					anchor: [-2 * CELL_SIZE, 0.75 * CELL_SIZE],
					angle: TAU / 6
				})
			}),
			nbPossibilitiesLabels: new MGroup(),
			nbPossibilitiesText: new TextLabel({
				text: '# possibilities',
				frameWidth: 100,
				frameHeight: 25,
				transform: new Transform({
					anchor: [1.7 * CELL_SIZE, 0.2 * CELL_SIZE],
					angle: -TAU / 6
				})
			}),
			selectedPath: [],
			selectedCells: []
		}
	}

	setup() {
		super.setup()
		let baseCell = new PascalsTriangleCell({
			nbHeads: 0,
			nbTails: 0,
			presentation: this.presentation
		})
		baseCell.update({
			anchor: [-baseCell.width / 2, 0]
		})
		this.cells[0] = [baseCell]
		this.add(baseCell)
		this.moveToBack(this.edges)
		this.splitButton.action = this.splitCells.bind(this)
		this.controls.add(this.splitButton)
		this.presentationFormsList.action = this.switchPresentation.bind(this)
		this.presentationFormsList.update({
			selectedButton: this.presentationFormsList.radioButtons[0]
		})
		this.controls.add(this.presentationFormsList)

		this.nbFlipsLabels.add(this.nbFlipsText)
		this.createNewNbFlipsLabel()
		this.add(this.nbFlipsLabels)

		this.nbPossibilitiesLabels.add(this.nbPossibilitiesText)
		this.createNewNbPossibilitiesLabel()
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
				opacity: CELL_START_OPACITY,
				presentation: this.presentation
			})
			let rightCopy = new PascalsTriangleCell({
				nbHeads: cell.nbHeads,
				nbTails: cell.nbTails,
				anchor: cell.anchor,
				opacity: CELL_START_OPACITY,
				presentation: this.presentation
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
			rightCopy.animatedAddTailsCoin(i == this.nbFlips ? this.endSplitting.bind(this): () => {})
			leftEdge.animate({
				endPoint: [cell.anchor[0] - 5, cell.anchor[1] + 1.5 * cell.height + 10]
			}, SLOW_CELL_ANIMATION_DURATION)
			rightEdge.animate({
				endPoint: [cell.anchor[0] + cell.width + 5, cell.anchor[1] + 1.5 * cell.height + 10]
			}, SLOW_CELL_ANIMATION_DURATION)
			if (i == 0) {
				this.cells[this.nbFlips + 1].push(leftCopy)
			}
			this.cells[this.nbFlips + 1].push(rightCopy)
		}
		this.splitButton.animate({
			anchor: vertexAdd(this.splitButton.anchor, [0, CELL_SIZE + CELL_PADDING])
		}, 1)
		this.presentationFormsList.animate({
			anchor: vertexAdd(this.presentationFormsList.anchor, [0, CELL_SIZE + CELL_PADDING])
		}, 1)
	}

	createNewNbFlipsLabel() {
		let labelAnchor = vertexAdd(
			this.cells[this.nbFlips][0].anchor,
			[-CELL_SIZE, 0]
		)
		let newNbFlipsLabel = new TextLabel({
			frameWidth: CELL_SIZE,
			frameHeight: CELL_SIZE,
			text: `${this.nbFlips}`,
			anchor: labelAnchor
		})
		this.nbFlipsLabels.add(newNbFlipsLabel)
	}

	createNewNbPossibilitiesLabel() {
		let labelAnchor = vertexAdd(
			this.cells[this.nbFlips][this.nbFlips].anchor,
			[CELL_SIZE, 0]
		)
		let newNbPossibilitiesLabel = new TextLabel({
			frameWidth: CELL_SIZE,
			frameHeight: CELL_SIZE,
			text: `${2 ** this.nbFlips}`,
			anchor: labelAnchor
		})
		this.nbPossibilitiesLabels.add(newNbPossibilitiesLabel)
	}


	endSplitting() {
		this.update({
			isSplitting: false,
			nbFlips: this.nbFlips + 1
		})
		this.createNewNbFlipsLabel()
		this.createNewNbPossibilitiesLabel()
	}

	switchPresentation() {
		let i = this.presentationFormsList.radioButtons.indexOf(this.presentationFormsList.selectedButton)
		let newPresentation = (i == 0) ? 'stacks' : 'combinations'
		if (newPresentation == this.presentation) { return }
		if (newPresentation == 'stacks') {
			this.showHTLabels(FAST_CELL_ANIMATION_DURATION)
			this.remove(this.nbPossibilitiesLabels)
			this.add(this.nbFlipsLabels)
		} else if (newPresentation == 'combinations') {
			this.showCombinationsLabels(FAST_CELL_ANIMATION_DURATION)
			this.remove(this.nbFlipsLabels)
			this.add(this.nbPossibilitiesLabels)
		}
		this.update({
			presentation: newPresentation
		})
	}

	showHTLabels(duration: number = 0) {
		for (let i = 0; i <= this.nbFlips; i++) {
			for (let j = 0; j <= i; j++) {
				let cell = this.cells[i][j]
				cell.showHTLabel(duration)
			}
		}
	}

	showCombinationsLabels(duration: number = 0) {
		for (let i = 0; i <= this.nbFlips; i++) {
			for (let j = 0; j <= i; j++) {
				let cell = this.cells[i][j]
				cell.showCombinationsLabel(duration)
			}
		}
	}

	onPointerDown(e: ScreenEvent) {
		let p = this.sensor.localEventVertex(e)
		let [n, k] = this.triangleIndex(p)
		if (n == 0 && k == 0) {
			this.selectCellAtIndex(n, k)
		}
	}

	onPointerMove(e: ScreenEvent) {
		let L = this.selectedPath.length
		if (L == 0) { return }
		let p = this.sensor.localEventVertex(e)
		let [n, k] = this.triangleIndex(p)
		if (L == 1) {
			if (n == 1) {
				this.selectCellAtIndex(n, k)
			}
			return
		}
		let [n_1, k_1] = this.selectedPath[this.selectedPath.length - 1]
		let [n_2, k_2] = this.selectedPath[this.selectedPath.length - 2]
		if (n == n_1 + 1 && (k == k_1 || k == k_1 + 1)) {
			this.selectCellAtIndex(n, k)
		} else if (n == n_2 && k == k_2) {
			this.deselectCellAtIndex(n, k)
		} else if (n == n_1 && ((k == k_2 && k == k_1 - 1) || (k_1 == k_2 && k == k_1 + 1))) {
			this.deselectCellAtIndex(n_1, k_1)
			this.selectCellAtIndex(n, k)
		}
	}

	selectCellAtIndex(n: number, k: number) {
		if (n >= this.cells.length) { return }
		let cell = this.cells[n][k]
		this.selectedCells.push(cell)
		this.selectedPath.push([n, k])
		cell.highlight()	
	}

	deselectCellAtIndex(n: number, k: number) {
		if (n >= this.cells.length) { return }
		let cell = this.selectedCells.pop()
		this.selectedPath.pop()
		cell.unhighlight()
	}

	triangleIndex(p: vertex): vertex {
		let x = p[0]
		let y = p[1]
		let n = Math.max(Math.floor(y / (CELL_SIZE + CELL_PADDING)), 0)
		let k = Math.min(Math.max(Math.round((x / (CELL_SIZE + CELL_PADDING) + n / 2)), 0), n)
		return [n, k]
	}

}
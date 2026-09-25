
import { MGroup } from 'core/mobjects/MGroup'
import { Linkable } from 'core/linkables/Linkable'
import { TriangleCell } from './TriangleCell'
import { SimpleButton } from 'core/ui/SimpleButton'
import { CELL_START_OPACITY, CELL_SIZE, CELL_PADDING, SLOW_CELL_ANIMATION_DURATION, FAST_CELL_ANIMATION_DURATION, EDGE_WIDTH, EDGE_HIGHLIGHT_WIDTH, EDGE_COLOR, EDGE_HIGHLIGHT_COLOR, PATH_COIN_ROW_HORIZONTAL_OFFSET } from './constants'
import { vertexAdd } from 'core/functions/vertex'
import { RadioButtonList } from 'core/ui/RadioButtonList'
import { log } from 'core/functions/logging'
import { TextLabel } from 'core/ui/TextLabel'
import { Transform } from 'core/classes/Transform'
import { TAU } from 'core/constants'
import { ScreenEvent } from 'core/mobjects/screen_events'
import { vertex } from 'core/functions/vertex'
import { PathCoinRow } from './PathCoinRow'
import { TrianglePath, PathDirection } from './TrianglePath'
import { TriangleEdge } from './TriangleEdge'
import { equalArrays, arrayWithReplacements } from 'core/functions/arrays'

export class PascalsTriangle extends Linkable {
	
	cells: Array<Array<TriangleCell>>
	nbFlips: number
	splitButton: SimpleButton
	isSplitting: boolean
	leftEdges: Array<Array<TriangleEdge>>
	rightEdges: Array<Array<TriangleEdge>>
	presentationFormsList: RadioButtonList
	presentation: 'stacks' | 'combinations'
	nbFlipsLabels: MGroup
	nbFlipsText: TextLabel
	nbPossibilitiesLabels: MGroup
	nbPossibilitiesText: TextLabel

	selectedPath: TrianglePath
	selectedCells: Array<TriangleCell>
	selectedEdges: Array<TriangleEdge>
	animationDuration: number
	pathCoinRow: PathCoinRow

	defaults(): object {
		return {
			cells: [],
			nbFlips: 0,
			splitButton: new SimpleButton({
				anchor: [-25, CELL_SIZE + CELL_PADDING],
				text: 'flip'
			}),
			presentation: 'stacks',
			isSplitting: false,
			leftEdges: [],
			rightEdges: [],
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
			selectedPath: new TrianglePath(),
			selectedCells: [],
			selectedEdges: [],
			pathCoinRow: new PathCoinRow()
		}
	}

	setup() {
		super.setup()
		let N = this.nbFlips
		this.nbFlips = 0

		let baseCell = new TriangleCell({
			nbHeads: 0,
			nbTails: 0,
			presentation: this.presentation
		})
		baseCell.update({
			anchor: [-baseCell.width / 2, 0]
		})
		this.cells.push([baseCell])
		this.add(baseCell)
		this.splitButton.action = this.splitCells.bind(this, SLOW_CELL_ANIMATION_DURATION)
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

		for (let i = 0; i < N; i++) {
			this.splitCells()
		}

		this.pathCoinRow.update({
			triangle: this
		})
		this.add(this.pathCoinRow)
	}

	splitCells(animationDuration: number = 0) {
		if (this.isSplitting) { return }
		this.update({ isSplitting: true })
		this.cells.push([])
		this.leftEdges.push([])
		this.rightEdges.push([])
		for (let i = 0; i <= this.nbFlips; i++) {
			let cell = this.cells[this.nbFlips][i]
			let leftCopy = new TriangleCell({
				nbHeads: cell.nbHeads,
				nbTails: cell.nbTails,
				anchor: cell.anchor,
				opacity: CELL_START_OPACITY,
				presentation: this.presentation
			})
			let rightCopy = new TriangleCell({
				nbHeads: cell.nbHeads,
				nbTails: cell.nbTails,
				anchor: cell.anchor,
				opacity: CELL_START_OPACITY,
				presentation: this.presentation
			})
			this.add(leftCopy)
			this.add(rightCopy)

			let leftEdge = new TriangleEdge({
				startPoint: [cell.anchor[0] + cell.width / 2, cell.anchor[1] + cell.height / 2],
				endPoint: [cell.anchor[0] + cell.width / 2, cell.anchor[1] + cell.height / 2]
			})
			this.add(leftEdge)
			this.leftEdges[this.nbFlips].push(leftEdge)
			this.moveToBack(leftEdge)

			let rightEdge = new TriangleEdge({
				startPoint: [cell.anchor[0] + cell.width / 2, cell.anchor[1] + cell.height / 2],
				endPoint: [rightCopy.anchor[0] + rightCopy.width / 2, rightCopy.anchor[1] + rightCopy.height / 2]
			})
			this.add(rightEdge)
			this.rightEdges[this.nbFlips].push(rightEdge)
			this.moveToBack(rightEdge)

			if (i == 0) {
				this.cells[this.nbFlips + 1].push(leftCopy)
			}
			leftCopy.animatedAddHeadsCoin(animationDuration, i != 0 ? function() { this.remove(leftCopy) }.bind(this) : () => {})

			this.cells[this.nbFlips + 1].push(rightCopy)
			rightCopy.animatedAddTailsCoin(animationDuration, i == this.nbFlips && animationDuration > 0 ? this.endSplitting.bind(this) : () => {})

			leftEdge.animate({
				endPoint: [cell.anchor[0] - 5, cell.anchor[1] + 1.5 * cell.height + 10]
			}, animationDuration)
			rightEdge.animate({
				endPoint: [cell.anchor[0] + cell.width + 5, cell.anchor[1] + 1.5 * cell.height + 10]
			}, animationDuration)
		}

		this.splitButton.animate({
			anchor: vertexAdd(this.splitButton.anchor, [0, CELL_SIZE + CELL_PADDING])
		}, animationDuration)
		this.presentationFormsList.animate({
			anchor: vertexAdd(this.presentationFormsList.anchor, [0, CELL_SIZE + CELL_PADDING])
		}, animationDuration)
		this.pathCoinRow.animate({
			anchor: [PATH_COIN_ROW_HORIZONTAL_OFFSET + (CELL_SIZE + CELL_PADDING) * this.nbFlips * 0.5, 10]
		}, animationDuration)

		if (animationDuration == 0) {
			this.endSplitting()
		}
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

	triangleIndex(p: vertex): vertex {
		let x = p[0]
		let y = p[1]
		let n = Math.max(Math.floor(y / (CELL_SIZE + CELL_PADDING)), 0)
		let k = Math.min(Math.max(Math.round((x / (CELL_SIZE + CELL_PADDING) + n / 2)), 0), n)
		return [n, k]
	}

	selectTopCell() {
		this.selectedCells.push(this.cells[0][0])
		this.cells[0][0].highlight()
	}

	addToPath(direction: PathDirection) {
		this.selectedPath.add(direction)
		this.updateSelection()
	}

	addToPathAfterLevel(direction: PathDirection, n: number) {
		this.selectedPath.addAfterLevel(direction, n)
		this.updateSelection()
	}

	popFromPath() {
		this.selectedPath.pop()
		this.updateSelection()
	}

	clipPathToLevel(n: number) {
		this.selectedPath.clipToLevel(n)
		this.updateSelection()
	}

	flipPathAtLevel(n: number) {
		this.selectedPath.flipAtLevel(n)
		this.updateSelection()
	}

	getSelectedCells(): Array<TriangleCell> {
		let ret: Array<TriangleCell> = [this.cells[0][0]]
		var k: number = 0
		for (let n = 1; n <= this.selectedPath.length; n++) {
			if (this.selectedPath[n - 1] == 'R') {
				k += 1
			}
			ret.push(this.cells[n][k])
		}
		return ret
	}

	getSelectedEdges(): Array<TriangleEdge> {
		let ret: Array<TriangleEdge> = []
		var k: number = 0
		for (let n = 0; n <= this.selectedPath.length - 1; n++) {
			if (this.selectedPath[n] == 'L') {
				ret.push(this.leftEdges[n][k])
			} else {
				ret.push(this.rightEdges[n][k])
				k += 1
			}
		}
		return ret
	}

	updateSelection() {
		let newSelectedCells = this.getSelectedCells()
		for (let cell of this.selectedCells) {
			if (!newSelectedCells.includes(cell)) {
				cell.unhighlight()
			}
		}
		for (let cell of newSelectedCells) {
			if (!this.selectedCells.includes(cell)) {
				cell.highlight()
			}
		}
		this.selectedCells = newSelectedCells

		let newSelectedEdges = this.getSelectedEdges()
		for (let edge of this.selectedEdges) {
			if (!newSelectedEdges.includes(edge)) {
				edge.unhighlight()
			}
		}
		for (let edge of newSelectedEdges) {
			if (!this.selectedEdges.includes(edge)) {
				edge.highlight()
			}
		}
		this.selectedEdges = newSelectedEdges

		let newStates = arrayWithReplacements(this.selectedPath, {'L': 'heads', 'R': 'tails'})
		this.pathCoinRow.update({
			states: newStates
		})

	}

	selectedIndices(): Array<[number, number]> {
		let ret: Array<[number, number]> = []
		var k: number = 0
		for (let n = 0; n <= this.selectedPath.length; n++) {
			ret.push([n, k])
			if (n == this.selectedPath.length) { break }
			if (this.selectedPath[n] == 'R') {
				k += 1
			}
		}
		return ret
	}

	indexIsSelected(index: [number, number]): boolean {
		for (let index2 of this.selectedIndices()) {
			if (equalArrays(index, index2)) {
				return true
			}
		}
		return false
	}

	onPointerDown(e: ScreenEvent) {
		let p = this.sensor.localEventVertex(e)
		let [n, k] = this.triangleIndex(p)
		if (n == 0) {
			if (this.selectedPath.length == 0) {
				this.selectTopCell()
			} else {
				this.clipPathToLevel(0)
			}
		}
		if (this.indexIsSelected([n - 1, k])) {
			this.clipPathToLevel(n - 1)
			this.addToPath('L')
		} else if (this.indexIsSelected([n - 1, k - 1])) {
			this.clipPathToLevel(n - 1)
			this.addToPath('R')
		}
	}

	onPointerMove(e: ScreenEvent) {
		let p = this.sensor.localEventVertex(e)
		let [n, k] = this.triangleIndex(p)
		if (this.indexIsSelected([n, k])) {
			let [n_1, k_1] = this.selectedIndices()[this.selectedPath.length]
			if (n == n_1 - 1) {
				this.popFromPath()
				return
			}
		}
		if (n == 1 && this.selectedPath.length == 0) {
			this.addToPath(k == 0 ? 'L' : 'R')
		} else if (n >= 1) {
			let [n_1, k_1] = this.selectedIndices()[this.selectedPath.length]
			if (n == n_1 + 1) {
				if (k == k_1) {
					this.addToPath('L')
				} else if (k == k_1 + 1) {
					this.addToPath('R')
				}
			} else if (n == n_1) {
				if (this.selectedPath.length < 1) { return }
				let [n_2, k_2] = this.selectedIndices()[this.selectedPath.length - 1]
				if (k == k_2) {
					this.popFromPath()
					this.addToPath('L')
				} else if (k == k_2 + 1) {
					this.popFromPath()
					this.addToPath('R')
				}
			} else if (n == n_1 - 1) {
				if (this.selectedPath.length < 2) { return }
				let [n_3, k_3] = this.selectedIndices()[this.selectedPath.length - 2]
				if (k == k_3) {
					this.popFromPath()
					this.popFromPath()
					this.addToPath('L')
				} else if (k == k_3 + 1) {
					this.popFromPath()
					this.popFromPath()
					this.addToPath('R')
				}
			}
		}
	}

















}
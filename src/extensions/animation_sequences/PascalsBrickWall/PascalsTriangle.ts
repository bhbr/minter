
import { MGroup } from 'core/mobjects/MGroup'
import { Linkable } from 'core/linkables/Linkable'
import { TriangleCell } from './TriangleCell'
import { SimpleButton } from 'core/ui/SimpleButton'
import { CELL_START_OPACITY, CELL_SIZE, CELL_PADDING, SLOW_CELL_ANIMATION_DURATION, FAST_CELL_ANIMATION_DURATION, EDGE_WIDTH, EDGE_HIGHLIGHT_WIDTH, EDGE_COLOR, EDGE_HIGHLIGHT_COLOR, PATH_COIN_ROW_HORIZONTAL_OFFSET, SPLIT_BUTTON_SIZE, CONTROLS_HEIGHT, CONTROLS_WIDTH } from './constants'
import { vertex, vertexAdd, vertexSubtract } from 'core/functions/vertex'
import { RadioButtonList } from 'core/ui/RadioButtonList'
import { log } from 'core/functions/logging'
import { TextLabel } from 'core/ui/TextLabel'
import { Transform } from 'core/classes/Transform'
import { TAU } from 'core/constants'
import { ScreenEvent, ScreenEventHandler } from 'core/mobjects/screen_events'
import { PathCoinRow } from './PathCoinRow'
import { TrianglePath, PathDirection } from './TrianglePath'
import { TriangleEdge } from './TriangleEdge'
import { equalArrays, arrayWithReplacements } from 'core/functions/arrays'
import { Checkbox } from 'core/ui/Checkbox'
import { IntegerInputBox } from 'extensions/ui/InputBox/IntegerInputBox'
import { Polygon } from 'core/vmobjects/Polygon'
import { RoundedRectangle } from 'core/shapes/RoundedRectangle'
import { Color } from 'core/classes/Color'

export class PascalsTriangle extends Linkable {
	
	cells: Array<Array<TriangleCell>>
	nbFlips: number
	isSplitting: boolean
	leftEdges: Array<Array<TriangleEdge>>
	rightEdges: Array<Array<TriangleEdge>>
	presentationFormsList: RadioButtonList
	presentation: 'stacks' | 'combinations'
	nbFlipsLabels: MGroup
	nbFlipsText: TextLabel
	nbOutcomesLabels: MGroup
	nbOutcomesText: TextLabel
	nbTailsLabels: MGroup
	nbTailsText: TextLabel
	labelsCheckbox: Checkbox
	nbFlipsBox: IntegerInputBox
	splitButton: Polygon

	selectedPath: TrianglePath
	selectedCells: Array<TriangleCell>
	selectedEdges: Array<TriangleEdge>
	animationDuration: number
	pathCoinRow: PathCoinRow
	background: RoundedRectangle

	defaults(): object {
		return {
			cells: [],
			nbFlips: 0,
			presentation: 'stacks',
			isSplitting: false,
			leftEdges: [],
			rightEdges: [],

			inputProperties: [
				{
					name: 'nbFlips',
					displayName: '# flips',
					type: 'number'
				}
			],

			frameWidth: CONTROLS_WIDTH,
			frameHeight: CONTROLS_HEIGHT + CELL_SIZE,

			nbFlipsBox: new IntegerInputBox({
				anchor: [0, 0],
				labelText: '# flips:',
				labelWidth: 48,
				labelGap: 10,
				labelPlacement: 'left',
				inputWidth: 40
			}),

			presentationFormsList: new RadioButtonList({
				anchor: [0, 45],
				options: [
					'tallies',
					'outcomes'
				],
				orientation: 'horizontal',
				optionSpacing: 80
			}),

			labelsCheckbox: new Checkbox({
				anchor: [0, 80],
				text: 'show scales',
				state: false
			}),
			
			splitButton: new Polygon({
				anchor: [(CONTROLS_WIDTH - SPLIT_BUTTON_SIZE) / 2, CONTROLS_HEIGHT + CELL_SIZE + CELL_PADDING],
				vertices: [
					[0, 0],
					[SPLIT_BUTTON_SIZE, 0],
					[SPLIT_BUTTON_SIZE / 2, SPLIT_BUTTON_SIZE / 4]
				],
				strokeWidth: 0,
				fillOpacity: 0.35,
				screenEventHandler: ScreenEventHandler.Self
			}),

			selectedPath: new TrianglePath(),
			selectedCells: [],
			selectedEdges: [],
			pathCoinRow: new PathCoinRow(),

			nbFlipsLabels: new MGroup(),
			nbFlipsText: new TextLabel({
				text: '# flips',
				frameWidth: 50,
				frameHeight: 25,
				transform: new Transform({
					angle: TAU / 6,
					shift: [-CELL_SIZE / 2, CONTROLS_HEIGHT + CELL_SIZE]
				})
			}),

			nbOutcomesLabels: new MGroup(),
			nbOutcomesText: new TextLabel({
				text: '# outcomes',
				frameWidth: 100,
				frameHeight: 25,
				transform: new Transform({
					angle: -TAU / 6,
					shift: [3 * CELL_SIZE, CONTROLS_HEIGHT]
				})
			}),

			nbTailsLabels: new MGroup({
				anchor: [-20, CONTROLS_HEIGHT + CELL_SIZE + CELL_PADDING + 20],
				frameWidth: 25
			}),
			nbTailsText: new TextLabel({
				text: '# tails',
				frameWidth: 100,
				frameHeight: 25,
			}),

			background: new RoundedRectangle({
				fillColor: Color.black(),
				strokeWidth: 0,
			})
		}
	}

	setup() {
		super.setup()
		let N = this.nbFlips
		this.nbFlips = 0

		this.background.update({
			width: CONTROLS_WIDTH,
			height: CONTROLS_HEIGHT + CELL_SIZE + 50
		})
		this.add(this.background)
		this.moveToBack(this.background)

		let baseCell = new TriangleCell({
			nbHeads: 0,
			nbTails: 0,
			presentation: this.presentation
		})
		baseCell.update({
			anchor: [(CONTROLS_WIDTH - CELL_SIZE) / 2, CONTROLS_HEIGHT]
		})
		this.cells.push([baseCell])
		this.add(baseCell)
		this.presentationFormsList.action = this.switchPresentation.bind(this)
		this.presentationFormsList.update({
			selectedButton: this.presentationFormsList.radioButtons[0]
		})
		this.controls.add(this.presentationFormsList)

		this.nbFlipsLabels.add(this.nbFlipsText)
		this.createNewNbFlipsLabel()
		this.add(this.nbFlipsLabels)
		this.nbFlipsLabels.hide()

		this.nbTailsLabels.add(this.nbTailsText)
		this.createNewNbTailsLabel()
		this.add(this.nbTailsLabels)
		this.nbTailsLabels.hide()

		this.nbOutcomesLabels.add(this.nbOutcomesText)
		this.createNewnbOutcomesLabel()
		this.add(this.nbOutcomesLabels)
		this.nbOutcomesLabels.hide()

		for (let i = 0; i < N; i++) {
			this.split()
		}

		this.pathCoinRow.update({
			triangle: this
		})
		this.add(this.pathCoinRow)

		this.controls.add(this.labelsCheckbox)
		this.labelsCheckbox.onToggle = this.toggleLabels.bind(this)

		this.nbFlipsBox.update({
			value: this.nbFlips
		})
		this.nbFlipsBox.addDependency('value', this, 'nbFlips')
		this.controls.add(this.nbFlipsBox)

		this.splitButton.onTap = this.splitFromButton.bind(this)
		this.splitButton.update({
			anchor: [(CONTROLS_WIDTH - SPLIT_BUTTON_SIZE) / 2, CONTROLS_HEIGHT + (this.nbFlips + 1) * (CELL_SIZE + CELL_PADDING)],
		})
		this.add(this.splitButton)
	}

	splitFromButton() {
		this.nbFlipsBox.inputElement.value = (this.nbFlips + 1).toString()
		this.split(SLOW_CELL_ANIMATION_DURATION)
	}

	split(animationDuration: number = 0) {
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

		this.pathCoinRow.animate({
			anchor: [PATH_COIN_ROW_HORIZONTAL_OFFSET + (CELL_SIZE + CELL_PADDING) * this.nbFlips * 0.5 + 40, CONTROLS_HEIGHT + 10]
		}, animationDuration)

		this.splitButton.animate({
			anchor: vertexAdd(this.splitButton.anchor, [0, CELL_SIZE + CELL_PADDING])
		}, animationDuration)

		this.nbTailsLabels.animate({
			anchor: vertexAdd(this.nbTailsLabels.anchor, [-0.5 * (CELL_SIZE + CELL_PADDING), CELL_SIZE + CELL_PADDING])
		}, animationDuration)

		let newBGWidth =  Math.max(CONTROLS_WIDTH, (this.nbFlips + 2) * (CELL_SIZE + CELL_PADDING) + 20) + 150
		this.background.animate({
			width: newBGWidth,
			height: CONTROLS_HEIGHT + (this.nbFlips + 2) * (CELL_SIZE + CELL_PADDING) + 50,
			anchor: [(CONTROLS_WIDTH - newBGWidth) / 2, 0]
		}, animationDuration)

		if (animationDuration == 0) {
			this.endSplitting()
		}
	}

	unsplitFromInputBox() {
		this.nbFlipsBox.inputElement.value = (this.nbFlips - 1).toString()
		this.unsplit()
	}

	unsplit() {
		for (let cell of this.cells[this.nbFlips]) {
			this.remove(cell)
		}
		this.cells.pop()

		for (let edge of this.leftEdges[this.nbFlips - 1]) {
			this.remove(edge)
		}
		this.leftEdges.pop()

		for (let edge of this.rightEdges[this.nbFlips - 1]) {
			this.remove(edge)
		}
		this.rightEdges.pop()

		this.presentationFormsList.update({
			anchor: vertexSubtract(this.presentationFormsList.anchor, [0, CELL_SIZE + CELL_PADDING])
		})
		this.labelsCheckbox.update({
			anchor: vertexSubtract(this.labelsCheckbox.anchor, [0, CELL_SIZE + CELL_PADDING])
		})
		this.nbTailsLabels.update({
			anchor: [this.nbTailsLabels.anchor[0] + 0.5 * (CELL_SIZE + CELL_PADDING), this.nbTailsLabels.anchor[1] - CELL_SIZE - CELL_PADDING]
		})
		this.nbTailsLabels.remove(this.nbTailsLabels.children[this.nbTailsLabels.children.length - 1])
		this.nbFlipsLabels.remove(this.nbFlipsLabels.children[this.nbFlipsLabels.children.length - 1])
		this.nbOutcomesLabels.remove(this.nbOutcomesLabels.children[this.nbOutcomesLabels.children.length - 1])
		this.nbFlips--

		if (this.selectedPath.length > this.nbFlips) {
			this.popFromPath()
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

	createNewNbTailsLabel() {
		let labelAnchor = [this.nbFlips * (CELL_SIZE + CELL_PADDING) + 85, 0]
		let newNbTailsLabel = new TextLabel({
			frameWidth: CELL_SIZE,
			frameHeight: 25,
			text: `${this.nbFlips}`,
			anchor: labelAnchor
		})
		this.nbTailsLabels.add(newNbTailsLabel)
	}

	createNewnbOutcomesLabel() {
		let labelAnchor = vertexAdd(
			this.cells[this.nbFlips][this.nbFlips].anchor,
			[CELL_SIZE, 0]
		)
		let newnbOutcomesLabel = new TextLabel({
			frameWidth: CELL_SIZE,
			frameHeight: CELL_SIZE,
			text: `${2 ** this.nbFlips}`,
			anchor: labelAnchor
		})
		this.nbOutcomesLabels.add(newnbOutcomesLabel)
	}

	endSplitting() {
		this.update({
			isSplitting: false,
			nbFlips: this.nbFlips + 1
		})
		this.createNewNbFlipsLabel()
		this.createNewNbTailsLabel()
		this.createNewnbOutcomesLabel()
	}

	switchPresentation() {
		let i = this.presentationFormsList.radioButtons.indexOf(this.presentationFormsList.selectedButton)
		let newPresentation = (i == 0) ? 'stacks' : 'combinations'
		if (newPresentation == this.presentation) { return }
		if (newPresentation == 'stacks') {
			this.showHTLabels(FAST_CELL_ANIMATION_DURATION)
		} else if (newPresentation == 'combinations') {
			this.showCombinationsLabels(FAST_CELL_ANIMATION_DURATION)
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
		let x = p[0] - this.cells[0][0].anchor[0] - CELL_SIZE / 2
		let y = p[1] - this.cells[0][0].anchor[1]
		let n = Math.floor(y / (CELL_SIZE + CELL_PADDING))
		let k = Math.round((x / (CELL_SIZE + CELL_PADDING) + n / 2))
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

	clearPath() {
		this.clipPathToLevel(0)
		this.selectedCells.pop()
		this.cells[0][0].unhighlight()
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
		if (n < 0) { return }
		if (k < 0 || k > n) { return }
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
		} else {
			if (n != 0 || k != 0) {
				this.clearPath()
			}
		}
	}

	onPointerMove(e: ScreenEvent) {
		let p = this.sensor.localEventVertex(e)
		let [n, k] = this.triangleIndex(p)
		if (n < 0) { return }
		if (k < 0 || k > n) { return }
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

	toggleLabels() {
		let visible = this.labelsCheckbox.state
		this.nbFlipsLabels.view.setVisibility(visible)
		this.nbOutcomesLabels.view.setVisibility(visible)
		this.nbTailsLabels.view.setVisibility(visible)
	}

	update(args: object = {}, redraw: boolean = true) {
		if (args['nbFlips'] !== undefined) {
			let newNbFlips = args['nbFlips']
			if (newNbFlips > this.nbFlips) {
				for (let n = this.nbFlips; n < newNbFlips; n++) {
					this.split()
				}
			} else {
				for (let n = this.nbFlips; n > newNbFlips; n--) {
					this.unsplit()
				}
			}
		}
		super.update(args, redraw)

	}







}
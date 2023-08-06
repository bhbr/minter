import { Vertex } from '../../helpers/Vertex_Transform'
import { PointerEventPolicy, LocatedEvent, pointerEventVertex } from '../pointer_events'
import { Mobject } from '../Mobject'
import { MGroup } from '../MGroup'
import { LinkHook } from './LinkHook'
import { LinkLine } from './LinkLine'
import { IOList } from './IOList'
import { Circle } from '../../shapes/Circle'
import { SNAPPING_DISTANCE } from './constants'

export class DependencyMap extends MGroup {

	linkLines: Array<LinkLine>
	editedLinkLine: LinkLine
	pointerUpVertex: Vertex
	startMobject: Mobject
	mobject: Mobject

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			linkLines: []
		})
	}

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			pointerEventPolicy: PointerEventPolicy.HandleYourself
		})
	}

	selfHandlePointerDown(e: LocatedEvent) {
		let t: Mobject = this.eventTargetMobject(e).eventTargetMobject(e).eventTargetMobject(e)
		// find a better way to handle this!
		if (t instanceof LinkHook) {
			let tl = t as LinkHook
			let llStart = tl.center(this)
			this.editedLinkLine = new LinkLine({
				startPoint: llStart,
				source: tl.mobject,
				inputName: t.outputName,
				startHook: tl,
				superMobject: this.superMobject
			})
			this.add(this.editedLinkLine)
			this.startMobject = tl.mobject
		}
	}

	selfHandlePointerMove(e: LocatedEvent) {
		if (this.editedLinkLine == undefined) { return }
		let p = pointerEventVertex(e)
		this.editedLinkLine.updateFromTip(this.snapInput(p))
	}


	selfHandlePointerUp(e: LocatedEvent) {
		let line: LinkLine = this.editedLinkLine
		let tcircle: any = this.eventTargetMobject(e).eventTargetMobject(e).eventTargetMobject(e)

		let tl: LinkHook = null
		if (tcircle.constructor.name == 'Circle') {
			// actually this is the Circle that we dragged, not the LinkBullet we snapped it to
			for (let iol of this.children) {
				if (!(iol instanceof IOList)) { continue }
				for (let b of iol.inputList.children) {
					if (!(b instanceof LinkHook)) { continue }
					let bc = b.center(this.parent)
					let tc = (tcircle as Circle).center(this.parent)
					if (bc.x == tc.x && bc.y == tc.y) {
						tl = b
						break
					}
				}
			}
		} else {
			tl = tcircle as LinkHook
		}

		line.target = tl.mobject
		line.endHook = tl
		line.dissolveInto(this)
		this.linkLines.push(line)

		this.editedLinkLine = undefined
		this.pointerUpVertex = pointerEventVertex(e)
	}

	snapInput(p: Vertex): Vertex {
		for (let [loc, mobject, inputName] of this.inputLocations()) {
			if (p.closeTo(loc, SNAPPING_DISTANCE)) { return loc }
		}
		return p
	}


	snapOutput(p: Vertex): Vertex {
		for (let [loc, mobject, outputName] of this.outputLocations()) {
			if (p.closeTo(loc, SNAPPING_DISTANCE)) { return loc }
		}
		return p
	}

	inputLocations(): Array<Array<any>> {
		let arr: Array<Array<any>> = []
		for (let ioList of this.children) {
			if (!(ioList instanceof IOList)) { continue }
			let dict = ioList.inputList.hookLocationDict
			for (let inputName of Object.keys(dict)) {
				let loc = ioList.inputList.relativeTransform(this).appliedTo(dict[inputName])
				arr.push([loc, ioList.mobject, inputName])
			}
		}
		return arr
	}

	outputLocations(): Array<Array<any>> {
		let arr: Array<Array<any>> = []
		for (let ioList of this.children) {
			if (!(ioList instanceof IOList)) { continue }
			let dict = ioList.outputList.hookLocationDict
			for (let outputName of Object.keys(dict)) {
				let loc = ioList.outputList.relativeTransform(this).appliedTo(dict[outputName])
				arr.push([loc, ioList.mobject, outputName])
			}
		}
		return arr
	}

	getInputFromVertex(p: Vertex): [Mobject, string] {
		for (let [loc, mobject, inputName] of this.inputLocations()) {
			if (p.closeTo(loc, SNAPPING_DISTANCE)) { return [mobject, inputName] }
		}
		return [null, null]
	}

	getOutputFromVertex(p: Vertex): [Mobject, string] {
		for (let [loc, mobject, outputName] of this.outputLocations()) {
			if (p.closeTo(loc, SNAPPING_DISTANCE)) { return [mobject, outputName] }
		}
		return [null, null]
	}

	fixLinkLine(argsDict: object) {
		let p: Vertex = argsDict['fromPoint']
		let q: Vertex = argsDict['toPoint']
		let [source, outputName] = this.getOutputFromVertex(p)
		let [target, inputName] = this.getInputFromVertex(q)
		if (source == null || target == null) {
			this.remove(this.editedLinkLine)
			return
		}
		source.addDependency(outputName, target, inputName)
		source.update()

	}

	updateModel(argsDict: object = {}) {
		for (let line of this.linkLines) {
			line.startBullet.updateModel({
				midpoint: line.startHook.center(this)
			})
			line.endBullet.updateModel({
				midpoint: line.endHook.center(this)
			})
		}
		super.updateModel(argsDict)
	}

}
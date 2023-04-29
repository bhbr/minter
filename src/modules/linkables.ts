import { Vertex } from './vertex-transform'
import { Mobject, MGroup } from './mobject'
import { VMobject } from './vmobject'
import { TextLabel } from './textlabel'
import { Dependency } from './dependency'
import { Color } from './color'
import { Circle, RoundedRectangle } from './shapes'
import { pointerEventVertex, LocatedEvent, paperLog, EventHandlingMode } from './helpers'
import { CreatedMobject } from './creating'
import { Segment } from './arrows'
import { CindyCanvas } from './cindycanvas'

const BULLET_SIZE: number = 10
const SNAPPING_DISTANCE: number = 10

export class LinkHook extends Circle {

	mobject: Mobject
	inputName: string
	outputName: string

	readonly _radius = BULLET_SIZE
	readonly fillOpacity = 0
	readonly strokeColor = Color.white()

	constructor(args = {}, superCall = false) {
		super({}, true)
		if (!superCall) {
			this.setup()
			this.update(args)
		}
	}

}


export class InputList extends RoundedRectangle {

	listInputNames: Array<string> = []
	hookLocationDict = {}
	readonly cornerRadius = 20
	readonly fillColor = Color.white()
	readonly fillOpacity = 0.2
	readonly strokeWidth = 0
	width = 150
	mobject: Mobject

	constructor(args = {}, superCall = false) {
		super({}, true)
		if (!superCall) {
			this.setup()
			this.update(args)
		}
	}

	setup() {
		super.setup()
		this.createHookList()
		//this.update({ height: this.getHeight() }, false)
	}

	createHookList() {
		for (let i = 0; i < this.listInputNames.length; i++) {
			let name = this.listInputNames[i]
			let c = new LinkHook({mobject: this.mobject, inputName: name})
			let t = new TextLabel({
				text: name,
				horizontalAlign: 'left',
				verticalAlign: 'center',
				viewHeight: 20,
				viewWidth: 100
			})
			this.add(c)
			this.add(t)
			c.update({ anchor: new Vertex([15, -10 + 25 * (i + 1)]) })
			t.update({ anchor: c.anchor.translatedBy(25, 0) })
			this.hookLocationDict[name] = c.parent.localPointRelativeTo(c.midpoint, t.getPaper())
		}
	}

	getHeight(): number {
		if (this.listInputNames == undefined) { return 0 }
		if (this.listInputNames.length == 0) { return 0 }
		else { return 40 + 25 * this.listInputNames.length }
	}

	updateSelf(args = {}, redraw = true) {
		args['height'] = this.getHeight()
		super.updateSelf(args, redraw)
	}
}



export class OutputList extends RoundedRectangle {

	listOutputNames: Array<string> = []
	hookLocationDict = {}
	readonly cornerRadius = 20
	readonly fillColor = Color.white()
	readonly fillOpacity = 0.3
	readonly strokeWidth = 0
	readonly width = 150
	mobject: Mobject

	constructor(args = {}, superCall = false) {
		super({}, true)
		if (!superCall) {
			this.setup()
			this.update(args)
		}
	}

	setup() {
		super.setup()
		this.createHookList()
		//this.update({ height: this.getHeight() }, false)
	}

	getHeight(): number {
		if (this.listOutputNames == undefined) { return 0 }
		if (this.listOutputNames.length == 0) { return 0 }
		else {
			return 40 + 25 * this.listOutputNames.length
		}
	}

	createHookList() {
		for (let i = 0; i < this.listOutputNames.length; i++) {
			let name = this.listOutputNames[i]
			let c = new LinkHook({mobject: this.mobject, outputName: name})
			let t = new TextLabel({
				text: name,
				horizontalAlign: 'left',
				verticalAlign: 'center',
				viewHeight: 20,
				viewWidth: 100
			})
			this.hookLocationDict[name] = c.anchor
			this.add(c)
			this.add(t)
			c.update({ anchor: new Vertex([15, -10 + 25 * (i + 1)]) })
			t.update({ anchor: c.anchor.translatedBy(25, 0) })
			this.hookLocationDict[name] = c.parent.localPointRelativeTo(c.midpoint, t.getPaper())
		}
	}

	updateSelf(args = {}, redraw = true) {
		args['height'] = this.getHeight()
		super.updateSelf(args,redraw)
	}

}

export class IOList extends MGroup {

	inputList = new InputList()
	outputList = new OutputList()
	listInputNames: Array<string> = []
	listOutputNames: Array<string> = []
	mobject: Mobject

	constructor(args = {}, superCall = false) {
		super({}, true)
		if (!superCall) {
			this.setup()
			this.update(args)
		}
	}

	setup() {
		super.setup()
		this.inputList.listInputNames = this.listInputNames
		this.outputList.listOutputNames = this.listOutputNames
		this.inputList.mobject = this.mobject
		this.outputList.mobject = this.mobject
		this.inputList.setup()  // rework this
		this.outputList.setup() // rework this
		this.add(this.inputList)
		this.add(this.outputList)
	}

	updateSelf(args = {}, redraw) {
		super.updateSelf(args, redraw)
		this.inputList.update(args, false)  // will get redrawn when shown
		this.outputList.update(args, false) // will get redrawn when shown
	}
}

export class DependencyMap extends MGroup {

	linkLines: Array<LinkLine> = []
	editedLinkLine?: LinkLine = null
	pointerUpVertex?: Vertex = null
	startMobject?: Mobject = null
	mobject: Mobject
	readonly interactive = true
	eventHandlingMode: EventHandlingMode = "self"

	constructor(args = {}, superCall = false) {
		super({}, true)
		if (!superCall) {
			this.setup()
			this.update(args)
		}
	}

	selfHandlePointerDown(e: LocatedEvent) {
		let t: Mobject = this.lowestTargetedMobject(e)
		if (!(t instanceof LinkHook)) { return }

		let tl = t as LinkHook
		let llStart = tl.relativeCenter(this)
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

	selfHandlePointerMove(e: LocatedEvent) {
		if (this.editedLinkLine == undefined) { return }
		let p = pointerEventVertex(e)
		this.editedLinkLine.updateFromTip(this.snapInput(p))
	}

	selfHandlePointerUp(e: LocatedEvent) {
		let line: LinkLine = this.editedLinkLine
		let tcircle: any = this.lowestTargetedMobject(e)

		let tl: LinkHook = null
		if (tcircle.constructor.name == 'Circle') {
			// actually this is the Circle that we dragged, not the LinkBullet we snapped it to
			for (let iol of this.children) {
				if (!(iol instanceof IOList)) { continue }
				for (let b of iol.inputList.children) {
					if (!(b instanceof LinkHook)) { continue }
					let bc = b.relativeCenter(this.parent)
					let tc = (tcircle as Circle).relativeCenter(this.parent)
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
				let loc = ioList.inputList.transformRelativeTo(this).appliedTo(dict[inputName])
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
				let loc = ioList.outputList.transformRelativeTo(this).appliedTo(dict[outputName])
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

	fixLinkLine(args: object) {
		let p: Vertex = args['fromPoint']
		let q: Vertex = args['toPoint']
		let [source, outputName] = this.getOutputFromVertex(p)
		let [target, inputName] = this.getInputFromVertex(q)
		if (source == null || target == null) {
			this.remove(this.editedLinkLine)
			return
		}
		source.addDependency(outputName, target, inputName)
		source.update()

	}

	updateSelf(args = {}, redraw = true) {
		for (let line of this.linkLines) {
			line.startBullet.update({
				midpoint: line.startHook.relativeCenter(this)
			}, false) // will get redrawn when shown
			line.endBullet.update({
				midpoint: line.endHook.relativeCenter(this)
			}, false) // will get redrawn when shown
		}
		super.updateSelf(args, redraw)
	}

}


export class LinkLine extends CreatedMobject {

	startBullet = new Circle({
		radius: BULLET_SIZE - 4,
		fillOpacity: 1
	})
	endBullet = new Circle({
		radius: BULLET_SIZE - 4,
		fillOpacity: 1
	})
	startHook: LinkHook
	endHook?: LinkHook
	line = new Segment({
		strokeWidth: 5
	})
	source: LinkableMobject
	inputName: string
	target: Mobject

	constructor(args = {}, superCall = false) {
		super({}, true)
		if (!superCall) {
			this.setup()
			this.update(args)
		}
	}

	setup() {
		super.setup()
		this.add(this.startBullet)
		this.add(this.line)
		this.add(this.endBullet)

		// shouldn't the following be in updateSelf?
		this.startBullet.update({
			midpoint: this.startPoint
		}, false)
		this.line.update({
			startPoint: this.startPoint,
			endPoint: this.startPoint.copy()
		})
		this.endBullet.update({
			midpoint: this.endPoint
		})
	}

	dissolveInto(superMobject: Mobject) {
		(superMobject as DependencyMap).fixLinkLine({
			fromPoint: this.startPoint,
			toPoint: this.endPoint
		})
		paperLog('dissolving LinkLine')

		//super.dissolveInto(superMobject)
	}

	updateFromTip(q: Vertex) {
		this.endBullet.update({midpoint: q})
		this.line.update({endPoint: q})
		this.update() // why does this not work?
		this.endBullet.update()
		this.line.update()
		this.update({endPoint: q})
	}

	updateSelf(args = {}, redraw) {
		if (this.startHook != undefined && this.startBullet != undefined) {
			this.startBullet.centerAt(this.startHook.relativeCenter(this.superMobject), this.superMobject)
		}

		if (this.endHook != undefined && this.endBullet != undefined) {
			this.endBullet.centerAt(this.endHook.relativeCenter(this.superMobject), this.superMobject)
		}
		if (this.line != undefined && this.startHook != undefined && this.endHook != undefined) {
			this.line.updateSelf({
				startPoint: this.startHook.relativeCenter(this.superMobject),
				endPoint: this.endHook.relativeCenter(this.superMobject)
			})
		}
		super.updateSelf(args, redraw)
	}
}


export class LinkableMobject extends Mobject {

	inputNames: Array<string> = []
	outputNames: Array<string> = []
	dependencyMap: DependencyMap
	cindys: Array<CindyCanvas>

	constructor(args = {}, superCall = false) {
		super({}, true)
		if (!superCall) {
			this.setup()
			this.update(args)
		}
	}

	dependenciesBetweenChildren(): Array<Dependency> {
		let deps: Array<Dependency> = []
		for (let submob of this.children) {
			deps.push(...submob.dependencies)
		}
		return deps
	}

	showLinksOfSubmobs() {
		if (this.dependencyMap) {
			this.dependencyMap.show()
			return
		}
		this.dependencyMap = new DependencyMap({ superMobject: this })
		this.dependencyMap.mobject = this
		this.add(this.dependencyMap)
		for (let submob of this.children) {
			this.createIOListForMobject(submob)
		}
	}

	createIOListForMobject(submob: Mobject) {
		if (submob == this.dependencyMap) { return }
		if (!(submob instanceof LinkableMobject)) { return }
		if (submob.inputNames.length == 0 && submob.outputNames.length == 0) { return }
		let ioList = new IOList({
			mobject: submob,
			listInputNames: submob.inputNames,
			listOutputNames: submob.outputNames,
		})
		this.dependencyMap.add(ioList)
		let p1: Vertex = ioList.inputList.relativeBottomCenter(this)
		let p2: Vertex = submob.relativeTopCenter(this)
		ioList.inputList.update({ anchor: ioList.inputList.anchor.translatedBy(p2[0] - p1[0], p2[1] - p1[1] - 10)})
	 	let p3: Vertex = ioList.outputList.relativeTopCenter(this)
		let p4: Vertex = submob.relativeBottomCenter(this)
		ioList.outputList.update({ anchor: ioList.outputList.anchor.translatedBy(p4[0] - p3[0], p4[1] - p3[1] + 10)})
		ioList.update()
	}

	hideLinksOfSubmobs() {
		this.dependencyMap.hide()
	}

	updateIOList() {
		if (this.dependencyMap == undefined) { return }
		for (let submob of this.children) {
			var alreadyLinked = false
			for (let ioList of this.dependencyMap.children) {
				if (!(ioList instanceof IOList)) { continue }
				if (ioList.mobject == submob) { alreadyLinked = true }
			}
			if (!alreadyLinked) {
				this.createIOListForMobject(submob)
			}
		}
	}

	updateSelf(args = {}, redraw = true) {
		super.updateSelf(args ,redraw)
		this.updateIOList()
	}
}






















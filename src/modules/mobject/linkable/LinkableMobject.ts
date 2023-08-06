import { Vertex } from '../../helpers/Vertex_Transform'
import { Mobject } from '../Mobject'
import { VMobject } from '../VMobject'
import { MGroup } from '../MGroup'
import { TextLabel } from '../../TextLabel'
import { Dependency } from '../Dependency'
import { Color } from '../../helpers/color'
import { Circle } from '../../shapes/Circle'
import { RoundedRectangle } from '../../shapes/RoundedRectangle'
import { pointerEventVertex, LocatedEvent, PointerEventPolicy } from '../pointer_events'
import { paperLog } from '../../helpers/helpers'
import { CreatedMobject } from '../../creations/CreatedMobject'
import { Segment } from '../..//arrows/Segment'
import { CindyCanvas } from '../../cindy/CindyCanvas'
import { DependencyMap } from './DependencyMap'
import { IOList } from './IOList'

export class LinkableMobject extends Mobject {

	inputNames: Array<string>
	outputNames: Array<string>
	dependencyMap: DependencyMap
	cindys: Array<CindyCanvas> // remove?

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			inputNames: [],  // linkable parameters
			outputNames: [], // linkable parameters
		})
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
		let p1: Vertex = ioList.inputList.bottomCenter(this)
		let p2: Vertex = submob.topCenter(this)
		ioList.inputList.update({ anchor: ioList.inputList.anchor.translatedBy(p2[0] - p1[0], p2[1] - p1[1] - 10)})
	 	let p3: Vertex = ioList.outputList.topCenter(this)
		let p4: Vertex = submob.bottomCenter(this)
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

	updateModel(argsDict: object = {}) {
		super.updateModel(argsDict)
		this.updateIOList()
	}
}






















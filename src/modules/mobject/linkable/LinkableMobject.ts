import { Vertex } from '../../helpers/Vertex'
import { ExpandableMobject } from '../expandable/ExpandableMobject'
import { Mobject } from '../Mobject'
import { VMobject } from '../VMobject'
import { MGroup } from '../MGroup'
import { TextLabel } from '../../TextLabel'
import { Dependency } from '../Dependency'
import { Color } from '../../helpers/Color'
import { Circle } from '../../shapes/Circle'
import { RoundedRectangle } from '../../shapes/RoundedRectangle'
import { ScreenEvent, ScreenEventHandler } from '../screen_events'
import { log } from '../../helpers/helpers'
import { CreatingMobject } from '../../creations/CreatingMobject'
import { Segment } from '../../arrows/Segment'
import { CindyCanvas } from '../../cindy/CindyCanvas'
import { InputList } from './InputList'
import { OutputList } from './OutputList'
import { LinkHook } from './LinkHook'

export class LinkableMobject extends Mobject {

	inputNames: Array<string>
	outputNames: Array<string>
	inputList: InputList
	outputList: OutputList

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			inputNames: [],  // linkable parameters
			outputNames: [], // linkable parameters
			screenEventHandler: ScreenEventHandler.Self
		})
	}

	get parent(): ExpandableMobject {
		return super.parent as ExpandableMobject
	}
	set parent(newValue: ExpandableMobject) {
		super.parent = newValue
	}

	statefulSetup() {
		super.statefulSetup()
		this.inputList = new InputList({
			mobject: this,
			inputNames: this.inputNames
		})
		this.add(this.inputList)
		this.inputList.hide()
		this.outputList = new OutputList({
			mobject: this,
			outputNames: this.outputNames
		})
		this.add(this.outputList)
		this.outputList.hide()
	}

	showLinks() {
		this.inputList.show()
		this.outputList.show()
	}

	hideLinks() {
		this.inputList.hide()
		this.outputList.hide()
	}

	inputHooks(): Array<LinkHook> {
		let arr: Array<LinkHook> = []
		for (let inputName of this.inputNames) {
			arr.push(this.inputList.hookNamed(inputName))
		}
		return arr
	}

	outputHooks(): Array<LinkHook> {
		let arr: Array<LinkHook> = []
		for (let outputName of this.outputNames) {
			arr.push(this.outputList.hookNamed(outputName))
		}
		return arr
	}

	dragging(e: ScreenEvent) {
		super.dragging(e)
		this.parent.linkMap.update()
	}

}






















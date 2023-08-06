import { Vertex } from '../../helpers/Vertex_Transform'
import { CreatedMobject } from '../../creations/CreatedMobject'
import { Circle } from '../../shapes/Circle'
import { LinkHook } from './LinkHook'
import { Segment } from '../../arrows/Segment'
import { LinkableMobject } from './LinkableMobject'
import { Mobject } from '../Mobject'
import { DependencyMap } from './DependencyMap'
import { paperLog } from '../../helpers/helpers'
import { BULLET_SIZE } from './constants'

export class LinkLine extends CreatedMobject {

	startBullet: Circle
	endBullet: Circle
	startHook: LinkHook
	endHook?: LinkHook
	line: Segment
	source: LinkableMobject
	inputName: string
	target: Mobject

	statelessSetup() {
		super.statelessSetup()
		this.startBullet = new Circle({
			radius: BULLET_SIZE - 4,
			fillOpacity: 1
		})
		this.line = new Segment({
			strokeWidth: 5
		})
		this.endBullet = new Circle({
			radius: BULLET_SIZE - 4,
			fillOpacity: 1
		})
	}

	statefulSetup() {
		super.statefulSetup()
		this.add(this.startBullet)
		this.add(this.line)
		this.add(this.endBullet)
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

	updateModel(argsDict: object = {}) {
		if (this.startHook != undefined && this.startBullet != undefined) {
			this.startBullet.centerAt(this.startHook.center(this.superMobject), this.superMobject)
		}

		if (this.endHook != undefined && this.endBullet != undefined) {
			this.endBullet.centerAt(this.endHook.center(this.superMobject), this.superMobject)
		}
		if (this.line != undefined && this.startHook != undefined && this.endHook != undefined) {
			this.line.updateModel({
				startPoint: this.startHook.center(this.superMobject),
				endPoint: this.endHook.center(this.superMobject)
			})
		}
		super.updateModel(argsDict)
	}
}
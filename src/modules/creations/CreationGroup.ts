import { Vertex } from '../helpers/Vertex_Transform'
import { Color } from '../helpers/Color'
import { Paper } from '../../Paper'
import { CreatedMobject } from './CreatedMobject'
import { Freehand } from './Freehand'
import { DrawnSegment } from './DrawnSegment'
import { DrawnRay } from './DrawnRay'
import { DrawnLine } from './DrawnLine'
import { DrawnCircle } from './DrawnCircle'
import { DrawnRectangle } from '../cindy/DrawnRectangle'
import { LinkableMobject } from '../mobject/linkable/LinkableMobject'
import { CreatedPendulum } from '../pendulum/CreatedPendulum'
import { CreatedBoxSlider } from '../slider/CreatedBoxSlider'

export class CreationGroup extends CreatedMobject {

	creations: object
	visibleCreation: string = 'freehand'
	drawFreehand: boolean = true
	penColor: Color


	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			penColor: Color.white(),
			startPoint: Vertex.origin()
		})
	}

	statelessSetup() {
		super.statelessSetup()
		this.creations = { }
	}

	statefulSetup() {
		super.statefulSetup()
		this.creations['freehand'] = new Freehand()
		this.creations['segment'] = new DrawnSegment({ startPoint: this.startPoint })
		this.creations['ray'] = new DrawnRay({ startPoint: this.startPoint })
		this.creations['line'] = new DrawnLine({ startPoint: this.startPoint })
		this.creations['circle'] = new DrawnCircle({ startPoint: this.startPoint })
		this.creations['cindy'] = new DrawnRectangle({ startPoint: this.startPoint })
		this.creations['slider'] = new CreatedBoxSlider({ startPoint: this.startPoint })
		this.creations['pendulum'] = new CreatedPendulum({ startPoint: this.startPoint })

		for (let mob of Object.values(this.creations)) {
			this.addDependency('penColor', mob, 'penStrokeColor')
			this.addDependency('penColor', mob, 'penFillColor')
			mob.update()
		}

		this.setVisibleCreation(this.visibleCreation)
		for (let creation of Object.values(this.creations)) {
			this.add(creation)
		}

	}

	updateFromTip(q: Vertex) {
		for (let creation of Object.values(this.creations)) {
			creation.updateFromTip(q)
		}
	}

	setVisibleCreation(visibleCreation: string) {
		for (let mob of Object.values(this.creations)) {
			mob.hide()
		}
		this.visibleCreation = visibleCreation
		if (!(visibleCreation == 'freehand' && !this.drawFreehand)) {
			this.creations[visibleCreation].show()
		}

		if (visibleCreation == 'cindy') {
			this.creations[visibleCreation].strokeColor = Color.white()
		}
	}

	dissolveInto(paper: Paper) {
		paper.remove(this)
		this.creations[this.visibleCreation].dissolveInto(paper)
		paper.updateIOList()
	}

	updateModel(argsDict: object = {}) {
		super.updateModel(argsDict)
		if (this.creations == undefined) { return }
		let sc = argsDict['strokeColor']
		if (sc != undefined) {
			for (let mob of Object.values(this.creations)) {
				mob.updateModel({ strokeColor: sc })
			}
		}
		let fc = argsDict['fillColor']
		if (fc != undefined) {
			for (let mob of Object.values(this.creations)) {
				mob.updateModel({ fillColor: fc })
			}
		}
	}















}

import { CreatedMobject, Freehand, DrawnSegment, DrawnRay, DrawnLine, DrawnCircle } from './creating'
import { DrawnRectangle } from './cindycanvas'
import { CreatedBoxSlider } from './createdslider'
import { LinkableMobject } from './linkables'
import { CreatedPendulum } from './pendulum'
import { Vertex } from './vertex-transform'
import { Color } from './color'
import { Paper } from '../paper'

export class CreationGroup extends CreatedMobject {

	creations: object
	visibleCreation: string = 'freehand'
	drawFreehand: boolean = true
	penColor: Color
	penTip?: Vertex


	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			penColor: Color.white(),
			startPoint: Vertex.origin(),
			penTip: null
		})
	}

	statelessSetup() {
		super.statelessSetup()
		this.creations = { }
	}

	statefulSetup() {
		super.statefulSetup()
		this.creations['freehand'] = new Freehand()
		this.creations['segment'] = new DrawnSegment({ startPoint: this.startPoint})
		this.creations['ray'] = new DrawnRay({startPoint: this.startPoint})
		this.creations['line'] = new DrawnLine({startPoint: this.startPoint})
		this.creations['circle'] = new DrawnCircle({startPoint: this.startPoint})
		this.creations['cindy'] = new DrawnRectangle({startPoint: this.startPoint})
		this.creations['slider'] = new CreatedBoxSlider({startPoint: this.startPoint})
		this.creations['pendulum'] = new CreatedPendulum({startPoint: this.startPoint})

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
		this.creations['freehand'].updateFromTip(q)
		if (this.visibleCreation != 'freehand') {
			this.creations[this.visibleCreation].updateFromTip(q)
		}
		this.penTip = q

	}

	setVisibleCreation(visibleCreation: string) {
		for (let mob of Object.values(this.creations)) {
			mob.hide()
		}
		this.visibleCreation = visibleCreation
		if (this.penTip) {
			this.creations[this.visibleCreation].updateFromTip(this.penTip)
		}
		if (!(visibleCreation == 'freehand' && !this.drawFreehand)) {
			this.creations[visibleCreation].show()
		}

		// if (visibleCreation == 'cindy') {
		// 	this.creations[visibleCreation].strokeColor = Color.white()
		// }
	}

	dissolveInto(paper: Paper) {
		paper.remove(this)
		this.creations[this.visibleCreation].dissolveInto(paper)
		paper.updateIOList()
		this.penTip = null
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

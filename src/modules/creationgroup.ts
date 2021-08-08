import { CreatedMobject, Freehand, DrawnSegment, DrawnRay, DrawnLine, DrawnCircle } from './creating'
import { DrawnRectangle } from './cindycanvas'
import { CreatedBoxSlider } from './createdslider'
import { LinkableMobject } from './linkables'
import { CreatedPendulum } from './pendulum'
import { Vertex } from './vertex-transform'
import { Color } from './color'
import { Paper } from '../paper'

export class CreationGroup extends CreatedMobject {

	creations = {} // convert into string index signature 
	visibleCreation = 'freehand'
	drawFreehand = true
	penColor = Color.white()
	startPoint = Vertex.origin()
	penTip?: Vertex = null

	constructor(args = {}, superCall = false) {
		super({}, true)
		if (!superCall) {
			this.setup()
			this.update(args)
		}
	}
	
	setup() {
		super.setup()
		this.creations['freehand'] = new Freehand()
		// this.creations['segment'] = new DrawnSegment({ startPoint: this.startPoint})
		// this.creations['ray'] = new DrawnRay({startPoint: this.startPoint})
		// this.creations['line'] = new DrawnLine({startPoint: this.startPoint})
		// this.creations['circle'] = new DrawnCircle({startPoint: this.startPoint})
		// this.creations['cindy'] = new DrawnRectangle({startPoint: this.startPoint})
		// this.creations['slider'] = new CreatedBoxSlider({startPoint: this.startPoint})
		// this.creations['pendulum'] = new CreatedPendulum({startPoint: this.startPoint})

		for (let creation of Object.values(this.creations) as Array<CreatedMobject>) {
			this.add(creation)
			this.addDependency('penColor', creation, 'penStrokeColor')
			this.addDependency('penColor', creation, 'penFillColor')
			creation.update()
		}

		this.setVisibleCreation(this.visibleCreation)

	}

	updateFromTip(q: Vertex) {
		this.creations['freehand'].updateFromTip(q)
		if (this.visibleCreation != 'freehand') {
			this.creations[this.visibleCreation].updateFromTip(q)
		}
		this.penTip = q

	}

	setVisibleCreation(visibleCreation: string) {
		for (let mob of Object.values(this.creations) as Array<CreatedMobject>) {
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

	updateSelf(args: object = {}) {
		super.updateSelf(args)
		if (this.creations == undefined) { return }
		let sc = args['strokeColor']
		if (sc != undefined) {
			for (let mob of Object.values(this.creations) as Array<CreatedMobject>) {
				mob.update({ strokeColor: sc }, false)
			}
		}
		let fc = args['fillColor']
		if (fc != undefined) {
			for (let mob of Object.values(this.creations) as Array<CreatedMobject>) {
				mob.update({ fillColor: fc }, false)
			}
		}
	}















}

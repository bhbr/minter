import { CreatedMobject, Freehand, DrawnSegment, DrawnRay, DrawnLine, DrawnCircle } from './creating'
import { DrawnRectangle } from './cindycanvas'
import { CreatedBoxSlider } from './createdslider'
import { LinkableMobject } from './linkables'
import { Vertex } from './transform'
import { Color } from './mobject'

export class CreationGroup extends CreatedMobject {

	creations: object
	visibleCreation: string = 'freehand'

	constructor(argsDict) {
		super(argsDict)
		this.creations = { }
		this.creations['freehand'] = new Freehand()
		this.creations['segment'] = new DrawnSegment({startPoint: this.startPoint})
		this.creations['ray'] = new DrawnRay({startPoint: this.startPoint})
		this.creations['line'] = new DrawnLine({startPoint: this.startPoint})
		this.creations['circle'] = new DrawnCircle({startPoint: this.startPoint})
		this.creations['cindy'] = new DrawnRectangle({startPoint: this.startPoint})
		this.creations['slider'] = new CreatedBoxSlider({startPoint: this.startPoint})
		this.setVisibleCreation(this.visibleCreation)
		for (let creation of Object.values(this.creations)) {
			this.add(creation)
		}
		this.update(argsDict)

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
		this.creations[visibleCreation].show()

		if (visibleCreation == 'cindy') {
			this.creations[visibleCreation].strokeColor = Color.white()
		}
	}

	dissolveInto(superMobject: LinkableMobject) {
		superMobject.remove(this)
		this.creations[this.visibleCreation].dissolveInto(superMobject)
		superMobject.updateIOList()
	}

















}

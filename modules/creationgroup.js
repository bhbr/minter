import { CreatedMobject, Freehand, DrawnSegment, DrawnRay, DrawnLine, DrawnCircle } from './creating.js'
import { DrawnRectangle } from './cindycanvas.js'
import { CreatedBoxSlider } from './createdslider.js'
import { rgb } from './helpers.js'

export class CreationGroup extends CreatedMobject {

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
		this.update()

	}

	updateFromTip(q) {
		for (let creation of Object.values(this.creations)) {
			creation.updateFromTip(q)
		}
	}

	setVisibleCreation(visibleCreation) {
		for (let mob of Object.values(this.creations)) {
			mob.hide()
		}
		this.visibleCreation = visibleCreation
		this.creations[visibleCreation].show()

		if (visibleCreation == 'cindy') {
			this.creations[visibleCreation].strokeColor = rgb(1, 1, 1)
		}
	}

	dissolveInto(superMobject) {
		superMobject.remove(this)
		this.creations[this.visibleCreation].dissolveInto(superMobject)
		//superMobject.updateIOList()
	}

















}

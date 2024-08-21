import { Vertex } from '../helpers/Vertex'
import { Transform } from '../helpers/Transform'
import { MGroup } from '../mobject/MGroup'
import { Polygon } from '../shapes/Polygon'

export class Arrow extends Polygon {
	startPoint: Vertex
	endPoint: Vertex

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			startPoint: Vertex.origin(),
			endPoint: Vertex.origin()
		})
	}
}


// export class Arrow extends MGroup {

//     constructor(start = Vertex.origin(), end = Vertex.origin()) {
//         super()
//         if (end == null) {
//             this.components = new Vertex(start)
//         } else {
//             this.startPoint = new Vertex(start)
//             this.components = new Vertex(end)
//         }
//         this.stem = new Segment(Vertex.origin(), this.components())
//         this.add(this.stem)
//         this.tip = new Polygon(this.tipPoints())
//         this.add(this.tip)
//     }

//     get startPoint() { return this.anchor }
//     set startPoint(newValue) { this.anchor = new Vertex(newValue) }

//     tipPoints() {
//         let w = new Scaling(-0.2).appliedTo(this.components)
//         let w1 = new Rotation(Math.PI/8).appliedTo(w)
//         let w2 = new Rotation(-Math.PI/8).appliedTo(w)
//         return new Translation(this.components).appliedTo([Vertex.origin(), w1, w2])

//     }

//     get endPoint() {
//         return this.startPoint.translatedBy(this.components)
//     }

//     set endPoint(newValue) {
//         this.components = new Vertex(newValue).subtract(this.startPoint)
//     }

//     redraw() {

//         if (this.view == undefined || this.components == undefined) { return }

//         if (this.visible && this.components.isNaN()) {
//             this.visible = false
//         }
//         if (!this.visible && !this.components.isNaN()) {
//             this.visible = true
//         }

//         if (this.stem != undefined) {
//             this.stem.anchor = Vertex.origin()
//             this.stem.vertices = [Vertex.origin(), this.components]
//         }
//         if (this.tip != undefined) {
//             this.tip.anchor = Vertex.origin()
//             this.tip.vertices = this.tipPoints()
//         }
//         super.redraw()
//     }

//     norm2() { return this.components.norm2() }
//     norm() { return Math.sqrt(this.norm2()) }

// }

// export class Vector extends Arrow {}

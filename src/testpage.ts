import { Vertex, Transform } from './modules/vertex-transform'
import { ExtendedObject } from './modules/extended-object'
import { Mobject } from './modules/mobject'
import { Circle } from './modules/shapes'
import { Color } from './modules/color'

// let f = new Mobject({
// 	anchor: new Vertex(200, 100),
// 	viewWidth: 150,
// 	viewHeight: 50
// })
// f.redraw()

let c = new Circle({
	midPoint: new Vertex(50, 50),
	radius: 60,
	fillColor: Color.green(),
	fillOpacity: 1,
	strokeColor: Color.red()
})
c.redraw()

document.querySelector('#paper').appendChild(c.view)

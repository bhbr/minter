
import { getPaper } from '../paper/getPaper.js'
import { log } from '../functions/logging.js'
import { Circle } from '../shapes/Circle.js'
import { Color } from '../views/Color.js'

let paper = getPaper()
log('Playground!')
log(paper)

let c = new Circle()
log(c)
let c2 = new Circle({
	radius: 10,
	fillColor: Color.blue(),
	fillOpacity: 1.0
})
log(c2)

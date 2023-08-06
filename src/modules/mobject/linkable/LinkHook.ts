import { Mobject } from '..//Mobject'
import { Circle } from '../../shapes/Circle'
import { Color } from '../../helpers/Color'
import { BULLET_SIZE } from './constants'

export class LinkHook extends Circle {

	mobject: Mobject
	inputName: string
	outputName: string

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {        
			radius: BULLET_SIZE,
			fillOpacity: 0,
			strokeColor: Color.white()
		})
	}
}
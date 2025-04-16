
import { Rectangle } from 'core/shapes/Rectangle'
import { TextLabel } from 'core/mobjects/TextLabel'
import { Color } from 'core/classes/Color'
import { Linkable } from 'core/linkables/Linkable'
import { ValueBox } from './ValueBox'
import { log } from 'core/functions/logging'

export class NumberBox extends ValueBox {

	declare value: number

	defaults(): object {
		return {
			value: 1
		}
	}

















}
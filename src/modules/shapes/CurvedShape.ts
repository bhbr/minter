import { VMobject } from '../mobject/VMobject'
import { Vertex } from '../helpers/Vertex'
import { VertexArray } from '../helpers/VertexArray'
import { stringFromPoint } from '../helpers/helpers'
import { CurvedLine } from './CurvedLine'

export class CurvedShape extends CurvedLine {
	/*
	A closed CurvedLine is a CurvedShape
	*/

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			closed: true
		})
	}

}
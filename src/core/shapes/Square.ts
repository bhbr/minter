
import { Rectangle } from 'core/shapes/Rectangle'
import { log } from 'core/functions/logging'

export class Square extends Rectangle {

	defaults(): object {
		return {
			sidelength: 100,
			width: undefined,
			height: undefined
		}
	}

	get sidelength(): number { return this.width }
	set sidelength(newValue: number) {
		this.width = newValue
		this.height = newValue
	}

	synchronizeUpdateArguments(args: object = {}): object {
		let newSidelength = args['sidelength']
		if (newSidelength !== undefined) {
			args['sidelength'] = newSidelength
		}
		delete args['width']
		delete args['height']
		return args
	}

}
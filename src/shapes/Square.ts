
import { Rectangle } from './Rectangle.js'
import { log } from 'minter/functions/logging.js'

export class Square extends Rectangle {

	defaults(): object {
		return {
			sidelength: 100,
			width: 100,
			height: 100
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
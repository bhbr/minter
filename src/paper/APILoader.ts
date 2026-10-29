
import { BetterObject } from '@bhbr/better-things'
import { getPaper } from '../paper/getPaper.js'

type APILoadStatus = 'pending' | 'loading' | 'loaded'

export class APILoader extends BetterObject {
	
	status: APILoadStatus

	defaults(): object {
		return {
			status: 'pending'
		}
	}

	load() {
		this.update({
			status: 'loaded'
		})
		getPaper().loadedAPI(this)
	}

	onload() {
		
	}
}
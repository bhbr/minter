
import { ExtendedObject } from 'core/classes/ExtendedObject'
import { getPaper } from 'core/functions/getters'

type APILoadStatus = 'pending' | 'loading' | 'loaded'

export class APILoader extends ExtendedObject {
	
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
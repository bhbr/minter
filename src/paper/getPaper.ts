
import { Paper } from './Paper.js'

export function getPaper(): Paper {
	let paperDiv = document.querySelector('#paper_id')
	if (paperDiv == null) { return undefined }
	return paperDiv['view'].mobject
}

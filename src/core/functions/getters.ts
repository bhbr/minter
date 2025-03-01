
import { Paper } from 'core/Paper'
import { Sidebar } from 'core/Sidebar'

export function getPaper(): Paper {
	let paperDiv = document.querySelector('#paper_id')
	if (paperDiv == null) { return undefined }
	return paperDiv['mobject']
}

export function getSidebar(): Sidebar {
	let sidebarDiv = document.querySelector('#sidebar_id')
	if (sidebarDiv == null) { return undefined }
	return sidebarDiv['mobject']
}

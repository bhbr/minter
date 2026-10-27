
import { Paper } from 'minter/Paper.js'
import { Sidebar } from 'minter/Sidebar.js'

export function getPaper(): Paper {
	let paperDiv = document.querySelector('#paper_id')
	if (paperDiv == null) { return undefined }
	return paperDiv['view'].mobject
}

export function getSidebar(): Sidebar {
	let sidebarDiv = document.querySelector('#sidebar_id')
	if (sidebarDiv == null) { return undefined }
	return sidebarDiv['view'].mobject
}

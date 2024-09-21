
import { Paper } from 'core/Paper'
import { Sidebar } from 'core/Sidebar'

export function getPaper(): Paper {
	return document.querySelector('#paper_id')['mobject']
}

export function getSidebar(): Sidebar {
	return document.querySelector('#sidebar_id')['mobject']
}

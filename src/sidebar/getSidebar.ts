
import { Sidebar } from './Sidebar.js'

export function getSidebar(): Sidebar | null {
	let sidebarDiv = document.querySelector('#sidebar_id')
	if (sidebarDiv == null) { return null }
	return sidebarDiv['view'].mobject
}

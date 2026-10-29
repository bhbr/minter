
import { Sidebar } from './Sidebar.js'

export function getSidebar(): Sidebar {
	let sidebarDiv = document.querySelector('#sidebar_id')
	if (sidebarDiv == null) { return undefined }
	return sidebarDiv['view'].mobject
}

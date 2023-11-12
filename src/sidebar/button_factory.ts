import { SidebarButton } from './SidebarButton'
import { ArrowButton } from './ArrowButton'

export function buttonFactory(name: string, locationIndex: number): SidebarButton {
	switch (name) {
	case 'ArrowButton':
		return new ArrowButton({locationIndex: locationIndex})
	}
}
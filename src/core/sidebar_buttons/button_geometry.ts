
import { vertex } from 'core/functions/vertex'

export const BUTTON_CENTER_X: number = 50
export const BUTTON_CENTER_Y: number = 70
export const BUTTON_SPACING: number = 12.5
export const BUTTON_RADIUS: number = 25
export const BUTTON_SCALE_FACTOR: number = 1.3
export const OPTION_SPACING: number = 25

export function buttonCenter(verticalIndex: number, horizontalIndex: number = 0): vertex {
	let y: number = BUTTON_CENTER_Y + verticalIndex * (BUTTON_SPACING + 2 * BUTTON_RADIUS)
	return [BUTTON_CENTER_X + horizontalIndex * OPTION_SPACING, y]
}

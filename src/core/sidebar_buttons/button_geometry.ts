
import { Vertex } from 'core/classes/vertex/Vertex'

export const BUTTON_CENTER_X: number = 50
export const BUTTON_CENTER_Y: number = 50
export const BUTTON_SPACING: number = 12.5
export const BUTTON_RADIUS: number = 25
export const BUTTON_SCALE_FACTOR: number = 1.3

export function buttonCenter(index: number): Vertex {
	let y: number = BUTTON_CENTER_X + index * (BUTTON_SPACING + 2 * BUTTON_RADIUS)
	return new Vertex(BUTTON_CENTER_X, y)
}
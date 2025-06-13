
import { Color } from 'core/classes/Color'
import { vertex } from 'core/functions/vertex'

export const SIDEBAR_WIDTH = 150

export const DRAW_BORDERS: boolean = false
export const VIEW_DEBUGGING_OFFSET: vertex = [0, 0]

export const MAX_TAP_DELAY: number = 250
export const MERE_TAP_DELAY: number = 250
export const LONG_PRESS_DURATION: number = 1000

export const TAU = 2 * Math.PI
export const PI = TAU / 2
export const DEGREES = TAU / 360

export const COLOR_PALETTE: object = {
	'white': Color.white(),
	'red': Color.red(),
	'orange': Color.orange(),
	'yellow': Color.yellow(),
	'green': Color.green(),
	'blue': Color.blue(),
	'indigo': Color.indigo(),
	'purple': Color.purple()
}
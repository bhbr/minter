
import { Color } from 'core/classes/Color'

export function Colors_properly_export_to_hex(): boolean {
	let c = Color.red()
	return c.toHex() == '#ff0000'
}
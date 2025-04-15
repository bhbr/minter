import { TAU } from 'core/constants'

export class Color {
// Color objects handle conversion to HTML and CSS formats and have a few other convenient methods

	red: number // from 0 to 1
	green: number // from 0 to 1
	blue: number // from 0 to 1
	alpha: number // from 0 to 1

	constructor(r, g, b, a = 1) {
		this.red = r
		this.green = g
		this.blue = b
		this.alpha = a
	}

	brighten(factor: number): Color {
		return new Color(factor * this.red, factor * this.green, factor * this.blue, this.alpha)
	}

	// Conversion methods

	toHex(): string {
	// e. g. Color(1, 1, 1, 1).toHex() == '#ff0000'
		let hex_r: string = (Math.round(this.red * 255)).toString(16).padStart(2, '0')
		let hex_g: string = (Math.round(this.green * 255)).toString(16).padStart(2, '0')
		let hex_b: string = (Math.round(this.blue * 255)).toString(16).padStart(2, '0')
		let hex_a: string = ''
		if (this.alpha != 1) {
			hex_a = (Math.round(this.alpha * 255)).toString(16).padStart(2, '0')
		}
		return '#' + hex_r + hex_g + hex_b + hex_a
	}

	toCSS(): string {
	// e. g. Color(1, 1, 1, 1).toCSS() == 'rgba(255, 255, 255, 1)'
	// CSS rgb values go from 0 to 255, the alpha value from 0 to 1
		return `rgba(${255 * this.red}, ${255 * this.green}, ${255 * this.blue}, ${this.alpha})`
	}

	toString(): string {
		return this.toCSS()
	}

	withAlpha(a: number, premultiplied: boolean = false): Color {
		return new Color(this.red, this.green, this.blue, premultiplied ? a * this.alpha : a)
	}

	static fromHex(hex: string): Color {
		let r: number = parseInt('0x' + hex.slice(1, 2)) / 255
		let g: number = parseInt('0x' + hex.slice(3, 2)) / 255
		let b: number = parseInt('0x' + hex.slice(5, 2)) / 255
		let a: number = 1
		if (hex.length > 7) {
			a = parseInt('0x' + hex.slice(7, 2))/255
		}
		return new Color(r, g, b, a)
	}

	// Color palette

	static clear(): Color { return new Color(0, 0, 0, 0) }

	static black(): Color { return Color.gray(0) }
	static white(): Color { return Color.gray(1) }

	static red(): Color { return new Color(1, 0, 0) }
	static orange(): Color { return new Color(1, 0.5, 0) }
	static yellow(): Color { return new Color(1, 1, 0) }
	static green(): Color { return new Color(0, 1, 0) }
	static blue(): Color { return new Color(0, 0, 1) }
	static indigo(): Color { return new Color(0.5, 0, 1) }
	static purple(): Color { return new Color(1, 0, 1) }

	// Methods for creating new colors

	static gray(x): Color { return new Color(x, x, x) }

	static random(): Color { return new Color(Math.random(), Math.random(), Math.random(), 1) }
	static randomGray(): Color { return Color.gray(Math.random()) }

	interpolate(newColor: Color, weight: number) {
		return new Color(
			(1 - weight) * this.red + weight * newColor.red,
			(1 - weight) * this.green + weight * newColor.green,
			(1 - weight) * this.blue + weight * newColor.blue,
			(1 - weight) * this.alpha + weight * newColor.alpha
		)
	}

	static hsv_to_rgb(hue: number, saturation: number, value: number): Array<number> {

		let deg60 = TAU / 6
		let C = saturation * value
		let X = C * (1 - Math.abs((hue / deg60) % 2 - 1))
		let m = value - C
		var rPrime = 0
		var gPrime = 0
		var bPrime = 0

		if (hue < deg60) {
			rPrime = C
			gPrime = X
		} else if (hue < 2 * deg60) {
			rPrime = X
			gPrime = C
		} else if (hue < 3 * deg60) {
			gPrime = C
			bPrime = X
		} else if (hue < 4 * deg60) {
			gPrime = X
			bPrime = C
		} else if (hue < 5 * deg60) {
			rPrime = X
			bPrime = C
		} else {
			rPrime = C
			bPrime = X
		}

		let red = Math.min(rPrime + m, 1)
		let green = Math.min(gPrime + m, 1)
		let blue = Math.min(bPrime + m, 1)
		return [red, green, blue]

	}

}


























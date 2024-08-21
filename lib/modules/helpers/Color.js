export class Color {
    constructor(r, g, b, a = 1) {
        this.red = r;
        this.green = g;
        this.blue = b;
        this.alpha = a;
    }
    brighten(factor) {
        return new Color(factor * this.red, factor * this.green, factor * this.blue, this.alpha);
    }
    toHex() {
        let hex_r = (Math.round(this.red * 255)).toString(16).padStart(2, '0');
        let hex_g = (Math.round(this.green * 255)).toString(16).padStart(2, '0');
        let hex_b = (Math.round(this.blue * 255)).toString(16).padStart(2, '0');
        let hex_a = '';
        if (this.alpha != 1) {
            hex_a = (Math.round(this.alpha * 255)).toString(16).padStart(2, '0');
        }
        return '#' + hex_r + hex_g + hex_b + hex_a;
    }
    toCSS() {
        return `rgb(${255 * this.red}, ${255 * this.green}, ${255 * this.blue}, ${this.alpha})`;
    }
    withAlpha(a, premultiplied = false) {
        return new Color(this.red, this.green, this.blue, premultiplied ? a * this.alpha : a);
    }
    static fromHex(hex) {
        let r = parseInt('0x' + hex.slice(1, 2)) / 255;
        let g = parseInt('0x' + hex.slice(3, 2)) / 255;
        let b = parseInt('0x' + hex.slice(5, 2)) / 255;
        let a = 1;
        if (hex.length > 7) {
            a = parseInt('0x' + hex.slice(7, 2)) / 255;
        }
        return new Color(r, g, b, a);
    }
    interpolate(newColor, weight) {
        return new Color((1 - weight) * this.red + weight * newColor.red, (1 - weight) * this.green + weight * newColor.green, (1 - weight) * this.blue + weight * newColor.blue, (1 - weight) * this.alpha + weight * newColor.alpha);
    }
    static clear() { return new Color(0, 0, 0, 0); }
    static gray(x) { return new Color(x, x, x); }
    static black() { return Color.gray(0); }
    static white() { return Color.gray(1); }
    static red() { return new Color(1, 0, 0); }
    static orange() { return new Color(1, 0.5, 0); }
    static yellow() { return new Color(1, 1, 0); }
    static green() { return new Color(0, 1, 0); }
    static blue() { return new Color(0, 0, 1); }
    static indigo() { return new Color(0.5, 0, 1); }
    static purple() { return new Color(1, 0, 1); }
}
export const COLOR_PALETTE = {
    'white': Color.white(),
    'red': Color.red(),
    'orange': Color.orange(),
    'yellow': Color.yellow(),
    'green': Color.green(),
    'blue': Color.blue(),
    'indigo': Color.indigo(),
    'purple': Color.purple()
};
//# sourceMappingURL=Color.js.map
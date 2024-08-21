// replicate RGB(A) notation from CSS
export function rgba(r, g, b, a) {
    return `rgb(${255 * r}, ${255 * g}, ${255 * b}, ${a})`;
}
export function rgb(r, g, b) {
    let hex_r = (Math.round(r * 255)).toString(16).padStart(2, '0');
    let hex_g = (Math.round(g * 255)).toString(16).padStart(2, '0');
    let hex_b = (Math.round(b * 255)).toString(16).padStart(2, '0');
    return '#' + hex_r + hex_g + hex_b;
}
export function gray(x) { return rgb(x, x, x); }
//# sourceMappingURL=rgb.js.map
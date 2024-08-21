import { Vertex } from '../modules/helpers/Vertex.js';
export const BUTTON_CENTER_X = 50;
export const BUTTON_CENTER_Y = 50;
export const BUTTON_SPACING = 12.5;
export const BUTTON_RADIUS = 25;
export const BUTTON_SCALE_FACTOR = 1.3;
export function buttonCenter(index) {
    let y = BUTTON_CENTER_X + index * (BUTTON_SPACING + 2 * BUTTON_RADIUS);
    return new Vertex(BUTTON_CENTER_X, y);
}
//# sourceMappingURL=button_geometry.js.map
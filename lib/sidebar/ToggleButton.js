import { SidebarButton } from './SidebarButton.js';
import { BUTTON_SCALE_FACTOR } from './button_geometry.js';
export class ToggleButton extends SidebarButton {
    commonButtonUp() {
        this.currentModeIndex = 0;
        super.commonButtonUp();
    }
    updateLabel() {
        if (this.label == undefined) {
            return;
        }
        let f = this.active ? BUTTON_SCALE_FACTOR : 1;
        this.label.view.setAttribute('font-size', (f * this.fontSize).toString());
    }
}
//# sourceMappingURL=ToggleButton.js.map
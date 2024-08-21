import { SidebarButton } from './SidebarButton.js';
import { COLOR_PALETTE } from '../modules/helpers/Color.js';
import { BUTTON_RADIUS, BUTTON_SCALE_FACTOR } from './button_geometry.js';
export class ColorChangeButton extends SidebarButton {
    fixedArgs() {
        return Object.assign(super.fixedArgs(), {
            optionSpacing: 15,
            showLabel: false
        });
    }
    defaultArgs() {
        return Object.assign(super.defaultArgs(), {
            showLabel: true
        });
    }
    statelessSetup() {
        super.statelessSetup();
        this.outgoingMessage = {};
    }
    statefulSetup() {
        super.statefulSetup();
        this.colorNames = Object.keys(COLOR_PALETTE);
        this.label.view.setAttribute('fill', 'black');
        for (let name of this.colorNames) {
            this.messages.push({ color: name, target: 'paper' });
        }
    }
    colorForIndex(i) {
        return COLOR_PALETTE[this.colorNames[i]];
    }
    commonButtonDown() {
        if (this.active) {
            return;
        }
        this.active = true;
        this.radius = BUTTON_RADIUS * BUTTON_SCALE_FACTOR;
        this.previousIndex = this.currentModeIndex;
        this.update();
    }
    commonButtonUp() {
        this.radius = BUTTON_RADIUS;
        this.update({}, false);
        this.active = false;
        this.fillColor = this.colorForIndex(this.currentModeIndex);
        this.updateLabel();
        this.label.update({ text: '' });
        this.messagePaper(this.outgoingMessage);
        this.update();
    }
    //	buttonDrag(e: ScreenEvent) {
    onPointerMove(e) {
        //		super.buttonDrag(e)
        super.onPointerMove(e);
        this.remove(this.label);
    }
}
//# sourceMappingURL=ColorChangeButton.js.map
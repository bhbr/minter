import { ToggleButton } from './ToggleButton.js';
export class DragButton extends ToggleButton {
    fixedArgs() {
        return Object.assign(super.fixedArgs(), {
            messages: [{ drag: true }],
            outgoingMessage: { drag: false },
            key: 'q'
        });
    }
    statefulSetup() {
        super.statefulSetup();
        this.label.text = 'drag';
    }
}
//# sourceMappingURL=DragButton.js.map
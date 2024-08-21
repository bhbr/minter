import { ToggleButton } from './ToggleButton.js';
export class LinkButton extends ToggleButton {
    fixedArgs() {
        return Object.assign(super.fixedArgs(), {
            messages: [{ link: true }],
            outgoingMessage: { link: false },
            key: 'w'
        });
    }
    statefulSetup() {
        super.statefulSetup();
        this.label.view['fill'] = 'black';
        this.label.text = 'link';
    }
}
//# sourceMappingURL=LinkButton.js.map
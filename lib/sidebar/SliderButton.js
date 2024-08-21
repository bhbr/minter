import { CreativeButton } from './CreativeButton.js';
export class SliderButton extends CreativeButton {
    fixedArgs() {
        return Object.assign(super.fixedArgs(), {
            creations: ['slider', 'value', '+', '–', '*', '/'],
            key: 'r'
        });
    }
}
//# sourceMappingURL=SliderButton.js.map
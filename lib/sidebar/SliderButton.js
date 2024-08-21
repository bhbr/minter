import { CreativeButton } from './CreativeButton.js';
export class SliderButton extends CreativeButton {
    fixedArgs() {
        return Object.assign(super.fixedArgs(), {
            creations: ['slider'],
            key: 'r'
        });
    }
}
//# sourceMappingURL=SliderButton.js.map
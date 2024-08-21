import { CreativeButton } from './CreativeButton.js';
export class CircleButton extends CreativeButton {
    fixedArgs() {
        return Object.assign(super.fixedArgs(), {
            creations: ['circle'],
            key: 'e'
        });
    }
}
//# sourceMappingURL=CircleButton.js.map
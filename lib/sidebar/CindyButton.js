import { CreativeButton } from './CreativeButton.js';
export class CindyButton extends CreativeButton {
    fixedArgs() {
        return Object.assign(super.fixedArgs(), {
            creations: ['cindy'],
            key: 't'
        });
    }
}
//# sourceMappingURL=CindyButton.js.map
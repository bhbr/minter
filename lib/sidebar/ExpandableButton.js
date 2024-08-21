import { CreativeButton } from './CreativeButton.js';
export class ExpandableButton extends CreativeButton {
    fixedArgs() {
        return Object.assign(super.fixedArgs(), {
            creations: ['exp', 'cons'],
            key: 'e'
        });
    }
}
//# sourceMappingURL=ExpandableButton.js.map
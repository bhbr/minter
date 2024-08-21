import { CreativeButton } from './CreativeButton.js';
export class ArrowButton extends CreativeButton {
    fixedArgs() {
        return Object.assign(super.fixedArgs(), {
            creations: ['segment', 'ray', 'line'],
            key: 'w'
        });
    }
}
//# sourceMappingURL=ArrowButton.js.map
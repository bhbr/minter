import { CreativeButton } from './CreativeButton.js';
export class PendulumButton extends CreativeButton {
    fixedArgs() {
        return Object.assign(super.fixedArgs(), {
            creations: ['pendulum'],
            key: 'z'
        });
    }
}
//# sourceMappingURL=PendulumButton.js.map
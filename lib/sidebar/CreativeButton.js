import { SidebarButton } from './SidebarButton.js';
export class CreativeButton extends SidebarButton {
    defaultArgs() {
        return Object.assign(super.defaultArgs(), {
            creations: [],
            outgoingMessage: { create: 'freehand' }
        });
    }
    statefulSetup() {
        super.statefulSetup();
        for (let c of this.creations) {
            this.messages.push({ create: c });
        }
    }
}
//# sourceMappingURL=CreativeButton.js.map
import { ArrowButton } from './ArrowButton.js';
import { CircleButton } from './CircleButton.js';
import { DragButton } from './DragButton.js';
import { LinkButton } from './LinkButton.js';
import { CindyButton } from './CindyButton.js';
import { ArithmeticButton } from './ArithmeticButton.js';
import { ExpandableButton } from './ExpandableButton.js';
import { PendulumButton } from './PendulumButton.js';
export function buttonFactory(name, locationIndex) {
    switch (name) {
        case 'ArrowButton':
            return new ArrowButton({ locationIndex: locationIndex });
        case 'CircleButton':
            return new CircleButton({ locationIndex: locationIndex });
        case 'DragButton':
            return new DragButton({ locationIndex: locationIndex });
        case 'LinkButton':
            return new LinkButton({ locationIndex: locationIndex });
        case 'CindyButton':
            return new CindyButton({ locationIndex: locationIndex });
        case 'ArithmeticButton':
            return new ArithmeticButton({ locationIndex: locationIndex });
        case 'ExpandableButton':
            return new ExpandableButton({ locationIndex: locationIndex });
        case 'PendulumButton':
            return new PendulumButton({ locationIndex: locationIndex });
    }
}
//# sourceMappingURL=button_factory.js.map
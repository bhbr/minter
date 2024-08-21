import { Dependency } from '../Dependency.js';
import { Segment } from '../../arrows/Segment.js';
import { Mobject } from '../Mobject.js';
import { LinkBullet } from './LinkBullet.js';
import { LINK_LINE_WIDTH } from './constants.js';
export class DependencyLink extends Mobject {
    statelessSetup() {
        super.statelessSetup();
        this.dependency = new Dependency();
        this.startBullet = new LinkBullet();
        this.endBullet = new LinkBullet();
        this.linkLine = new Segment({
            strokeWidth: LINK_LINE_WIDTH
        });
    }
    statefulSetup() {
        super.statefulSetup();
        this.add(this.startBullet);
        this.add(this.linkLine);
        this.add(this.endBullet);
        this.startBullet.addDependency('midpoint', this.linkLine, 'startPoint');
        this.endBullet.addDependency('midpoint', this.linkLine, 'endPoint');
    }
}
//# sourceMappingURL=DependencyLink.js.map
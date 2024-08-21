import { CreatingMobject } from '../creations/CreatingMobject.js';
import { Pendulum } from './Pendulum.js';
export class CreatingPendulum extends CreatingMobject {
    statelessSetup() {
        super.statelessSetup();
        this.pendulum = new Pendulum();
    }
    statefulSetup() {
        super.statefulSetup();
        this.add(this.pendulum);
        this.pendulum.update({
            anchor: this.startPoint
        }, false);
        this.pendulum.hideLinks();
    }
    createdMobject() {
        return this.pendulum;
    }
    updateFromTip(q) {
        super.updateFromTip(q);
        let dr = q.subtract(this.startPoint);
        let length = dr.norm();
        let angle = Math.atan2(dr.x, dr.y);
        this.pendulum.update({
            maxLength: length,
            length: 1,
            initialAngle: angle
        });
        this.pendulum.hideLinks();
    }
    dissolve() {
        super.dissolve();
        this.pendulum.update({
            initialTime: Date.now()
        });
        this.pendulum.run();
    }
}
//# sourceMappingURL=CreatingPendulum.js.map
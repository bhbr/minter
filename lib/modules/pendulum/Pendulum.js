import { Vertex } from '../helpers/Vertex.js';
import { Color } from '../helpers/Color.js';
import { LinkableMobject } from '../mobject/linkable/LinkableMobject.js';
import { Segment } from '../arrows/Segment.js';
import { Rectangle } from '../shapes/Rectangle.js';
import { Circle } from '../shapes/Circle.js';
export class Pendulum extends LinkableMobject {
    statelessSetup() {
        super.statelessSetup();
        this.fixture = new Rectangle({
            fillColor: Color.white(),
            fillOpacity: 1
        });
        this.string = new Segment();
        this.weight = new Circle({
            fillColor: Color.white(),
            fillOpacity: 1
        });
        this.initialTime = Date.now();
    }
    statefulSetup() {
        super.statefulSetup();
        this.add(this.fixture);
        this.add(this.string);
        this.add(this.weight);
        this.fixture.update({
            width: this.fixtureWidth,
            height: this.fixtureHeight,
            anchor: new Vertex(-this.fixtureWidth / 2, -this.fixtureHeight)
        }, false);
        this.weight.update({
            radius: this.weightRadius
        });
    }
    fixedArgs() {
        return Object.assign(super.fixedArgs(), {
            fixtureWidth: 50,
            fixtureHeight: 10,
            initialSpeed: 0,
            inputNames: ['length', 'mass'],
            outputNames: ['angle', 'period']
        });
    }
    defaultArgs() {
        return Object.assign(super.defaultArgs(), {
            maxLength: 300,
            length: 1,
            mass: 0.2,
            initialAngle: 0,
            initialTime: 0
        });
    }
    get angle() {
        let dt = (Date.now() - this.initialTime) % this.period;
        let value = this.initialAngle * Math.cos(2 * Math.PI * dt / this.period);
        return value;
    }
    get period() {
        return 500 * this.length ** 0.5 * 5; // ms
    }
    get pixelLength() {
        return this.length * this.maxLength;
    }
    get weightRadius() {
        return 50 * this.mass ** 0.5;
    }
    updateModel(argsDict = {}) {
        super.updateModel(argsDict);
        let angle = argsDict['initialAngle'] ?? this.angle;
        let newEndPoint = (new Vertex(0, 1)).rotatedBy(-angle).scaledBy(this.pixelLength);
        this.string.updateModel({
            endPoint: newEndPoint
        });
        this.weight.updateModel({
            radius: this.weightRadius,
            midpoint: newEndPoint
        });
    }
    run() {
        window.setInterval(function () { this.update(); }.bind(this), 10);
    }
}
//# sourceMappingURL=Pendulum.js.map
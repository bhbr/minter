import { Mobject } from './Mobject.js';
import { MGroup } from './MGroup.js';
import { Color } from '../helpers/Color.js';
import { Vertex } from '../helpers/Vertex.js';
import { Transform } from '../helpers/Transform.js';
import { VertexArray } from '../helpers/VertexArray.js';
import { addPointerDown, addPointerMove, addPointerUp } from './screen_events.js';
export class VMobject extends Mobject {
    defaultArgs() {
        return Object.assign(super.defaultArgs(), {
            fillColor: Color.white(),
            fillOpacity: 0,
            strokeColor: Color.white(),
            strokeWidth: 1,
        });
    }
    statelessSetup() {
        super.statelessSetup();
        this.vertices = new VertexArray();
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.svg['mobject'] = this;
        this.path['mobject'] = this;
        this.svg.appendChild(this.path);
        this.svg.setAttribute('class', 'mobject-svg');
        this.svg.style.overflow = 'visible';
    }
    statefulSetup() {
        this.setupView();
        this.view.appendChild(this.svg);
        this.view.setAttribute('class', this.constructor.name + ' mobject-div');
        addPointerDown(this.path, this.capturedOnPointerDown.bind(this));
        addPointerMove(this.path, this.capturedOnPointerMove.bind(this));
        addPointerUp(this.path, this.capturedOnPointerUp.bind(this));
    }
    redrawSelf() {
        let pathString = this.pathString();
        if (pathString.includes('NaN')) {
            return;
        }
        this.path.setAttribute('d', pathString);
        this.path.style['fill'] = this.fillColor.toHex();
        this.path.style['fill-opacity'] = this.fillOpacity.toString();
        this.path.style['stroke'] = this.strokeColor.toHex();
        this.path.style['stroke-width'] = this.strokeWidth.toString();
    }
    pathString() {
        console.warn('please subclass pathString');
        return '';
    }
    relativeVertices(frame) {
        let returnValue = this.relativeTransform(frame).appliedToVertices(this.vertices);
        if (returnValue == undefined) {
            return [];
        }
        else {
            return returnValue;
        }
    }
    globalVertices() {
        return this.relativeVertices(); // uses default frame = paper
    }
    localXMin() {
        let xMin = Infinity;
        if (this.vertices != undefined) {
            for (let p of this.vertices) {
                xMin = Math.min(xMin, p.x);
            }
        }
        if (this.children != undefined) {
            for (let mob of this.children) {
                xMin = Math.min(xMin, mob.localXMin() + mob.anchor.x);
            }
        }
        return xMin;
    }
    localXMax() {
        let xMax = -Infinity;
        if (this.vertices != undefined) {
            for (let p of this.vertices) {
                xMax = Math.max(xMax, p.x);
            }
        }
        if (this.children != undefined) {
            for (let mob of this.children) {
                xMax = Math.max(xMax, mob.localXMax() + mob.anchor.x);
            }
        }
        return xMax;
    }
    localYMin() {
        let yMin = Infinity;
        if (this.vertices != undefined) {
            for (let p of this.vertices) {
                yMin = Math.min(yMin, p.y);
            }
        }
        if (this.children != undefined) {
            for (let mob of this.children) {
                yMin = Math.min(yMin, mob.localYMin() + mob.anchor.y);
            }
        }
        return yMin;
    }
    localYMax() {
        let yMax = -Infinity;
        if (this instanceof MGroup) {
        }
        if (this.vertices != undefined) {
            for (let p of this.vertices) {
                yMax = Math.max(yMax, p.y);
            }
        }
        if (this.children != undefined) {
            for (let mob of this.children) {
                yMax = Math.max(yMax, mob.localYMax() + mob.anchor.y);
            }
        }
        return yMax;
    }
    localULCorner() {
        return new Vertex(this.localXMin(), this.localYMin());
    }
    getWidth() { return this.localXMax() - this.localXMin(); }
    getHeight() { return this.localYMax() - this.localYMin(); }
    adjustFrame() {
        let shift = new Transform({ shift: this.localULCorner() });
        let inverseShift = shift.inverse();
        let updateDict = {};
        for (let [key, value] of Object.entries(this)) {
            var newValue;
            if (value instanceof Vertex) {
                newValue = inverseShift.appliedTo(value);
            }
            else if (value instanceof Array && value.length > 0) {
                newValue = [];
                if (!(value[0] instanceof Vertex)) {
                    continue;
                }
                for (let v of value) {
                    newValue.push(inverseShift.appliedTo(v));
                }
            }
            else {
                continue;
            }
            updateDict[key] = newValue;
        }
        updateDict['anchor'] = shift.appliedTo(this.anchor);
        updateDict['viewWidth'] = this.getWidth();
        updateDict['viewHeight'] = this.getHeight();
        this.update(updateDict);
    }
}
//# sourceMappingURL=VMobject.js.map
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
        // setup the svg
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg['mobject'] = this;
        this.svg.setAttribute('class', 'mobject-svg');
        this.svg.style.overflow = 'visible';
        // and its path
        this.path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.path['mobject'] = this;
        this.svg.appendChild(this.path);
    }
    statefulSetup() {
        this.setupView();
        this.view.appendChild(this.svg);
        this.view.setAttribute('class', this.constructor.name + ' mobject-div');
        // screen events are detected on the path
        // so the active area is clipped to its shape
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
        // This method turns this.vertices into a CSS path
        console.warn('please subclass pathString');
        return '';
    }
    relativeVertices(frame) {
        // the vertices are in local coordinates, convert them to the given frame of an ancestor mobject
        let returnValue = this.relativeTransform(frame).appliedToVertices(this.vertices);
        if (returnValue == undefined) {
            return new VertexArray();
        }
        else {
            return returnValue;
        }
    }
    globalVertices() {
        // uses default frame = paper
        return this.relativeVertices();
    }
    //////////////////////////////////////////////////////////
    //                                                      //
    //                     FRAME METHODS                    //
    //                                                      //
    //////////////////////////////////////////////////////////
    /*
    The coordinate extrema (x_min, x_max, y_min, y_max) are computed from the vertices
    instead of the view frame as for a general Mobject.
    Other coordinate quantities (x_mid, y_mid, ulCorner etc.) are computes from these
    four values.
    */
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
    localMidX() { return (this.localXMin() + this.localXMax()) / 2; }
    localMidY() { return (this.localYMin() + this.localYMax()) / 2; }
    localULCorner() { return new Vertex(this.localXMin(), this.localYMin()); }
    localURCorner() { return new Vertex(this.localXMax(), this.localYMin()); }
    localLLCorner() { return new Vertex(this.localXMin(), this.localYMax()); }
    localLRCorner() { return new Vertex(this.localXMax(), this.localYMax()); }
    localCenter() { return new Vertex(this.localMidX(), this.localMidY()); }
    localLeftCenter() { return new Vertex(this.localXMin(), this.localMidY()); }
    localRightCenter() { return new Vertex(this.localXMax(), this.localMidY()); }
    localTopCenter() { return new Vertex(this.localMidX(), this.localYMin()); }
    localBottomCenter() { return new Vertex(this.localMidX(), this.localYMax()); }
    ulCorner(frame) { return this.transformLocalPoint(this.localULCorner(), frame); }
    urCorner(frame) { return this.transformLocalPoint(this.localURCorner(), frame); }
    llCorner(frame) { return this.transformLocalPoint(this.localLLCorner(), frame); }
    lrCorner(frame) { return this.transformLocalPoint(this.localLRCorner(), frame); }
    center(frame) { return this.transformLocalPoint(this.localCenter(), frame); }
    xMin(frame) { return this.ulCorner(frame).x; }
    xMax(frame) { return this.lrCorner(frame).x; }
    yMin(frame) { return this.ulCorner(frame).y; }
    yMax(frame) { return this.lrCorner(frame).y; }
    midX(frame) { return this.center(frame).x; }
    midY(frame) { return this.center(frame).y; }
    leftCenter(frame) { return this.transformLocalPoint(this.localLeftCenter(), frame); }
    rightCenter(frame) { return this.transformLocalPoint(this.localRightCenter(), frame); }
    topCenter(frame) { return this.transformLocalPoint(this.localTopCenter(), frame); }
    bottomCenter(frame) { return this.transformLocalPoint(this.localRightCenter(), frame); }
    getWidth() { return this.localXMax() - this.localXMin(); }
    getHeight() { return this.localYMax() - this.localYMin(); }
    adjustFrame() {
        // Set the view anchor and size to fit the frame as computed from the vertices
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
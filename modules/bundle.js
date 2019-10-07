(function () {
    'use strict';

    //import {stringFromPoint, remove, rgb, rgba} from './helpers.js'

    class Vertex extends Array {

        constructor(x = [0, 0], y = null) {
            super();
            if (typeof x == 'number' && typeof y == 'number') {
                this.x = x;
                this.y = y;
            } else if (x instanceof Array && x.length == 2 && y == undefined) {
                this.x = x[0];
                this.y = x[1];
            } else if (x instanceof Vertex) {
                this.x = x.x;
                this.y = x.y;
            }
        }

        static origin() {
            return new Vertex()
            this.x = 0;
            this.y = 0;
        }

        get x() { return this[0] }
        set x(newValue) { this[0] = newValue; }

        get y() { return this[1] }
        set y(newValue) { this[1] = newValue; }

        norm2() { return this.x**2 + this.y**2 }
        norm() { return Math.sqrt(this.norm2()) }

        copyFrom(otherVertex) {
            this.x = otherVertex.x;
            this.y = otherVertex.y;
        }

        imageUnder(transform) {
            return transform.appliedTo(this)
        }

        apply(transform) {
            this.copyFrom(this.imageUnder(t));
        }

        translatedBy(w1, w2 = null) {
            return this.imageUnder(new Translation(w1, w2))
        }

        translateBy(w1, w2) {
            this.copyFrom(this.translatedBy(w1, w2));
        }

        rotatedBy(angle, center = Vertex.origin()) {
            let r = new Rotation(angle, center);
            return this.imageUnder(r)
        }

        rotateBy(angle, center = Vertex.origin()) {
            this.copyFrom(this.rotatedBy(angle, center));
        }

        scaledBy(factor, center = Vertex.origin()) {
            let s = new Scaling(factor, center);
            return this.imageUnder(s)
        }

        scaleBy(factor, center = Vertex.origin()) {
            this.copyFrom(this.scaledBy(center, factor));
        }

        add(otherVertex) { return this.translatedBy(otherVertex) }
        multiply(factor) { return this.scaledBy(factor) }
        divide(factor) { return this.multiply(1/factor) }
        opposite() { return new Vertex(-this.x, -this.y) }
        subtract(otherVertex) { return this.add(otherVertex.opposite()) }

        isNaN() {
            return (isNaN(this.x) || isNaN(this.y)) 
        }

        static vertices(listOfComponents) {
            let listOfVertices = [];
            for (let components of listOfComponents) {
                let v = new Vertex(components);
                listOfVertices.push(v);
            }
            return listOfVertices
        }

    }













    class Transform {

        constructor(a = 1, b = 0, c = 0, d = 1, e = 0, f = 0) {
            this.a = a, this.b = b, this.c = c, this.d = d, this.e = e, this.f = f;
            this.anchor = new Vertex(e, f);
        }

        static identity() {
            return new Transform(1,0,0,1,0,0)
        }

        copyFrom(otherTransform) {
            this.a = otherTransform.a;
            this.b = otherTransform.b;
            this.c = otherTransform.c;
            this.d = otherTransform.d;
            this.e = otherTransform.e;
            this.f = otherTransform.f;
            this.anchor.copyFrom(otherTransform.anchor);
        }

        asString() {
            return `matrix(${this.a},${this.b},${this.c},${this.d},${this.e},${this.f})`
        }

        appliedToVertex(v) {
            let newX = this.a * v.x + this.b * v.y + this.e;
            let newY = this.c * v.x + this.d * v.y + this.f;
            return new Vertex(newX, newY)
        }

        appliedToArrayOfVertices(arr) {
            let images = [];
            for (let v of arr) {
                images.push(this.appliedToVertex(v));
            }
            return images
        }

        appliedTo(arg) {
            if (arg instanceof Vertex) {
                return this.appliedToVertex(arg)
            } else if (arg instanceof Array) {
                return this.appliedToArrayOfVertices(arg)
            } else {
                return undefined
            }
        }

        get anchor() {
            return this._anchor
        }

        set anchor(newValue) {
            this.e = newValue[0];
            this.f = newValue[1];
            if (this._anchor) {
                this._anchor.x = this.e;
                this._anchor.y = this.f;
            } else {
                this._anchor = new Vertex(this.e, this.f);
            }
        }

        det() { return this.a * this.d - this.b * this.c }

        inverse() {
            let a = this.a, b = this.b, c = this.c, d = this.d, e = this.e, f = this.f;
            let det = this.det();
            let invA = d /det;
            let invB = -b / det;
            let invC = -c / det;
            let invD = a / det;
            let invE = b/a*(a*f - c*d)/det - d/a;
            let invF = (-a*f + c*d)/det;

            return new Transform(invA, invB, invC, invD, invE, invF)
        }

        rightComposedWith(otherTransform) {
            let a1 = this.a, b1 = this.b, c1 = this.c, d1 = this.d, e1 = this.e, f1 = this.f;
            let a2 = otherTransform.a, b2 = otherTransform.b, c2 = otherTransform.c,
                d2 = otherTransform.d, e2 = otherTransform.e, f2 = otherTransform.f;
            let a = a1*a2 + b1*c2;
            let b = a1*b2 + b1*d2;
            let c = c1*a2 + d1*c2;
            let d = c1*b2 + d1*d2;
            let e = a1*e2 + b1*f2 + e1;
            let f = c1*e2 + d1*f2 + f1;
            return new Transform(a,b,c,d,e,f)
        }

        rightComposeWith(otherTransform) {
            let a1 = this.a, b1 = this.b, c1 = this.c, d1 = this.d, e1 = this.e, f1 = this.f;
            let a2 = otherTransform.a, b2 = otherTransform.b, c2 = otherTransform.c,
                d2 = otherTransform.d, e2 = otherTransform.e, f2 = otherTransform.f;
            this.a = a1*a2 + b1*c2;
            this.b = a1*b2 + b1*d2;
            this.c = c1*a2 + d1*c2;
            this.d = c1*b2 + d1*d2;
            this.e = a1*e2 + b1*f2 + e1;
            this.f = c1*e2 + d1*f2 + f1;
            this.anchor = new Vertex(this.e, this.f);
        }

        leftComposedWith(otherTransform) {
            return otherTransform.rightComposedWith(this)
        }

        leftComposeWith(otherTransform) {
            this.copyFrom(this.leftComposedWith(otherTransform));
        }

        composedWith(otherTransform) {
            return this.rightComposedWith(otherTransform)
        }

        composeWith(otherTransform) {
            this.rightComposeWith(otherTransform);
        }

        conjugatedWith(otherTransform) {
            return otherTransform.inverse().composedWith(this).composedWith(otherTransform)
        }

        conjugateWith(otherTransform) {
            this.copyFrom(this.conjugatedWith(otherTransform));
        }

        centeredAt(vertex) {
            // let t1 = (new Translation(this.anchor)).inverse()
            // let t2 = new Translation(vertex)
            // return t2.composedWith(t1).composedWith(this)
            return new Transform(this.a, this.b, this.c, this.d, vertex[0], vertex[1])
        }

        centerAt(vertex) {
            this.anchor = vertex;
        }

    }









    // const t = new Transform(paper.width/2,0,0,-paper.height/2,paper.width/2,paper.height/2)
    // paper.setAttribute('transform', t.asString())












    class Translation extends Transform {
        constructor(dx = [0, 0], dy = null) {
            super();
            if (typeof dx == 'number' && typeof dy == 'number') {
                this.dx = dx;
                this.dy = dy;
            } else if (dx instanceof Array && dx.length == 2 && dy == undefined) {
                this.dx = dx[0];
                this.dy = dx[1];
            }
        }

        get dx() { return this.e }
        set dx(newValue) { this.e = newValue; }

        get dy() { return this.f }
        set dy(newValue) { this.f = newValue; }

        inverse() {
            return new Translation(-this.dx, -this.dy)
        }
    }

    class CentralStretching extends Transform {
        constructor(scaleX = 1, scaleY = 1) {
            super();
            this.a = scaleX, this.d = scaleY;
            this.center = Vertex.origin();
        }

        get scaleX() { return this.a }
        set scaleX(newValue) { this.a = newValue; }

        get scaleY() { return this.d }
        set scaleY(newValue) { this.d = newValue; }

        inverse() {
            return new CentralStretching(1/this.scaleX, 1/this.scaleY)
        }

    }

    class Stretching extends Transform {
        constructor(scaleX = 1, scaleY = 1, center = Vertex.origin()) {
            super();
            let cs = new CentralStretching(scaleX, scaleY);
            let s = cs.centeredAt(center);
            this.copyFrom(s);
            this.center = center;
        }

        inverse() {
            return new Stretching(1/scaleX, 1/scaleY, this.center)
        }
    }

    class CentralScaling extends CentralStretching {
        constructor(scale) {
            super(scale, scale);
        }

        get scale() { return this.scaleX }
        set scale(newValue) { this.scaleX = newValue, this.scaleY = newValue; }

        inverse() {
            return new CentralScaling(1/this.scale)
        }
    }

    class Scaling extends Stretching {
        constructor(scale, center = Vertex.origin()) {
            super(scale);
            let cs = new CentralScaling(scale);
            let s = cs.centeredAt(center);
            this.copyFrom(s);
            this.center = center;
        }

        inverse() {
            return new Scaling(1/scale, this.center)
        }
    }

    class CentralRotation extends Transform {
        constructor(angle) {
            super(Math.cos(angle), Math.sin(angle), -Math.sin(angle), Math.cos(angle), 0, 0);
            this.angle = angle;
        }

        get angle() { return this._angle }
        set angle(newValue) {
            this._angle = newValue;
            this.a = Math.cos(this.angle);
            this.b = Math.sin(this.angle);
            this.c = -Math.sin(this.angle);
            this.d = Math.cos(this.angle);
        }



        inverse() {
            return new CentralRotation(-this.angle)
        }
    }

    class Rotation extends Transform {
        constructor(angle, center = Vertex.origin()) {
            super();
            let cr = new CentralRotation(angle);
            let r = cr.centeredAt(center);
            this.copyFrom(r);
            this.center = center;
        }

        inverse() {
            return new Rotation(-angle, this.center)
        }
    }

    class Mobject {

        constructor() {
            this.view = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this.view.setAttribute('class', this.constructor.name);
            this.view.mobject = this;
            this.transform = Transform.identity();
            this.submobjects = [];
            this.parentMobject = paper; // default

            this.isDraggable = false;
            this.isDragged = false;
            this.visible = true;

            // give event-triggered methods reference to this = self (instead of window)
            // also, they need proper names to refer to them
            // when removing the event listeners
            this.boundDragStart = this.dragStart.bind(this);
            this.boundDrag = this.drag.bind(this);
            this.boundDragEnd = this.dragEnd.bind(this);
            // this.boundScrubStart = this.scrubStart.bind(this)
            // this.boundScrub = this.scrub.bind(this)
            // this.boundScrubEnd = this.scrubEnd.bind(this)
            this.boundCreatePopover = this.createPopover.bind(this);
            this.boundDismissPopover = this.dismissPopover.bind(this);
            this.boundMouseUpAfterCreatingPopover = this.mouseUpAfterCreatingPopover.bind(this);

            this.view.addEventListener('mousedown', this.boundDragStart);
            //this.view.addEventListener('dblclick', this.boundMakeScrubbable)

        }

        get parentMobject() { return this._parentMobject }
        set parentMobject(newValue) {
            this.view.remove();
            this._parentMobject = newValue;
            if (newValue == undefined) { return }
            if (newValue == paper) {
                newValue.appendChild(this.view);
            } else {
                newValue.view.appendChild(this.view);
            }
        }

        globalTransform() {
            let t = Transform.identity();
            let mob = this;
            while (mob && mob.transform instanceof Transform) {
                t.leftComposeWith(mob.transform);
                mob = mob.parentMobject;
            }
            return t
        }

        globalVertices() {
            return this.globalTransform().appliedTo(this.vertices)
        }

        updateView() {
            if (this.view == undefined) { return }

            for (let submob of this.submobjects) {
                submob.updateView();
            }

            if (this.popover != undefined) {
                this.popover.anchor = this.anchor.translatedBy(this.rightEdge());
            }
        }

        get fillColor() { return this.view.fill }
        set fillColor(newValue) {
            this.view.fill = newValue;
            for (let submob of this.submobjects) {
                submob.fillColor = newValue;
            }
            this.updateView();
        }

        get fillOpacity() { return this.view.style['fill-opacity'] }
        set fillOpacity(newValue) {
            this.view.style['fill-opacity'] = newValue;

            // TODO: rethink this (commented out for circles)

            // for (let submob of this.submobjects) {
            //     submob.fillOpacity = newValue
            // }
            this.updateView();
        }

        get strokeColor() { return this.view.stroke }
        set strokeColor(newValue) {
            this.view.stroke = newValue;
            for (let submob of this.submobjects) {
                submob.strokeColor = newValue;
            }
            this.updateView();
        }

        get strokeWidth() { return this.view.style['stroke-width'] }
        set strokeWidth(newValue) {
            this.view.style['stroke-width'] = newValue;
            for (let submob of this.submobjects) {
                submob.strokeWidth = newValue;
            }
            this.updateView();
        }

        dragStart(e) {
            if (!this.isDraggable) { return }
            this.isDragged = true;
            this.dragStartingPoint = new Vertex(e.x, e.y);
            this.anchorBeforeDragging = Object.create(this.anchor);
            if (this.popover != undefined) {
                this.popover.anchorBeforeDragging = Object.create(this.popover.anchor);
            }
            paper.addEventListener('mousemove', this.boundDrag);
            paper.addEventListener('mouseup', this.boundDragEnd);
        }

        drag(e) {
            if (!(this.isDraggable && this.isDragged)) { return }
            let dragVector = new Vertex(e.x, e.y).subtract(this.dragStartingPoint);
            this.anchor = this.anchorBeforeDragging.add(dragVector);
            if (this.popover != undefined) {
                this.popover.anchor = this.popover.anchorBeforeDragging.add(dragVector);
            }
            this.updateView();
        }

        dragEnd(e) {
            this.isDragged = false;
            this.dragStartingPoint = undefined;
            this.anchorBeforeDragging = undefined;
            if (this.popover != undefined) {
                this.popover.anchorBeforeDragging = undefined;
            }
            paper.removeEventListener('mousemove', this.boundDrag);
            paper.removeEventListener('mouseup', this.boundDragEnd);
        }

        add(submob) {
            submob.isDraggable = false;
            submob.parentMobject = this;
            this.submobjects.push(submob);
            this.view.appendChild(submob.view);
            submob.updateView();
        }

        remove(submob) {
            submob.view.remove();
            remove(this.submobjects, submob);
            submob.parentMobject = undefined;
        }

        get anchor() {
            return new Vertex(this.transform.e, this.transform.f)
        }
        set anchor(newValue) {
            this.transform.centerAt(newValue);
            this.updateView();
        }

        hide() {
            this.visible = false;
            if (this.view != undefined) {
                this.view.style.visibility = 'hidden';
            }
            for (let submob of this.submobjects) {
                submob.hide();
            }
            this.updateView();
        }

        show() {
            this.visible = true;
            if (this.view != undefined) {
                this.view.style.visibility = 'visible';
            }
            for (let submob of this.submobjects) {
                submob.show();
            }
            this.updateView();
        }

        rightEdge() { return Vertex.origin() }


        createPopover(e) {
            this.popover = new Popover(this, 200, 300, 'right');
            paper.add(this.popover);
            //paper.addEventListener('mousedown', this.boundDismissPopover)
            this.view.removeEventListener('dblclick', this.boundCreatePopover);
            this.view.removeEventListener('mousedown', this.boundDragStart);
            paper.removeEventListener('mousemove', this.boundDrag);
            removeLongPress(this.view);
            this.view.addEventListener('mouseup', this.boundMouseUpAfterCreatingPopover);
        }

        mouseUpAfterCreatingPopover(e) {
            this.view.addEventListener('mousedown', this.boundDragStart);
            this.view.removeEventListener('mouseup', this.boundMouseUpAfterCreatingPopover);
        }

        dismissPopover(e) {
            if (this.popover == undefined) { return }
            if (this.popover.view.contains(e.target)
                && !this.popover.closeButton.view.contains(e.target)
                && !this.popover.deleteButton.view.contains(e.target))
                { return }
            this.popover.view.remove();
            //paper.removeEventListener('mousedown', this.boundDismissPopover)
            this.view.addEventListener('dblclick', this.boundCreatePopover);
            addLongPress(this.view, this.boundCreatePopover);
            this.popover = undefined;
        }
    }



    class MGroup extends Mobject {

        constructor(submobs = []) {
            super();
            for (let submob of submobs) {
                submob.isDraggable = false;
                this.add(submob);
            }
        }

    }















    class Polygon extends Mobject {

        constructor(vertices) {
            super();
            this.vertices = vertices;
            this.path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            this.view.appendChild(this.path);
            this.updateView();
        }

        updateView() {
            let pathString = Polygon.pathString(this.globalVertices());
            if (this.path == undefined) { return }
            this.path.setAttribute('d', pathString);
            if (this.fillColor != undefined) {
                this.path.setAttribute('fill', this.fillColor);
            }
            if (this.strokeColor != undefined) {
                this.path.setAttribute('stroke', this.strokeColor);
            }
            if (this.strokeWidth != undefined) {
                this.path.setAttribute('stroke-width', this.strokeWidth);
            }
            super.updateView();
        }

        get vertices() { return this._vertices }
        set vertices(newVertices) {
            this._vertices = newVertices;
            this.updateView();
        }

        static pathString(points) {
            let pathString = '';
            for (let point of points) {
                if (point.isNaN()) {
                    pathString = '';
                    return pathString
                }
                let prefix = (pathString == '') ? 'M' : 'L';
                pathString += prefix + stringFromPoint(point);
            }
            pathString += 'Z';
            return pathString
        }

    }














    class CurvedShape extends Mobject {

        constructor(bezierPoints = []) {
            super();
            this.bezierPoints = bezierPoints;
            this.path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            this.view.appendChild(this.path);
        }

        get bezierPoints() { return this._bezierPoints }
        set bezierPoints(newBezierPoints) {
            this._bezierPoints = newBezierPoints;
            // do NOT update view, because updateView calls updateBezierPoints
        }

        updateBezierPoints() { }
        // implemented by subclasses

        globalBezierPoints() {
            return this.globalTransform().appliedTo(this.bezierPoints)
        }

        updateView() {
            this.updateBezierPoints();
            let pathString = CurvedShape.pathString(this.globalBezierPoints());
            if (this.path) {
                this.path.setAttribute('d', pathString);
                this.path.setAttribute('fill', this.fillColor);
            }
            super.updateView();
        }

        static pathString(points) {
            if (points.length == 0) { return '' }

            // there should be 3n+1 points
            let nbCurves = (points.length - 1)/3;
            if (nbCurves % 1 != 0) { throw 'Incorrect number of Bézier points' }

            let pathString = 'M' + stringFromPoint(points[0]);
            for (let i = 0; i < nbCurves; i++) {
                let point1str = stringFromPoint(points[3*i + 1]);
                let point2str = stringFromPoint(points[3*i + 2]);
                let point3str = stringFromPoint(points[3*i + 3]);
                pathString += 'C' + point1str + ' ' + point2str + ' ' + point3str;
            }
            pathString += 'Z';
            return pathString
        }

        get strokeWidth() { return super.strokeWidth }
        set strokeWidth(newValue) {
            super.strokeWidth = newValue;
            this.path.setAttribute('stroke-width', newValue);
        }

        get strokeColor() { return super.strokeColor }
        set strokeColor(newValue) {
            super.strokeColor = newValue;
            this.path.setAttribute('stroke', newValue);
        }
    }





    class TextLabel extends Mobject {

        constructor(text) {
            super();
            this.view = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            paper.add(this);
            this.view.setAttribute('class', this.constructor.name + ' unselectable');
            this.view.mobject = this;
            this.text = text;
            this.transform = Transform.identity();
            this.submobjects = [];
            this.parentMobject = paper; // default

            this.isDraggable = false;
            this.isDragged = false;
            this.visible = true;

            this.view.setAttribute('x', 0);
            this.view.setAttribute('y', 0);
        }

        get text() { return this._text }
        set text(newText) {
            this._text = newText;
            if (this.view != undefined) { this.view.textContent = newText; }
        }

        set anchor(newValue) {
            this.transform.centerAt(newValue);
            this.updateView();
        }

        updateView() {
            this.view.setAttribute('x', this.globalTransform().e);
            this.view.setAttribute('y', this.globalTransform().f);
            super.updateView();
        }

    }













    class Popover extends CurvedShape {
        constructor(sourceMobject, width, height, direction = 'right') {
            super();
            this.sourceMobject = sourceMobject;
            console.log(sourceMobject.anchor);
            console.log(sourceMobject.rightEdge());
            this.anchor = sourceMobject.anchor.translatedBy(sourceMobject.rightEdge());
            console.log(this.anchor);
            // sourceMobject != parentMobject because using the latter
            // conflicts with the z hierarchy

            let tipSize = 10;
            let cornerRadius = 30;
            this.fillColor = 'white';
            this.strokeColor = 'black';
            this.strokeWidth = 1;
            if (direction == 'right') {
                let bezierPoints = Vertex.vertices([
                    [0, 0], [0, 0],
                    [tipSize, tipSize], [tipSize, tipSize], [tipSize, tipSize],
                    [tipSize, height/2 - cornerRadius], [tipSize, height/2 - cornerRadius], [tipSize, height/2],
                    [tipSize, height/2], [tipSize + cornerRadius, height/2], [tipSize + cornerRadius, height/2],
                    [tipSize + width - cornerRadius, height/2], [tipSize + width - cornerRadius, height/2], [tipSize + width, height/2],
                    [tipSize + width, height/2], [tipSize + width, height/2 - cornerRadius], [tipSize + width, height/2 - cornerRadius],
                    [tipSize + width, -height/2 + cornerRadius], [tipSize + width, -height/2 + cornerRadius], [tipSize + width, -height/2],
                    [tipSize + width, -height/2], [tipSize + width - cornerRadius, -height/2], [tipSize + width - cornerRadius, -height/2],
                    [tipSize + cornerRadius, -height/2], [tipSize + cornerRadius, -height/2], [tipSize, -height/2], 
                    [tipSize, -height/2], [tipSize, -height/2 + cornerRadius], [tipSize, -height/2 + cornerRadius],
                    [tipSize, -tipSize], [tipSize, -tipSize], [tipSize, -tipSize],
                    [0, 0], [0, 0]
                ]);
                // let translatedBezierPoints = []
                // for (let point of bezierPoints) {
                //     point.translateBy(this.anchor)
                // }
                this.bezierPoints = bezierPoints;
            }
            
            this.closeButton = new TextLabel('X');
            this.closeButton.anchor = new Vertex(70, -130);
            this.boundDismiss = this.dismiss.bind(this);
            this.closeButton.view.addEventListener('click', this.boundDismiss);
            this.add(this.closeButton);

            this.deleteButton = new TextLabel('🗑');
            this.deleteButton.anchor = new Vertex(65, 140);
            this.boundDelete = this.delete.bind(this);
            this.deleteButton.view.addEventListener('click', this.boundDelete);
            this.add(this.deleteButton);

        }

        dismiss(e) {
            this.sourceMobject.dismissPopover(e);
        }

        delete(e) {
            this.dismiss(e);
        }

    }




    // class ScrubbableMobject extends Mobject {

    //  constructor(anchor, quantity = null) {
    //      super(anchor)
    //      this.quantity = quantity
    //      this.boundMakeScrubbable = this.makeScrubbable.bind(this)
    //      this.boundUnmakeScrubbable = this.unmakeScrubbable.bind(this)
    //  }

    //  makeScrubbable(e) {
    //      this.scrub_indicator = new Circle(this.radius + 5)
    //      this.scrub_indicator.midPoint = this.midPoint
    //      this.scrub_indicator.fillColor = rgba(0, 0, 0, 0.2)
    //      this.add(this.scrub_indicator)
    //      this.view.removeEventListener('mousedown', this.boundDragStart)
    //      this.view.addEventListener('mousedown', this.boundScrubStart)

    //      this.scrubbingBackground = new Circle(1000)
    //      this.scrubbingBackground.midPoint = this.midPoint
    //      this.scrubbingBackground.fillColor = rgba(0,0,0,0)
    //      this.add(this.scrubbingBackground)
    //      paper.addEventListener('mousedown', this.boundUnmakeScrubbable)
    //  }

    //  unmakeScrubbable(e) {
    //      this.remove(this.scrub_indicator)
    //      this.remove(this.scrubbingBackground)
    //      this.view.removeEventListener('mousedown', this.boundScrubStart)
    //      this.view.addEventListener('mousedown', this.boundDragStart)
    //      paper.removeEventListener('mousedown', this.boundUnmakeScrubbable)
    //  }

    //  scrubStart(e) {
    //      this.scrubStartingPoint = [e.x, e.y]
    //      this.quantityBeforeScrubbing = this.quantity
    //      this.scrubbingBackground.view.addEventListener('mousemove', this.boundScrub)
    //      this.scrubbingBackground.view.addEventListener('mouseup', this.boundScrubEnd)
    //  }

    //  scrub(e) {
    //      let scrubVector = vsub([e.x, e.y], this.scrubStartingPoint)
    //      this.quantity = this.quantityBeforeScrubbing - 0.1*scrubVector[1]
    //      this.updateView()
    //  }

    //  scrubEnd(e) {
    //      this.scrubStartingPoint = undefined
    //      this.quantityBeforeScrubbing = undefined
    //      this.scrubbingBackground.view.removeEventListener('mousemove', this.boundScrub)
    //      this.scrubbingBackground.view.removeEventListener('mouseup', this.boundScrubEnd)
    //  }

    // }

    class Circle extends CurvedShape {
        
        constructor(radius) {
            super();
            this.radius = radius;
        }

        // midPoint is a synonym for anchor
        get midPoint() { return this.anchor }
        set midPoint(newValue) {
            this.anchor = newValue;
            this.updateView();
        }

        updateBezierPoints() {
            let newBezierPoints = [];
            let n = 8;
            for (let i = 0; i <= n; i++) {
                let theta = i/n * 2 * Math.PI;
                let d = this.radius * 4/3 * Math.tan(Math.PI/(2*n));
                let radialUnitVector = new Vertex(Math.cos(theta), Math.sin(theta));
                let tangentUnitVector = new Vertex(-Math.sin(theta), Math.cos(theta));
                let anchorPoint = radialUnitVector.scaledBy(this.radius);

                let leftControlPoint = anchorPoint.translatedBy(tangentUnitVector.scaledBy(-d));
                let rightControlPoint = anchorPoint.translatedBy(tangentUnitVector.scaledBy(d));

                if (i != 0) { newBezierPoints.push(leftControlPoint); }
                newBezierPoints.push(anchorPoint);
                if (i != n) { newBezierPoints.push(rightControlPoint); }
            }
            this.bezierPoints = newBezierPoints;

            // do NOT update the view, because updateView called updateBezierPoints
        }

        rightEdge() {
            return new Vertex(this.radius, 0)
        }

        get radius() { return this._radius }
        set radius(newRadius) {
            this._radius = newRadius;
            this.updateView();
        }

    }

    class Line extends Polygon {
        
        constructor(start, end) {
            super([start, end]);
            this.startPoint = start;
            this.endPoint = end;
            this.strokeColor = 'black';
        }

        get components() {
            return this.endPoint.subtract(this.startPoint)
        }

        norm2() {
            return this.components.norm2()
        }

        norm() { return Math.sqrt(this.norm2()) }
    }


    class Arrow extends MGroup {

        constructor(start = Vertex.origin(), end = Vertex.origin()) {
            super();
            if (end == null) {
                this.components = new Vertex(start);
            } else {
                this.startPoint = new Vertex(start);
                this.components = new Vertex(end);
            }
            this.stem = new Line(Vertex.origin(), this.components);
            this.add(this.stem);
            this.tip = new Polygon(this.tipPoints());
            this.add(this.tip);
        }

        get startPoint() { return this.anchor }
        set startPoint(newValue) { this.anchor = new Vertex(newValue); }

        tipPoints() {
            let w = new Scaling(-0.2).appliedTo(this.components);
            let w1 = new Rotation(Math.PI/8).appliedTo(w);
            let w2 = new Rotation(-Math.PI/8).appliedTo(w);
            return new Translation(this.components).appliedTo([Vertex.origin(), w1, w2])

        }

        get endPoint() {
            return this.startPoint.translatedBy(this.components)
        }

        set endPoint(newValue) {
            this.components = new Vertex(newValue).subtract(this.startPoint);
        }

        updateView() {

            if (this.view == undefined || this.components == undefined) { return }

            if (this.visible && this.components.isNaN()) {
                this.visible = false;
            }
            if (!this.visible && !this.components.isNaN()) {
                this.visible = true;
            }

            if (this.stem != undefined) {
                this.stem.anchor = Vertex.origin();
                this.stem.vertices = [Vertex.origin(), this.components];
            }
            if (this.tip != undefined) {
                this.tip.anchor = Vertex.origin();
                this.tip.vertices = this.tipPoints();
            }
            super.updateView();
        }

        norm2() { return this.components.norm2() }
        norm() { return Math.sqrt(this.norm2()) }

    }

    class Vector extends Arrow {}

    class VectorField extends MGroup {

        constructor(fieldFunction, width, height, samplingLength) {
            super();
            this.fieldFunction = fieldFunction;
            this.samplingLength = samplingLength;
            this.anchoringMode = 'anchor';
            this.samplingPoints = this.createSamplingPoints(width, height, samplingLength);
            for (let point of this.samplingPoints) {
                let start = point;
                let components = this.fieldFunction(point);
                let end = start.add(components);
                let v = new Vector(start, end);
                v.samplingPoint = point;
                this.add(v);
            }
        }

        get anchoringMode() { return this._anchoringMode }
        set anchoringMode(newValue) {
            if (newValue == 'start' || newValue == 'center' || newValue == 'end') {
                this._anchoringMode = newValue;
                this.updateView();
            }
        }

        createSamplingPoints(width, height, samplingLength) {
            let anchors = [];
            let dx = samplingLength;
            let dy = samplingLength;
            for (let x = 0; x < width; x += dx) {
                for (let y = 0; y < height; y += dy) {
                    anchors.push(new Vertex(x, y));
                }
            }
            return anchors
        }

        updateView() {
            for (let v of this.submobjects) {
                v.components = this.fieldFunction(v.samplingPoint);
                if (this.anchoringMode == 'start') {
                    v.anchor = v.samplingPoint;
                } else if (this.anchoringMode == 'center') {
                    v.anchor = v.samplingPoint.translatedBy(v.components.scaledBy(-0.5));
                } else if (this.anchoringMode == 'end') {
                    v.anchor = v.samplingPoint.translatedBy(v.components.scaledBy(-1));
                }
                if (v.norm2() > 4 * this.samplingLength**2) { v.hide(); }
                    else { v.show(); }
            }
            super.updateView();
        }

    }

    class Slider extends Mobject {

        constructor(min = -1, max = 1, value = 0, length = 100, orientation = 'horizontal') {
            super();
            this.min = min;
            this.max = max;
            this.value = value;
            this.length = length;
            this.orientation = orientation;
            let start = Vertex.origin();
            let end = start;
            if (orientation == 'horizontal') { end = start.translatedBy(length, 0); }
            else if (orientation == 'vertical') { end = start.translatedBy(0, -length); }
            this.line = new Line(start, end);
            this.line.strokeWidth = 1;
            this.line.anchor = Vertex.origin();
            this.add(this.line);
            this.scrubber = new Polygon([
                new Vertex(0,0), new Vertex(10,-10), new Vertex(10,10)
            ]);
            console.log(this.scrubber.path);
            this.scrubber.anchor = this.valueToCoords(this.value);
            this.add(this.scrubber);

            if (orientation == 'horizontal') {
                this.scale = new Polygon([
                    new Vertex(0,0),
                    new Vertex(this.length,0),
                    new Vertex(this.length,-40),
                    new Vertex(0,-40),
                ]);
            } else if (orientation == 'vertical') {
                this.scale = new Polygon([
                    new Vertex(0,0),
                    new Vertex(0,-this.length),
                    new Vertex(-40,-this.length),
                    new Vertex(-40,0),
                ]);
            }
            this.scale.strokeColor = rgba(0,0,0,0);
            this.scale.fillColor = rgba(0,0,0,0.2);

            this.boundDragScaleStart = this.dragScaleStart.bind(this);
            this.boundDragScale = this.dragScale.bind(this);
            this.boundDragScaleEnd = this.dragScaleEnd.bind(this);
            this.scale.view.addEventListener('mousedown', this.boundDragScaleStart);

            this.updateScale();
            this.add(this.scale);

            this.boundScrubStart = this.scrubStart.bind(this);
            this.boundScrub = this.scrub.bind(this);
            this.boundScrubEnd = this.scrubEnd.bind(this);

            this.scrubber.view.addEventListener('mousedown', this.boundScrubStart);

        }

        scrubStart(e) {
            if (e.target != this.scrubber.path) { return }
            this.scrubber.view.removeEventListener('mousedown', this.boundScrubStart);
            paper.addEventListener('mousemove', this.boundScrub);
            paper.addEventListener('mouseup', this.boundScrubEnd);
            this.dragStartingPoint = new Vertex(e.x, e.y);
            this.oldScrubAnchor = new Vertex(this.scrubber.anchor);
            this.updateValue();
        }

        scrub(e) {
            let dragVector = new Vertex(e.x, e.y).subtract(this.dragStartingPoint);
            
            if (this.orientation == 'horizontal') {
                let newX = this.oldScrubAnchor.x + dragVector.x;
                newX = Math.max(0, Math.min(this.length, newX));
                this.scrubber.anchor = new Vertex(newX, this.scrubber.anchor.y);
            } else if (this.orientation == 'vertical') {
                let newY = this.oldScrubAnchor.y + dragVector.y;
                newY = Math.min(0, Math.max(-this.length, newY));
                this.scrubber.anchor = new Vertex(this.scrubber.anchor.x, newY);
            } else {
                console.log('Unknown orientation');
            }
            this.scrubber.updateView();
            this.updateValue();
        }

        scrubEnd(e) {
            paper.removeEventListener('mouseup', this.boundScrubEnd);
            paper.removeEventListener('mousemove', this.boundScrub);
            this.scrubber.view.addEventListener('mousedown', this.boundScrubStart);
            this.updateValue();
        }

        updateValue() {
            this.value = this.coordsToValue(this.scrubber.anchor);
        }

        valueToCoords(x) {
            let fraction = (x - this.min)/(this.max - this.min);
            if (this.orientation == 'horizontal') {
                return new Vertex(fraction * this.length, 0)
            } else if (this.orientation == 'vertical') {
                return new Vertex(0, -fraction * this.length)
            } else {
                console.log('Unknown orientation');
                return undefined
            }
        }

        coordsToValue(v) {
            let fraction = 0;
            if (this.orientation == 'horizontal') {
                fraction = v.x/this.length;
            } else if (this.orientation == 'vertical') {
                fraction = -v.y/this.length;
            } else {
                console.log('Unknown orientation');
                return undefined
            }
            return (1 - fraction) * this.min + fraction * this.max
        }

        static tickValues(a, b) {
            //console.log('a', a, 'b', b)
            let n = Math.floor(Math.log10(b - a));
            //console.log('n', n)
            let m = 10**(Math.log10(b - a) - n); // mantissa, 1 <= m < 10
            //console.log('m', m)
            let unit = 0;
            if (m < 2) { unit = 0.2 * 10**n; }
            else if (m < 5) { unit = 0.5 * 10**n; }
            else { unit = 10**n; }
            //console.log('unit', unit)
            let ticks = new Array();
            //console.log('xmin', Math.ceil(a/unit)*unit)
            for (let x = Math.ceil(a/unit)*unit; x < b; x += unit) {
                 ticks.push(x);
            }
            return ticks
        }

        updateScale() {
            for (let submob of this.scale.submobjects) {
                this.scale.remove(submob);
            }
            let values = Slider.tickValues(this.min, this.max);
            for (let value of values) {
                let location = this.valueToCoords(value);
                if (this.orientation == 'horizontal') {
                    location.translateBy(0, -25);
                } else if (this.orientation = 'vertical') {
                    location.translateBy(-25, 0);
                }
                let label = new TextLabel(value);
                label.view.setAttribute('class', 'TextLabel scaleLabel unselectable');
                label.anchor = location;
                this.scale.add(label);
            }
        }

        dragScaleStart(e) {
            console.log('drag start');
            this.scale.dragStartingPoint = new Vertex(e.x, e.y);
            this.oldMin = this.min;
            this.oldMax = this.max;
            this.scale.view.removeEventListener('mousedown', this.boundDragScaleStart);
            this.scale.view.addEventListener('mousemove', this.boundDragScale);
            this.scale.view.addEventListener('mouseup', this.boundDragScaleEnd);
            e.stopPropagation();
        }

        dragScale(e) {
            console.log('dragging');
            let dragVector = new Vertex(e.x, e.y).subtract(this.scale.dragStartingPoint);
            let dvalue = 0;
            if (this.orientation == 'horizontal') {

                let newX = this.scale.dragStartingPoint.x + dragVector.x;
                newX = Math.max(0, Math.min(this.length, newX));
                let dx = newX - this.scale.dragStartingPoint.x;
                dvalue = this.coordsToValue(new Vertex(newX, 0)) - this.coordsToValue(this.scale.dragStartingPoint);

            } else if (this.orientation == 'vertical') {

                let newY = this.scale.dragStartingPoint.y + dragVector.y;
                newY = Math.max(0, Math.min(this.length, newY));
                let dy = newY - this.scale.dragStartingPoint.y;
                dvalue = this.coordsToValue(new Vertex(0, newY)) - this.coordsToValue(this.scale.dragStartingPoint);

            } else {
                console.log('Unknown orientation');
            }
            this.min = this.oldMin - dvalue;
            this.max = this.oldMax - dvalue;
            this.scrubber.anchor = this.valueToCoords(this.value);
            this.scrubber.updateView();
            this.updateScale();
        }


        dragScaleEnd(e) {
            console.log('drag end');
            this.scale.view.addEventListener('mousedown', this.boundDragScaleStart);
            this.scale.view.removeEventListener('mousemove', this.boundDragScale);
            this.scale.view.removeEventListener('mouseup', this.boundDragScaleEnd);
            this.scale.dragStartingPoint = undefined;
            this.oldMin = undefined;
            this.oldMax = undefined;
        }













    }

    class Charge extends Circle { //, ScrubbableMobject {

        constructor(charge = 1) {
            super(Charge.radiusFunc(charge));
            this.charge = charge;
            this.boundCreatePopover = this.createPopover.bind(this);
            this.view.addEventListener('dblclick', this.boundCreatePopover);

            this.label = new TextLabel(this.charge);
            this.label.view.setAttribute('class', 'unselectable ChargeLabel');
            this.label.view.style.color = 'white';
            this.add(this.label);

            this.updateView();
        }

        static radiusFunc(charge) {
            return 15 // 10*Math.sqrt(Math.abs(charge))
        }

        get charge() { return this.quantity }
        set charge(newValue) { this.quantity = newValue; }

        get location() { return this.midPoint }
        set location(newValue) { this.midPoint = newValue; }

        updateView() {
            //this.radius = Charge.radiusFunc(this.charge)
            if (this.label != undefined) {
                this.label.view.innerHTML = this.charge.toFixed(1);
            }
            super.updateView();
            if (this.field != undefined) { this.field.updateView(); }
        
        }

        createPopover(e) {
            this.popover = new ChargePopover(this, 200, 300, 'right');
            paper.add(this.popover);
            //paper.addEventListener('mousedown', this.boundDismissPopover)
            this.view.removeEventListener('dblclick', this.boundCreatePopover);
            this.view.removeEventListener('mousedown', this.boundDragStart);
            paper.removeEventListener('mousemove', this.boundDrag);
            removeLongPress(this.view);
            this.view.addEventListener('mouseup', this.boundMouseUpAfterCreatingPopover);
        }
    }



    class MagneticField extends VectorField {

        constructor(charges, width, height, resolution) {
            super(MagneticField.fieldFunction(charges), width, height, resolution);
            this.charges = charges;
            for (let c of this.charges) {
                c.field = this;
            }
            this.updateView();
        }

        static elementaryField(charge, pos) {
            let relativePos = pos.subtract(charge.anchor);
            let v = relativePos.rotatedBy(Math.PI/2);
            let factor = 5000 * charge.charge/v.norm2();
            return v.scaledBy(factor)
        }

        static fieldFunction(charges) {
            return (pos) => {
                let v = Vertex.origin();
                for (let c of charges) {
                    v = v.add(MagneticField.elementaryField(c, pos));
                }
                return v
            }
        }

    }


    class ChargePopover extends Popover {
        constructor(charge, width, height, direction = 'right') {
            super(charge, width, height, direction);
            this.charge = charge;
            this.setupSlider();
        }

        setupSlider() {
            this.slider = new Slider(-5, 5, this.charge.charge, 200, 'vertical');
            this.slider.anchor = [60, 100];
            this.slider.updatedMobject = this.charge;
            this.slider.updateValue = this.updateCharge.bind(this);
            this.add(this.slider);       
        }

        updateCharge() {
            this.slider.value = this.slider.coordsToValue(this.slider.scrubber.anchor);
            this.slider.updatedMobject.charge = this.slider.value;
            this.slider.updatedMobject.updateView();
        }

        delete(e) {
            super.delete(e);
            remove(this.charge.field.charges,this.charge);
            remove(charges, this.charge);
            this.charge.view.remove();
            v.updateView();
        }
    }

    let charge1 = new Charge(-1);
    charge1.anchor = [100, 200];
    charge1.isDraggable = true;

    let charges = [charge1];

    let v = new MagneticField(charges, 800, 800, 100);
    v.anchoringMode = 'start';

    paper.addEventListener('dblclick', createNewCharge);

    function createNewCharge(e) {
        if (e.target.mobject != undefined) {
            if (e.target.mobject instanceof Charge || e.target.mobject instanceof TextLabel) {
                return
            }
        }
        let c = new Charge(-1);
        c.anchor = [e.x, e.y];
        c.isDraggable = true;
        charges.push(c);
        v.charges.push(c);
        c.field = v;
        v.updateView();
    }

    addLongPressListener(paper, createNewCharge);
    addLongPressListener(charge1.view, charge1.createPopover);

}());

(function () {
   'use strict';

   const isTouchDevice = 'ontouchstart' in document.documentElement;


   function stringFromPoint(point) {
       let x = point[0],
           y = point[1];
       return x + ' ' + y
   }

   function rgb(r, g, b) {
       let hex_r = (Math.round(r*255)).toString(16).padStart(2, '0');
       let hex_g = (Math.round(g*255)).toString(16).padStart(2, '0');
       let hex_b = (Math.round(b*255)).toString(16).padStart(2, '0');
       return '#' + hex_r + hex_g + hex_b
   }


   function pointerEventPageLocation(e) {
       let t = null;
       let sidebarWidth = 0;
       try {
           let sidebar = document.querySelector('#sidebar');
           sidebarWidth = sidebar.clientWidth;
       } catch {
       }
       if (e instanceof MouseEvent) { t = e; }
       else { t = e.changedTouches[0]; }
       return [t.pageX - sidebarWidth, t.pageY]
   }


   function addPointerDown(element, method) {
       element.addEventListener('touchstart', method, { capture: true });
       element.addEventListener('mousedown', method, { capture: true });
   }

   function removePointerDown(element, method) {
       element.removeEventListener('touchstart', method, { capture: true });
       element.removeEventListener('mousedown', method, { capture: true });
   }

   function addPointerMove(element, method) {
       element.addEventListener('touchmove', method, { capture: true });
       element.addEventListener('mousemove', method, { capture: true });
   }

   function removePointerMove(element, method) {
       element.removeEventListener('touchmove', method, { capture: true });
       element.removeEventListener('mousemove', method, { capture: true });
   }

   function addPointerUp(element, method) {
       element.addEventListener('touchend', method, { capture: true });
       element.addEventListener('mouseup', method, { capture: true });
       element.addEventListener('pointerup', method, { capture: true });
   }

   function removePointerUp(element, method) {
       element.removeEventListener('touchend', method, { capture: true });
       element.removeEventListener('mouseup', method, { capture: true });
       element.removeEventListener('pointerup', method, { capture: true });
   }

   function logInto(obj, id) {
       let msg = obj.toString();
       let newLine = document.createElement('p');
       newLine.innerText = msg;
       let myConsole = document.querySelector('#' + id);
       myConsole.appendChild(newLine);
       
       // Neither of these lines does what they are supposed to. I give up
       //myConsole.scrollTop = console.scrollHeight
       //newLine.scrollIntoView()
   }

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
               throw 'Argument of Vertex constructor is already a Vertex. cannot assign by reference'
           }
       }

       static origin() {
           return new Vertex()
           this.x = 0;
           this.y = 0;
       }

       static new(...args) {
           let x = args[0];
           if (x instanceof Vertex) { return x }
           else { return new Vertex(...args) }
       }

       get x() { return this[0] }
       set x(newValue) { this[0] = newValue; }

       get y() { return this[1] }
       set y(newValue) { this[1] = newValue; }

       norm2() { return this.x**2 + this.y**2 }
       norm() { return Math.sqrt(this.norm2()) }

       closeTo(otherVertex) { return (this.subtract(otherVertex).norm() < 1) }

       copyFrom(otherVertex) {
           this.x = otherVertex.x;
           this.y = otherVertex.y;
       }

       update(otherVertex) { this.copyFrom(otherVertex); }

       copy() {
           let ret = new Vertex();
           ret.copyFrom(this);
           return ret
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
           if (this._anchor != undefined) {
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

       recenter() {
           this.centerAt(this.anchor);
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

       constructor(argsDict) {
           this.view = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
           this.view.setAttribute('class', this.constructor.name);
           this.view.mobject = this;
           this.eventTarget = null;
           this.setAttributes(argsDict);
           this.setDefaults({
               transform: Transform.identity(),
               anchor: Vertex.origin(),
               vertices: [],
               children: [],
               dependents: [],
               strokeWidth: 1,
               strokeColor: rgb(1, 1, 1),
               fillColor: rgb(1, 1, 1),
               draggable: false,
               isDragged: false,
               passAlongEvents: false, // to event target
               visible: true,
           });
           this.show();

           this.boundPointerDown = this.pointerDown.bind(this);
           this.boundPointerMove = this.pointerMove.bind(this);
           this.boundPointerUp = this.pointerUp.bind(this);
           this.boundEventTargetMobject = this.eventTargetMobject.bind(this);
           addPointerDown(this.view, this.boundPointerDown);

           // this.boundCreatePopover = this.createPopover.bind(this)
           // this.boundDismissPopover = this.dismissPopover.bind(this)
           // this.boundMouseUpAfterCreatingPopover = this.mouseUpAfterCreatingPopover.bind(this)

       }

       eventTargetMobject(e) {
           let t = e.target;
           if (t == this.view) { return this }
           let targetViewChain = [t];
           while (t != undefined && t != this.view) {
               t = t.parentNode;
               targetViewChain.push(t);
           }
           while (t != undefined) {
               if (t.mobject != undefined) { return t.mobject }
               t = targetViewChain.pop();
           }
       }

       pointerDown(e) {
           e.stopPropagation();
           logInto(this.constructor.name, 'paper-console');
           logInto('(as Mobject) handling pointer down', 'paper-console');
           removePointerDown(this.view, this.boundPointerDown);
           addPointerMove(this.view, this.boundPointerMove);
           addPointerUp(this.view, this.boundPointerUp);
           
           this.eventTarget = this.boundEventTargetMobject(e);
           if (this.passAlongEvents) {
               this.eventTarget.pointerDown(e);
           } else {
               this.selfHandlePointerDown(e);
           }
       }

       pointerMove(e) {
           e.stopPropagation();
           logInto(this.constructor.name, 'paper-console');
           logInto('(as Mobject) handling pointer move', 'paper-console');

           if (this.passAlongEvents) {
               this.eventTarget.pointerMove(e);
           } else {
               this.selfHandlePointerMove(e);
           }
       }

       pointerUp(e) {
           e.stopPropagation();
           logInto(this.constructor.name, 'paper-console');
           logInto('(as Mobject) handling pointer up', 'paper-console');
           removePointerMove(this.view, this.boundPointerMove);
           removePointerUp(this.view, this.boundPointerUp);
           addPointerDown(this.view, this.boundPointerDown);

           if (this.passAlongEvents) {
               this.eventTarget.pointerUp(e);
           } else {
               this.selfHandlePointerUp(e);
           }
           this.eventTarget = null;
       }

       selfHandlePointerDown(e) {
           logInto(this.constructor.name, 'paper-console');
           logInto('(as Mobject) self-handling pointer down', 'paper-console');
       }

       selfHandlePointerMove(e) {
           logInto(this.constructor.name, 'paper-console');
           logInto('(as Mobject) self-handling pointer move', 'paper-console');
       }

       selfHandlePointerUp(e) {
           logInto(this.constructor.name, 'paper-console');
           logInto('(as Mobject) self-handling pointer up', 'paper-console');

       }


       setAttributes(argsDict) {
           argsDict = argsDict || {};
           for (let [key, value] of Object.entries(argsDict)) {
               if (this[key] instanceof Vertex) { this[key].copyFrom(value); }
               else { this[key] = value; }
           }
       }

       setDefaults(argsDict) {
           for (let [key, value] of Object.entries(argsDict)) {
               if (this[key] != undefined) { continue }
               if (this[key] instanceof Vertex) { this[key].copyFrom(value); }
               else { this[key] = value; }
           }

       }

       get parent() { return this._parent }
       set parent(newValue) {
           this.view.remove();
           this._parent = newValue;
           if (newValue == undefined) { return }
           newValue.add(this);
           if (this.parent.visible) { this.show(); }
           else { this.hide(); }
       }

       globalTransform() {
           let t = Transform.identity();
           let mob = this;
           while (mob && mob.transform instanceof Transform) {
               t.leftComposeWith(mob.transform);
               mob = mob.parent;
           }
           return t
       }

       globalVertices() {
           let returnValue = this.globalTransform().appliedTo(this.vertices);
           if (returnValue == undefined) { return [] }
           else { return returnValue }
       }

       update(argsDict) {
           this.setAttributes(argsDict || {});

           if (Object.values(this).includes(undefined)) { return }

           for (let submob of this.children || []) { submob.update(); }

           if (this.popover != undefined) {
               this.popover.anchor = this.anchor.translatedBy(this.rightEdge());
           }

           //this.transform.recenter()
           this.transform.e = this.anchor.x;
           this.transform.f = this.anchor.y;
           this.updateView();
       }


       updateView() {
           if (this.view == undefined) { return }
       }


       get fillColor() { return this.view.fill }
       set fillColor(newValue) {
           this.view.fill = newValue;
           if (this.children == undefined) { return }
           for (let submob of this.children || []) {
               submob.fillColor = newValue;
           }
           this.updateView();
       }

       get fillOpacity() { return this.view.fillOpacity }
       set fillOpacity(newValue) {
           this.view.fillOpacity = newValue;

           // TODO: rethink this (commented out for circles)

   //         for (let submob of this.submobjects) {
   //             submob.fillOpacity = newValue
   //         }
           this.updateView();
       }

       get strokeColor() { return this.view.style.stroke }
       set strokeColor(newValue) {
           this.view.style.stroke = newValue;
           if (this.children == undefined) { return }
           for (let submob of this.children || []) {
               submob.strokeColor = newValue;
           }
           this.updateView();
       }

       get strokeWidth() { return this.view.strokeWidth }
       set strokeWidth(newValue) {
           this.view.strokeWidth = newValue;
           for (let submob of this.children || []) {
               submob.strokeWidth = newValue;
           }
           this.updateView();
       }


       add(submob) {
           if (submob.parent != this) { submob.parent = this; }
           if (!this.children.includes(submob)) {
               this.children.push(submob);
           }
           this.view.appendChild(submob.view);
           submob.updateView();
       }

       remove(submob) {
           submob.view.remove();
           remove(this.children, submob);
           submob.parent = undefined;
       }

       get transform() {
           if (this._transform == undefined) {
               this._transform = Transform.identity();
           }
           return this._transform
       }
       set transform(newValue) { this._transform.copyFrom(newValue); }

       get anchor() {
           return this._anchor
       }
       set anchor(newValue) {
           if (this._anchor == undefined) { this._anchor = newValue; }
           else { this._anchor.copyFrom(newValue); }
           this.transform.centerAt(newValue);
           //this.update()
       }



       hide() {
           this.visible = false;
           if (this.view != undefined) {
               this.view.style["visibility"] = "hidden";
           }
           for (let submob of this.children) { submob.hide(); } // we have to propagate invisibility
           this.updateView();
       }

       show() {
           this.visible = true;
           if (this.view != undefined) {
               this.view.style["visibility"] = "visible";
           }
           for (let submob of this.children) { submob.show(); } // we have to propagate visibility bc we have to for invisibility
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
                                                      
       registerTouchStart(e) {
           this.touchStart = new Vertex(pointerEventPageLocation(e));
       }
              
       closeTo(otherMobject) {
           return (this.anchor.subtract(otherMobject.anchor).norm() < 10)
       }
   }














   class CurvedShape extends Mobject {

       constructor(argsDict) {
           super(argsDict);
           this.bezierPoints = [];
           this.path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
           this.view.appendChild(this.path);
       }

       updateBezierPoints() { }
       // implemented by subclasses

       globalBezierPoints() {
           let ret = this.globalTransform().appliedTo(this.bezierPoints);
           return ret
       }

       updateView() {
           this.updateBezierPoints();
           let pathString = CurvedShape.pathString(this.globalBezierPoints());
           if (this.path && this.bezierPoints.length > 0) {
               this.path.setAttribute('d', pathString);
               this.path.setAttribute('fill', this.fillColor);
               this.path.setAttribute('fill-opacity', this.fillOpacity);
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
           if (this.path != undefined) {
               this.path.setAttribute('stroke-width', newValue);
           }
       }

       get strokeColor() { return super.strokeColor }
       set strokeColor(newValue) {
           super.strokeColor = newValue;
           if (this.path != undefined) {
               this.path.setAttribute('stroke', newValue);
           }
       }
   }













   // export class Popover extends CurvedShape {
   //     constructor(sourceMobject, width, height, direction = 'right') {
   //         super()
   //         this.sourceMobject = sourceMobject
   //         this.anchor = sourceMobject.anchor.translatedBy(sourceMobject.rightEdge())
   //         // sourceMobject != parentMobject because using the latter
   //         // conflicts with the z hierarchy

   //         let tipSize = 10
   //         let cornerRadius = 30
   //         this.fillColor = 'white'
   //         this.strokeColor = 'black'
   //         this.strokeWidth = 1
   //         if (direction == 'right') {
   //             let bezierPoints = Vertex.vertices([
   //                 [0, 0], [0, 0],
   //                 [tipSize, tipSize], [tipSize, tipSize], [tipSize, tipSize],
   //                 [tipSize, height/2 - cornerRadius], [tipSize, height/2 - cornerRadius], [tipSize, height/2],
   //                 [tipSize, height/2], [tipSize + cornerRadius, height/2], [tipSize + cornerRadius, height/2],
   //                 [tipSize + width - cornerRadius, height/2], [tipSize + width - cornerRadius, height/2], [tipSize + width, height/2],
   //                 [tipSize + width, height/2], [tipSize + width, height/2 - cornerRadius], [tipSize + width, height/2 - cornerRadius],
   //                 [tipSize + width, -height/2 + cornerRadius], [tipSize + width, -height/2 + cornerRadius], [tipSize + width, -height/2],
   //                 [tipSize + width, -height/2], [tipSize + width - cornerRadius, -height/2], [tipSize + width - cornerRadius, -height/2],
   //                 [tipSize + cornerRadius, -height/2], [tipSize + cornerRadius, -height/2], [tipSize, -height/2], 
   //                 [tipSize, -height/2], [tipSize, -height/2 + cornerRadius], [tipSize, -height/2 + cornerRadius],
   //                 [tipSize, -tipSize], [tipSize, -tipSize], [tipSize, -tipSize],
   //                 [0, 0], [0, 0]
   //             ])
   //             // let translatedBezierPoints = []
   //             // for (let point of bezierPoints) {
   //             //     point.translateBy(this.anchor)
   //             // }
   //             this.bezierPoints = bezierPoints
   //         }
           
   //         this.closeButton = new TextLabel('X')
   //         this.closeButton.anchor = new Vertex(70, -130)
   //         this.boundDismiss = this.dismiss.bind(this)
   //         this.closeButton.view.addEventListener('click', this.boundDismiss)
   //         this.add(this.closeButton)

   //         this.deleteButton = new TextLabel('🗑')
   //         this.deleteButton.anchor = new Vertex(65, 140)
   //         this.boundDelete = this.delete.bind(this)
   //         this.deleteButton.view.addEventListener('click', this.boundDelete)
   //         this.add(this.deleteButton)

   //     }

   //     dismiss(e) {
   //         this.sourceMobject.dismissPopover(e)
   //     }

   //     delete(e) {
   //         this.dismiss(e)
   //     }
                                                                                               
   // }












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
   //      this.remove(this.scrubrub_indicator)
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
       
       constructor(argsDict) {
           super(argsDict);
           this.setDefaults({
               radius: 10,
               midPoint: Vertex.origin()
           });
       }

       // midPoint is a synonym for anchor
       get midPoint() { return this.anchor }
       set midPoint(newValue) {
           this.anchor = newValue; // updates automatically
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
           this.update();
       }

   }

   class InteractivePoint extends Circle {

       constructor(argsDict) {
           super(argsDict);
           this.setDefaults({
               brightness: 0.5
           });
           this.update({});
       }

       selfHandlePointerDown(e) {
           logInto(this.constructor.name, 'paper-console');
           logInto('self-handling pointer down', 'paper-console');
           super.selfHandlePointerDown(e);
           this.startY = pointerEventPageLocation(e)[1];
           this.startBrightness = this.brightness;
       }

       selfHandlePointerMove(e) {
           logInto(this.constructor.name, 'paper-console');
           logInto('self-handling pointer move', 'paper-console');
           super.selfHandlePointerMove(e);
           let newY = pointerEventPageLocation(e)[1];
           this.brightness = this.startBrightness + (newY - this.startY)/255;
           this.update();
       }


       update(argsDict) {
           this.fillColor = rgb(this.brightness, this.brightness, this.brightness);
           super.update(argsDict);
       }

   }

   class Paper extends Mobject {

        constructor(argsDict) {
           super(argsDict);
           //this.view = document.querySelector('#paper')
           //this.view.mobject = this
   //         this.useCapture = true
   //         this.isCreating = false
   //         this.draggedMobject = undefined
   //         this.constructionModes = ['segment', 'ray', 'line', 'circle', 'cindy']
   //         this.currentMode = 'freehand'
   //         this.colorPalette = {
   //             'black': rgb(0, 0, 0),
   //             'white': rgb(1, 1, 1),
   //             'red': rgb(1, 0, 0),
   //             'orange': rgb(1, 0.5, 0),
   //             'yellow': rgb(1, 1, 0),
   //             'green': rgb(0, 1, 0),
   //             'blue': rgb(0, 0, 1),
   //             'indigo': rgb(0.5, 0, 1),
   //             'violet': rgb(1, 0, 1)
   //         }
   //         this.currentColor = this.colorPalette['white']

   //         this.freehands = []
   //         this.freePoints = []
   //         this.constructions = []
   //         this.cindyPorts = []

   //         this.newFreehand = undefined
   //         this.newPoints = []
   //         this.newConstructions = {}
   //         this.newCindyPort = undefined

   //         this.boundStartDragging = this.startDragging.bind(this)
   //         this.boundDrag = this.drag.bind(this)
   //         this.boundEndDragging = this.endDragging.bind(this)

   //         this.boundPointerDown = this.pointerDown.bind(this)
   //         this.boundPointerMove = this.pointerMove.bind(this)
   //         this.boundPointerUp = this.pointerUp.bind(this)
   //         addPointerDown(this.view, this.boundPointerDown, this.useCapture)
        }

   //     changeColorByName(newColorName) {
   //         let newColor = this.colorPalette[newColorName]
   //         this.changeColor(newColor)
   //     }

   //     changeColor(newColor) {
   //         this.currentColor = newColor
   //         for (let mob of Object.values(this.newConstructions)) {
   //             mob.strokeColor = this.currentColor
   //             mob.fillColor = this.currentColor
   //         }
   //         for (let mob of Object.values(this.newPoints)) {
   //             mob.strokeColor = this.currentColor
   //             mob.fillColor = this.currentColor
   //         }
   //         try {
   //             this.newFreehand.strokeColor = this.currentColor
   //             this.newFreehand.fillColor = this.currentColor
   //         } catch { }

   //     }

        changeMode(newMode) {

            this.currentMode = newMode;

   //         if (newMode == 'drag') {
   //             for (let mob of this.constructions) {
   //                 if (mob instanceof CindyCanvas) {
   //                     mob.view.style['pointer-events'] = 'none'
   //                 }
   //             }
   //         } else {
   //             for (let mob of this.constructions) {
   //                 if (mob instanceof CindyCanvas) {
   //                     mob.view.style['pointer-events'] = 'auto'
   //                 }
   //             }
   //         }
   //         for (let mob of Object.values(this.newConstructions)) { mob.hide() }
   //         for (let point of this.newPoints) { point.hide() }
   //         if (this.newFreehand != undefined) { this.newFreehand.hide() }

   //         switch (this.currentMode) {
   //         case 'freehand':
   //             try { this.newFreehand.show() } catch { }
   //             break

   //         case 'segment':
   //         case 'ray':
   //         case 'line':
   //         case 'circle':
   //             try { this.newPoints[0].show() } catch { }
   //             try { this.newPoints[1].show() } catch { }
   //             try { this.newConstructions[this.currentMode].show() } catch { }
   //             break
   //         case 'cindy':
   //             try { this.newConstructions['cindy'].show() } catch { }
   //             break
   //         case 'drag':
   //             break
   //         }
        }


   //     targetMobject(e) {
   //     // which mobject have we clicked on?
   //     // (event detection completely handled by paper except maybe for Cindy)
   //         //if (!(e.target.mobject instanceof CindyCanvas || e.target.mobject instanceof FreePoint)) {
   //         let tm = undefined
   //         if (this.draggedMobject != undefined) {
   //             tm = this.draggedMobject
   //             return tm
   //         }
   //         let p = new Vertex(pointerEventPageLocation(e))
   //         for (let point of this.freePoints) {
   //             if (point.anchor.subtract(p).norm() < 10) {
   //                 tm = point
   //                 return tm
   //             }
   //         }
   //         tm = e.target.parentNode.mobject
   //         if (tm != undefined) {
   //             // maybe the event got detected by a point, but through its path
   //             if (tm instanceof DrawnCircle) {
   //                 return this // clicked inside a circle, but not on its center
   //             }
   //         } else {
   //             // paper or Cindy canvas
   //             tm = e.target.mobject
   //             return tm
   //         }
   //     }

   //     pointerDown(e) {
   //         e.preventDefault()
   //         e.stopPropagation()
   //         let target = this.targetMobject(e)
   //         let p = new Vertex(pointerEventPageLocation(e))
   //         switch (target.constructor.name) {
   //         case 'Paper':
   //             this.handlePointerDownOnPaper(target, p)
   //             // meaning we create two new points
   //             break
   //         case 'FreePoint':
   //             this.handlePointerDownOnFreePoint(target, p)
   //             // meaning we either drag a point or create something starting there
   //             break
   //         }
   //         this.update()

   //         addPointerMove(this.view, this.boundPointerMove)
   //         addPointerUp(this.view, this.boundPointerUp)
   //         removePointerDown(this.view, this.boundPointerDown)
   //     }

   //     pointerMove(e) {
   //         e.preventDefault()
   //         e.stopPropagation()
   //         let target = this.targetMobject(e)
   //         let p = new Vertex(pointerEventPageLocation(e))

   //         if (target != this && !this.isCreating) { this.currentMode = 'drag' }
   //         console.log(p, target)
   //         this.handlePointerMove(target, p)
   //     }

   //     pointerUp(e) {
   //         e.preventDefault()
   //         e.stopPropagation()
   //         let target = this.targetMobject(e)
   //         let p = new Vertex(pointerEventPageLocation(e))

   //         this.handlePointerUp(target, p)

   //         addPointerDown(this.view, this.boundPointerDown, this.useCapture)
   //         removePointerMove(this.view, this.boundPointerMove, this.useCapture)
   //         removePointerUp(this.view, this.boundPointerUp, this.useCapture)
   //     }





   //     handlePointerDownOnPaper(target, p) {
   //         if (this.currentMode == 'drag') {
   //             for (let mob of this.constructions) {
   //                 if (mob instanceof CindyCanvas) { target = mob }
   //             }
   //             this.startDragging(p, target)
   //             return
   //         }
   //         // start a new construction from nowhere
   //         // including a freehand drawing)
   //         let fp1 = new FreePoint({anchor: p, strokeColor: this.currentColor, fillColor: this.currentColor})
   //         let fp2 = new FreePoint({anchor: p.copy(), strokeColor: this.currentColor, fillColor: this.currentColor})
   //         let fh = new Freehand({anchor: Vertex.origin(), strokeColor: this.currentColor, fillColor: this.currentColor})
   //         let s = new Segment({startPoint: fp1.anchor, endPoint: fp2.anchor, strokeColor: this.currentColor, fillColor: this.currentColor})
   //         let r = new Ray({startPoint: fp1.anchor, endPoint: fp2.anchor, strokeColor: this.currentColor, fillColor: this.currentColor})
   //         let l = new Line({startPoint: fp1.anchor, endPoint: fp2.anchor, strokeColor: this.currentColor, fillColor: this.currentColor})
   //         let c = new DrawnCircle({midPoint: fp1.anchor, outerPoint: fp2.anchor, strokeColor: this.currentColor, fillColor: this.currentColor})
   //         let cindyRect = new DrawnRectangle({startPoint: fp1.anchor, endPoint: fp2.anchor})
   //         // more geometric objects to follow
   //         this.add(fp1)
   //         this.add(fp2)
   //         this.add(fh)
   //         this.add(s)
   //         this.add(r)
   //         this.add(l)
   //         this.add(c)
   //         this.add(cindyRect)

   //         this.newPoints = [fp1, fp2]
   //         this.newFreehand = fh
   //         this.newConstructions['segment'] = s
   //         this.newConstructions['ray'] = r
   //         this.newConstructions['line'] = l
   //         this.newConstructions['circle'] = c
   //         this.newConstructions['cindy'] = cindyRect

   //         for (let mob of Object.values(this.newConstructions)) {
   //             mob.hide()
   //         }
   //         for (let point of Object.values(this.newPoints)) {
   //             point.hide()
   //         }

   //         // show the relevant objects
   //         this.changeMode(this.currentMode)

   //         this.draggedMobject = fp2
   //         this.isCreating = true

   //     }

   //     handlePointerDownOnFreePoint(target, p) {
   //         if (this.currentMode == 'freehand') {
   //             this.currentMode = 'drag'
   //             this.draggedMobject = target
   //             return
   //         }

   //         // else: create something
   //         let fp1 = target
   //         fp1.update({strokeColor: this.currentColor, fillColor: this.currentColor})
   //         let fp2 = new FreePoint({anchor: p, strokeColor: this.currentColor, fillColor: this.currentColor})
   //         let s = new Segment({startPoint: fp1.anchor, endPoint: fp2.anchor, strokeColor: this.currentColor, fillColor: this.currentColor})
   //         let r = new Ray({startPoint: fp1.anchor, endPoint: fp2.anchor, strokeColor: this.currentColor, fillColor: this.currentColor})
   //         let l = new Line({startPoint: fp1.anchor, endPoint: fp2.anchor, strokeColor: this.currentColor, fillColor: this.currentColor})
   //         let c = new DrawnCircle({midPoint: fp1.anchor, outerPoint: fp2.anchor, strokeColor: this.currentColor, fillColor: this.currentColor})
   //         this.add(fp2)
   //         this.add(s)
   //         this.add(r)
   //         this.add(l)
   //         this.add(c)

   //         this.newPoints = [fp2]
   //         this.newConstructions['segment'] = s
   //         this.newConstructions['ray'] = r
   //         this.newConstructions['line'] = l
   //         this.newConstructions['circle'] = c

   //         for (let mob of Object.values(this.newConstructions)) {
   //             mob.hide()
   //         }
   //         for (let point of Object.values(this.newPoints)) {
   //             point.hide()
   //         }

   //         // show the relevant objects
   //         this.changeMode(this.currentMode)

   //         this.draggedMobject = fp2
   //         this.isCreating = true
   //     }

   //     handlePointerMove(target, p) {
   //         this.draggedMobject.anchor.copyFrom(p)
   //         this.snap(this.draggedMobject)
   //         if (this.newFreehand != undefined) {
   //             this.newFreehand.updateFromTip(p)
   //         }
   //         this.update()

   //         this.changeMode(this.currentMode)
   //     }

   //     snap(mobject) {
   //         if (!(mobject instanceof FreePoint)) { return }
   //         for (let otherPoint of this.freePoints) {
   //             if (otherPoint == mobject) { continue }
   //             if (otherPoint.anchor.subtract(mobject.anchor).norm() < 10) {
   //                 mobject.anchor.copyFrom(otherPoint.anchor)
   //                 return
   //             }
   //         }
   //     }


   //     handlePointerUp(target, p) {
   //         this.draggedMobject = undefined
   //         for (let mob of Object.values(this.newConstructions)) {
   //             mob.view.remove()
   //         }
   //         switch (this.currentMode) {
   //         case 'freehand':
   //             this.freehands.push(this.newFreehand)
   //             for (let point of this.newPoints) { point.view.remove() }
   //             break
   //         case 'segment':
   //         case 'ray':
   //         case 'line':
   //         case 'circle':
   //             let newMob = this.newConstructions[this.currentMode]
   //             console.log(newMob)
   //             let fp1 = this.newPoints[0]
   //             let fp2 = this.newPoints[1]

   //             function replaceWithSnappedPoint(fp, newMob, freePoints, paper) {
   //                 let snappedFP = undefined
   //                 for (let point of freePoints) {
   //                     if (point.anchor.subtract(fp.anchor).norm() < 1) {
   //                         let color = fp.fillColor
   //                         snappedFP = point
   //                         snappedFP.update({strokeColor: color, fillColor: color})
   //                         break
   //                     }
   //                 }
   //                 if (snappedFP == undefined) { return fp }

   //                 try {
   //                 if (newMob.startPoint.subtract(fp.anchor).norm() < 1) { newMob.startPoint = snappedFP.anchor }
   //                 } catch {}
   //                 try {
   //                 if (newMob.endPoint.subtract(fp.anchor).norm() < 1)  {
   //                     newMob.endPoint = snappedFP.anchor
   //                 }
   //                 } catch {}
   //                 try {
   //                 if (newMob.midPoint.subtract(fp.anchor).norm() < 1)  { newMob.midPoint = snappedFP.anchor }
   //                 } catch {}
   //                 try {
   //                     if (newMob.outerPoint.subtract(fp.anchor).norm() < 1)  { newMob.outerPoint = snappedFP.anchor }
   //                 } catch {}
   //                 fp.view.remove()
   //                 paper.add(snappedFP)
   //                 return snappedFP
   //             }

   //             if (this.isCreating) {
   //                 if (fp1 != undefined) {
   //                     fp1 = replaceWithSnappedPoint(fp1, newMob, this.freePoints, this)
   //                     if (!this.freePoints.includes(fp1)) {
   //                         this.freePoints.push(fp1)
   //                     }
   //                 }
   //                 if (fp2 != undefined) {
   //                     fp2 = replaceWithSnappedPoint(fp2, newMob, this.freePoints, this)
   //                     if (!this.freePoints.includes(fp2)) {
   //                         this.freePoints.push(fp2)
   //                     }
   //                 }
   //             }
               

   //             this.constructions.push(newMob)
   //             this.add(newMob)
   //             console.log('just added:', newMob)

   //         case 'drag':
   //             this.currentMode = 'freehand'
   //             break
   //         case 'cindy':
   //             let origin = this.newConstructions['cindy'].p1
   //             let lrCorner = this.newConstructions['cindy'].p3
   //             let cindyWidth = lrCorner.x - origin.x
   //             let cindyHeight = lrCorner.y - origin.y
   //             this.newConstructions['cindy'].view.remove()
   //             this.constructions.push(new CindyCanvas(origin, cindyWidth, cindyHeight))

   //         }

   //         this.isCreating = false
   //         this.newFreehand = undefined
   //         this.newPoints = []
   //         this.newConstructions = {}
   //         this.update()
   //     }







   //     add(mobject) {
   //         this.view.appendChild(mobject.view)
   //     }

   //     update() {
   //         for (let point of this.freePoints) { point.update() }
   //         for (let point of this.newPoints) { point.update() }
   //         for (let mob of this.constructions) { mob.update() }
   //         for (let mob of Object.values(this.newConstructions)) { mob.update() }
   //     }


   //     startDragging(p, mob) {
   //         let oldX = parseInt(mob.view.style.left.replace('px', ''))
   //         let oldY = parseInt(mob.view.style.top.replace('px', ''))
   //         let q = new Vertex(oldX, oldY)
   //         this.mobOffsetFromCursor = q.subtract(p)
           
   //         addPointerMove(this.view, this.boundDrag)
   //         addPointerUp(this.view, this.boundEndDragging)
   //     }

   //     drag(e) {
   //         let dragPoint = new Vertex(pointerEventPageLocation(e))
   //         let mob = null
   //         for (let mob2 of this.constructions) {
   //             if (mob2 instanceof CindyCanvas) {mob = mob2 }
   //         }
   //         mob.view.style.left = (dragPoint.x + this.mobOffsetFromCursor.x) + 'px'
   //         mob.view.style.top = (dragPoint.y + this.mobOffsetFromCursor.y) + 'px'
   //     }

   //     endDragging(e) {
   //         removePointerMove(this.view, this.boundDrag)
   //         removePointerUp(this.view, this.boundEndDragging)
   //         this.currentMode = 'freehand'
   //         this.draggedMobject = undefined
   //     }


   }

   logInto('test', 'paper-console');

   let paper$1 = new Paper({view: document.querySelector('#paper'), passAlongEvents: true });

   let ip = new InteractivePoint({midPoint: new Vertex(100, 100), radius: 20, fillColor: rgb(1, 1, 1)});

   paper$1.add(ip);

}());

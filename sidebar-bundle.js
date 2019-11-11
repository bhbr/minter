(function () {
   'use strict';

   const isTouchDevice = 'ontouchstart' in document.documentElement;


   function stringFromPoint(point) {
       let x = point[0],
           y = point[1];
       return x + ' ' + y
   }

   function remove(arr, value, all = false) {
      for (let i = 0; i < arr.length; i++) {
           if (arr[i] == value) {
               arr.splice(i,1);
               if (!all) { break }
           }
       }
   }

   function rgb(r, g, b) {
       let hex_r = (Math.round(r*255)).toString(16).padStart(2, '0');
       let hex_g = (Math.round(g*255)).toString(16).padStart(2, '0');
       let hex_b = (Math.round(b*255)).toString(16).padStart(2, '0');
       return '#' + hex_r + hex_g + hex_b
   }

   function gray(x) { return rgb(x, x, x) }


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

   function pointerEventVertex(e) {
       return new Vertex(pointerEventPageLocation(e))
   }

   class Mobject {

       constructor(argsDict) {
           argsDict = argsDict || {};
           this.eventTarget = null;
           if (argsDict['view'] == undefined) {
               this.view = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
           } else {
               this.view = argsDict['view'];
           }
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
               passAlongEvents: false, // to event target
               visible: true,
               draggable: false // by outside forces, that is
           });
           this.view.mobject = this;
           this.view.setAttribute('class', this.constructor.name);
           this.show();

           this.boundPointerDown = this.pointerDown.bind(this);
           this.boundPointerMove = this.pointerMove.bind(this);
           this.boundPointerUp = this.pointerUp.bind(this);
           this.boundEventTargetMobject = this.eventTargetMobject.bind(this);
           addPointerDown(this.view, this.boundPointerDown);

           this.savedSelfHandlePointerDown = this.selfHandlePointerDown;
           this.savedSelfHandlePointerMove = this.selfHandlePointerMove;
           this.savedSelfHandlePointerUp = this.selfHandlePointerUp;
           this.disableDragging();

           // this.boundCreatePopover = this.createPopover.bind(this)
           // this.boundDismissPopover = this.dismissPopover.bind(this)
           // this.boundMouseUpAfterCreatingPopover = this.mouseUpAfterCreatingPopover.bind(this)

       }

       enableDragging() {
           this.savedSelfHandlePointerDown = this.selfHandlePointerDown;
           this.savedSelfHandlePointerMove = this.selfHandlePointerMove;
           this.savedSelfHandlePointerUp = this.selfHandlePointerUp;
           this.selfHandlePointerDown = this.startSelfDragging;
           this.selfHandlePointerMove = this.selfDragging;
           this.selfHandlePointerUp = this.endSelfDragging;
       }

       disableDragging() {
           this.selfHandlePointerDown = this.savedSelfHandlePointerDown;
           this.selfHandlePointerMove = this.savedSelfHandlePointerMove;
           this.selfHandlePointerUp = this.savedSelfHandlePointerUp;
       }

       eventTargetMobject(e) {
           let t = e.target;
           if (t.tagName == 'path') { t = t.parentNode; }
           if (t == this.view) { return this }
           let targetViewChain = [t];
           while (t != undefined && t != this.view) {
               t = t.parentNode;
               targetViewChain.push(t);
           }
           t = targetViewChain.pop();
           t = targetViewChain.pop();
           while (t != undefined) {
               if (t.mobject != undefined) { return t.mobject }
               t = targetViewChain.pop(); 
           }
           return this
       }

       pointerDown(e) {
           e.stopPropagation();
           removePointerDown(this.view, this.boundPointerDown);
           addPointerMove(this.view, this.boundPointerMove);
           addPointerUp(this.view, this.boundPointerUp);

           this.eventTarget = this.boundEventTargetMobject(e);
           if (this.eventTarget != this && this.passAlongEvents) {
               this.eventTarget.pointerDown(e);
           } else {
               this.selfHandlePointerDown(e);
           }
           this.update();
       }

       pointerMove(e) {
           e.stopPropagation();

           if (this.eventTarget != this && this.passAlongEvents) {
               this.eventTarget.pointerMove(e);
           } else {
               this.selfHandlePointerMove(e);
           }
           this.update();
       }

       pointerUp(e) {
           e.stopPropagation();
           removePointerMove(this.view, this.boundPointerMove);
           removePointerUp(this.view, this.boundPointerUp);
           addPointerDown(this.view, this.boundPointerDown);

           if (this.eventTarget != this && this.passAlongEvents) {
               this.eventTarget.pointerUp(e);
           } else {
               this.selfHandlePointerUp(e);
           }
           this.eventTarget = null;
           this.update();
       }


       selfHandlePointerDown(e) { }
       selfHandlePointerMove(e) { }
       selfHandlePointerUp(e) { }

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
           if (Object.values(this).includes(undefined)) { 
               return
           }

           for (let mob of this.dependents || []) {
               mob.update();
           }
           for (let submob of this.children || []) {
               if (this.dependsOn(submob)) {
                   continue
               }
               submob.update();
           }

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

       allDependents() {
           let dep = [];
           for (let mob of this.dependents) {
               dep.push(mob);
               for (let mob2 of mob.allDependents()) {
                   dep.push(mob2);
               }
           }
           return dep
       }

       dependsOn(otherMobject) {
           return otherMobject.allDependents().includes(this)
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



       startSelfDragging(e) {
           this.dragPointStart = new Vertex(pointerEventPageLocation(e));
           this.dragAnchorStart = this.anchor.copy();
       }

       selfDragging(e) {
           let dragPoint = new Vertex(pointerEventPageLocation(e));
           let dr = dragPoint.subtract(this.dragPointStart);
           this.anchor.copyFrom(this.dragAnchorStart.add(dr));
           this.update();
       }

       endSelfDragging(e) {
           this.dragPointStart = undefined;
           this.dragAnchorStart = undefined;
       }





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
           this.path.mobject = this;
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





   class TextLabel extends Mobject {

       constructor(argsDict) {
           super(argsDict);
           this.setDefaults({
               text: ''
           });
           this.view = document.createElementNS('http://www.w3.org/2000/svg', 'text');
           this.view.setAttribute('class', this.constructor.name + ' unselectable');
           this.view.setAttribute('text-anchor', 'middle');
           this.view.setAttribute('alignment-baseline', 'middle');
           this.view.setAttribute('fill', 'white');
           this.view.setAttribute('font-family', 'Helvetica');
           this.view.setAttribute('font-size', '12');
           this.view.mobject = this;

           this.view.setAttribute('x', 0);
           this.view.setAttribute('y', 0);
       }

       get text() { return this._text }
       set text(newText) {
           this._text = newText;
           if (this.view != undefined) { this.view.textContent = newText; }
       }

       updateView() {
           this.view.setAttribute('x', this.globalTransform().e);
           this.view.setAttribute('y', this.globalTransform().f);
           super.updateView();
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

   }

   let paper$1 = null;
   if (!isTouchDevice) {
       const paperView = document.querySelector('#paper');
       paper$1 = paperView.mobject;
   }

   let sidebar = document.querySelector('#sidebar');
   sidebar.add = function(mobject) {
       sidebar.appendChild(mobject.view);
   };

   function buttonCenter(index) {
       let y = buttonYOffset + index * (buttonSpacing + 2*buttonRadius);
       return new Vertex(buttonXOffset, y)
   }



   const buttonXOffset = 50;
   const buttonYOffset = 50;
   const buttonSpacing = 12.5;
   const buttonRadius = 25;
   const buttonScaleFactor = 1.3;

   class SidebarButton extends Circle {
       
       constructor(argsDict) {
           super(argsDict);
           this.setDefaults({
               currentModeIndex: 0,
               baseColor: rgb(1, 1, 1),
               locationIndex: 0,
               optionSpacing: 25,
               active: false,
               showLabel: true,
               text: 'text',
               fontSize: 12,
           });
           this.setAttributes({
               radius: buttonRadius
           });

           this.updateModeIndex(0);
           this.label = new TextLabel({text: this.text});
           this.label.view.setAttribute('font-size', this.fontSize.toString());
           this.label.anchor = Vertex.origin();
           this.add(this.label);
           this.update();

           this.boundButtonUpByKey = this.buttonUpByKey.bind(this);
           this.boundButtonDownByKey = this.buttonDownByKey.bind(this);
           this.boundButtonUpByPointer = this.buttonUpByPointer.bind(this);
           this.boundButtonDownByPointer = this.buttonDownByPointer.bind(this);
           this.boundCommonButtonUp = this.commonButtonUp.bind(this);
           this.boundCommonButtonDown = this.commonButtonDown.bind(this);
           this.boundButtonDrag = this.buttonDrag.bind(this);
           
           addPointerDown(this.view, this.boundButtonDownByPointer);
           document.addEventListener('keydown', this.boundButtonDownByKey);
       }
       
       get baseColor() { return this._baseColor }
       set baseColor(newColor) {
           this._baseColor = newColor;
           this.fillColor = newColor;
       }
       
       get locationIndex() { return this._locationIndex }
       set locationIndex(newIndex) {
           this._locationIndex = newIndex;
           this.anchor = buttonCenter(this._locationIndex);
           
       }
       
       static brighten(color, factor) {
           return rgb(factor*color[0], factor*color[1], factor*color[2])
       }

       colorForIndex(i) {
           return this.baseColor
       }
       
       buttonDownByKey(e) {
           e.preventDefault();
           e.stopPropagation();
           document.addEventListener('keyup', this.boundButtonUpByKey);
           if (e.key == this.key) {
               this.commonButtonDown();
           } else if (e.key == 'ArrowRight' && this.active) {
               this.selectNextOption();
           } else if (e.key == 'ArrowLeft' && this.active) {
               this.selectPreviousOption();
           }
       }

       commonButtonDown() {
           if (this.active) { return }
           this.active = true;
           this.radius = buttonRadius * buttonScaleFactor;
           this.previousIndex = this.currentModeIndex;
           this.messagePaper(this.messages[0]);
           this.update();
       }
       
       buttonDownByPointer(e) {
           e.preventDefault();
           e.stopPropagation();
           this.commonButtonDown();
           removePointerDown(this.view, this.boundButtonDownByPointer);
           addPointerUp(this.view, this.boundButtonUpByPointer);
           addPointerMove(this.view, this.boundButtonDrag);
           this.registerTouchStart(e);
       }
       

       buttonUpByPointer(e) {
           e.preventDefault();
           e.stopPropagation();
           
           removePointerUp(this.view, this.boundButtonUpByPointer);
           addPointerDown(this.view, this.boundButtonDownByPointer);
           removePointerMove(this.view, this.boundButtonDrag);
           
           this.commonButtonUp();
       }
       
       buttonUpByKey(e) {
           if (e.key == this.key) {
               document.removeEventListener('keyup', this.boundButtonUpByKey);
               document.addEventListener('keydown', this.boundButtonDownByKey);
               this.commonButtonUp();
           }
       }

       commonButtonUp() {
           this.radius = buttonRadius;
           let dx = this.currentModeIndex * this.optionSpacing;
           let newMidpoint = new Vertex(buttonCenter(this.locationIndex).x + dx, buttonCenter(this.locationIndex).y);
           this.midPoint.copyFrom(newMidpoint);

           this.update();
           this.active = false;
           this.fillColor = this.colorForIndex(this.currentModeIndex);
           this.label.view.setAttribute('font-size', this.fontSize.toString());
           this.messagePaper(this.outgoingMessage);
       }

       messagePaper(message) {
           try {
               webkit.messageHandlers.handleMessage.postMessage(message);
           } catch {
               paper$1.handleMessage(message);
           }
       }

       updateLabel() {
           let f = this.active ? buttonScaleFactor : 1;
           this.label.view.setAttribute('font-size', (f * this.fontSize).toString());
           if (this.showLabel) {
               try {
                   let msg = this.messages[this.currentModeIndex];
                   this.label.text = Object.values(msg)[0];
               } catch { }
           } else {
               this.label.text = '';
           }
       }

       update(argsDict) {
           super.update(argsDict);
           this.updateLabel();
       }
       
       updateModeIndex(newIndex, withMessage) {
           if (newIndex == this.currentModeIndex || newIndex == -1) { return }
           this.currentModeIndex = newIndex;
           let message = this.messages[this.currentModeIndex];
           this.fillColor = this.colorForIndex(this.currentModeIndex);
           if (withMessage) { this.messagePaper(message); }
    
           this.update();
       }
       
       selectNextOption() {
           if (this.currentModeIndex == this.messages.length - 1) { return }
           let dx = this.optionSpacing * (this.currentModeIndex + 1);
           this.midPoint = new Vertex(buttonCenter(this.locationIndex).x + dx, buttonCenter(this.locationIndex).y);
           this.updateModeIndex(this.currentModeIndex + 1, true);
       }
       
       
       selectPreviousOption() {
           if (this.currentModeIndex == 0) { return }
           let dx = this.optionSpacing * (this.currentModeIndex - 1);
           this.midPoint = new Vertex(buttonCenter(this.locationIndex).x + dx, buttonCenter(this.locationIndex).y);
           this.updateModeIndex(this.currentModeIndex - 1, true);
       }
       
       buttonDrag(e) {
           if (e != null) {
               e.preventDefault();
               e.stopPropagation();
           }
       
           let t = null;
           if (e instanceof MouseEvent) { t = e; }
           else { t = e.changedTouches[0]; }
       
           let p = pointerEventVertex(e);
           var dx = p.x - this.touchStart.x;

           var newIndex = Math.floor(this.previousIndex + dx / this.optionSpacing);
           newIndex = Math.min(Math.max(newIndex, 0), this.messages.length - 1);
           dx += this.previousIndex * this.optionSpacing;
           dx = Math.min(Math.max(dx, 0), this.optionSpacing * (this.messages.length - 1));

           let newMidpoint = new Vertex(buttonCenter(this.locationIndex).x + dx, buttonCenter(this.locationIndex).y);
           this.midPoint.copyFrom(newMidpoint);

           this.updateModeIndex(newIndex, true);
           
       }
       
   }

   class ColorChangeButton extends SidebarButton {

       constructor(argsDict) {
           super(argsDict);
           this.setAttributes({
               optionSpacing: 15,
               showLabel: false,
               palette: {
                   'white': rgb(1, 1, 1),
                   'red': rgb(1, 0, 0),
                   'orange': rgb(1, 0.5, 0),
                   'yellow': rgb(1, 1, 0),
                   'green': rgb(0, 1, 0),
                   'blue': rgb(0, 0, 1),
                   'indigo': rgb(0.5, 0, 1),
                   'violet': rgb(1, 0, 1)
               }
           });
           this.colors = Object.keys(this.palette);
           this.label.text = 'color';
           this.label.view.setAttribute('fill', 'black');

           this.messages = [];
           for (let value of Object.values(this.palette)) {
               this.messages.push({color: value});
           }
           this.outgoingMessage = {};
       }

       colorForIndex(i) {
           return this.palette[this.colors[i]]
       }

       updateLabel() {
           let f = this.active ? buttonScaleFactor : 1;
           this.label.view.setAttribute('font-size', (f * this.fontSize).toString());
       }

       commonButtonUp() {
           this.radius = buttonRadius;
           this.update();
           this.active = false;
           this.fillColor = this.colorForIndex(this.currentModeIndex);
           this.updateLabel();
           this.messagePaper(this.outgoingMessage);
       }

       buttonDrag(e) {
           super.buttonDrag(e);
           this.remove(this.label);
       }
   }

   class CreativeButton extends SidebarButton {
       constructor(argsDict) {
           super(argsDict);
           this.creations = argsDict['creations'];
           this.messages = [];
           for (let creation of this.creations) {
               this.messages.push({creating: creation});
           }
           this.outgoingMessage = {creating: 'freehand'};
           super.update();
           this.updateLabel();
       }

       commonButtonUp() {
           this.currentModeIndex = 0;
           super.commonButtonUp();
       }

       updateLabel() {
           if (this.showLabel) {
               try {
                   this.label.text = this.creations[this.currentModeIndex];
               } catch { }
           } else {
               this.label.text = '';
           }
       }
   }


   class DragButton extends SidebarButton {

       constructor(argsDict) {
           super(argsDict);
           this.setAttributes({ fontSize: 30 });
           this.label.view.setAttribute('font-family', 'Times');
           this.label2 = new TextLabel({text: this.text});
           this.label2.view.setAttribute('font-family', 'Times');
           this.label2.view.setAttribute('font-size', this.fontSize.toString());
           this.label2.view.setAttribute('transform', 'rotate(90, 51, 237.5)');
           this.label2.color = rgb(1, 1, 1);
           this.label2.anchor = new Vertex(0, 2);
           this.label.text = '↕︎';
           this.label2.text = '↕︎';
           this.add(this.label2);
           this.update();
       }

       commonButtonUp() {
           this.currentModeIndex = 0;
           super.commonButtonUp();
       }

       updateLabel() {
           if (this.label == undefined) { return }
           if (this.label2 == undefined) { return }
           let f = this.active ? buttonScaleFactor : 1;
           this.label.view.setAttribute('font-size', (f * this.fontSize).toString());
           this.label2.view.setAttribute('font-size', (f * this.fontSize).toString());
       }

   }

   let lineButton = new CreativeButton({
       creations: ['segment', 'ray', 'line'],
       key: 'q',
       locationIndex: 0
   });
   lineButton.baseColor = gray(0.2);
   sidebar.add(lineButton);

   let circleButton = new CreativeButton({
       creations: ['circle'],
       key: 'w',
       locationIndex: 1
   });
   circleButton.baseColor = gray(0.4);
   sidebar.add(circleButton);

   let cindyButton = new CreativeButton({
       creations: ['cindy'],
       key: 'e',
       locationIndex: 2
   });
   cindyButton.baseColor = gray(0.6);
   sidebar.add(cindyButton);
     
   let dragButton = new DragButton({
       messages: [{drag: true}],
       outgoingMessage: {drag: false},
       key: 'a',
       locationIndex: 3
   });
   dragButton.baseColor = gray(0.8);
   dragButton.label.view.setAttribute('fill', 'black');
   dragButton.label2.view.setAttribute('fill', 'black');
   sidebar.add(dragButton);

   let colorButton = new ColorChangeButton({
       key: 'r',
       modeSpacing: 15,
       locationIndex: 4
   });
   colorButton.baseColor = gray(1.0);
   sidebar.add(colorButton);

}());

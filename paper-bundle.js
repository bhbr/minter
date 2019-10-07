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
       element.addEventListener('touchstart', method);
       element.addEventListener('mousedown', method);
   }

   function removePointerDown(element, method) {
       element.removeEventListener('touchstart', method);
       element.removeEventListener('mousedown', method);
   }

   function addPointerMove(element, method) {
       element.addEventListener('touchmove', method);
       element.addEventListener('mousemove', method);
   }

   function removePointerMove(element, method) {
       element.removeEventListener('touchmove', method);
       element.removeEventListener('mousemove', method);
   }

   function addPointerUp(element, method) {
       element.addEventListener('touchend', method);
       element.addEventListener('mouseup', method);
       element.addEventListener('pointerup', method);
   }

   function removePointerUp(element, method) {
       element.removeEventListener('touchend', method);
       element.removeEventListener('mouseup', method);
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

       copy() { return this.concat() }

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
           this.childMobjects = [];
           this.vertices = [];
           try {
               this.parentMobject = paper; // default
           } catch {
               this.parentMobject = sidebar; // if no paper
           }

           this.draggable = false;
           this.isDragged = false;
           this.strokeColor = rgb(1, 1, 1);
           this.fillColor = rgb(1, 1, 1);
           this.show();

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

           //this.view.addEventListener('mousedown', this.boundDragStart)
           //this.view.addEventListener('dblclick', this.boundMakeScrubbable)

       }

       get parentMobject() { return this._parentMobject }
       set parentMobject(newValue) {
           this.view.remove();
           this._parentMobject = newValue;
           if (newValue == undefined) { return }
           if (newValue.id == 'paper' || newValue.id == 'sidebar') {
               newValue.add(this);
           } else {
               newValue.view.appendChild(this.view);
           }
           if (this.parentMobject.visible || newValue.id == 'paper') {
               this.show();
           } else {
               this.hide();
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

       get fillOpacity() { return this.view.fillOpacity }
       set fillOpacity(newValue) {
           this.view.fillOpacity = newValue;

           // TODO: rethink this (commented out for circles)

   //         for (let submob of this.submobjects) {
   //             submob.fillOpacity = newValue
   //         }
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

       get strokeWidth() { return this.view.strokeWidth }
       set strokeWidth(newValue) {
           this.view.strokeWidth = newValue;
           for (let submob of this.submobjects) {
               submob.strokeWidth = newValue;
           }
           this.updateView();
       }

       get draggable() { return this._draggable }
       set draggable(newValue) {
           this._draggable = newValue;
           if (this._draggable) {
               addPointerDown(this.view, this.boundDragStart);
           } else {
               removePointerDown(this.view, this.boundDragStart);
           }
       }

       dragStart(e) {
           e.preventDefault();
           e.stopPropagation();
           this.draggable = true;
           this.isDragged = true;
           this.dragStartingPoint = new Vertex(e.x, e.y);
           this.anchorBeforeDragging = Object.create(this.anchor);
           if (this.popover != undefined) {
               this.popover.anchorBeforeDragging = Object.create(this.popover.anchor);
           }
           addPointerMove(paper, this.boundDrag);
           addPointerUp(paper, this.boundDragEnd);
       }

       drag(e) {
           e.preventDefault();
           e.stopPropagation();
           //if (!(this.draggable && this.isDragged)) { return }
           let dragVector = new Vertex(e.x, e.y).subtract(this.dragStartingPoint);
           this.anchor.copyFrom(this.anchorBeforeDragging.add(dragVector));
           if (this.popover != undefined) {
               this.popover.anchor.copyFrom(this.popover.anchorBeforeDragging.add(dragVector));
           }
           this.updateView();
       }

       dragEnd(e) {
           e.preventDefault();
           e.stopPropagation();
           this.isDragged = false;
           this.dragStartingPoint = undefined;
           this.anchorBeforeDragging = undefined;
           if (this.popover != undefined) {
               this.popover.anchorBeforeDragging = undefined;
           }
           removePointerMove(paper, this.boundDrag);
           removePointerUp(paper, this.boundDragEnd);
       }

       add(submob) {
           submob.draggable = false;
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
               this.view.style["visibility"] = "hidden";
           }
           for (let submob of this.submobjects) {
               submob.hide(); // we have to propagate invisibility
           }
           this.updateView();
       }

       show() {
           this.visible = true;
           if (this.view != undefined) {
               this.view.style["visibility"] = "visible";
           }
           for (let submob of this.submobjects) {
               submob.show(); // we have to propagate visibility bc we have to for invisibility
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
                                                      
       registerTouchStart(e) {
           this.touchStart = new Vertex(pointerEventPageLocation(e));
       }

       update(data) {
           for (let child of this.childMobjects) {
               child.update(data);
           }
           this.updateView();
       }
              
   }



   class MGroup extends Mobject {

       constructor(submobs = []) {
           super();
           for (let submob of submobs) {
               submob.draggable = false;
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
           //console.log(this.vertices)
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

       constructor(text) {
           super();
           this.view = document.createElementNS('http://www.w3.org/2000/svg', 'text');
           this.view.setAttribute('class', this.constructor.name + ' unselectable');
           this.view.setAttribute('text-anchor', 'middle');
           this.view.setAttribute('alignment-baseline', 'middle');
           this.view.setAttribute('fill', 'white');
           this.view.setAttribute('font-family', 'Helvetica');
           this.view.setAttribute('font-size', '12');
           this.view.mobject = this;
           this.text = text;
           this.transform = Transform.identity();
           this.submobjects = [];
           //this.parentMobject = paper // default

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
           this.anchor = sourceMobject.anchor.translatedBy(sourceMobject.rightEdge());
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

       update(data) {
           let newRadius = data.radius;
           let newMidPoint = data.midPoint;
           if (newRadius != undefined) { this.radius = newRadius; }
           if (newMidPoint != undefined) { this.midPoint = newMidPoint; }
           super.update(data);
       }

   }

   class Line extends Polygon {
       
       constructor(vertices) {
           super(vertices);
           this.startPoint = vertices[0];
           this.endPoint = vertices[1];
           this.strokeColor = rgb(1, 1, 1);
       }

       get components() {
           return this.endPoint.subtract(this.startPoint)
       }

       norm2() {
           return this.components.norm2()
       }

       norm() { return Math.sqrt(this.norm2()) }

   }

   let paper$1 = document.querySelector('#paper');
   paper$1.mode = 'freehand';
   paper$1.modes = ['freehand', 'segment', 'halfline', 'fullline', 'circle', 'cindy', 'drag'];
   paper$1.colors = {
       'white': rgb(1, 1, 1),
       'red': rgb(1, 0, 0),
       'orange': rgb(1, 0.5, 0),
       'yellow': rgb(1, 1, 0),
       'green': rgb(0, 1, 0),
       'blue': rgb(0, 0, 1),
       'indigo': rgb(0.5, 0, 1),
       'violet': rgb(1, 0, 1)
   };
   paper$1.color = 'white';

   let log = function(msg) { logInto(msg, 'paper-console'); };

   paper$1.createdMobjects = {};
   paper$1.createdPoints = [];
   paper$1.cindyPorts = [];

   paper$1.add = function(mobject) {
       paper$1.appendChild(mobject.view);
   };

   // class Paper extends Mobject {

   //     constructor() {
   //         super()
   //         this.view = document.querySelector('#paper')
   //         this.isCreating = false
   //         this.modes = ['freehand', 'segment', 'halfline', 'fullline', 'circle', 'cindy', 'drag']
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
   //         this.mobjectsCurrentlyBeingDrawn = {}
   //         this.cindyPorts = []

   //     }

   //     changeColorByName(newColorName) {
   //         let newColor = this.colorPalette[newColorName]
   //         this.changeColor(newColor)
   //     }

   //     changeColor(newColor) {
   //         this.currentColor = newColor
   //         for (let [key, mob] of paper.mobjectsCurrentlyBeingDrawn.entries()) {
   //                 mob.strokeColor = paper.currentColor
   //                 mob.fillColor = paper.currentColor
   //             }
   //     }


   //     changeMode(newMode) {
   //         this.currentMode = newMode
           
   //         if (newMode == 'drag') {
   //             // forbid all objects to handle input themselves
   //             for (let mob of paper.constructedObjects) {
   //                 mob.view.style['pointer-events'] = 'none'
   //             }
   //             return
   //         } else {
   //             // give  them back input control
   //             for (let mob of paper.constructedObjects) {
   //                 mob.view.style['pointer-events'] = 'auto'
   //             }
   //         }

   //         for (let mob of this.mobjectsCurrentlyBeingDrawn.values()) {
   //             mob.hide()
   //         }
   //         this.mobjectsCurrentlyBeingDrawn[this.currentMode].show()
   // }
   // }
   function changeMode(newMode) {

       if (!paper$1.modes.includes(newMode)) { return }

       paper$1.mode = newMode;
       
       if (newMode == 'drag') {
           // forbid all objects to handle input themselves
           for (let mob of paper$1.constructedObjects) {
               mob.view.style['pointer-events'] = 'none';
           }
           return
       } else {
           // give  them back input control
           for (let mob of paper$1.constructedObjects) {
               mob.view.style['pointer-events'] = 'auto';
           }
       }

       for (let mode in paper$1.createdMobjects) {
           paper$1.createdMobjects[mode].hide();
       }
       try {
           paper$1.createdMobjects[paper$1.mode].show();
       } catch { }
   }


   paper$1.changeMode = changeMode;
   paper$1.constructedObjects = [];
   paper$1.constructedPoints = [];



   class Freehand extends MGroup {
       
       constructor(p) {
           super();
           this.update(p, 'freehand');
           this.strokeColor = paper$1.color;
       }
       
       updateWithPoints(q) {
           let nbDrawnPoints = this.submobjects.length;
           if (nbDrawnPoints > 0) {
               p = this.submobjects[nbDrawnPoints - 1].midPoint;
           }
           let pointDistance = 10;
           let distance = ((p.x - q.x)**2 + (p.y - q.y)**2)**0.5;
           let unitVector = new Vertex([(q.x - p.x)/distance, (q.y - p.y)/distance]);
           for (var step = pointDistance; step < distance; step += pointDistance) {
               let x = p.x + step * unitVector.x + 0.5 * Math.random();
               let y = p.y + step * unitVector.y + 0.5 * Math.random();
               let newPoint = new Vertex([x, y]);
               let c = new Circle(2);
               c.fillColor = this.strokeColor;
               c.midPoint = new Vertex(newPoint);
               this.add(c);
           }
           let t = Math.random();
           let r = (1 - t) * 0.5 + t * 0.75;
           let c = new Circle(r);
           c.midPoint = new Vertex(q);
           this.add(c);
       }
       
       updateWithLines(q) {

           let nbDrawnPoints = this.submobjects.length;
           let p = null;
           if (nbDrawnPoints == 0) {
               p = q;
           } else {
               p = this.submobjects[nbDrawnPoints - 1].endPoint;
           }
           let newLine = new Line([p, q]);
           newLine.strokeColor = this.strokeColor;
           this.add(newLine);
       }
       
       update(q) {
           //this.strokeColor = paper.colors[paper.color]
           this.updateWithLines(q);
       }
   }

   class DrawnPoint extends Circle {

       constructor(p) {
           super(5);
           this.midPoint = p;
       }
   }

   class DrawnSegment extends MGroup {
       
       constructor(p, q) {
           super();
           if (q == undefined) { q = p; }
           this.startPoint = p;
           this.endPoint = q;
           this.c1 = new DrawnPoint(p);
           this.c2 = new DrawnPoint(q);
           this.line = new Line([p, q]);

           this.add(this.c1);
           this.add(this.c2);
           this.add(this.line);

           this.strokeColor = paper$1.color;
           this.fillColor = paper$1.color;
       }
       
       update(q) {
           this.c2.midPoint = q;
           this.line.vertices = [this.line.startPoint, q];
           this.updateView();
       }
   }

   class DrawnHalfLine extends DrawnSegment {

       constructor(p, q) {
           super(p, q);
           this.line.vertices = [this.startPoint, this.farOffEndPoint()];

       }

       farOffEndPoint() {
           if (this.startPoint == this.endPoint) {
               return this.endPoint
           }
           let farOffX = this.startPoint.x + 100 * (this.endPoint.x - this.startPoint.x);
           let farOffY = this.startPoint.y + 100 * (this.endPoint.y - this.startPoint.y);
           return new Vertex(farOffX, farOffY)
       }

       update(q) {
           this.endPoint = q;
           this.c2.midPoint = this.endPoint;
           this.line.vertices = [this.startPoint, this.farOffEndPoint()];
       }
   }

   class DrawnFullLine extends DrawnHalfLine {

       constructor(p, q) {
           super(p, q);
           this.line.vertices = [this.farOffStartPoint(), this.farOffEndPoint()];
       }

       farOffStartPoint() {
           if (this.startPoint == this.endPoint) {
               return this.startPoint
           }
           let farOffX = this.endPoint.x + 100 * (this.startPoint.x - this.endPoint.x);
           let farOffY = this.endPoint.y + 100 * (this.startPoint.y - this.endPoint.y);
           return new Vertex(farOffX, farOffY)
       }

       update(q) {
           this.endPoint = q;
           this.c2.midPoint = this.endPoint;
           this.line.vertices = [this.farOffStartPoint(), this.farOffEndPoint()];
       }
   }

   class DrawnCircle extends MGroup {
       
       constructor(p) {
           super();
           this.center = new Vertex(p);
           this.outer = new Vertex(p);
           this.radius = 0;
           this.centerPoint = new Circle(5);
           this.outerPoint = new Circle(5);
           this.centerPoint.midPoint = this.center;
           this.outerPoint.midPoint = this.outer;
           this.circle = new Circle(this.radius);
           this.circle.fillOpacity = 0;
           this.circle.strokeWidth = 1;
           this.circle.strokeColor = rgb(0, 0, 0);
           this.circle.midPoint = this.center;
           this.add(this.centerPoint);
           this.add(this.outerPoint);
           this.add(this.circle);
           this.strokeColor = paper$1.color;
           this.fillColor = paper$1.color;
       }
       
       update(q) {
           let r = Math.sqrt((q.x - this.center.x)**2 + (q.y - this.center.y)**2);
           this.updateRadius(r);
           this.updateOuter(q);
       }
       
       updateRadius(r) {
           this.circle.radius = r;
           this.radius = r;
       }
       
       updateOuter(q) {
           this.outer = q;
           this.outerPoint.midPoint = q;
           
       }
       
   }


   class DrawnRectangle extends MGroup {
       
       constructor(p) {
           super();
           this.p1 = new Vertex(p);
           this.p2 = new Vertex(p);
           this.p3 = new Vertex(p);
           this.p4 = new Vertex(p);
           this.startPoint = new Vertex(p);
           this.top = new Line([p, p]);
           this.bottom = new Line([p, p]);
           this.left = new Line([p, p]);
           this.right = new Line([p, p]);
           this.top.strokeColor = rgb(1, 1, 1);
           this.bottom.strokeColor = rgb(1, 1, 1);
           this.left.strokeColor = rgb(1, 1, 1);
           this.right.strokeColor = rgb(1, 1, 1);
           this.add(this.top);
           this.add(this.bottom);
           this.add(this.left);
           this.add(this.right);
       }
       
       update(q) {
           let xMin = Math.min(this.startPoint.x, q.x);
           let xMax = Math.max(this.startPoint.x, q.x);
           let yMin = Math.min(this.startPoint.y, q.y);
           let yMax = Math.max(this.startPoint.y, q.y);
           this.p1.x = xMin;
           this.p1.y = yMin;
           this.p2.x = xMax;
           this.p2.y = yMin;
           this.p3.x = xMax;
           this.p3.y = yMax;
           this.p4.x = xMin;
           this.p4.y = yMax;
           this.top.vertices = [this.p1, this.p2];
           this.bottom.vertices = [this.p3, this.p4];
           this.left.vertices = [this.p1, this.p4];
           this.right.vertices = [this.p2, this.p3];
       }
   }


   class CindyCanvas {
       
       constructor(p, width, height) {


           let script = document.createElement('script');
           script.setAttribute('type', 'text/x-cindyscript');
           let scriptID = 'csdraw'; // + paper.cindyPorts.length
           script.setAttribute('id', scriptID);
           script.textContent = 'W(x, p) := 0.5*(1+sin(100*|x-p|)); colorplot([0,W(#, A0)+W(#, A1),0]);';
           //script.textContent = 'colorplot(seconds());'

           this.view = document.createElement('div');
           this.view.style.position = 'absolute';
           this.view.style.left =  p.x + "px";
           this.view.style.top = p.y + "px";
           
           let csView = document.createElement('div');
           let canvasID = 'CSCanvas' + paper$1.cindyPorts.length;
           csView.setAttribute('id', canvasID);
           this.view.appendChild(csView);
           
           this.boundDragStart = this.dragStart.bind(this);
           this.boundDrag = this.drag.bind(this);
           this.boundDragEnd = this.dragEnd.bind(this);

           this.draggable = false;
           document.querySelector('#paper-container').insertBefore(this.view, document.querySelector('#paper-console'));
           document.body.appendChild(script);

           paper$1.cindyPorts.push({
               id: canvasID,
               width: width,
               height: height,
               transform: [{
                 visibleRect: [0, 1, 1, 0]
               }]
             });

           this.points = [[0.4, 0.4], [0.3, 0.8]];


           CindyJS({
             scripts: "cs*",
             autoplay: true,
             ports: paper$1.cindyPorts,
               geometry: this.geometry()
           });
           
       }

       get draggable() { return this._draggable }
       set draggable(newValue) {
           this._draggable = newValue;
           if (this._draggable) {
               log('setting draggable');
               addPointerDown(this.view, this.boundDragStart);
           } else {
               removePointerDown(this.view, this.boundDragStart);
           }
       }

       geometry() {
           let ret = [];
           let i = 0;
           for (let point of this.points) {
               ret.push({name: "A" + i, kind:"P", type:"Free", pos: point});
               i += 1;
           }
           return ret
       }
       
       update() {
           
       }
       

       dragStart(e) {
           e.preventDefault();
           e.stopPropagation();
           this.dragStartX = e.clientX - parseInt(this.view.style.left.replace('px', ''));
           this.dragStartY = e.clientY - parseInt(this.view.style.top.replace('px', ''));
           removePointerDown(this.view, this.boundDragStart);
           addPointerMove(this.view, this.boundDrag);
           addPointerUp(this.view, this.boundDragEnd);
           
           log(e.clientX);
           log(e.clientY);
           log(this.dragStartX);
           log(this.dragStartY);
       }

       drag(e) {
           e.preventDefault();
           e.stopPropagation();
           let newX = e.clientX;
           let newY = e.clientY;
           this.view.style.left = (newX - this.dragStartX) + 'px';
           this.view.style.top = (newY - this.dragStartY) + 'px';
           log(newX);
           log(newY);
       }

       dragEnd(e) {
           e.preventDefault();
           e.stopPropagation();
           removePointerUp(this.view, this.boundDragEnd);
           removePointerMove(this.view, this.boundDrag);
           addPointerDown(this.view, this.boundDragStart);

       }
   }



   function drag(e) {
       let dragPoint = new Vertex(pointerEventPageLocation(e));
       let mob = paper$1.constructedObjects[0];
       mob.view.style.left = (dragPoint.x + paper$1.mobOffsetFromCursor.x) + 'px';
       mob.view.style.top = (dragPoint.y + paper$1.mobOffsetFromCursor.y) + 'px';
   }

   function endDragging(e) {
       removePointerMove(paper$1, drag);
       removePointerUp(paper$1, endDragging);
   }

   function startDragging(p, mob) {
       let oldX = parseInt(mob.view.style.left.replace('px', ''));
       let oldY = parseInt(mob.view.style.top.replace('px', ''));
       let q = new Vertex(oldX, oldY);
       paper$1.mobOffsetFromCursor = q.subtract(p);
       
       addPointerMove(paper$1, drag);
       addPointerUp(paper$1, endDragging);
   }

   function startCreating(e) {
       e.preventDefault();
       e.stopPropagation();
       
       let p = new Vertex(pointerEventPageLocation(e));
       let mob = paper$1.constructedObjects[0]; // the Cindy canvas (works only for one)

       if (paper$1.mode == 'drag') {
           startDragging(p, mob);
           return
       }
       
       
       removePointerDown(paper$1, startCreating);
       addPointerMove(paper$1, creativeMove);
       addPointerUp(paper$1, endCreating);
      
       paper$1.createdMobjects['freehand'] = new Freehand(p);
       p = snap(p);
       paper$1.createdMobjects['segment'] = new DrawnSegment(p);
       paper$1.createdMobjects['halfline'] = new DrawnHalfLine(p);
       paper$1.createdMobjects['fullline'] = new DrawnFullLine(p);
       paper$1.createdMobjects['circle'] = new DrawnCircle(p);
       paper$1.createdMobjects['cindy'] = new DrawnRectangle(p);
       
       paper$1.changeMode(paper$1.mode);
       paper$1.startPoint = p;
       paper$1.currentPoint = p;

   }

   function snap(p) {
       for (let q of paper$1.constructedPoints) {
           if (p.subtract(q).norm() < 10) { return q }
       }
       return p
       
   }

   function creativeMove(e) {
       e.preventDefault();
       e.stopPropagation();

       let p = new Vertex(pointerEventPageLocation(e));
       
       for (let mode of paper$1.modes) {
           if (mode == 'freehand') {
               paper$1.createdMobjects['freehand'].update(p);
           } else if (mode != 'drag') {
               paper$1.createdMobjects[mode].update(snap(p));
           }
       }

       
       paper$1.currentPoint = p;
   }



   function endCreating(e) {
       
       e.preventDefault();
       e.stopPropagation();
       
       let p = paper$1.currentPoint;
       
       removePointerMove(paper$1, creativeMove);
       removePointerUp(paper$1, endCreating);
       addPointerDown(paper$1, startCreating);

       
       if (['point', 'segment', 'halfline', 'fullline', 'circle'].includes(paper$1.mode)) {
           //paper.constructedObjects.push(paper.createdMobjects[paper.mode])
           paper$1.constructedPoints.push(paper$1.startPoint);
           paper$1.constructedPoints.push(p);
       }

       if (paper$1.mode == 'cindy') {
           let origin = paper$1.createdMobjects['cindy'].p1;
           let lrCorner = paper$1.createdMobjects['cindy'].p3;
           let cindyWidth = lrCorner.x - origin.x;
           let cindyHeight = lrCorner.y - origin.y;
           paper$1.createdMobjects['cindy'].view.remove();
           paper$1.constructedObjects.push(new CindyCanvas(origin, cindyWidth, cindyHeight));
       }

       for (let mode of paper$1.modes) {
           if (mode == 'drag') { continue }
           if (paper$1.mode != mode) {
               paper$1.createdMobjects[mode].hide();
           } else {
               paper$1.createdMobjects[mode].show();
           }
       }
       paper$1.createdMobjects = {};
       
   }
   addPointerDown(paper$1, startCreating);

}());

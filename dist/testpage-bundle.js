(function () {
    'use strict';

    // import { rgb, addPointerDown, remove, removePointerDown, addPointerMove, removePointerMove, addPointerUp, removePointerUp, logInto, isTouchDevice, pointerEventVertex, LocatedEvent } from './modules/helpers'
    // import { Vertex, Transform } from './modules/transform'
    // import { Color, Mobject, MGroup, VMobject, TextLabel } from './modules/mobject'
    // import { Circle, Rectangle, TwoPointCircle } from './modules/shapes'
    // import { Segment, Ray, Line } from './modules/arrows'
    // import { Point, FreePoint } from './modules/creating'
    // import { CindyCanvas, WaveCindyCanvas, DrawnRectangle } from './modules/cindycanvas'
    // import { CreationGroup } from './modules/creationgroup'
    // import { BoxSlider } from './modules/slider'
    // import { LinkableMobject, IOList, DependencyMap } from './modules/linkables'
    // import { paper } from './paper'
    // declare var CindyJS: any
    // let c = new Circle({anchor: new Vertex(100, 100), radius: 25})
    // c.anchor = new Vertex(300, 400)
    // c.fillColor = Color.violet()
    // c.redraw()
    //paper.add(c)
    // let t = new TextLabel({
    // 	text: "blablub",
    // 	anchor: new Vertex(100, 100),
    // 	color: Color.red()	
    // })
    // paper.add(t)
    // let s = new Segment({
    // 	startPoint: new Vertex(100, 100),
    // 	endPoint: new Vertex(200, 300)
    // })
    // paper.add(s)
    // let m = new MGroup()
    // let c = new Circle({anchor: new Vertex(100, 100), radius: 75})
    // let r = new Rectangle({
    // 	anchor: new Vertex(0, 0),
    // 	width: 50,
    // 	height: 50,
    // 	fillColor: Color.green()
    // })
    // m.add(c)
    // m.add(r)
    // paper.add(m)
    // let p = new Vertex(100, 100)
    // let q = new Vertex(200, 200)
    // let fp = new FreePoint({anchor: p})
    // let fq = new FreePoint({anchor: q})
    // paper.add(fp)
    // paper.add(fq)
    // let s = new Segment({
    // 	startPoint: fp.midPoint,
    // 	endPoint: fq.midPoint
    // })
    // fp.addDependent(s)
    // fq.addDependent(s)
    // paper.add(s)
    // let c = new TwoPointCircle({
    // 	midPoint: fp.midPoint,
    // 	outerPoint: fq.midPoint
    // })
    // fp.addDependency('midPoint', c, 'midPoint')
    // fq.addDependency('midPoint', c, 'outerPoint')
    // paper.add(c)
    // let sl = new BoxSlider({
    // 	anchor: new Vertex(400, 50),
    // 	height: 200
    // })
    // paper.add(sl)
    // console.log(sl.outerBar.globalVertices(), sl.outerBar.pathString())
    let paperView = document.querySelector('#paper');
    let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    // let pathString: string = 'M100 100L100 200L200 200L200 100Z'
    // path.setAttribute('d', pathString)
    // path.style['fill'] = '#ff0000'
    // path.style['fill-opacity'] = '1'
    // path.style['stroke'] = '#00ff00'
    // path.style['stroke-width'] = '1'
    // paperView.appendChild(path) // why not just add?
    paperView.addEventListener('mousedown', function (e) {
        console.log('ping');
    });
    let paperView2 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    let path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    paperView.appendChild(paperView2);
    let pathString2 = 'M120 120L120 180L180 180L180 120Z';
    path2.setAttribute('d', pathString2);
    path2.style['fill'] = '#0000ff';
    // path2.style['fill-opacity'] = '0.5'
    // path2.style['stroke'] = '#ff00ff'
    // path2.style['stroke-width'] = '1'
    paperView2.appendChild(path2); // why not just add?
    paperView2.addEventListener('mousedown', function (e) {
        console.log('pong');
    });

}());

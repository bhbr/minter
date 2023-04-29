import { Vertex } from './modules/vertex-transform.js';
import { Mobject } from './modules/mobject.js';
import { Circle } from './modules/shapes.js';
import { Color } from './modules/color.js';
let m = new Mobject({
    anchor: new Vertex(200, 100),
    viewWidth: 250,
    viewHeight: 150,
    backgroundColor: Color.red()
});
let c = new Circle({
    midpoint: new Vertex(50, 50),
    radius: 60,
    fillColor: Color.green(),
    fillOpacity: 1,
    strokeColor: Color.red()
});
m.add(c);
document.querySelector('#paper').appendChild(m.view);
//# sourceMappingURL=testpage.js.map
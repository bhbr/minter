import { ExtendedObject } from '../modules/helpers/ExtendedObject.js';
import { Vertex } from '../modules/helpers/Vertex.js';
import { Transform } from '../modules/helpers/Transform.js';
// testing whether objects get created properly
// esp. passing properties by value (Vertex, Transform) of by reference (anything else)
class MyExtObject extends ExtendedObject {
}
export function ExtendedObjectTest() {
    let v = new Vertex(1, 2);
    let a = new Vertex(3, 4);
    let t = new Transform({
        anchor: a,
        scale: 2
    });
    let arr = ['a', 'b'];
    let eobj = new MyExtObject({
        vertex: v,
        transform: t,
        array: a
    });
    // testing which changes will stick to the original objects
    eobj.vertex.x = 7; // shouldn't affect v
    eobj.transform.scale = -1; // shouldn't affect t
    eobj.array.push('c'); // should affect a
    console.log(v, t, a, eobj);
}
class MyExtObject2 extends MyExtObject {
    constructor() {
        super(...arguments);
        this.vertex = new Vertex(7, 8);
        this.blip = 1;
    }
}
let eobj2 = new MyExtObject2();
console.log(eobj2.vertex, eobj2.blip, eobj2);
//# sourceMappingURL=ExtendedObjectTest.js.map
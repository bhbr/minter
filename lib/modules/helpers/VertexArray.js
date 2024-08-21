export class VertexArray extends Array {
    constructor(array) {
        super();
        if (!array) {
            return;
        }
        for (let vertex of array) {
            this.push(vertex);
        }
    }
    interpolate(newVertexArray, weight) {
        let interpolatedVertexArray = new VertexArray();
        for (let i = 0; i < this.length; i++) {
            interpolatedVertexArray.push(this[i].interpolate(newVertexArray[i], weight));
        }
        return interpolatedVertexArray;
    }
    imageUnder(transform) {
        let image = new VertexArray();
        for (let i = 0; i < this.length; i++) {
            image.push(this[i].imageUnder(transform));
        }
        return image;
    }
}
//# sourceMappingURL=VertexArray.js.map
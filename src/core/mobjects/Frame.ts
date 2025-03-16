
import { ExtendedObject } from 'core/classes/ExtendedObject'
import { vertex, vertexOrigin } from 'core/functions/vertex'
import { Transform } from 'core/classes/Transform/Transform'
import { View } from './View'

export class Frame extends ExtendedObject {
	/*
	Most often the transform just has an anchor
	that describes where the Frame is
	located in its parent's frame.
	But the transform can also include a scale
	and a rotation angle (and a shift vector,
	which maybe shouldn't be used as Frame
	translations should be handled via its anchor).
	*/
	transform: Transform

	width: number
	height: number
	// (Note: the view itself is declared further below)

	view?: View

	defaults(): object {
		return {
			// position
			transform: Transform.identity(),
			anchor: vertexOrigin(),
			width: 100,
			height: 100,
			view: null
		}
	}

	// this.anchor is a synonym for this.transform.anchor
	get anchor(): vertex {
		return this.transform.anchor
	}

	set anchor(newValue: vertex) {
		this.transform.anchor = newValue
	}

	get parent(): Frame | null {
		return this.view?.parent.frame ?? null
	}

	relativeTransform(frame?: Frame): Transform {
	/*
	What transform maps (actively) from the given
	ancestor Frame ('frame') to this descendant Frame?
	If the transforms in between are all just anchor
	translations, this gives this Frame's anchor
	in the coordinate frame of the given Frame.
	*/

		// If there is no frame, use the direct parent's coordinate frame.
		// If there is no parent yet, use your own (local) coordinates.
		let frame_: any = frame  || this
		let t = Transform.identity()
		let fr: Frame = this
		while (fr && fr.transform instanceof Transform) {
			if (fr == frame_) { return t }
			t.leftComposeWith(new Transform({ shift: fr.anchor }))
			t.leftComposeWith(fr.transform)
			fr = fr.parent
		}
		throw 'relativeTransform requires a direct ancestor'
	}

	transformLocalPoint(point: vertex, frame?: Frame): vertex {
	/*
	Given a point (Vertex) in local coordinates,
	compute its coordinates in the given ancestor
	Frame's frame.
	*/
		let t = this.relativeTransform(frame)
		return t.appliedTo(point)
	}

	/*
	The following geometric properties are first computed from the view frame.
	The versions without 'view' in the name can be overriden by subclasses,
	e. g. VMobjects.
	*/

	viewULCorner(frame?: Frame): vertex {
		return this.transformLocalPoint(vertexOrigin(), frame)
	}

	viewURCorner(frame?: Frame): vertex {
		return this.transformLocalPoint([this.width, 0], frame)
	}

	viewLLCorner(frame?: Frame): vertex {
		return this.transformLocalPoint([0, this.height], frame)
	}

	viewLRCorner(frame?: Frame): vertex {
		return this.transformLocalPoint([this.width, this.height], frame)
	}

	viewXMin(frame?: Frame): number { return this.viewULCorner(frame)[0] }
	viewXMax(frame?: Frame): number { return this.viewLRCorner(frame)[0] }
	viewYMin(frame?: Frame): number { return this.viewULCorner(frame)[1] }
	viewYMax(frame?: Frame): number { return this.viewLRCorner(frame)[1] }

	viewCenter(frame?: Frame): vertex {
		let p = this.transformLocalPoint([this.width/2, this.height/2], frame)
		return p
	}

	viewMidX(frame?: Frame): number { return this.viewCenter(frame)[0] }
	viewMidY(frame?: Frame): number { return this.viewCenter(frame)[1] }

	viewLeftCenter(frame?: Frame): vertex { return [this.viewXMin(frame), this.viewMidY(frame)] }
	viewRightCenter(frame?: Frame): vertex { return [this.viewXMax(frame), this.viewMidY(frame)] }
	viewTopCenter(frame?: Frame): vertex { return [this.viewMidX(frame), this.viewYMin(frame)] }
	viewBottomCenter(frame?: Frame): vertex { return [this.viewMidX(frame), this.viewYMax(frame)] }

	/*
	Equivalent (by default) versions without "view" in the name
	These can be overriden in subclasses, e. g. in VFrame using
	its vertices.
	*/

	ulCorner(frame?: Frame): vertex { return this.viewULCorner(frame) }
	urCorner(frame?: Frame): vertex { return this.viewURCorner(frame) }
	llCorner(frame?: Frame): vertex { return this.viewLLCorner(frame) }
	lrCorner(frame?: Frame): vertex { return this.viewLRCorner(frame) }

	xMin(frame?: Frame): number { return this.viewXMin(frame) }
	xMax(frame?: Frame): number { return this.viewXMax(frame) }
	yMin(frame?: Frame): number { return this.viewYMin(frame) }
	yMax(frame?: Frame): number { return this.viewYMax(frame) }

	center(frame?: Frame): vertex { return this.viewCenter(frame) }

	midX(frame?: Frame): number { return this.viewMidX(frame) }
	midY(frame?: Frame): number { return this.viewMidY(frame) }

	leftCenter(frame?: Frame): vertex { return this.viewLeftCenter(frame) }
	rightCenter(frame?: Frame): vertex { return this.viewRightCenter(frame) }
	topCenter(frame?: Frame): vertex { return this.viewTopCenter(frame) }
	bottomCenter(frame?: Frame): vertex { return this.viewBottomCenter(frame) }

	// Local versions (relative to own coordinate system)

	localULCorner(): vertex { return this.ulCorner(this) }
	localURCorner(): vertex { return this.urCorner(this) }
	localLLCorner(): vertex { return this.llCorner(this) }
	localLRCorner(): vertex { return this.lrCorner(this) }

	localXMin(): number { return this.xMin(this) }
	localXMax(): number { return this.xMax(this) }
	localYMin(): number { return this.yMin(this) }
	localYMax(): number { return this.yMax(this) }

	localCenter(): vertex { return this.center(this) }

	localMidX(): number { return this.midX(this) }
	localMidY(): number { return this.midY(this) }

	localLeftCenter(): vertex { return this.leftCenter(this) }
	localRightCenter(): vertex { return this.rightCenter(this) }
	localTopCenter(): vertex { return this.topCenter(this) }
	localBottomCenter(): vertex { return this.bottomCenter(this) }

	getWidth(): number { return this.localXMax() - this.localXMin() }
	getHeight(): number { return this.localYMax() - this.localYMin() }


}

import { Mobject } from './Mobject'
import { vertex, vertexArray, isVertex, isVertexArray, vertexInterpolate, vertexArrayInterpolate } from 'core/functions/vertex'
import { Transform } from 'core/classes/Transform/Transform'
import { Color } from 'core/classes/Color'
import { copy } from 'core/functions/copying'
import { ExtendedObject } from 'core/classes/ExtendedObject'

export class Motor extends ExtendedObject {

	/*
	Animation is 'home-grown' (not via CSS).
	Any numerical property (number, Color, Vertex,
	number array, vertexArray, Transform) can be animated.
	For this, we create animationStopArgs (the given
	animation arguments), and animationStartArgs
	(the dict of corresponding current values).
	Then, at regular intervals, we compute
	a convex combination of each property
	and update this mobject with those.
	*/

	animationTimeStart?: number
	animationDuration?: number
	animationInterval?: number

	animationStartArgs: object
	animationStopArgs: object

	mobject?: Mobject
	showShadow?: boolean

	ownDefaults(): object {
		return {
			animationTimeStart: null,
			animationDuration: null,
			animationInterval: null,
			animationStartArgs: {},
			animationStopArgs: {},
			showShadow: null
		}
	}


	static isAnimatable(args: object): boolean {
		for (let [key, value] of Object.entries(args)) {
			if ((typeof value ==  'number') 
				|| isVertex(value)
				|| isVertexArray(value)
				|| value instanceof Transform
				|| value instanceof Color)
				{ continue }
			else {
				console.error(`Property ${key} on ${this.constructor.name} is not animatable`)
				return false
			}
		}
		return true
	}

	animate(args: object = {}, seconds: number, showShadow: boolean = false) {
	// Calling this method launches an animation
		if (!Motor.isAnimatable(args)) {
			return
		}

		for (let key of Object.keys(args)) {
			this.animationStartArgs[key] = copy(this.mobject[key])
		}
		this.animationStopArgs = args

		// all times in ms bc that is what setInterval and setTimeout expect
		let dt = 10
		this.animationTimeStart = Date.now()
		this.animationDuration = seconds * 1000
		this.showShadow = showShadow
		if (!this.showShadow) { this.mobject.hideShadow() }

		this.animationInterval = window.setInterval(
			function() {
				this.updateAnimation(Object.keys(args))
			}
			.bind(this), dt)
		// this.animationInterval is a reference number
		// that we need to remember to stop the animation
		window.setTimeout(
			this.cleanupAfterAnimation
		.bind(this), this.animationDuration)
	}

	updateAnimation(keys: Array<string>) {
	// This method gets called at regular intervals during the animation
		let weight = (Date.now() - this.animationTimeStart) / this.animationDuration
		let newArgs = this.interpolatedAnimationArgs(keys, weight)
		this.mobject?.update(newArgs, true)
	}

	interpolatedAnimationArgs(keys: Array<string>, weight: number): object {
	/*
	Compute a convex combination between the start and stop values
	of each key. The custom types (all except number) all have
	their own interpolation method.
	*/
		let returnValues: object = {}
		for (let key of keys) {
			let startValue: any = this.animationStartArgs[key]
			let stopValue: any = this.animationStopArgs[key]
			if (typeof startValue ==  'number') {
				returnValues[key] = (1 - weight) * startValue + weight * stopValue
			} else if (isVertex(startValue)) {
				returnValues[key] = vertexInterpolate(startValue, stopValue as vertex, weight)
			} else if (isVertexArray(startValue)) {
				returnValues[key] = vertexArrayInterpolate(startValue, stopValue as vertexArray, weight)
			} else if (startValue instanceof Transform) {
				returnValues[key] = startValue.interpolate(stopValue as Transform, weight)
			} else if (startValue instanceof Color) {
				returnValues[key] = startValue.interpolate(stopValue as Color, weight)
			}
		}
		return returnValues
	}

	cleanupAfterAnimation() {
	// This method gets called at the end of the animation
		window.clearInterval(this.animationInterval)
		if (!this.showShadow) { this.mobject.showShadow() }
		this.animationInterval = null
		this.animationStartArgs = {}
		this.animationStopArgs = {}
		this.showShadow = null
	}



}
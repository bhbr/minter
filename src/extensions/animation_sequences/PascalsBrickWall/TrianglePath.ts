
export type PathDirection = 'L' | 'R'

export class TrianglePath extends Array<PathDirection> {
	
	nbSelectedMoves(): number {
		return this.length
	}

	nbSelectedRightMoves(nbMoves?: number): number {
		if (nbMoves === undefined) {
			nbMoves = this.nbSelectedMoves()
		}
		return this.slice(0, nbMoves).filter((x) => x == 'R').length
	}
	
	index(nbMoves: number): [number, number] {
		return [nbMoves, this.nbSelectedRightMoves(nbMoves)]
	}

	addAfterLevel(direction: PathDirection, n: number) {
		this.clipToLevel(n)
		this.push(direction)
	}

	add(direction: PathDirection) {
		this.addAfterLevel(direction, this.length)
	}

	clipToLevel(n: number) {
		for (let i = this.length; i > n; i--) {
			this.pop()
		}
	}

	flipAtLevel(n: number) {
		this[n] = (this[n] == 'L') ? 'R' : 'L'
	}
}
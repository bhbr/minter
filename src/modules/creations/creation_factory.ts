import { CreatingMobject } from './CreatingMobject'
import { CreatingWaveCindyCanvas } from '../cindy/CreatingWaveCindyCanvas'
import { CreatingExpandableMobject } from '../mobject/expandable/CreatingExpandableMobject_Construction'
import { CreatingConstruction } from '../construction/CreatingConstruction'
import { CreatingBoxSlider } from '../slider/CreatingBoxSlider'
import { ConstructingSegment } from './ConstructingSegment'
import { ConstructingRay } from './ConstructingRay'
import { ConstructingLine } from './ConstructingLine'
import { ConstructingCircle } from './ConstructingCircle'
import { Freehand } from './Freehand'

export function creationFactory(name: string): CreatingMobject {
	switch (name) {
	case 'CreatingWaveCindyCanvas':
		return new CreatingWaveCindyCanvas()
	case 'CreatingExpandableMobject_Construction':
		return new CreatingExpandableMobject()
	case 'CreatingConstruction':
		return new CreatingConstruction()
	case 'CreatingBoxSlider':
		return new CreatingBoxSlider()
	case 'ConstructingSegment':
		return new ConstructingSegment()
	case 'ConstructingRay':
		return new ConstructingRay()
	case 'ConstructingRay':
		return new ConstructingRay()
	case 'ConstructingCircle':
		return new ConstructingCircle()
	case 'Freehand':
		return new Freehand()
	}
}
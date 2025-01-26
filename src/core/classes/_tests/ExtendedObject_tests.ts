
import { ExtendedObject } from '../ExtendedObject'

class FirstClass extends ExtendedObject {

	mutableProperty: number
	initializableProperty: number
	subclassableProperty: number
	immutableProperty: number
	_accessor: number

	get accessor(): number {
		return this._accessor
	}

	set accessor(newValue: number) {
		this._accessor = newValue
	}

	ownDefaults(): object {
		return {
			mutableProperty: 1,
			initializableProperty: 2,
			subclassableProperty: 3,
			immutableProperty: 4,
			accessor: 5
		}
	}

	ownMutabilities(): object {
		return {
			//mutableProperty: 'always',
			initializableProperty: 'on_init',
			subclassableProperty: 'in_subclass',
			immutableProperty: 'never',
			accessor: 'always'
		}
	}

	synchronizeUpdateArguments(args: object): object {
		if (Object.keys(args).includes('_accessor')) {
			delete args['_accessor']
		}
		return args
	}
}


export function Every_property_has_a_mutability(): boolean {
	let A = new FirstClass()
	for (let prop of A.properties()) {
		if (A.mutability(prop) === null || A.mutability(prop) === undefined) {
			return false
		}
	}
	return true
}


export function Every_property_has_a_default_value(): boolean {
	let A = new FirstClass() // default values: see above
	return (
		A.mutableProperty == 1
		&& A.initializableProperty == 2
		&& A.subclassableProperty == 3
		&& A.immutableProperty == 4
		&& A.accessor == 5
	)
}

////////////////////////////////////////////////////
// CHANGING PROPERTY VALUES AFTER OBJECT CREATION //
////////////////////////////////////////////////////

export function A_mutable_property_can_be_changed_after_object_creation(): boolean {
	let A = new FirstClass()
	try {
		A.mutableProperty = 10
		return true
	} catch {
		return false
	}
}

export function A_mutable_property_will_be_changed_properly_after_object_creation(): boolean {
	let A = new FirstClass()
	try {
		A.mutableProperty = 10
		return (A.mutableProperty === 10)
	} catch {
		return false
	}
}

export function An_initializable_property_cannot_be_changed_after_object_creation(): boolean {
	let A = new FirstClass()
	try {
		A.initializableProperty = 30
		return false
	} catch {
		return true
	}
}

export function A_subclassable_property_cannot_be_changed_after_object_creation(): boolean {
	let A = new FirstClass()
	try {
		A.subclassableProperty = 20
		return false
	} catch {
		return true
	}
}

export function An_immutable_property_cannot_be_changed_after_object_creation(): boolean {
	let A = new FirstClass()
	try {
		A.immutableProperty = 40
		return false
	} catch {
		return true
	}
}


/////////////////////////////////////////////////
// CHANGING PROPERTY VALUES ON OBJECT CREATION //
/////////////////////////////////////////////////

export function A_mutable_property_can_be_changed_on_object_creation(): boolean {
	try {
		let A = new FirstClass({ mutableProperty: 10 })
		return true
	} catch {
		return false
	}
}

export function A_mutable_property_will_be_changed_properly_on_object_creation(): boolean {
	try {
		let A = new FirstClass({ mutableProperty: 10 })
		return (A.mutableProperty === 10)
	} catch {
		return false
	}
}

export function An_initializable_property_can_be_changed_on_object_creation(): boolean {
	try {
		let A = new FirstClass({initializableProperty: 30})
		return true
	} catch {
		return false
	}
}

export function An_initializable_property_will_be_changed_properly_on_object_creation(): boolean {
	try {
		let A = new FirstClass({initializableProperty: 30})
		return (A.initializableProperty === 30)
	} catch {
		return false
	}
}

export function A_subclassable_property_cannot_be_changed_on_object_creation(): boolean {
	try {
		let A = new FirstClass({ subclassableProperty: 20 })
		return false
	} catch {
		return true
	}
}

export function An_immutable_property_cannot_be_changed_on_object_creation(): boolean {
	try {
		let A = new FirstClass({ immutableProperty: 40 })
		return false
	} catch {
		return true
	}
}


////////////////////////////////////////////
// CHANGING PROPERTY VALUES IN A SUBCLASS //
////////////////////////////////////////////

export function A_mutable_property_can_be_changed_in_subclass(): boolean {
	try {
		class SecondClass extends FirstClass {
			ownDefaults(): object {
				return {
					mutableProperty: 10
				}
			}
		}
		let A = new SecondClass()
		return true
	} catch {
		return false
	}
}

export function A_mutable_property_will_be_changed_properly_in_subclass(): boolean {
	try {
		class SecondClass extends FirstClass {
			ownDefaults(): object {
				return {
					mutableProperty: 10
				}
			}
		}
		let A = new SecondClass()
		return (A.mutableProperty === 10)
	} catch {
		return false
	}

}

export function An_initializable_property_can_be_changed_in_subclass(): boolean {
	try {
		class SecondClass extends FirstClass {
			ownDefaults(): object {
				return {
					initializableProperty: 20
				}
			}
		}
		let A = new SecondClass()
		return true
	} catch {
		return false
	}
}

export function An_initializable_property_will_be_changed_properly_in_subclass(): boolean {
	try {
		class SecondClass extends FirstClass {
			ownDefaults(): object {
				return {
					initializableProperty: 20
				}
			}
		}
		let A = new SecondClass()
		return (A.initializableProperty === 20)
	} catch {
		return false
	}
}

export function A_subclassable_property_can_be_changed_in_subclass(): boolean {
	try {
		class SecondClass extends FirstClass {
			ownDefaults(): object {
				return {
					subclassableProperty: 20
				}
			}
		}
		let A = new SecondClass()
		return true
	} catch {
		return false
	}
}

export function A_subclassable_property_will_be_changed_properly_in_subclass(): boolean {
	try {
		class SecondClass extends FirstClass {
			ownDefaults(): object {
				return {
					subclassableProperty: 20
				}
			}
		}
		let A = new SecondClass()
		return (A.subclassableProperty === 20)
	} catch {
		return false
	}
}

export function An_immutable_property_cannot_be_changed_in_subclass(): boolean {
	try {
		class SecondClass extends FirstClass {
			ownDefaults(): object {
				return {
					immutableProperty: 40
				}
			}
		}
		let A = new SecondClass()
		return false
	} catch {
		return true
	}
}


///////////////////////////////////////////////
// CHANGING MUTABILITY AFTER OBJECT CREATION //
///////////////////////////////////////////////

export function An_object_s_mutability_object_cannot_be_reassigned(): boolean {
	let A = new FirstClass()
	try {
		A._mutabilities = {}
		return false
	} catch {
		return true
	}
}

export function A_property_s_mutability_cannot_be_changed_on_an_object(): boolean {
	let A = new FirstClass()
	try {
		A._mutabilities['mutableProperty'] = 'never'
		return false
	} catch {
		return true
	}
}





////////////////////////////////////////////////////////
// CHANGING MUTABILITY AND DEFAULT VALUES IN SUBCLASS //
////////////////////////////////////////////////////////

export function An_immutable_property_cannot_become_subclassable_in_subclass(): boolean {
	try {
		class SecondClass extends FirstClass {
			ownMutabilities(): object {
				return {
					immutableProperty: 'in_subclass'
				}
			}
		}
		let A = new SecondClass()
		return false
	} catch {
		return true
	}
}

export function An_immutable_property_cannot_become_initializable_in_subclass(): boolean {
	try {
		class SecondClass extends FirstClass {
			ownMutabilities(): object {
				return {
					immutableProperty: 'on_init'
				}
			}
		}
		let A = new SecondClass()
		return false
	} catch {
		return true
	}
}

export function An_immutable_property_cannot_become_mutable_in_subclass(): boolean {
	try {
		class SecondClass extends FirstClass {
			ownMutabilities(): object {
				return {
					immutableProperty: 'always'
				}
			}
		}
		let A = new SecondClass()
		return false
	} catch {
		return true
	}
}

export function A_subclassable_property_can_become_immutable_in_subclass(): boolean {
	try {
		class SecondClass extends FirstClass {
			ownMutabilities(): object {
				return {
					subclassableProperty: 'never'
				}
			}
		}
		let A = new SecondClass()
		return (A.mutability('subclassableProperty') === 'never')
	} catch {
		return false
	}
}


export function A_subclassable_property_can_become_immutable_and_have_a_new_default_value_in_subclass(): boolean {
	try {
		class SecondClass extends FirstClass {
			ownDefaults(): object {
				return {
					subclassableProperty: 30
				}
			}
			ownMutabilities(): object {
				return {
					subclassableProperty: 'never'
				}
			}
		}
		let A = new SecondClass()
		return (A.mutability('subclassableProperty') === 'never' && A.subclassableProperty === 30)
	} catch {
		return false
	}
}

export function A_subclassable_property_cannot_become_initializable_in_subclass(): boolean {
	try {
		class SecondClass extends FirstClass {
			ownMutabilities(): object {
				return {
					subclassableProperty: 'on_init'
				}
			}
		}
		let A = new SecondClass()
		return false
	} catch {
		return true
	}
}

export function A_subclassable_property_cannot_become_mutable_in_subclass(): boolean {
	try {
		class SecondClass extends FirstClass {
			ownMutabilities(): object {
				return {
					subclassableProperty: 'always'
				}
			}
		}
		let A = new SecondClass()
		return false
	} catch {
		return true
	}
}


export function An_initializable_property_can_become_immutable_in_subclass(): boolean {
	try {
		class SecondClass extends FirstClass {
			ownMutabilities(): object {
				return {
					initializableProperty: 'never'
				}
			}
		}
		let A = new SecondClass()
		return (A.mutability('initializableProperty') === 'never')
	} catch {
		return false
	}
}


export function An_initializable_property_can_become_immutable_and_have_a_new_default_value_in_subclass(): boolean {
	try {
		class SecondClass extends FirstClass {
			ownDefaults(): object {
				return {
					initializableProperty: 20
				}
			}
			ownMutabilities(): object {
				return {
					initializableProperty: 'never'
				}
			}
		}
		let A = new SecondClass()
		return (A.mutability('initializableProperty') === 'never' && A.initializableProperty === 20)
	} catch {
		return false
	}
}

export function An_initializable_property_can_become_subclassable_in_subclass(): boolean {
	try {
		class SecondClass extends FirstClass {
			ownMutabilities(): object {
				return {
					initializableProperty: 'in_subclass'
				}
			}
		}
		let A = new SecondClass()
		return (A.mutability('initializableProperty') === 'in_subclass')
	} catch {
		return false
	}
}

export function An_initializable_property_can_become_subclassable_and_have_a_new_default_value_in_subclass(): boolean {
	try {
		class SecondClass extends FirstClass {
			ownDefaults(): object {
				return {
					initializableProperty: 20
				}
			}
			ownMutabilities(): object {
				return {
					initializableProperty: 'in_subclass'
				}
			}
		}
		let A = new SecondClass()
		return (A.mutability('initializableProperty') === 'in_subclass')
	} catch {
		return false
	}
}

export function An_initializable_property_cannot_become_mutable_in_subclass(): boolean {
	try {
		class SecondClass extends FirstClass {
			ownMutabilities(): object {
				return {
					initializableProperty: 'always'
				}
			}
		}
		let A = new SecondClass()
		return false
	} catch {
		return true
	}
}

export function A_mutable_property_can_become_immutable_in_subclass(): boolean {
	try {
		class SecondClass extends FirstClass {
			ownMutabilities(): object {
				return {
					mutableProperty: 'never'
				}
			}
		}
		let A = new SecondClass()
		return (A.mutability('mutableProperty') === 'never')
	} catch {
		return false
	}
}

export function A_mutable_property_can_become_immutable_and_have_a_new_default_value_in_subclass(): boolean {
	try {
		class SecondClass extends FirstClass {
			ownDefaults(): object {
				return {
					mutableProperty: 10
				}
			}
			ownMutabilities(): object {
				return {
					mutableProperty: 'never'
				}
			}
		}
		let A = new SecondClass()
		return (A.mutability('mutableProperty') === 'never' && A.mutableProperty == 10)
	} catch {
		return false
	}
}

export function A_mutable_property_can_become_immutable_and_have_a_new_default_value_in_subsubclass_1(): boolean {
	try {
		class SecondClass extends FirstClass { }
		class ThirdClass extends SecondClass {
			ownDefaults(): object {
				return {
					mutableProperty: 10
				}
			}
			ownMutabilities(): object {
				return {
					mutableProperty: 'never'
				}
			}
		}
		let A = new ThirdClass()
		return (A.mutability('mutableProperty') === 'never' && A.mutableProperty == 10)
	} catch {
		return false
	}
}

export function A_mutable_property_can_become_immutable_and_have_a_new_default_value_in_subsubclass_2(): boolean {
	try {
		class SecondClass extends FirstClass {
			ownDefaults(): object {
				return {
					mutableProperty: 10
				}
			}
			ownMutabilities(): object {
				return {
					mutableProperty: 'never'
				}
			}
		}
		class ThirdClass extends SecondClass { }
		let A = new ThirdClass()
		return (A.mutability('mutableProperty') === 'never' && A.mutableProperty == 10)
	} catch {
		return false
	}
}


export function A_mutable_property_can_become_subclassable_in_subclass(): boolean {
	try {
		class SecondClass extends FirstClass {
			ownMutabilities(): object {
				return {
					mutableProperty: 'in_subclass'
				}
			}
		}
		let A = new SecondClass()
		return (A.mutability('mutableProperty') === 'in_subclass')
	} catch {
		return false
	}
}

export function A_mutable_property_can_become_subclassable_and_have_a_new_default_value_in_subclass(): boolean {
	try {
		class SecondClass extends FirstClass {
			ownDefaults(): object {
				return {
					mutableProperty: 10
				}
			}
			ownMutabilities(): object {
				return {
					mutableProperty: 'in_subclass'
				}
			}
		}
		let A = new SecondClass()
		return (A.mutability('mutableProperty') === 'in_subclass' && A.mutableProperty === 10)
	} catch {
		return false
	}
}

export function A_mutable_property_can_become_initializable_in_subclass(): boolean {
	try {
		class SecondClass extends FirstClass {
			ownMutabilities(): object {
				return {
					mutableProperty: 'on_init'
				}
			}
		}
		let A = new SecondClass()
		return (A.mutability('mutableProperty') === 'on_init')
	} catch {
		return false
	}
}

export function A_mutable_property_can_become_initializable_and_have_a_new_default_value_in_subclass(): boolean {
	try {
		class SecondClass extends FirstClass {
			ownDefaults(): object {
				return {
					mutableProperty: 10
				}
			}
			ownMutabilities(): object {
				return {
					mutableProperty: 'on_init'
				}
			}
		}
		let A = new SecondClass()
		return (A.mutability('mutableProperty') === 'on_init' && A.mutableProperty == 10)
	} catch {
		return false
	}
}

//////////////
// UPDATING //
//////////////


export function A_mutable_property_can_be_updated(): boolean {
	let A = new FirstClass()
	try {
		A.update({ mutableProperty: 10 })
		return true
	} catch {
		return false
	}
}

export function A_mutable_property_can_be_updated_to_the_correct_value(): boolean {
	let A = new FirstClass()
	try {
		A.update({ mutableProperty: 10 })
		return (A.mutableProperty === 10)
	} catch {
		return false
	}
}

export function An_initializable_property_cannot_be_updated(): boolean {
	let A = new FirstClass()
	try {
		A.update({ initializableProperty: 20 })
		return false
	} catch {
		return true
	}
}

export function A_subclassable_property_cannot_be_updated(): boolean {
	let A = new FirstClass()
	try {
		A.update({ subclassableProperty: 30 })
		return false
	} catch {
		return true
	}
}

export function An_immutable_property_cannot_be_updated(): boolean {
	let A = new FirstClass()
	try {
		A.update({ immutableProperty: 40 })
		return false
	} catch {
		return true
	}
}

export function An_immutable_property_can_be_added_in_a_subclass(): boolean {
	try {
		class SecondClass extends FirstClass {

			immutableProperty2: number

			ownDefaults(): object {
				return {
					immutableProperty2: 6
				}
			}
			ownMutabilities(): object {
				return {
					immutableProperty2: 'never'
				}
			}
		}
		let A = new SecondClass()
		return (A.mutability('immutableProperty2') == 'never' && A.immutableProperty2 == 6)
	} catch {
		return false
	}
}



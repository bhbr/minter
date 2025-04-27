
import { ExtendedObject } from 'core/classes/ExtendedObject'
import { MutabilityError, AssignmentError } from 'core/classes/Errors'
import { log } from 'core/functions/logging'
import { ExecutionTest, ConditionTest, ValueTest, AssertionTest, ErrorTest, BundledTest } from '_tests/Tests'

class FirstClass extends ExtendedObject {

	genericallySettableProperty: number
	settableProperty: number
	updatableProperty: number
	initializableProperty: number
	subclassableProperty: number
	immutableProperty: number

	defaults(): object {
		return {
			genericallySettableProperty: 10,
			settableProperty: 20,
			updatableProperty: 30,
			initializableProperty: 40,
			subclassableProperty: 50,
			immutableProperty: 60,
		}
	}

	mutabilities(): object {
		return {
			settableProperty: 'always',
			updatableProperty: 'on_update',
			initializableProperty: 'on_init',
			subclassableProperty: 'in_subclass',
			immutableProperty: 'never'
		}
	}

}

export const Every_property_has_a_mutability = new AssertionTest({
	name: 'Every_property_has_a_mutability',
	function: function(): boolean {
		ExtendedObject.clearClassDeclarations()
		let A = new FirstClass()
		for (let prop of A.properties) {
			let mut = A.mutability(prop)
			if (mut === null || mut === undefined) {
				console.error(`Mutability of ${prop} on class FirstClass is ${mut}`)
				return false
			}
		}
		return true
	}
})

export const ExtendedObject_tests = [


	function A_property_is_by_default_settable(): boolean {
		ExtendedObject.clearClassDeclarations()
		let A = new FirstClass()
		return A.mutability('genericallySettableProperty') === 'always'
	},

	function Every_property_has_a_default_value(): boolean {
		ExtendedObject.clearClassDeclarations()
		let A = new FirstClass() // default values: see above
		return (
			A.genericallySettableProperty == 10
			&& A.settableProperty == 20
			&& A.updatableProperty == 30
			&& A.initializableProperty == 40
			&& A.subclassableProperty == 50
			&& A.immutableProperty == 60
		)
	}

]

///////////////////////////////////////////////////
// SETTING PROPERTY VALUES AFTER OBJECT CREATION //
///////////////////////////////////////////////////

export function A_settable_property_can_be_set_after_object_creation(): boolean {
	ExtendedObject.clearClassDeclarations()
	let A = new FirstClass()
	try {
		A.settableProperty = 21
		return true
	} catch (e) {
		console.error(e)
		return false
	}
}

export function A_settable_property_will_be_set_properly_after_object_creation(): boolean {
	ExtendedObject.clearClassDeclarations()
	let A = new FirstClass()
	A.settableProperty = 21
	return A.settableProperty === 21
}


export function An_updatable_property_cannot_be_set_after_object_creation(): boolean {
	ExtendedObject.clearClassDeclarations()
	let A = new FirstClass()
	try {
		A.updatableProperty = 31
		return false
	} catch (e) {
		return e instanceof AssignmentError
	}
}

export function An_initializable_property_cannot_be_set_after_object_creation(): boolean {
	ExtendedObject.clearClassDeclarations()
	let A = new FirstClass()
	try {
		A.initializableProperty = 41
		return false
	} catch (e) {
		return e instanceof AssignmentError
	}
}

export function A_subclassable_property_cannot_be_set_after_object_creation(): boolean {
	ExtendedObject.clearClassDeclarations()
	let A = new FirstClass()
	try {
		A.subclassableProperty = 51
		return false
	} catch (e) {
		return e instanceof AssignmentError
	}
}

export function An_immutable_property_cannot_be_set_after_object_creation(): boolean {
	ExtendedObject.clearClassDeclarations()
	let A = new FirstClass()
	try {
		A.immutableProperty = 61
		return false
	} catch (e) {
		return e instanceof AssignmentError
	}
}


////////////////////////////////////////////////////
// UPDATING PROPERTY VALUES AFTER OBJECT CREATION //
////////////////////////////////////////////////////

export function A_settable_property_can_be_updated_after_object_creation(): boolean {
	ExtendedObject.clearClassDeclarations()
	let A = new FirstClass()
	try {
		A.update({ settableProperty: 21 })
		return true
	} catch (e) {
		console.error(e)
		return false
	}
}

export function A_settable_property_will_be_updated_properly_after_object_creation(): boolean {
	ExtendedObject.clearClassDeclarations()
	let A = new FirstClass()
	A.update({ settableProperty: 21 })
	return A.settableProperty === 21
}

export function An_updatable_property_can_be_updated_after_object_creation(): boolean {
	ExtendedObject.clearClassDeclarations()
	let A = new FirstClass()
	try {
		A.update({ updatableProperty: 31 })
		return true
	} catch (e) {
		console.error(e)
		return false
	}
}

export function An_updatable_property_will_be_updated_properly_after_object_creation(): boolean {
	ExtendedObject.clearClassDeclarations()
	let A = new FirstClass()
	A.update({ updatableProperty: 31 })
	return A.updatableProperty === 31
}

export function An_initializable_property_cannot_be_update_after_object_creation(): boolean {
	ExtendedObject.clearClassDeclarations()
	let A = new FirstClass()
	try {
		A.update({ initializableProperty: 41 })
		return false
	} catch (e) {
		return e instanceof AssignmentError
	}
}

export function A_subclassable_property_cannot_be_update_after_object_creation(): boolean {
	ExtendedObject.clearClassDeclarations()
	let A = new FirstClass()
	try {
		A.update({ subclassableProperty: 51 })
		return false
	} catch (e) {
		return e instanceof AssignmentError
	}
}

export function An_immutable_property_cannot_be_updated_after_object_creation(): boolean {
	ExtendedObject.clearClassDeclarations()
	let A = new FirstClass()
	try {
		A.update({ immutableProperty: 61 })
		return false
	} catch (e) {
		return e instanceof AssignmentError
	}
}


/////////////////////////////////////////////////
// CHANGING PROPERTY VALUES ON OBJECT CREATION //
/////////////////////////////////////////////////

export function A_settable_property_can_be_changed_on_object_creation(): boolean {
	ExtendedObject.clearClassDeclarations()
	try {
		let A = new FirstClass({ settableProperty: 21 })
		return true
	} catch (e) {
		return e instanceof AssignmentError
	}
}

export function A_settable_property_will_be_changed_properly_on_object_creation(): boolean {
	ExtendedObject.clearClassDeclarations()
	let A = new FirstClass({ settableProperty: 21 })
	return A.settableProperty === 21
}

export function An_updatable_property_can_be_changed_on_object_creation(): boolean {
	ExtendedObject.clearClassDeclarations()
	try {
		let A = new FirstClass({ updatableProperty: 31 })
		return true
	} catch (e) {
		return e instanceof AssignmentError
	}
}

export function An_updatable_property_will_be_changed_properly_on_object_creation(): boolean {
	ExtendedObject.clearClassDeclarations()
	let A = new FirstClass({ updatableProperty: 31 })
	return A.updatableProperty === 31
}

export function An_initializable_property_can_be_changed_on_object_creation(): boolean {
	ExtendedObject.clearClassDeclarations()
	try {
		let A = new FirstClass({ initializableProperty: 41 })
		return true
	} catch (e) {
		return e instanceof AssignmentError
	}
}

export function An_initializable_property_will_be_changed_properly_on_object_creation(): boolean {
	ExtendedObject.clearClassDeclarations()
	let A = new FirstClass({ initializableProperty: 41 })
	return A.initializableProperty === 41
}

export function A_subclassable_property_cannot_be_changed_on_object_creation(): boolean {
	ExtendedObject.clearClassDeclarations()
	try {
		let A = new FirstClass({ subclassableProperty: 51 })
		return false
	} catch (e) {
		return e instanceof AssignmentError
	}
}

export function An_immutable_property_cannot_be_changed_on_object_creation(): boolean {
	ExtendedObject.clearClassDeclarations()
	try {
		let A = new FirstClass({ immutableProperty: 61 })
		return false
	} catch (e) {
		return e instanceof AssignmentError
	}
}


////////////////////////////////////////////
// CHANGING PROPERTY VALUES IN A SUBCLASS //
////////////////////////////////////////////

export function A_settable_property_can_be_changed_in_subclass(): boolean {
	ExtendedObject.clearClassDeclarations()
	try {
		class SecondClass extends FirstClass {
			defaults(): object {
				return {
					settableProperty: 10
				}
			}
		}
		let A = new SecondClass()
		return true
	} catch (e) {
		console.error(e)
		return false
	}
}

export function A_mutable_property_will_be_changed_properly_in_subclass(): boolean {
	ExtendedObject.clearClassDeclarations()
	class SecondClass extends FirstClass {
		defaults(): object {
			return {
				settableProperty: 10
			}
		}
	}
	let A = new SecondClass()
	return A.settableProperty === 10
}

export function An_initializable_property_can_be_changed_in_subclass(): boolean {
	ExtendedObject.clearClassDeclarations()
	try {
		class SecondClass extends FirstClass {
			defaults(): object {
				return {
					initializableProperty: 20
				}
			}
		}
		let A = new SecondClass()
		return true
	} catch (e) {
		console.error(e)
		return false
	}
}

export function An_initializable_property_will_be_changed_properly_in_subclass(): boolean {
	ExtendedObject.clearClassDeclarations()
	class SecondClass extends FirstClass {
		defaults(): object {
			return {
				initializableProperty: 20
			}
		}
	}
	let A = new SecondClass()
	return A.initializableProperty === 20
}

export function A_subclassable_property_can_be_changed_in_subclass(): boolean {
	ExtendedObject.clearClassDeclarations()
	try {
		class SecondClass extends FirstClass {
			defaults(): object {
				return {
					subclassableProperty: 20
				}
			}
		}
		let A = new SecondClass()
		return true
	} catch (e) {
		console.error(e)
		return false
	}
}

export function A_subclassable_property_will_be_changed_properly_in_subclass(): boolean {
	ExtendedObject.clearClassDeclarations()
	class SecondClass extends FirstClass {
		defaults(): object {
			return {
				subclassableProperty: 20
			}
		}
	}
	let A = new SecondClass()
	return (A.subclassableProperty === 20)
}

export function An_immutable_property_cannot_be_changed_in_subclass(): boolean {
	ExtendedObject.clearClassDeclarations()
	try {
		class SecondClass extends FirstClass {
			defaults(): object {
				return {
					immutableProperty: 40
				}
			}
		}
		let A = new SecondClass()
		return false
	} catch (e) {
		return e instanceof AssignmentError
	}
}




////////////////////////////////////////////////////////
// CHANGING MUTABILITY AND DEFAULT VALUES IN SUBCLASS //
////////////////////////////////////////////////////////

export function An_immutable_property_cannot_become_subclassable_in_subclass(): boolean {
	ExtendedObject.clearClassDeclarations()
	try {
		class SecondClass extends FirstClass {
			mutabilities(): object {
				return {
					immutableProperty: 'in_subclass'
				}
			}
		}
		let A = new SecondClass()
		return false
	} catch (e) {
		return e instanceof MutabilityError
	}
}

export function An_immutable_property_cannot_become_initializable_in_subclass(): boolean {
	ExtendedObject.clearClassDeclarations()
	try {
		class SecondClass extends FirstClass {
			mutabilities(): object {
				return {
					immutableProperty: 'on_init'
				}
			}
		}
		let A = new SecondClass()
		return false
	} catch (e) {
		return e instanceof MutabilityError
	}
}

export function An_immutable_property_cannot_become_updatable_in_subclass(): boolean {
	ExtendedObject.clearClassDeclarations()
	try {
		class SecondClass extends FirstClass {
			mutabilities(): object {
				return {
					immutableProperty: 'on_update'
				}
			}
		}
		let A = new SecondClass()
		return false
	} catch (e) {
		return e instanceof MutabilityError
	}
}

export function An_immutable_property_cannot_become_settable_in_subclass(): boolean {
	ExtendedObject.clearClassDeclarations()
	try {
		class SecondClass extends FirstClass {
			mutabilities(): object {
				return {
					immutableProperty: 'always'
				}
			}
		}
		let A = new SecondClass()
		return false
	} catch (e) {
		return e instanceof MutabilityError
	}
}

export function A_subclassable_property_can_become_immutable_in_subclass(): boolean {
	ExtendedObject.clearClassDeclarations()
	try {
		class SecondClass extends FirstClass {
			mutabilities(): object {
				return {
					subclassableProperty: 'never'
				}
			}
		}
		let A = new SecondClass()
		return (A.mutability('subclassableProperty') === 'never')
	} catch (e) {
		console.error(e)
		return false
	}
}

export function A_subclassable_property_can_become_immutable_and_have_a_new_default_value_in_subclass(): boolean {
	ExtendedObject.clearClassDeclarations()
	try {
		class SecondClass extends FirstClass {
			defaults(): object {
				return {
					subclassableProperty: 51
				}
			}
			mutabilities(): object {
				return {
					subclassableProperty: 'never'
				}
			}
		}
		let A = new SecondClass()
		return (A.mutability('subclassableProperty') === 'never' && A.subclassableProperty === 51)
	} catch (e) {
		console.error(e)
		return false
	}
}

export function A_subclassable_property_cannot_become_initializable_in_subclass(): boolean {
	ExtendedObject.clearClassDeclarations()
	try {
		class SecondClass extends FirstClass {
			mutabilities(): object {
				return {
					subclassableProperty: 'on_init'
				}
			}
		}
		let A = new SecondClass()
		return false
	} catch (e) {
		return e instanceof MutabilityError
	}
}

export function A_subclassable_property_cannot_become_updatable_in_subclass(): boolean {
	ExtendedObject.clearClassDeclarations()
	try {
		class SecondClass extends FirstClass {
			mutabilities(): object {
				return {
					subclassableProperty: 'on_update'
				}
			}
		}
		let A = new SecondClass()
		return false
	} catch (e) {
		return e instanceof MutabilityError
	}
}

export function A_subclassable_property_cannot_become_settable_in_subclass(): boolean {
	ExtendedObject.clearClassDeclarations()
	try {
		class SecondClass extends FirstClass {
			mutabilities(): object {
				return {
					subclassableProperty: 'always'
				}
			}
		}
		let A = new SecondClass()
		return false
	} catch (e) {
		return e instanceof MutabilityError
	}
}


export function An_initializable_property_can_become_immutable_in_subclass(): boolean {
	ExtendedObject.clearClassDeclarations()
	try {
		class SecondClass extends FirstClass {
			mutabilities(): object {
				return {
					initializableProperty: 'never'
				}
			}
		}
		let A = new SecondClass()
		return (A.mutability('initializableProperty') === 'never')
	} catch (e) {
		return e instanceof MutabilityError
	}
}

export function An_initializable_property_can_become_immutable_and_have_a_new_default_value_in_subclass(): boolean {
	ExtendedObject.clearClassDeclarations()
	try {
		class SecondClass extends FirstClass {
			defaults(): object {
				return {
					initializableProperty: 41
				}
			}
			mutabilities(): object {
				return {
					initializableProperty: 'never'
				}
			}
		}
		let A = new SecondClass()
		return (A.mutability('initializableProperty') === 'never' && A.initializableProperty === 41)
	} catch (e) {
		console.error(e)
		return false
	}
}

export function An_initializable_property_can_become_subclassable_in_subclass(): boolean {
	ExtendedObject.clearClassDeclarations()
	try {
		class SecondClass extends FirstClass {
			mutabilities(): object {
				return {
					initializableProperty: 'in_subclass'
				}
			}
		}
		let A = new SecondClass()
		return (A.mutability('initializableProperty') === 'in_subclass')
	} catch (e) {
		console.error(e)
		return false
	}
}

export function An_initializable_property_can_become_subclassable_and_have_a_new_default_value_in_subclass(): boolean {
	ExtendedObject.clearClassDeclarations()
	try {
		class SecondClass extends FirstClass {
			defaults(): object {
				return {
					initializableProperty: 41
				}
			}
			mutabilities(): object {
				return {
					initializableProperty: 'in_subclass'
				}
			}
		}
		let A = new SecondClass()
		return (A.mutability('initializableProperty') === 'in_subclass' && A.initializableProperty === 41)
	} catch (e) {
		console.error(e)
		return false
	}
}

export function An_initializable_property_cannot_become_updatable_in_subclass(): boolean {
	ExtendedObject.clearClassDeclarations()
	try {
		class SecondClass extends FirstClass {
			mutabilities(): object {
				return {
					initializableProperty: 'on_update'
				}
			}
		}
		let A = new SecondClass()
		return false
	} catch (e) {
		return e instanceof MutabilityError
	}
}

export function An_initializable_property_cannot_become_settable_in_subclass(): boolean {
	ExtendedObject.clearClassDeclarations()
	try {
		class SecondClass extends FirstClass {
			mutabilities(): object {
				return {
					initializableProperty: 'always'
				}
			}
		}
		let A = new SecondClass()
		return false
	} catch (e) {
		return e instanceof MutabilityError
	}
}

export function A_settable_property_can_become_immutable_in_subclass(): boolean {
	ExtendedObject.clearClassDeclarations()
	try {
		class SecondClass extends FirstClass {
			mutabilities(): object {
				return {
					settableProperty: 'never'
				}
			}
		}
		let A = new SecondClass()
		return (A.mutability('settableProperty') === 'never')
	} catch (e) {
		console.error(e)
		return false
	}
}

export function A_settable_property_can_become_immutable_and_have_a_new_default_value_in_subclass(): boolean {
	ExtendedObject.clearClassDeclarations()
	try {
		class SecondClass extends FirstClass {
			defaults(): object {
				return {
					settableProperty: 21
				}
			}
			mutabilities(): object {
				return {
					settableProperty: 'never'
				}
			}
		}
		let A = new SecondClass()
		return (A.mutability('settableProperty') === 'never' && A.settableProperty == 21)
	} catch (e) {
		console.error(e)
		return false
	}
}

export function A_settable_property_can_become_immutable_and_have_a_new_default_value_in_subsubclass_1(): boolean {
	ExtendedObject.clearClassDeclarations()
	try {
		class SecondClass extends FirstClass { }
		class ThirdClass extends SecondClass {
			defaults(): object {
				return {
					settableProperty: 21
				}
			}
			mutabilities(): object {
				return {
					settableProperty: 'never'
				}
			}
		}
		let A = new ThirdClass()
		return (A.mutability('settableProperty') === 'never' && A.settableProperty == 21)
	} catch (e) {
		console.error(e)
		return false
	}
}

export function A_settable_property_can_become_immutable_and_have_a_new_default_value_in_subsubclass_2(): boolean {
	ExtendedObject.clearClassDeclarations()
	try {
		class SecondClass extends FirstClass {
			defaults(): object {
				return {
					settableProperty: 21
				}
			}
			mutabilities(): object {
				return {
					settableProperty: 'never'
				}
			}
		}
		class ThirdClass extends SecondClass { }
		let A = new ThirdClass()
		return (A.mutability('settableProperty') === 'never' && A.settableProperty == 21)
	} catch (e) {
		console.error(e)
		return false
	}
}


export function A_settable_property_can_become_subclassable_in_subclass(): boolean {
	ExtendedObject.clearClassDeclarations()
	try {
		class SecondClass extends FirstClass {
			mutabilities(): object {
				return {
					settableProperty: 'in_subclass'
				}
			}
		}
		let A = new SecondClass()
		return (A.mutability('settableProperty') === 'in_subclass')
	} catch (e) {
		console.error(e)
		return false
	}
}

export function A_settable_property_can_become_subclassable_and_have_a_new_default_value_in_subclass(): boolean {
	ExtendedObject.clearClassDeclarations()
	try {
		class SecondClass extends FirstClass {
			defaults(): object {
				return {
					settableProperty: 10
				}
			}
			mutabilities(): object {
				return {
					settableProperty: 'in_subclass'
				}
			}
		}
		let A = new SecondClass()
		return (A.mutability('settableProperty') === 'in_subclass' && A.settableProperty === 10)
	} catch (e) {
		console.error(e)
		return false
	}
}

export function A_settable_property_can_become_initializable_in_subclass(): boolean {
	ExtendedObject.clearClassDeclarations()
	try {
		class SecondClass extends FirstClass {
			mutabilities(): object {
				return {
					settableProperty: 'on_init'
				}
			}
		}
		let A = new SecondClass()
		return (A.mutability('settableProperty') === 'on_init')
	} catch (e) {
		console.error(e)
		return false
	}
}

export function A_settable_property_can_become_initializable_and_have_a_new_default_value_in_subclass(): boolean {
	ExtendedObject.clearClassDeclarations()
	try {
		class SecondClass extends FirstClass {
			defaults(): object {
				return {
					settableProperty: 10
				}
			}
			mutabilities(): object {
				return {
					settableProperty: 'on_init'
				}
			}
		}
		let A = new SecondClass()
		return (A.mutability('settableProperty') === 'on_init' && A.settableProperty == 10)
	} catch (e) {
		console.error(e)
		return false
	}
}

export function A_settable_property_can_become_updatable_in_subclass(): boolean {
	ExtendedObject.clearClassDeclarations()
	try {
		class SecondClass extends FirstClass {
			mutabilities(): object {
				return {
					settableProperty: 'on_update'
				}
			}
		}
		let A = new SecondClass()
		return (A.mutability('settableProperty') === 'on_update')
	} catch (e) {
		console.error(e)
		return false
	}
}

export function A_settable_property_can_become_updatable_and_have_a_new_default_value_in_subclass(): boolean {
	ExtendedObject.clearClassDeclarations()
	try {
		class SecondClass extends FirstClass {
			defaults(): object {
				return {
					settableProperty: 21
				}
			}
			mutabilities(): object {
				return {
					settableProperty: 'on_update'
				}
			}
		}
		let A = new SecondClass()
		return (A.mutability('settableProperty') === 'on_update' && A.settableProperty == 21)
	} catch (e) {
		console.error(e)
		return false
	}
}


///////////////////////////////////
// ADDING PROPERTIES IN SUBCLASS //
///////////////////////////////////

export function An_immutable_property_can_be_added_in_a_subclass(): boolean {
	ExtendedObject.clearClassDeclarations()
	try {
		class SecondClass extends FirstClass {

			immutableProperty2: number

			defaults(): object {
				return {
					immutableProperty2: 7
				}
			}
			mutabilities(): object {
				return {
					immutableProperty2: 'never'
				}
			}
		}
		let A = new SecondClass()
		return (A.mutability('immutableProperty2') == 'never' && A.immutableProperty2 == 7)
	} catch (e) {
		console.error(e)
		return false
	}
}













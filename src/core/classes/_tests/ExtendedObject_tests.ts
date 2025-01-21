
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

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			mutableProperty: 1,
			initializableProperty: 2,
			subclassableProperty: 3,
			immutableProperty: 4,
			accessor: 5
		})
	}

	mutabilities(): object {
		return this.updateMutabilities(super.mutabilities(), {
			mutableProperty: 'always',
			initializableProperty: 'on_init',
			subclassableProperty: 'in_subclass',
			immutableProperty: 'never',
			accessor: 'always'
		})
	}

	synchronizeUpdateArguments(args: object): object {
		if (Object.keys(args).includes('_accessor')) {
			delete args['_accessor']
		}
		return args
	}
}





export function Properties_have_a_default_value(): boolean {
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

// export function A_mutable_property_can_be_updated_after_object_creation(): boolean {
// 	let A = new FirstClass()
// 	try {
// 		A.update({ mutableProperty: 10 })
// 		return true
// 	} catch {
// 		return false
// 	}
// }

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
			defaults(): object {
				return this.updateDefaults(super.defaults(), {
					mutableProperty: 10
				})
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
			defaults(): object {
				return this.updateDefaults(super.defaults(), {
					mutableProperty: 10
				})
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
			defaults(): object {
				return this.updateDefaults(super.defaults(), {
					initializableProperty: 20
				})
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
			defaults(): object {
				return this.updateDefaults(super.defaults(), {
					initializableProperty: 20
				})
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
			defaults(): object {
				return this.updateDefaults(super.defaults(), {
					subclassableProperty: 20
				})
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
			defaults(): object {
				return this.updateDefaults(super.defaults(), {
					subclassableProperty: 20
				})
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
			defaults(): object {
				return this.updateDefaults(super.defaults(), {
					immutableProperty: 40
				})
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
			mutabilities(): object {
				return this.updateMutabilities(super.mutabilities(), {
					immutableProperty: 'in_subclass'
				})
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
			mutabilities(): object {
				return this.updateMutabilities(super.mutabilities(), {
					immutableProperty: 'on_init'
				})
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
			mutabilities(): object {
				return this.updateMutabilities(super.mutabilities(), {
					immutableProperty: 'always'
				})
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
			mutabilities(): object {
				return this.updateMutabilities(super.mutabilities(), {
					subclassableProperty: 'never'
				})
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
			defaults(): object {
				return this.updateDefaults(super.defaults(), {
					subclassableProperty: 30
				})
			}
			mutabilities(): object {
				return this.updateMutabilities(super.mutabilities(), {
					subclassableProperty: 'never'
				})
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
			mutabilities(): object {
				return this.updateMutabilities(super.mutabilities(), {
					subclassableProperty: 'on_init'
				})
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
			mutabilities(): object {
				return this.updateMutabilities(super.mutabilities(), {
					subclassableProperty: 'always'
				})
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
			mutabilities(): object {
				return this.updateMutabilities(super.mutabilities(), {
					initializableProperty: 'never'
				})
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
			defaults(): object {
				return this.updateDefaults(super.defaults(), {
					initializableProperty: 20
				})
			}
			mutabilities(): object {
				return this.updateMutabilities(super.mutabilities(), {
					initializableProperty: 'never'
				})
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
			mutabilities(): object {
				return this.updateMutabilities(super.mutabilities(), {
					initializableProperty: 'in_subclass'
				})
			}
		}
		let A = new SecondClass()
		return (A.mutability('initializableProperty') === 'in_subclass')
	} catch {
		return false
	}
}

export function An_initializable_property_can_become_subclassable_in_subclass_and_have_a_new_default_value_in_subclass(): boolean {
	try {
		class SecondClass extends FirstClass {
			defaults(): object {
				return this.updateDefaults(super.defaults(), {
					initializableProperty: 20
				})
			}
			mutabilities(): object {
				return this.updateMutabilities(super.mutabilities(), {
					initializableProperty: 'in_subclass'
				})
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
			mutabilities(): object {
				return this.updateMutabilities(super.mutabilities(), {
					initializableProperty: 'always'
				})
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
			mutabilities(): object {
				return this.updateMutabilities(super.mutabilities(), {
					mutableProperty: 'never'
				})
			}
		}
		let A = new SecondClass()
		return (A.mutability('mutableProperty') === 'never')
	} catch {
		return false
	}
}

export function A_mutable_property_can_become_immutable_in_subclass_and_have_a_new_default_value_in_subclass(): boolean {
	try {
		class SecondClass extends FirstClass {
			defaults(): object {
				return this.updateDefaults(super.defaults(), {
					mutableProperty: 10
				})
			}
			mutabilities(): object {
				return this.updateMutabilities(super.mutabilities(), {
					mutableProperty: 'never'
				})
			}
		}
		let A = new SecondClass()
		return (A.mutability('mutableProperty') === 'never' && A.mutableProperty == 10)
	} catch {
		return false
	}
}



export function A_mutable_property_can_become_subclassable_in_subclass(): boolean {
	try {
		class SecondClass extends FirstClass {
			mutabilities(): object {
				return this.updateMutabilities(super.mutabilities(), {
					mutableProperty: 'in_subclass'
				})
			}
		}
		let A = new SecondClass()
		return (A.mutability('mutableProperty') === 'in_subclass')
	} catch {
		return false
	}
}

export function A_mutable_property_can_become_subclassable_in_subclass_and_have_a_new_default_value_in_subclass(): boolean {
	try {
		class SecondClass extends FirstClass {
			defaults(): object {
				return this.updateDefaults(super.defaults(), {
					mutableProperty: 10
				})
			}
			mutabilities(): object {
				return this.updateMutabilities(super.mutabilities(), {
					mutableProperty: 'in_subclass'
				})
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
			mutabilities(): object {
				return this.updateMutabilities(super.mutabilities(), {
					mutableProperty: 'on_init'
				})
			}
		}
		let A = new SecondClass()
		return (A.mutability('mutableProperty') === 'on_init')
	} catch {
		return false
	}
}

export function A_mutable_property_can_become_initializable_in_subclass_and_have_a_new_default_value_in_subclass(): boolean {
	try {
		class SecondClass extends FirstClass {
			defaults(): object {
				return this.updateDefaults(super.defaults(), {
					mutableProperty: 10
				})
			}
			mutabilities(): object {
				return this.updateMutabilities(super.mutabilities(), {
					mutableProperty: 'on_init'
				})
			}
		}
		let A = new SecondClass()
		return (A.mutability('mutableProperty') === 'on_init' && A.mutableProperty == 10)
	} catch {
		return false
	}
}








// export function Properties_with_mutability_always_can_be_updated(): boolean {
// 	let A = new FirstClass()
// 	A.update({propertyMutableAlways: 5})
// 	return (A.mutableProperty == 5)
// }







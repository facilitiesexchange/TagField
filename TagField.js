/**
 * TagField
 * For use in ExtJS 6.x Modern
 * @author Brandon Ryall-Ortiz <brandon.ryall@facilitiesexchange.com>, <brandon@guilt.io>
 * Facilities Exchange www.fexa.io
 **/
Ext.define('Ext.field.TagField', {
	extend: 'Ext.field.Picker',
	xtype: 'tagfield',

	requires: [
		'Ext.picker.Picker'
	],

	isField: true,

	config: {
		store: null,
		displayField: 'text',
		valueField: 'id',
		picker: 'floated',
		floatedPicker: {
			xtype: 'list',
			selectable: 'multi'
		},
		selected: {}
	},

	listeners: {
		keyup() {
			const me = this;
			let v = this.getInputValue();

			if( v && v.length ) {
				this.getPicker().getStore().filterBy( ( rec ) => {
					return rec.get( me.getDisplayField() ).match( new RegExp( me.getInputValue(), 'gi' ) ) !== null;
				} );
			} else {
				this.getPicker().getStore().clearFilter();
			}
		}
	},

	onSelect( t, recs ) {
		let i = 0, len = recs.length;
		if( !this._selected ) {
			this._selected = {};
		}
		while( i < len ) {
			// Don't add a selection if it is already selected
			if( this._selected[ recs[ i ].get( this.getValueField() ) ] ) {
				break;
			}
			this._selected[ recs[ i ].get( this.getValueField() ) ] = recs[ i ];
			this.addTag( recs[ i ] );
			i++;
		}

		this.validate();
	},

	onDeselect( t, recs ) {
		let i = 0, len = recs.length;
		while( i < len ) {
			delete this._selected[ recs[ i ].get( this.getValueField() ) ];
			this.removeTag( recs[ i ] );
			i++;
		}
		this.validate();
	},

	reset() {
		this._selected = {};
		this.removeAllTags();
		this.callParent(arguments);
	},

	addTag( tag ) {
		let el = document.createElement( 'span' );
		el.id = `${this.id}-tag-${tag.internalId}`;
		el.innerHTML = `${tag.get( this.getDisplayField() )} <span style="margin-left: 2px; color: var( --base-foreground-color ); cursor: pointer;${ tag.preventDeselection && ' display: none;' }" class="x-fa fa-times-circle" aria-hidden="true">&nbsp;</span>`;
		el.style.padding = '4px';
		el.style.margin = '4px';
		el.style.cursor = 'default';
		el.style.backgroundColor = 'var( --base-color )';
		el.style.color = 'var( --base-foreground-color )';
		el.style.borderRadius = '3px';
		if( tag.tagCls ) {
			el.classList.add( tag.tagCls );
		}
		if( tag.color ) {
			el.style.border = `2px solid ${ tag.color }`;
		} else {
			el.style.boxShadow = '1px 1px 1px var( --base-dark-color )';
		}
		el.setAttribute( 'tagFieldSpan', true );

		el.querySelector( 'span' ).addEventListener( 'click', function() {
			this.getPicker().onItemDeselect( [ tag ] );
			this.getPicker().setItemSelection( [ tag ], false );
		}.bind( this ) );

		this.beforeInputElement.append( el );
		this.beforeInputElement.setStyle({
			marginRight: '10px',
			flexWrap: 'wrap'
		});

		// This let and its nullification seem unnecessary, but it was implied that this would aid with garbage collection
		let storedValues = this.getValue();
		this.fireEvent( 'change', this, storedValues, this._selected );
		storedValues = null;
	},

	removeTag( tag ) {
		let removed = tag.get( this.getValueField() );

		let el = this.beforeInputElement.down( `#${this.id}-tag-${tag.internalId}` );
		if( el ) {
			el.destroy();
		}

		if( !this.expanded ) {
			this.syncLabelPlaceholder( true );
		}

		// This let and its nullification seem unnecessary, but it was implied that this would aid with garbage collection
		let storedValues = this.getValue();
		this.fireEvent( 'change', this, storedValues, this._selected, removed );
		storedValues = null;
		removed = null;
	},

	removeAllTags() {
		let items = this.beforeInputElement.query( 'span[tagFieldSpan=true]' ),
			i = items.length, el;

		while( i-- ) {
			el = this.beforeInputElement.down( `#${items[ i ].id}` );
			if( el ) {
				el.destroy();
			}
		}
	},

	createFloatedPicker() {
		const me = this;
		let result = Ext.merge({
				ownerCmp: me,
				store: me.getStore(),
				itemTpl: me.itemTpl ? me.itemTpl : `{${me.getDisplayField()}}`,
				listeners: {
					select: {
						fn: me.onSelect,
						scope: me
					},
					deselect: {
						fn: me.onDeselect,
						scope: me
					}
				}
			}, me.getFloatedPicker());
		return result;
	},

	getValue() {
		var keys = Object.keys( this._selected ),
			i = 0, len = keys.length, values = [];

		while( i < len ) {
			values.push( this._selected[ keys[ i ] ].get( this.getValueField() ) );
			i++;
		}

		return values;
	},

	setValue( v ) {
		let selection = [];

		if( !( v instanceof Array ) ) {
			v = [ v ];
		}

		let i = 0, len = v.length, store = this.getPicker().getStore(), f, me = this;

		if( !store ) {
			return false;
		}

		if( !store.isLoaded() ) {
			store.addListener( 'load', () => {
				me.setValue( v );
			} );
			return false;
		}

		while( i < len ) {
			f = store.getAt( store.findExact( this.getValueField(), v[ i ] ) );
			if( f ) {
				selection.push( f );
			}
			i++;
		}

		if( selection.length ) {
			this.getPicker().select( selection );
		}

		if( !this.expanded ) {
			this.syncLabelPlaceholder( true );
		}
	},

	privates: {
		syncLabelPlaceholder: function (animate) {
			let inside;
			this._animPlaceholderLabel = animate;
			if( this.rendered ) {
				if( Object.keys( this._selected ).length > 0 ) {
					inside = false;
				} else {
					inside = !this.hasFocus || this.getDisabled() || this.getReadOnly();
				}
				this.setLabelInPlaceholder( inside );
			}

			this._animPlaceholderLabel = false;
		}
	},

	updateInputValue() {}, // Do nothing!

	isInputField: false,
	isSelectField: true,

	validate(skipLazy) {
		let me = this,
		empty, errors, field, record, validity, value;

		if (me.isConfiguring && me.validateOnInit === 'none') {
			return true;
		}

		if (!me.getDisabled() || me.getValidateDisabled()) {
			errors = [];

			if (me.isInputField && !me.isSelectField) {
				value = me.getInputValue();
				empty = !value;
				validity = empty && me.inputElement.dom.validity;
				if (validity && validity.badInput) {
					errors.push(me.badFormatMessage);
					empty = false;
				}
			} else {
				value = me.getValue();
				empty = value === '' || value == null || !value.length;
			}

			if (empty && me.getRequired()) {
				errors.push(me.getRequiredMessage());
			} else if (!errors.length) {
				if (!empty) {
					value = me.parseValue(value, errors);
				}
				if (!errors.length) {
					field = me._validationField;
					record = me._validationRecord;

					if (field && record) {
						field.validate(value, null, errors, record);
					}

					if (!empty) {
						me.doValidate(value, errors, skipLazy);
					}
				}
			}
			if(errors.length) {
				me.setError(errors);
				return false;
			}
		}

		me.setError(null);
		return true;
	},

	doDestroy() {
		this._selected = {};
		this.destroyMembers('picker', 'hideEventListeners', 'touchListeners', 'focusTrap');
		this.callParent();
	}
});

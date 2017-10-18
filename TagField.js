/**
 * TagField
 * For use in ExtJS 6.x Modern
 * @author Brandon Ryall-Ortiz <brandon.ryall@facilitiesexchange.com>, <brandon@guilt.io>
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
		floatedPicker: {
			xtype: 'list',
			selectable: 'multi'
		}
	},

	selected: {},

	listeners: {
		keyup() {
			const me = this;
			let v = this.getInputValue();

			if( v.length ) {
				this.getStore().filterBy( ( rec ) => {
					return rec.get( me.getDisplayField() ).match( new RegExp( me.getInputValue(), 'gi' ) ) !== null;
				} );
			} else {
				this.getStore().clearFilter();
			}
		}
	},

	onSelect( t, recs ) {
		let i = 0, len = recs.length;
		while( i < len ) {
			this.selected[ recs[ i ].get( this.getValueField() ) ] = recs[ i ];
			this.addTag( recs[ i ] );
			i++;
		}
	},

	onDeselect( t, recs ) {
		let i = 0, len = recs.length;
		while( i < len ) {
			delete this.selected[ recs[ i ].get( this.getValueField() ) ];
			this.removeTag( recs[ i ] );
			i++;
		}
	},

	addTag( tag ) {
		let el = document.createElement( 'span' );
		el.id = `${this.id}-tag-${tag.get( this.getValueField() )}`;
		el.innerHTML = `${tag.get( this.getDisplayField() )} <span style="margin-left: 2px; color: var( --base-foreground-color ); cursor: pointer;" class="x-fa fa-times-circle" aria-hidden="true">&nbsp;</span>`;
		el.style.padding = '4px';
		el.style.margin = '4px';
		el.style.cursor = 'default';
		el.style.backgroundColor = 'var( --base-color )';
		el.style.color = 'var( --base-foreground-color )';
		el.style.borderRadius = '3px';
		el.style.boxShadow = '1px 1px 1px var( --base-dark-color )';

		el.querySelector( 'span' ).addEventListener( 'click', function() {
			this.getPicker().onItemDeselect( [ tag ] );
			this.getPicker().setItemSelection( [ tag ], false );
		}.bind( this ) );

		this.beforeInputElement.append( el );
		this.beforeInputElement.setStyle({
			marginRight: '10px'
		});
	},

	removeTag( tag ) {
		let el = this.beforeInputElement.down( `#${this.id}-tag-${tag.get( this.getValueField() )}` );
		if( el ) {
			el.destroy();
		}

		if( !this.expanded ) {
			this.syncLabelPlaceholder( true );
		}
	},

	createFloatedPicker() {
		const me = this;
		let result = Ext.merge({
				ownerCmp: me,
				store: me.getStore(),
				itemTpl: `{${me.getDisplayField()}}`,
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
		var keys = Object.keys( this.selected ),
			i = 0, len = keys.length, values = [];

		while( i < len ) {
			values.push( this.selected[ keys[ i ] ].get( this.getValueField() ) );
			i++;
		}

		return values;
	},

	setValue( v ) {
		let selection = [];

		if( !( v instanceof Array ) ) {
			v = [ v ];
		}

		let i = 0, len = v.length, store = this.getStore(), f;
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
				if( Object.keys( this.selected ).length > 0 ) {
					inside = false;
				} else {
					inside = !this.hasFocus || this.getDisabled() || this.getReadOnly();
				}
				this.setLabelInPlaceholder( inside );
			}

			this._animPlaceholderLabel = false;
		}
	},

	updateInputValue() {} // Do nothing!
});

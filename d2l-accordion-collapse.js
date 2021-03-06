import '@polymer/polymer/polymer-legacy.js';
import 'd2l-colors/d2l-colors.js';
import 'd2l-icons/d2l-icon.js';
import 'd2l-icons/tier1-icons.js';
import '@polymer/iron-collapse/iron-collapse.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import 'd2l-polymer-behaviors/d2l-dom.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="d2l-accordion-collapse">
	<template strip-whitespace="">
		<style is="custom-style">
		:host {
				display: block;
			}
			#trigger {
				@apply --layout-horizontal;
				@apply --layout-center;
				text-decoration: none;
			}
			#trigger, #trigger:visited, #trigger:hover, #trigger:active {
				color: inherit;
			}
			.collapse-title[flex] {
				@apply --layout-flex;
			}
		</style>

		<a href="javascript:void(0)" id="trigger" on-click="toggle" aria-controls="collapse" role="button">
			<div class="collapse-title" flex$=[[flex]]>[[title]]<slot name="header"></slot>
			</div>
			<template is="dom-if" if="[[!noIcons]]">
				<d2l-icon icon="[[_toggle(opened, collapseIcon, expandIcon)]]"></d2l-icon>
			</template>
		</a>
		<iron-collapse id="collapse" no-animation="[[noAnimation]]" opened="[[opened]]">
			<slot></slot>
		</iron-collapse>
	</template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);
/**
 * `d2l-accordion-collapse`
 * An iron-collapse with a trigger section and optional expand/collapse icons.
 * Originally taken from: https://www.webcomponents.org/element/jifalops/iron-collapse-button
 *
 * @demo demo/d2l-accordion-collapse.html
 */
Polymer({
	is: 'd2l-accordion-collapse',
	properties: {
		/**
		 * Label title
		 */
		title: {
			type: String,
			value: ''
		},
		/**
		 * Corresponds to the iron-collapse's noAnimation property.
		 */
		noAnimation: {
			type: Boolean,
			value: false
		},
		/**
		 * Whether currently expanded.
		 */
		opened: {
			type: Boolean,
			value: false,
			notify: true,
			observer: '_notifyStateChanged',
			reflectToAttribute: true
		},
		/**
		 * The icon when collapsed.
		 */
		expandIcon: {
			type: String,
			value: 'd2l-tier1:arrow-expand'
		},
		/**
		 * The icon when expanded.
		 */
		collapseIcon: {
			type: String,
			value: 'd2l-tier1:arrow-collapse'
		},
		/**
		 * Whether to hide the expand/collapse icon.
		 */
		noIcons: {
			type: Boolean,
			value: false
		},
		/**
		 * Whether to use or not flex layout.
		 */
		flex: {
			type: Boolean,
			value: false
		},
		/**
		 * Whether the accordion's expand/collapse function is disabled.
		 */
		disabled: {
			type: Boolean,
			value: false
		},
		/**
		 * Listener for state changes.
		 */
		_boundListener: {
			type: Function
		}
	},
	ready: function() {
		this._boundListener = this._onStateChanged.bind(this);
		this.$.trigger.setAttribute('aria-expanded', this.opened);
	},

	attached: function() {
		if (this.disabled) {
			return;
		}
		window.addEventListener('d2l-accordion-collapse-state-changed', this._boundListener);
		this.$.collapse.addEventListener('iron-resize', this._fireAccordionResizeEvent);
	},

	detached: function() {
		if (this.disabled) {
			return;
		}
		window.removeEventListener('d2l-accordion-collapse-state-changed', this._boundListener);
		this.$.collapse.removeEventListener('iron-resize', this._fireAccordionResizeEvent);
	},
	open: function() {
		if (this.disabled) {
			return;
		}
		this.opened = true;
		this._notifyStateChanged();
	},
	close: function() {
		if (this.disabled) {
			return;
		}
		this.opened = false;
		this._notifyStateChanged();
	},
	toggle: function() {
		this.fire('d2l-accordion-collapse-clicked');
		if (this.disabled) {
			return;
		}
		if (this.opened) {
			this.close();
		} else {
			this.open();
		}
	},
	_toggle: function(cond, t, f) { return cond ? t : f; },
	_onStateChanged: function(event) {
		if (this.opened
			&& event.detail.el !== this
			&& this._haveSharedAutoCloseAccordionAncestor(this, event.detail.el)
		) {
			/* close an opened child */
			if (!event.detail.opened
				&& D2L.Dom.isComposedAncestor(event.detail.el, this)
			) {
				this.opened = false;
			}
			/* close an opened sibling */
			if (event.detail.opened
				&& !D2L.Dom.isComposedAncestor(event.detail.el, this)
				&& !D2L.Dom.isComposedAncestor(this, event.detail.el)
			) {
				this.opened = false;
			}
		}
	},
	_notifyStateChanged: function() {
		this.fire('d2l-accordion-collapse-state-changed', { opened: this.opened, el: this });
		this.$.trigger.setAttribute('aria-expanded', this.opened);
	},
	_haveSharedAutoCloseAccordionAncestor: function(node1, node2) {
		var accordionAncestor = D2L.Dom.findComposedAncestor(node1, function(elem) {
			if (elem.isAccordion && elem.autoClose) {
				return true;
			}
		});
		if (!accordionAncestor) {
			return false;
		}
		if (!D2L.Dom.isComposedAncestor(accordionAncestor, node2)) {
			return false;
		}
		return true;
	},
	_fireAccordionResizeEvent: function() {
		var event = new CustomEvent('d2l-accordion-collapse-resize', {
			bubbles: true
		});
		window.dispatchEvent(event);
	}
});

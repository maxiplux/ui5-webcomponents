import UI5Element from "@ui5/webcomponents-base/dist/UI5Element.js";
import ItemNavigation from "@ui5/webcomponents-base/dist/delegate/ItemNavigation.js";
import litRender from "@ui5/webcomponents-base/dist/renderer/LitRenderer.js";
import ResizeHandler from "@ui5/webcomponents-base/dist/delegate/ResizeHandler.js";

// Template
import SegmentedButtonTemplate from "./generated/templates/SegmentedButtonTemplate.lit.js";

// Styles
import SegmentedButtonCss from "./generated/themes/SegmentedButton.css.js";

/**
 * @public
 */
const metadata = {
	tag: "ui5-segmentedbutton",
	properties: /** @lends sap.ui.webcomponents.main.SegmentedButton.prototype */  {},
	slots: /** @lends sap.ui.webcomponents.main.SegmentedButton.prototype */ {

		/**
		 * Defines the buttons of <code>ui5-segmentedbutton</code>.
		 * <br><br>
		 * <b>Note:</b> Multiple buttons are allowed.
		 * <br><br>
		 * <b>Note:</b> Use the <code>ui5-togglebutton</code> for the intended design.
		 * @type {HTMLElement[]}
		 * @slot
		 * @public
		 */
		"default": {
			propertyName: "buttons",
			type: HTMLElement,
		},
	},
	events: /** @lends sap.ui.webcomponents.main.SegmentedButton.prototype */ {

		/**
		 * Fired when the selected button changes.
		 *
		 * @event
		 * @param {HTMLElement} selectedButton the pressed button.
		 * @public
		 */
		selectionChange: {
			detail: {
				selectedButton: { type: HTMLElement },
			},
		},
	},
};

/**
 * @class
 *
 * <h3 class="comment-api-title">Overview</h3>
 *
 * The <code>SegmentedButton</code> shows a group of buttons. When the user clicks or taps
 * one of the buttons, it stays in a pressed state. It automatically resizes the buttons
 * to fit proportionally within the component. When no width is set, the component uses the available width.
 * <br><br>
 * <b>Note:</b> There can be just one selected <code>button</code> at a time.
 *
 * <h3>ES6 Module Import</h3>
 *
 * <code>import "@ui5/webcomponents/dist/SegmentedButton";</code>
 *
 * @constructor
 * @author SAP SE
 * @alias sap.ui.webcomponents.main.SegmentedButton
 * @extends sap.ui.webcomponents.base.UI5Element
 * @tagname ui5-segmentedbutton
 * @since 1.0.0-rc.6
 * @public
 */
class SegmentedButton extends UI5Element {
	static get metadata() {
		return metadata;
	}

	static get render() {
		return litRender;
	}

	static get template() {
		return SegmentedButtonTemplate;
	}

	static get styles() {
		return SegmentedButtonCss;
	}

	constructor() {
		super();
		this.initItemNavigation();

		this.absoluteWidthSet = false; // set to true whenever we set absolute width to the component
		this.percentageWidthSet = false; //  set to true whenever we set 100% width to the component
		this.hasPreviouslyFocusedItem = false;

		this._handleResizeBound = this._handleResize.bind(this);
	}

	onEnterDOM() {
		ResizeHandler.register(this.parentNode, this._handleResizeBound);
	}

	onExitDOM() {
		ResizeHandler.deregister(this.parentNode, this._handleResizeBound);
	}

	onBeforeRendering() {
		this.normalizeSelection();
	}

	async onAfterRendering() {
		await Promise.all(this.buttons.map(button => button._waitForDomRef));
		this.widths = this.buttons.map(button => button.offsetWidth);
	}

	initItemNavigation() {
		this._itemNavigation = new ItemNavigation(this);

		this._itemNavigation.getItemsCallback = () => this.getSlottedNodes("buttons");
	}

	normalizeSelection() {
		this._selectedButton = this.buttons.filter(button => button.pressed).pop();

		if (this._selectedButton) {
			this.buttons.forEach(button => {
				button.pressed = false;
			});
			this._selectedButton.pressed = true;
		}
	}

	_onclick(event) {
		if (event.target !== this._selectedButton) {
			if (this._selectedButton) {
				this._selectedButton.pressed = false;
			}
			this._selectedButton = event.target;
			this.fireEvent("selectionChange", {
				selectedButton: this._selectedButton,
			});
		}

		this._selectedButton.pressed = true;
		this._itemNavigation.update(this._selectedButton);

		return this;
	}

	_onfocusin(event) {
		// If the component was previously focused,
		// update the ItemNavigation to sync butons` tabindex values
		if (this.hasPreviouslyFocusedItem) {
			this._itemNavigation.update(event.target);
			return;
		}

		// If the component is focused for the first time
		// focus the selected item if such present
		if (this.selectedButton) {
			this.selectedButton.focus();
			this._itemNavigation.update(this._selectedButton);
			this.hasPreviouslyFocusedItem = true;
		}
	}

	_handleResize() {
		const parentWidth = this.parentNode.offsetWidth;

		if (!this.style.width || this.percentageWidthSet) {
			this.style.width = `${Math.max(...this.widths) * this.buttons.length}px`;
			this.absoluteWidthSet = true;
		}

		this.buttons.forEach(button => {
			button.style.width = "100%";
		});

		if (parentWidth <= this.offsetWidth && this.absoluteWidthSet) {
			this.style.width = "100%";
			this.percentageWidthSet = true;
		}
	}

	/**
	 * Currently selected button.
	 *
	 * @readonly
	 * @type { ui5-togglebutton }
	 * @public
	 */
	get selectedButton() {
		return this._selectedButton;
	}
}

SegmentedButton.define();

export default SegmentedButton;

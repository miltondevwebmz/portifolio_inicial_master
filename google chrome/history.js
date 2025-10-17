// Copyright 2012 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import {
  a as assert,
  b as assertNotReached,
  g as getCss$A,
  c as getCss$B,
  E as EventTracker,
  C as CrRippleMixin,
  d as getFaviconForPageURL,
  e as getDeepActiveElement,
  F as FocusOutlineManager,
  f as getTrustedHTML,
  h as getInstance,
  i as FocusRow,
  V as VirtualFocusRow,
  j as focusWithoutInk,
  k as getCss$C,
  B as BrowserServiceImpl,
  l as VisitContextMenuAction,
  m as BROWSING_GAP_TIME,
  R as RESULTS_PER_PAGE,
  n as debounceEnd,
  o as isWindows,
  p as isMac,
  q as getCss$D,
  r as getTrustedScriptURL,
  H as HistoryPageViewHistogram,
  s as hasKeyModifiers,
  t as HistorySignInState,
} from "./shared.rollup.js";
export {
  u as CrActionMenuElement,
  v as CrButtonElement,
  w as CrCheckboxElement,
  x as CrDialogElement,
  z as HistorySearchedLabelElement,
  A as HistorySyncedDeviceCardElement,
  D as HistorySyncedDeviceManagerElement,
  S as SYNCED_TABS_HISTOGRAM_NAME,
  y as SyncedTabsHistogram,
} from "./shared.rollup.js";
import { loadTimeData } from "chrome://resources/js/load_time_data.js";
import {
  css,
  html,
  CrLitElement,
  nothing,
  render,
} from "chrome://resources/lit/v3_0/lit.rollup.js";
import { mojo } from "chrome://resources/mojo/mojo/public/js/bindings.js";
import {
  PolymerElement,
  html as html$1,
  templatize,
} from "chrome://resources/polymer/v3_0/polymer/polymer_bundled.min.js";
import "../../../../../../../../../../../../../../../strings.m.js";
import {
  addWebUiListener,
  removeWebUiListener,
} from "chrome://resources/js/cr.js";
function sanitizeInnerHtmlInternal(rawString, opts) {
  opts = opts || {};
  const html = parseHtmlSubset(
    `<b>${rawString}</b>`,
    opts.tags,
    opts.attrs
  ).firstElementChild;
  return html.innerHTML;
}
let sanitizedPolicy = null;
function sanitizeInnerHtml(rawString, opts) {
  assert(window.trustedTypes);
  if (sanitizedPolicy === null) {
    sanitizedPolicy = window.trustedTypes.createPolicy("sanitize-inner-html", {
      createHTML: sanitizeInnerHtmlInternal,
      createScript: () => assertNotReached(),
      createScriptURL: () => assertNotReached(),
    });
  }
  return sanitizedPolicy.createHTML(rawString, opts);
}
const allowAttribute = (_node, _value) => true;
const allowedAttributes = new Map([
  [
    "href",
    (node, value) =>
      node.tagName === "A" &&
      (value.startsWith("chrome://") ||
        value.startsWith("https://") ||
        value === "#"),
  ],
  ["target", (node, value) => node.tagName === "A" && value === "_blank"],
]);
const allowedOptionalAttributes = new Map([
  ["class", allowAttribute],
  ["id", allowAttribute],
  ["is", (_node, value) => value === "action-link" || value === ""],
  ["role", (_node, value) => value === "link"],
  [
    "src",
    (node, value) => node.tagName === "IMG" && value.startsWith("chrome://"),
  ],
  ["tabindex", allowAttribute],
  ["aria-description", allowAttribute],
  ["aria-hidden", allowAttribute],
  ["aria-label", allowAttribute],
  ["aria-labelledby", allowAttribute],
]);
const allowedTags = new Set([
  "A",
  "B",
  "I",
  "BR",
  "DIV",
  "EM",
  "KBD",
  "P",
  "PRE",
  "SPAN",
  "STRONG",
]);
const allowedOptionalTags = new Set(["IMG", "LI", "UL"]);
let unsanitizedPolicy;
function mergeTags(optTags) {
  const clone = new Set(allowedTags);
  optTags.forEach((str) => {
    const tag = str.toUpperCase();
    if (allowedOptionalTags.has(tag)) {
      clone.add(tag);
    }
  });
  return clone;
}
function mergeAttrs(optAttrs) {
  const clone = new Map(allowedAttributes);
  optAttrs.forEach((key) => {
    if (allowedOptionalAttributes.has(key)) {
      clone.set(key, allowedOptionalAttributes.get(key));
    }
  });
  return clone;
}
function walk(n, f) {
  f(n);
  for (let i = 0; i < n.childNodes.length; i++) {
    walk(n.childNodes[i], f);
  }
}
function assertElement(tags, node) {
  if (!tags.has(node.tagName)) {
    throw Error(node.tagName + " is not supported");
  }
}
function assertAttribute(attrs, attrNode, node) {
  const n = attrNode.nodeName;
  const v = attrNode.nodeValue || "";
  if (!attrs.has(n) || !attrs.get(n)(node, v)) {
    throw Error(node.tagName + "[" + n + '="' + v + '"] is not supported');
  }
}
function parseHtmlSubset(s, extraTags, extraAttrs) {
  const tags = extraTags ? mergeTags(extraTags) : allowedTags;
  const attrs = extraAttrs ? mergeAttrs(extraAttrs) : allowedAttributes;
  const doc = document.implementation.createHTMLDocument("");
  const r = doc.createRange();
  r.selectNode(doc.body);
  if (window.trustedTypes) {
    if (!unsanitizedPolicy) {
      unsanitizedPolicy = window.trustedTypes.createPolicy(
        "parse-html-subset",
        {
          createHTML: (untrustedHTML) => untrustedHTML,
          createScript: () => assertNotReached(),
          createScriptURL: () => assertNotReached(),
        }
      );
    }
    s = unsanitizedPolicy.createHTML(s);
  }
  const df = r.createContextualFragment(s);
  walk(df, function (node) {
    switch (node.nodeType) {
      case Node.ELEMENT_NODE:
        assertElement(tags, node);
        const nodeAttrs = node.attributes;
        for (let i = 0; i < nodeAttrs.length; ++i) {
          assertAttribute(attrs, nodeAttrs[i], node);
        }
        break;
      case Node.COMMENT_NODE:
      case Node.DOCUMENT_FRAGMENT_NODE:
      case Node.TEXT_NODE:
        break;
      default:
        throw Error("Node type " + node.nodeType + " is not supported");
    }
  });
  return df;
}
const I18nMixinLit = (superClass) => {
  class I18nMixinLit extends superClass {
    i18nRaw_(id, ...varArgs) {
      return varArgs.length === 0
        ? loadTimeData.getString(id)
        : loadTimeData.getStringF(id, ...varArgs);
    }
    i18n(id, ...varArgs) {
      const rawString = this.i18nRaw_(id, ...varArgs);
      return parseHtmlSubset(`<b>${rawString}</b>`).firstChild.textContent;
    }
    i18nAdvanced(id, opts) {
      opts = opts || {};
      const rawString = this.i18nRaw_(id, ...(opts.substitutions || []));
      return sanitizeInnerHtml(rawString, opts);
    }
    i18nDynamic(_locale, id, ...varArgs) {
      return this.i18n(id, ...varArgs);
    }
    i18nRecursive(locale, id, ...varArgs) {
      let args = varArgs;
      if (args.length > 0) {
        args = args.map((str) =>
          this.i18nExists(str) ? loadTimeData.getString(str) : str
        );
      }
      return this.i18nDynamic(locale, id, ...args);
    }
    i18nExists(id) {
      return loadTimeData.valueExists(id);
    }
  }
  return I18nMixinLit;
};
let instance$E = null;
function getCss$z() {
  return (
    instance$E ||
    (instance$E = [
      ...[getCss$A(), getCss$B()],
      css`
        [actionable] {
          cursor: pointer;
        }
        .hr {
          border-top: var(--cr-separator-line);
        }
        iron-list.cr-separators > *:not([first]) {
          border-top: var(--cr-separator-line);
        }
        [scrollable] {
          border-color: transparent;
          border-style: solid;
          border-width: 1px 0;
          overflow-y: auto;
        }
        [scrollable].is-scrolled {
          border-top-color: var(--cr-scrollable-border-color);
        }
        [scrollable].can-scroll:not(.scrolled-to-bottom) {
          border-bottom-color: var(--cr-scrollable-border-color);
        }
        [scrollable] iron-list > :not(.no-outline):focus-visible,
        [selectable]:focus-visible,
        [selectable] > :focus-visible {
          outline: solid 2px var(--cr-focus-outline-color);
          outline-offset: -2px;
        }
        .scroll-container {
          display: flex;
          flex-direction: column;
          min-height: 1px;
        }
        [selectable] > * {
          cursor: pointer;
        }
        .cr-centered-card-container {
          box-sizing: border-box;
          display: block;
          height: inherit;
          margin: 0 auto;
          max-width: var(--cr-centered-card-max-width);
          min-width: 550px;
          position: relative;
          width: calc(100% * var(--cr-centered-card-width-percentage));
        }
        .cr-container-shadow {
          box-shadow: inset 0 5px 6px -3px rgba(0, 0, 0, 0.4);
          height: var(--cr-container-shadow-height);
          left: 0;
          margin: 0 0 var(--cr-container-shadow-margin);
          opacity: 0;
          pointer-events: none;
          position: relative;
          right: 0;
          top: 0;
          transition: opacity 500ms;
          z-index: 1;
        }
        #cr-container-shadow-bottom {
          margin-bottom: 0;
          margin-top: var(--cr-container-shadow-margin);
          transform: scaleY(-1);
        }
        #cr-container-shadow-top:has(
            + #container.can-scroll:not(.scrolled-to-top)
          ),
        #container.can-scroll:not(.scrolled-to-bottom)
          + #cr-container-shadow-bottom,
        #cr-container-shadow-bottom.force-shadow,
        #cr-container-shadow-top.force-shadow {
          opacity: var(--cr-container-shadow-max-opacity);
        }
        .cr-row {
          align-items: center;
          border-top: var(--cr-separator-line);
          display: flex;
          min-height: var(--cr-section-min-height);
          padding: 0 var(--cr-section-padding);
        }
        .cr-row.first,
        .cr-row.continuation {
          border-top: none;
        }
        .cr-row-gap {
          padding-inline-start: 16px;
        }
        .cr-button-gap {
          margin-inline-start: 8px;
        }
        paper-tooltip::part(tooltip),
        cr-tooltip::part(tooltip) {
          border-radius: var(--paper-tooltip-border-radius, 2px);
          font-size: 92.31%;
          font-weight: 500;
          max-width: 330px;
          min-width: var(--paper-tooltip-min-width, 200px);
          padding: var(--paper-tooltip-padding, 10px 8px);
        }
        .cr-padded-text {
          padding-block-end: var(--cr-section-vertical-padding);
          padding-block-start: var(--cr-section-vertical-padding);
        }
        .cr-title-text {
          color: var(--cr-title-text-color);
          font-size: 107.6923%;
          font-weight: 500;
        }
        .cr-secondary-text {
          color: var(--cr-secondary-text-color);
          font-weight: 400;
        }
        .cr-form-field-label {
          color: var(--cr-form-field-label-color);
          display: block;
          font-size: var(--cr-form-field-label-font-size);
          font-weight: 500;
          letter-spacing: 0.4px;
          line-height: var(--cr-form-field-label-line-height);
          margin-bottom: 8px;
        }
        .cr-vertical-tab {
          align-items: center;
          display: flex;
        }
        .cr-vertical-tab::before {
          border-radius: 0 3px 3px 0;
          content: "";
          display: block;
          flex-shrink: 0;
          height: var(--cr-vertical-tab-height, 100%);
          width: 4px;
        }
        .cr-vertical-tab.selected::before {
          background: var(
            --cr-vertical-tab-selected-color,
            var(--cr-checked-color)
          );
        }
        :host-context([dir="rtl"]) .cr-vertical-tab::before {
          transform: scaleX(-1);
        }
        .iph-anchor-highlight {
          background-color: var(--cr-iph-anchor-highlight-color);
        }
      `,
    ])
  );
}
const sheet = new CSSStyleSheet();
sheet.replaceSync(
  `html{--annotation-background-color:var(--google-green-50);--annotation-text-color:var(--google-green-600);--border-color:var(--google-grey-300);--entity-image-background-color:var(--google-grey-50);--icon-color:var(--google-grey-600);--url-color:var(--google-blue-600)}@media (prefers-color-scheme:dark){html{--annotation-background-color:var(--google-green-300);--annotation-text-color:var(--google-grey-900);--border-color:var(--google-grey-700);--entity-image-background-color:var(--google-grey-800);--icon-color:white;--url-color:var(--google-blue-300)}}html{--card-max-width:960px;--card-min-width:550px;--card-padding-between:16px;--card-padding-side:24px;--first-card-padding-top:24px;--cluster-max-width:var(--card-max-width);--cluster-min-width:var(--card-min-width);--cluster-padding-horizontal:var(--card-padding-side);--cluster-padding-vertical:var(--card-padding-between);--favicon-margin:16px;--favicon-size:16px;--first-cluster-padding-top:var(--first-card-padding-top);--pill-height:34px;--pill-padding-icon:12px;--pill-padding-text:16px;--top-visit-favicon-size:24px}`
);
document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
let instance$D = null;
function getCss$y() {
  return (
    instance$D ||
    (instance$D = [
      ...[getCss$z(), getCss$A()],
      css`
        .truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .pill {
          border: 1px solid var(--border-color);
          border-radius: calc(var(--pill-height) / 2);
          box-sizing: border-box;
          font-size: 0.75rem;
          height: var(--pill-height);
          line-height: 1.5;
        }
        .pill-icon-start {
          padding-inline-end: var(--pill-padding-text);
          padding-inline-start: var(--pill-padding-icon);
        }
        .pill-icon-start .icon {
          margin-inline-end: 4px;
        }
        .pill-icon-end {
          padding-inline-end: var(--pill-padding-icon);
          padding-inline-start: var(--pill-padding-text);
        }
        .pill-icon-end .icon {
          margin-inline-start: 8px;
        }
        .search-highlight-hit {
          --search-highlight-hit-background-color: none;
          --search-highlight-hit-color: none;
          font-weight: 700;
        }
        .timestamp-and-menu {
          align-items: center;
          display: flex;
          flex-shrink: 0;
        }
        .timestamp {
          color: var(--cr-secondary-text-color);
          flex-shrink: 0;
        }
      `,
    ])
  );
}
let instance$C = null;
function getCss$x() {
  return (
    instance$C ||
    (instance$C = [
      ...[getCss$y()],
      css`
        #actionMenuButton {
          --cr-icon-button-icon-size: 20px;
          --cr-icon-button-margin-end: 16px;
        }
        :host([in-side-panel_]) #actionMenuButton {
          --cr-icon-button-icon-size: 16px;
          --cr-icon-button-size: 24px;
          --cr-icon-button-margin-end: 8px;
        }
      `,
    ])
  );
}
function getHtml$t() {
  return html` <cr-icon-button
      id="actionMenuButton"
      class="icon-more-vert"
      title="${this.i18n("actionMenuDescription")}"
      aria-haspopup="menu"
      @click="${this.onActionMenuButtonClick_}"
    >
    </cr-icon-button>

    ${this.renderActionMenu_
      ? html`<cr-action-menu
          role-description="${this.i18n("actionMenuDescription")}"
        >
          <button
            id="openAllButton"
            class="dropdown-item"
            @click="${this.onOpenAllButtonClick_}"
          >
            ${this.i18n("openAllInTabGroup")}
          </button>
          <button
            id="hideAllButton"
            class="dropdown-item"
            @click="${this.onHideAllButtonClick_}"
          >
            ${this.i18n("hideAllVisits")}
          </button>
          <button
            id="removeAllButton"
            class="dropdown-item"
            @click="${this.onRemoveAllButtonClick_}"
            ?hidden="${!this.allowDeletingHistory_}"
          >
            ${this.i18n("removeAllFromHistory")}
          </button>
        </cr-action-menu>`
      : ""}`;
}
const ClusterMenuElementBase$1 = I18nMixinLit(CrLitElement);
class ClusterMenuElement extends ClusterMenuElementBase$1 {
  static get is() {
    return "cluster-menu";
  }
  static get styles() {
    return getCss$x();
  }
  render() {
    return getHtml$t.bind(this)();
  }
  static get properties() {
    return {
      allowDeletingHistory_: { type: Boolean },
      inSidePanel_: { type: Boolean, reflect: true },
      renderActionMenu_: { type: Boolean },
    };
  }
  #allowDeletingHistory__accessor_storage = loadTimeData.getBoolean(
    "allowDeletingHistory"
  );
  get allowDeletingHistory_() {
    return this.#allowDeletingHistory__accessor_storage;
  }
  set allowDeletingHistory_(value) {
    this.#allowDeletingHistory__accessor_storage = value;
  }
  #inSidePanel__accessor_storage = loadTimeData.getBoolean("inSidePanel");
  get inSidePanel_() {
    return this.#inSidePanel__accessor_storage;
  }
  set inSidePanel_(value) {
    this.#inSidePanel__accessor_storage = value;
  }
  #renderActionMenu__accessor_storage = false;
  get renderActionMenu_() {
    return this.#renderActionMenu__accessor_storage;
  }
  set renderActionMenu_(value) {
    this.#renderActionMenu__accessor_storage = value;
  }
  async onActionMenuButtonClick_(event) {
    event.preventDefault();
    if (!this.renderActionMenu_) {
      this.renderActionMenu_ = true;
      await this.updateComplete;
    }
    const menu = this.shadowRoot.querySelector("cr-action-menu");
    assert(menu);
    menu.showAt(this.$.actionMenuButton);
  }
  onOpenAllButtonClick_(event) {
    event.preventDefault();
    this.fire("open-all-visits");
    this.closeActionMenu_();
  }
  onHideAllButtonClick_(event) {
    event.preventDefault();
    this.fire("hide-all-visits");
    this.closeActionMenu_();
  }
  onRemoveAllButtonClick_(event) {
    event.preventDefault();
    this.fire("remove-all-visits");
    this.closeActionMenu_();
  }
  closeActionMenu_() {
    const menu = this.shadowRoot.querySelector("cr-action-menu");
    assert(menu);
    menu.close();
  }
}
customElements.define(ClusterMenuElement.is, ClusterMenuElement);
let instance$B = null;
function getCss$w() {
  return (
    instance$B ||
    (instance$B = [
      ...[getCss$y()],
      css`
        :host {
          --cr-icon-button-margin-start: 0px;
          --gradient-start: 64px;
          --horizontal-carousel-button-center: calc(
            var(--horizontal-carousel-button-size) / 2 +
              var(--horizontal-carousel-button-margin)
          );
          --horizontal-carousel-button-margin: 14px;
          --horizontal-carousel-button-size: 28px;
          display: flex;
          isolation: isolate;
          position: relative;
        }
        .carousel-button,
        .hover-layer {
          border-radius: 50%;
          display: none;
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
        }
        .carousel-button {
          --cr-icon-button-size: var(--horizontal-carousel-button-size);
          background-color: var(--color-button-background-tonal);
          margin: 0;
          z-index: 1;
        }
        :host(:hover) .carousel-button {
          display: block;
        }
        .hover-layer {
          background: var(--cr-hover-background-color);
          height: var(--horizontal-carousel-button-size);
          width: var(--horizontal-carousel-button-size);
          pointer-events: none;
          z-index: 2;
        }
        #backButton,
        #backHoverLayer {
          left: var(--horizontal-carousel-button-margin);
        }
        #forwardButton,
        #forwardHoverLayer {
          right: var(--horizontal-carousel-button-margin);
        }
        #backButton:hover ~ #backHoverLayer,
        #forwardButton:hover ~ #forwardHoverLayer {
          display: block;
        }
        :host([show-back-button_]:hover) #carouselContainer {
          -webkit-mask-image: linear-gradient(
            to right,
            transparent var(--horizontal-carousel-button-center),
            black var(--gradient-start)
          );
        }
        :host([show-forward-button_]:hover) #carouselContainer {
          -webkit-mask-image: linear-gradient(
            to right,
            black calc(100% - var(--gradient-start)),
            transparent calc(100% - var(--horizontal-carousel-button-center))
          );
        }
        :host([show-back-button_][show-forward-button_]:hover)
          #carouselContainer {
          -webkit-mask-image: linear-gradient(
            to right,
            transparent var(--horizontal-carousel-button-center),
            black var(--gradient-start),
            black calc(100% - var(--gradient-start)),
            transparent calc(100% - var(--horizontal-carousel-button-center))
          );
        }
        #carouselContainer {
          display: flex;
          flex-wrap: nowrap;
          min-width: 0;
          padding: 2px;
          overflow-x: hidden;
        }
      `,
    ])
  );
}
function getHtml$s() {
  return html` <cr-icon-button
      id="backButton"
      class="carousel-button"
      @click="${this.onCarouselBackClick_}"
      iron-icon="cr:chevron-left"
      ?hidden="${!this.showBackButton_}"
      tabindex="-1"
    >
    </cr-icon-button>
    <div id="backHoverLayer" class="hover-layer"></div>

    <cr-icon-button
      id="forwardButton"
      class="carousel-button"
      @click="${this.onCarouselForwardClick_}"
      iron-icon="cr:chevron-right"
      ?hidden="${!this.showForwardButton_}"
      tabindex="-1"
    >
    </cr-icon-button>
    <div id="forwardHoverLayer" class="hover-layer"></div>

    <div id="carouselContainer">
      <slot></slot>
    </div>`;
}
class HorizontalCarouselElement extends CrLitElement {
  static get is() {
    return "horizontal-carousel";
  }
  static get styles() {
    return getCss$w();
  }
  render() {
    return getHtml$s.bind(this)();
  }
  static get properties() {
    return {
      showForwardButton_: { type: Boolean, reflect: true },
      showBackButton_: { type: Boolean, reflect: true },
    };
  }
  resizeObserver_ = null;
  eventTracker_ = new EventTracker();
  #showBackButton__accessor_storage = false;
  get showBackButton_() {
    return this.#showBackButton__accessor_storage;
  }
  set showBackButton_(value) {
    this.#showBackButton__accessor_storage = value;
  }
  #showForwardButton__accessor_storage = false;
  get showForwardButton_() {
    return this.#showForwardButton__accessor_storage;
  }
  set showForwardButton_(value) {
    this.#showForwardButton__accessor_storage = value;
  }
  connectedCallback() {
    super.connectedCallback();
    this.resizeObserver_ = new ResizeObserver(() => {
      this.setShowCarouselButtons_();
    });
    this.resizeObserver_.observe(this.$.carouselContainer);
    this.eventTracker_.add(this, "keyup", this.onTabFocus_.bind(this));
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.resizeObserver_) {
      this.resizeObserver_.unobserve(this.$.carouselContainer);
      this.resizeObserver_ = null;
    }
  }
  onCarouselBackClick_() {
    const targetPosition = this.calculateTargetPosition_(-1);
    this.$.carouselContainer.scrollTo({
      left: targetPosition,
      behavior: "smooth",
    });
    this.showBackButton_ = targetPosition > 0;
    this.showForwardButton_ = true;
  }
  onCarouselForwardClick_() {
    const targetPosition = this.calculateTargetPosition_(1);
    this.$.carouselContainer.scrollTo({
      left: targetPosition,
      behavior: "smooth",
    });
    this.showForwardButton_ =
      targetPosition + this.$.carouselContainer.clientWidth <
      this.$.carouselContainer.scrollWidth;
    this.showBackButton_ = true;
  }
  onTabFocus_(event) {
    const element = event.target;
    if (event.code === "Tab") {
      this.$.carouselContainer.scrollTo({
        left: element.offsetLeft - 2,
        behavior: "smooth",
      });
    }
  }
  setShowCarouselButtons_() {
    if (
      Math.round(this.$.carouselContainer.scrollLeft) +
        this.$.carouselContainer.clientWidth <
      this.$.carouselContainer.scrollWidth
    ) {
      this.showForwardButton_ = true;
    } else {
      this.showBackButton_ = this.$.carouselContainer.scrollLeft > 0;
      this.showForwardButton_ = false;
    }
  }
  calculateTargetPosition_(direction) {
    const offset = (this.$.carouselContainer.clientWidth / 2) * direction;
    const targetPosition = Math.floor(
      this.$.carouselContainer.scrollLeft + offset
    );
    return Math.max(
      0,
      Math.min(
        targetPosition,
        this.$.carouselContainer.scrollWidth -
          this.$.carouselContainer.clientWidth
      )
    );
  }
}
customElements.define(HorizontalCarouselElement.is, HorizontalCarouselElement);
class JSTimeDataView {
  decoder_;
  version_;
  fieldSpecs_;
  constructor(decoder, version, fieldSpecs) {
    this.decoder_ = decoder;
    this.version_ = version;
    this.fieldSpecs_ = fieldSpecs;
  }
  get msec() {
    const field = this.fieldSpecs_[0];
    return mojo.internal.decodeStructField(this.decoder_, field, this.version_);
  }
}
class JsTimeConverter {
  msec(date) {
    return date.valueOf();
  }
  convert(view) {
    return new Date(view.msec);
  }
}
const TimeSpec = { $: {} };
const JSTimeSpec = { $: {} };
const TimeDeltaSpec = { $: {} };
const TimeTicksSpec = { $: {} };
mojo.internal.Struct(
  TimeSpec.$,
  "Time",
  [
    mojo.internal.StructField(
      "internalValue",
      0,
      0,
      mojo.internal.Int64,
      BigInt(0),
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 16]]
);
const converterForJSTime = new JsTimeConverter();
mojo.internal.TypemappedStruct(
  JSTimeSpec.$,
  "JSTime",
  JSTimeDataView,
  converterForJSTime,
  [
    mojo.internal.StructField(
      "msec",
      0,
      0,
      mojo.internal.Double,
      0,
      false,
      0,
      undefined,
      (value) => converterForJSTime.msec(value)
    ),
  ],
  [[0, 16]]
);
mojo.internal.Struct(
  TimeDeltaSpec.$,
  "TimeDelta",
  [
    mojo.internal.StructField(
      "microseconds",
      0,
      0,
      mojo.internal.Int64,
      BigInt(0),
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 16]]
);
mojo.internal.Struct(
  TimeTicksSpec.$,
  "TimeTicks",
  [
    mojo.internal.StructField(
      "internalValue",
      0,
      0,
      mojo.internal.Int64,
      BigInt(0),
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 16]]
);
const UrlSpec = { $: {} };
mojo.internal.Struct(
  UrlSpec.$,
  "Url",
  [
    mojo.internal.StructField(
      "url",
      0,
      0,
      mojo.internal.String,
      null,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 16]]
);
const AnnotationSpec = { $: mojo.internal.Enum() };
var Annotation;
(function (Annotation) {
  Annotation[(Annotation["MIN_VALUE"] = 0)] = "MIN_VALUE";
  Annotation[(Annotation["MAX_VALUE"] = 1)] = "MAX_VALUE";
  Annotation[(Annotation["kBookmarked"] = 0)] = "kBookmarked";
  Annotation[(Annotation["kSearchResultsPage"] = 1)] = "kSearchResultsPage";
})(Annotation || (Annotation = {}));
({ $: mojo.internal.Enum() });
var InteractionState;
(function (InteractionState) {
  InteractionState[(InteractionState["MIN_VALUE"] = 0)] = "MIN_VALUE";
  InteractionState[(InteractionState["MAX_VALUE"] = 2)] = "MAX_VALUE";
  InteractionState[(InteractionState["kDefault"] = 0)] = "kDefault";
  InteractionState[(InteractionState["kHidden"] = 1)] = "kHidden";
  InteractionState[(InteractionState["kDone"] = 2)] = "kDone";
})(InteractionState || (InteractionState = {}));
const MatchPositionSpec = { $: {} };
const SearchQuerySpec$1 = { $: {} };
const RawVisitDataSpec = { $: {} };
const URLVisitSpec = { $: {} };
const ClusterSpec = { $: {} };
mojo.internal.Struct(
  MatchPositionSpec.$,
  "MatchPosition",
  [
    mojo.internal.StructField(
      "begin",
      0,
      0,
      mojo.internal.Uint32,
      0,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "end",
      4,
      0,
      mojo.internal.Uint32,
      0,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 16]]
);
mojo.internal.Struct(
  SearchQuerySpec$1.$,
  "SearchQuery",
  [
    mojo.internal.StructField(
      "query",
      0,
      0,
      mojo.internal.String,
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "url",
      8,
      0,
      UrlSpec.$,
      null,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 24]]
);
mojo.internal.Struct(
  RawVisitDataSpec.$,
  "RawVisitData",
  [
    mojo.internal.StructField(
      "url",
      0,
      0,
      UrlSpec.$,
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "visitTime",
      8,
      0,
      TimeSpec.$,
      null,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 24]]
);
mojo.internal.Struct(
  URLVisitSpec.$,
  "URLVisit",
  [
    mojo.internal.StructField(
      "visitId",
      0,
      0,
      mojo.internal.Int64,
      BigInt(0),
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "normalizedUrl",
      8,
      0,
      UrlSpec.$,
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "urlForDisplay",
      16,
      0,
      mojo.internal.String,
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "pageTitle",
      24,
      0,
      mojo.internal.String,
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "titleMatchPositions",
      32,
      0,
      mojo.internal.Array(MatchPositionSpec.$, false),
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "urlForDisplayMatchPositions",
      40,
      0,
      mojo.internal.Array(MatchPositionSpec.$, false),
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "rawVisitData",
      48,
      0,
      RawVisitDataSpec.$,
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "duplicates",
      56,
      0,
      mojo.internal.Array(RawVisitDataSpec.$, false),
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "relativeDate",
      64,
      0,
      mojo.internal.String,
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "annotations",
      72,
      0,
      mojo.internal.Array(AnnotationSpec.$, false),
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "isKnownToSync",
      80,
      0,
      mojo.internal.Bool,
      false,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "debugInfo",
      88,
      0,
      mojo.internal.Map(mojo.internal.String, mojo.internal.String, false),
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "hasUrlKeyedImage",
      80,
      1,
      mojo.internal.Bool,
      false,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 104]]
);
mojo.internal.Struct(
  ClusterSpec.$,
  "Cluster",
  [
    mojo.internal.StructField(
      "id",
      0,
      0,
      mojo.internal.Int64,
      BigInt(0),
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "visits",
      8,
      0,
      mojo.internal.Array(URLVisitSpec.$, false),
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "label",
      16,
      0,
      mojo.internal.String,
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "tabGroupName",
      24,
      0,
      mojo.internal.String,
      null,
      true,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "labelMatchPositions",
      32,
      0,
      mojo.internal.Array(MatchPositionSpec.$, false),
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "relatedSearches",
      40,
      0,
      mojo.internal.Array(SearchQuerySpec$1.$, false),
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "imageUrl",
      48,
      0,
      UrlSpec.$,
      null,
      true,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "fromPersistence",
      56,
      0,
      mojo.internal.Bool,
      false,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "debugInfo",
      64,
      0,
      mojo.internal.String,
      null,
      true,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 80]]
);
({ $: mojo.internal.Enum() });
var WindowOpenDisposition;
(function (WindowOpenDisposition) {
  WindowOpenDisposition[(WindowOpenDisposition["MIN_VALUE"] = 0)] = "MIN_VALUE";
  WindowOpenDisposition[(WindowOpenDisposition["MAX_VALUE"] = 11)] =
    "MAX_VALUE";
  WindowOpenDisposition[(WindowOpenDisposition["UNKNOWN"] = 0)] = "UNKNOWN";
  WindowOpenDisposition[(WindowOpenDisposition["CURRENT_TAB"] = 1)] =
    "CURRENT_TAB";
  WindowOpenDisposition[(WindowOpenDisposition["SINGLETON_TAB"] = 2)] =
    "SINGLETON_TAB";
  WindowOpenDisposition[(WindowOpenDisposition["NEW_FOREGROUND_TAB"] = 3)] =
    "NEW_FOREGROUND_TAB";
  WindowOpenDisposition[(WindowOpenDisposition["NEW_BACKGROUND_TAB"] = 4)] =
    "NEW_BACKGROUND_TAB";
  WindowOpenDisposition[(WindowOpenDisposition["NEW_POPUP"] = 5)] = "NEW_POPUP";
  WindowOpenDisposition[(WindowOpenDisposition["NEW_WINDOW"] = 6)] =
    "NEW_WINDOW";
  WindowOpenDisposition[(WindowOpenDisposition["SAVE_TO_DISK"] = 7)] =
    "SAVE_TO_DISK";
  WindowOpenDisposition[(WindowOpenDisposition["OFF_THE_RECORD"] = 8)] =
    "OFF_THE_RECORD";
  WindowOpenDisposition[(WindowOpenDisposition["IGNORE_ACTION"] = 9)] =
    "IGNORE_ACTION";
  WindowOpenDisposition[(WindowOpenDisposition["SWITCH_TO_TAB"] = 10)] =
    "SWITCH_TO_TAB";
  WindowOpenDisposition[
    (WindowOpenDisposition["NEW_PICTURE_IN_PICTURE"] = 11)
  ] = "NEW_PICTURE_IN_PICTURE";
})(WindowOpenDisposition || (WindowOpenDisposition = {}));
const ClickModifiersSpec = { $: {} };
mojo.internal.Struct(
  ClickModifiersSpec.$,
  "ClickModifiers",
  [
    mojo.internal.StructField(
      "middleButton",
      0,
      0,
      mojo.internal.Bool,
      false,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "altKey",
      0,
      1,
      mojo.internal.Bool,
      false,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "ctrlKey",
      0,
      2,
      mojo.internal.Bool,
      false,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "metaKey",
      0,
      3,
      mojo.internal.Bool,
      false,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "shiftKey",
      0,
      4,
      mojo.internal.Bool,
      false,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 16]]
);
const PointSpec = { $: {} };
const PointFSpec = { $: {} };
const Point3FSpec = { $: {} };
const SizeSpec = { $: {} };
const SizeFSpec = { $: {} };
const RectSpec = { $: {} };
const RectFSpec = { $: {} };
const InsetsSpec = { $: {} };
const InsetsFSpec = { $: {} };
const Vector2dSpec = { $: {} };
const Vector2dFSpec = { $: {} };
const Vector3dFSpec = { $: {} };
const QuaternionSpec = { $: {} };
const QuadFSpec = { $: {} };
mojo.internal.Struct(
  PointSpec.$,
  "Point",
  [
    mojo.internal.StructField(
      "x",
      0,
      0,
      mojo.internal.Int32,
      0,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "y",
      4,
      0,
      mojo.internal.Int32,
      0,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 16]]
);
mojo.internal.Struct(
  PointFSpec.$,
  "PointF",
  [
    mojo.internal.StructField(
      "x",
      0,
      0,
      mojo.internal.Float,
      0,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "y",
      4,
      0,
      mojo.internal.Float,
      0,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 16]]
);
mojo.internal.Struct(
  Point3FSpec.$,
  "Point3F",
  [
    mojo.internal.StructField(
      "x",
      0,
      0,
      mojo.internal.Float,
      0,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "y",
      4,
      0,
      mojo.internal.Float,
      0,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "z",
      8,
      0,
      mojo.internal.Float,
      0,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 24]]
);
mojo.internal.Struct(
  SizeSpec.$,
  "Size",
  [
    mojo.internal.StructField(
      "width",
      0,
      0,
      mojo.internal.Int32,
      0,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "height",
      4,
      0,
      mojo.internal.Int32,
      0,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 16]]
);
mojo.internal.Struct(
  SizeFSpec.$,
  "SizeF",
  [
    mojo.internal.StructField(
      "width",
      0,
      0,
      mojo.internal.Float,
      0,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "height",
      4,
      0,
      mojo.internal.Float,
      0,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 16]]
);
mojo.internal.Struct(
  RectSpec.$,
  "Rect",
  [
    mojo.internal.StructField(
      "x",
      0,
      0,
      mojo.internal.Int32,
      0,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "y",
      4,
      0,
      mojo.internal.Int32,
      0,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "width",
      8,
      0,
      mojo.internal.Int32,
      0,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "height",
      12,
      0,
      mojo.internal.Int32,
      0,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 24]]
);
mojo.internal.Struct(
  RectFSpec.$,
  "RectF",
  [
    mojo.internal.StructField(
      "x",
      0,
      0,
      mojo.internal.Float,
      0,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "y",
      4,
      0,
      mojo.internal.Float,
      0,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "width",
      8,
      0,
      mojo.internal.Float,
      0,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "height",
      12,
      0,
      mojo.internal.Float,
      0,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 24]]
);
mojo.internal.Struct(
  InsetsSpec.$,
  "Insets",
  [
    mojo.internal.StructField(
      "top",
      0,
      0,
      mojo.internal.Int32,
      0,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "left",
      4,
      0,
      mojo.internal.Int32,
      0,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "bottom",
      8,
      0,
      mojo.internal.Int32,
      0,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "right",
      12,
      0,
      mojo.internal.Int32,
      0,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 24]]
);
mojo.internal.Struct(
  InsetsFSpec.$,
  "InsetsF",
  [
    mojo.internal.StructField(
      "top",
      0,
      0,
      mojo.internal.Float,
      0,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "left",
      4,
      0,
      mojo.internal.Float,
      0,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "bottom",
      8,
      0,
      mojo.internal.Float,
      0,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "right",
      12,
      0,
      mojo.internal.Float,
      0,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 24]]
);
mojo.internal.Struct(
  Vector2dSpec.$,
  "Vector2d",
  [
    mojo.internal.StructField(
      "x",
      0,
      0,
      mojo.internal.Int32,
      0,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "y",
      4,
      0,
      mojo.internal.Int32,
      0,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 16]]
);
mojo.internal.Struct(
  Vector2dFSpec.$,
  "Vector2dF",
  [
    mojo.internal.StructField(
      "x",
      0,
      0,
      mojo.internal.Float,
      0,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "y",
      4,
      0,
      mojo.internal.Float,
      0,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 16]]
);
mojo.internal.Struct(
  Vector3dFSpec.$,
  "Vector3dF",
  [
    mojo.internal.StructField(
      "x",
      0,
      0,
      mojo.internal.Float,
      0,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "y",
      4,
      0,
      mojo.internal.Float,
      0,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "z",
      8,
      0,
      mojo.internal.Float,
      0,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 24]]
);
mojo.internal.Struct(
  QuaternionSpec.$,
  "Quaternion",
  [
    mojo.internal.StructField(
      "x",
      0,
      0,
      mojo.internal.Double,
      0,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "y",
      8,
      0,
      mojo.internal.Double,
      0,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "z",
      16,
      0,
      mojo.internal.Double,
      0,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "w",
      24,
      0,
      mojo.internal.Double,
      0,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 40]]
);
mojo.internal.Struct(
  QuadFSpec.$,
  "QuadF",
  [
    mojo.internal.StructField(
      "p1",
      0,
      0,
      PointFSpec.$,
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "p2",
      8,
      0,
      PointFSpec.$,
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "p3",
      16,
      0,
      PointFSpec.$,
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "p4",
      24,
      0,
      PointFSpec.$,
      null,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 40]]
);
const ClusterActionSpec = { $: mojo.internal.Enum() };
var ClusterAction;
(function (ClusterAction) {
  ClusterAction[(ClusterAction["MIN_VALUE"] = 0)] = "MIN_VALUE";
  ClusterAction[(ClusterAction["MAX_VALUE"] = 3)] = "MAX_VALUE";
  ClusterAction[(ClusterAction["kDeleted"] = 0)] = "kDeleted";
  ClusterAction[(ClusterAction["kOpenedInTabGroup"] = 1)] = "kOpenedInTabGroup";
  ClusterAction[(ClusterAction["kRelatedSearchClicked"] = 2)] =
    "kRelatedSearchClicked";
  ClusterAction[(ClusterAction["kVisitClicked"] = 3)] = "kVisitClicked";
})(ClusterAction || (ClusterAction = {}));
const RelatedSearchActionSpec = { $: mojo.internal.Enum() };
var RelatedSearchAction;
(function (RelatedSearchAction) {
  RelatedSearchAction[(RelatedSearchAction["MIN_VALUE"] = 0)] = "MIN_VALUE";
  RelatedSearchAction[(RelatedSearchAction["MAX_VALUE"] = 0)] = "MAX_VALUE";
  RelatedSearchAction[(RelatedSearchAction["kClicked"] = 0)] = "kClicked";
})(RelatedSearchAction || (RelatedSearchAction = {}));
const VisitActionSpec = { $: mojo.internal.Enum() };
var VisitAction;
(function (VisitAction) {
  VisitAction[(VisitAction["MIN_VALUE"] = 0)] = "MIN_VALUE";
  VisitAction[(VisitAction["MAX_VALUE"] = 2)] = "MAX_VALUE";
  VisitAction[(VisitAction["kClicked"] = 0)] = "kClicked";
  VisitAction[(VisitAction["kHidden"] = 1)] = "kHidden";
  VisitAction[(VisitAction["kDeleted"] = 2)] = "kDeleted";
})(VisitAction || (VisitAction = {}));
const VisitTypeSpec = { $: mojo.internal.Enum() };
var VisitType;
(function (VisitType) {
  VisitType[(VisitType["MIN_VALUE"] = 0)] = "MIN_VALUE";
  VisitType[(VisitType["MAX_VALUE"] = 1)] = "MAX_VALUE";
  VisitType[(VisitType["kSRP"] = 0)] = "kSRP";
  VisitType[(VisitType["kNonSRP"] = 1)] = "kNonSRP";
})(VisitType || (VisitType = {}));
let PageHandlerPendingReceiver$1 = class PageHandlerPendingReceiver {
  handle;
  constructor(handle) {
    this.handle = mojo.internal.interfaceSupport.getEndpointForReceiver(handle);
  }
  bindInBrowser(scope = "context") {
    mojo.internal.interfaceSupport.bind(
      this.handle,
      "history_clusters.mojom.PageHandler",
      scope
    );
  }
};
let PageHandlerRemote$1 = class PageHandlerRemote {
  proxy;
  $;
  onConnectionError;
  constructor(handle) {
    this.proxy = new mojo.internal.interfaceSupport.InterfaceRemoteBase(
      PageHandlerPendingReceiver$1,
      handle
    );
    this.$ = new mojo.internal.interfaceSupport.InterfaceRemoteBaseWrapper(
      this.proxy
    );
    this.onConnectionError = this.proxy.getConnectionErrorEventRouter();
  }
  openHistoryUrl(url, clickModifiers) {
    this.proxy.sendMessage(
      578368592,
      PageHandler_OpenHistoryUrl_ParamsSpec.$,
      null,
      [url, clickModifiers],
      false
    );
  }
  setPage(page) {
    this.proxy.sendMessage(
      1836875116,
      PageHandler_SetPage_ParamsSpec$1.$,
      null,
      [page],
      false
    );
  }
  showContextMenuForSearchbox(query, point) {
    this.proxy.sendMessage(
      935934490,
      PageHandler_ShowContextMenuForSearchbox_ParamsSpec.$,
      null,
      [query, point],
      false
    );
  }
  showContextMenuForURL(url, point) {
    this.proxy.sendMessage(
      602978586,
      PageHandler_ShowContextMenuForURL_ParamsSpec.$,
      null,
      [url, point],
      false
    );
  }
  showSidePanelUI() {
    this.proxy.sendMessage(
      1814277516,
      PageHandler_ShowSidePanelUI_ParamsSpec.$,
      null,
      [],
      false
    );
  }
  toggleVisibility(visible) {
    return this.proxy.sendMessage(
      868673673,
      PageHandler_ToggleVisibility_ParamsSpec.$,
      PageHandler_ToggleVisibility_ResponseParamsSpec.$,
      [visible],
      false
    );
  }
  startQueryClusters(query, beginTime, recluster) {
    this.proxy.sendMessage(
      867834232,
      PageHandler_StartQueryClusters_ParamsSpec.$,
      null,
      [query, beginTime, recluster],
      false
    );
  }
  loadMoreClusters(query) {
    this.proxy.sendMessage(
      204944962,
      PageHandler_LoadMoreClusters_ParamsSpec.$,
      null,
      [query],
      false
    );
  }
  hideVisits(visits) {
    return this.proxy.sendMessage(
      201026995,
      PageHandler_HideVisits_ParamsSpec.$,
      PageHandler_HideVisits_ResponseParamsSpec.$,
      [visits],
      false
    );
  }
  removeVisits(visits) {
    return this.proxy.sendMessage(
      1755999898,
      PageHandler_RemoveVisits_ParamsSpec.$,
      PageHandler_RemoveVisits_ResponseParamsSpec.$,
      [visits],
      false
    );
  }
  removeVisitByUrlAndTime(url, timestamp) {
    return this.proxy.sendMessage(
      2093977179,
      PageHandler_RemoveVisitByUrlAndTime_ParamsSpec.$,
      PageHandler_RemoveVisitByUrlAndTime_ResponseParamsSpec.$,
      [url, timestamp],
      false
    );
  }
  openVisitUrlsInTabGroup(visits, tabGroupName) {
    this.proxy.sendMessage(
      405769901,
      PageHandler_OpenVisitUrlsInTabGroup_ParamsSpec.$,
      null,
      [visits, tabGroupName],
      false
    );
  }
  recordVisitAction(visitAction, visitIndex, visitType) {
    this.proxy.sendMessage(
      589554394,
      PageHandler_RecordVisitAction_ParamsSpec.$,
      null,
      [visitAction, visitIndex, visitType],
      false
    );
  }
  recordRelatedSearchAction(action, visitIndex) {
    this.proxy.sendMessage(
      390032597,
      PageHandler_RecordRelatedSearchAction_ParamsSpec.$,
      null,
      [action, visitIndex],
      false
    );
  }
  recordClusterAction(clusterAction, clusterIndex) {
    this.proxy.sendMessage(
      23181537,
      PageHandler_RecordClusterAction_ParamsSpec.$,
      null,
      [clusterAction, clusterIndex],
      false
    );
  }
  recordToggledVisibility(visible) {
    this.proxy.sendMessage(
      2083319066,
      PageHandler_RecordToggledVisibility_ParamsSpec.$,
      null,
      [visible],
      false
    );
  }
};
let PageHandler$1 = class PageHandler {
  static get $interfaceName() {
    return "history_clusters.mojom.PageHandler";
  }
  static getRemote() {
    let remote = new PageHandlerRemote$1();
    remote.$.bindNewPipeAndPassReceiver().bindInBrowser();
    return remote;
  }
};
let PagePendingReceiver$1 = class PagePendingReceiver {
  handle;
  constructor(handle) {
    this.handle = mojo.internal.interfaceSupport.getEndpointForReceiver(handle);
  }
  bindInBrowser(scope = "context") {
    mojo.internal.interfaceSupport.bind(
      this.handle,
      "history_clusters.mojom.Page",
      scope
    );
  }
};
let PageRemote$1 = class PageRemote {
  proxy;
  $;
  onConnectionError;
  constructor(handle) {
    this.proxy = new mojo.internal.interfaceSupport.InterfaceRemoteBase(
      PagePendingReceiver$1,
      handle
    );
    this.$ = new mojo.internal.interfaceSupport.InterfaceRemoteBaseWrapper(
      this.proxy
    );
    this.onConnectionError = this.proxy.getConnectionErrorEventRouter();
  }
  onClustersQueryResult(result) {
    this.proxy.sendMessage(
      893657314,
      Page_OnClustersQueryResult_ParamsSpec.$,
      null,
      [result],
      false
    );
  }
  onClusterImageUpdated(clusterIndex, imageUrl) {
    this.proxy.sendMessage(
      301078989,
      Page_OnClusterImageUpdated_ParamsSpec.$,
      null,
      [clusterIndex, imageUrl],
      false
    );
  }
  onVisitsHidden(hiddenVisits) {
    this.proxy.sendMessage(
      590939600,
      Page_OnVisitsHidden_ParamsSpec.$,
      null,
      [hiddenVisits],
      false
    );
  }
  onVisitsRemoved(removedVisits) {
    this.proxy.sendMessage(
      1671705528,
      Page_OnVisitsRemoved_ParamsSpec.$,
      null,
      [removedVisits],
      false
    );
  }
  onHistoryDeleted() {
    this.proxy.sendMessage(
      689797442,
      Page_OnHistoryDeleted_ParamsSpec.$,
      null,
      [],
      false
    );
  }
  onQueryChangedByUser(query) {
    this.proxy.sendMessage(
      891901351,
      Page_OnQueryChangedByUser_ParamsSpec.$,
      null,
      [query],
      false
    );
  }
};
let PageCallbackRouter$1 = class PageCallbackRouter {
  helper_internal_;
  $;
  router_;
  onClustersQueryResult;
  onClusterImageUpdated;
  onVisitsHidden;
  onVisitsRemoved;
  onHistoryDeleted;
  onQueryChangedByUser;
  onConnectionError;
  constructor() {
    this.helper_internal_ =
      new mojo.internal.interfaceSupport.InterfaceReceiverHelperInternal(
        PageRemote$1
      );
    this.$ = new mojo.internal.interfaceSupport.InterfaceReceiverHelper(
      this.helper_internal_
    );
    this.router_ = new mojo.internal.interfaceSupport.CallbackRouter();
    this.onClustersQueryResult =
      new mojo.internal.interfaceSupport.InterfaceCallbackReceiver(
        this.router_
      );
    this.helper_internal_.registerHandler(
      893657314,
      Page_OnClustersQueryResult_ParamsSpec.$,
      null,
      this.onClustersQueryResult.createReceiverHandler(false),
      false
    );
    this.onClusterImageUpdated =
      new mojo.internal.interfaceSupport.InterfaceCallbackReceiver(
        this.router_
      );
    this.helper_internal_.registerHandler(
      301078989,
      Page_OnClusterImageUpdated_ParamsSpec.$,
      null,
      this.onClusterImageUpdated.createReceiverHandler(false),
      false
    );
    this.onVisitsHidden =
      new mojo.internal.interfaceSupport.InterfaceCallbackReceiver(
        this.router_
      );
    this.helper_internal_.registerHandler(
      590939600,
      Page_OnVisitsHidden_ParamsSpec.$,
      null,
      this.onVisitsHidden.createReceiverHandler(false),
      false
    );
    this.onVisitsRemoved =
      new mojo.internal.interfaceSupport.InterfaceCallbackReceiver(
        this.router_
      );
    this.helper_internal_.registerHandler(
      1671705528,
      Page_OnVisitsRemoved_ParamsSpec.$,
      null,
      this.onVisitsRemoved.createReceiverHandler(false),
      false
    );
    this.onHistoryDeleted =
      new mojo.internal.interfaceSupport.InterfaceCallbackReceiver(
        this.router_
      );
    this.helper_internal_.registerHandler(
      689797442,
      Page_OnHistoryDeleted_ParamsSpec.$,
      null,
      this.onHistoryDeleted.createReceiverHandler(false),
      false
    );
    this.onQueryChangedByUser =
      new mojo.internal.interfaceSupport.InterfaceCallbackReceiver(
        this.router_
      );
    this.helper_internal_.registerHandler(
      891901351,
      Page_OnQueryChangedByUser_ParamsSpec.$,
      null,
      this.onQueryChangedByUser.createReceiverHandler(false),
      false
    );
    this.onConnectionError =
      this.helper_internal_.getConnectionErrorEventRouter();
  }
  removeListener(id) {
    return this.router_.removeListener(id);
  }
};
const QueryResultSpec = { $: {} };
const PageHandler_OpenHistoryUrl_ParamsSpec = { $: {} };
const PageHandler_SetPage_ParamsSpec$1 = { $: {} };
const PageHandler_ShowContextMenuForSearchbox_ParamsSpec = { $: {} };
const PageHandler_ShowContextMenuForURL_ParamsSpec = { $: {} };
const PageHandler_ShowSidePanelUI_ParamsSpec = { $: {} };
const PageHandler_ToggleVisibility_ParamsSpec = { $: {} };
const PageHandler_ToggleVisibility_ResponseParamsSpec = { $: {} };
const PageHandler_StartQueryClusters_ParamsSpec = { $: {} };
const PageHandler_LoadMoreClusters_ParamsSpec = { $: {} };
const PageHandler_HideVisits_ParamsSpec = { $: {} };
const PageHandler_HideVisits_ResponseParamsSpec = { $: {} };
const PageHandler_RemoveVisits_ParamsSpec = { $: {} };
const PageHandler_RemoveVisits_ResponseParamsSpec = { $: {} };
const PageHandler_RemoveVisitByUrlAndTime_ParamsSpec = { $: {} };
const PageHandler_RemoveVisitByUrlAndTime_ResponseParamsSpec = { $: {} };
const PageHandler_OpenVisitUrlsInTabGroup_ParamsSpec = { $: {} };
const PageHandler_RecordVisitAction_ParamsSpec = { $: {} };
const PageHandler_RecordRelatedSearchAction_ParamsSpec = { $: {} };
const PageHandler_RecordClusterAction_ParamsSpec = { $: {} };
const PageHandler_RecordToggledVisibility_ParamsSpec = { $: {} };
const Page_OnClustersQueryResult_ParamsSpec = { $: {} };
const Page_OnClusterImageUpdated_ParamsSpec = { $: {} };
const Page_OnVisitsHidden_ParamsSpec = { $: {} };
const Page_OnVisitsRemoved_ParamsSpec = { $: {} };
const Page_OnHistoryDeleted_ParamsSpec = { $: {} };
const Page_OnQueryChangedByUser_ParamsSpec = { $: {} };
mojo.internal.Struct(
  QueryResultSpec.$,
  "QueryResult",
  [
    mojo.internal.StructField(
      "query",
      0,
      0,
      mojo.internal.String,
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "clusters",
      8,
      0,
      mojo.internal.Array(ClusterSpec.$, false),
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "canLoadMore",
      16,
      0,
      mojo.internal.Bool,
      false,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "isContinuation",
      16,
      1,
      mojo.internal.Bool,
      false,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 32]]
);
mojo.internal.Struct(
  PageHandler_OpenHistoryUrl_ParamsSpec.$,
  "PageHandler_OpenHistoryUrl_Params",
  [
    mojo.internal.StructField(
      "url",
      0,
      0,
      UrlSpec.$,
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "clickModifiers",
      8,
      0,
      ClickModifiersSpec.$,
      null,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 24]]
);
mojo.internal.Struct(
  PageHandler_SetPage_ParamsSpec$1.$,
  "PageHandler_SetPage_Params",
  [
    mojo.internal.StructField(
      "page",
      0,
      0,
      mojo.internal.InterfaceProxy(PageRemote$1),
      null,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 16]]
);
mojo.internal.Struct(
  PageHandler_ShowContextMenuForSearchbox_ParamsSpec.$,
  "PageHandler_ShowContextMenuForSearchbox_Params",
  [
    mojo.internal.StructField(
      "query",
      0,
      0,
      mojo.internal.String,
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "point",
      8,
      0,
      PointSpec.$,
      null,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 24]]
);
mojo.internal.Struct(
  PageHandler_ShowContextMenuForURL_ParamsSpec.$,
  "PageHandler_ShowContextMenuForURL_Params",
  [
    mojo.internal.StructField(
      "url",
      0,
      0,
      UrlSpec.$,
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "point",
      8,
      0,
      PointSpec.$,
      null,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 24]]
);
mojo.internal.Struct(
  PageHandler_ShowSidePanelUI_ParamsSpec.$,
  "PageHandler_ShowSidePanelUI_Params",
  [],
  [[0, 8]]
);
mojo.internal.Struct(
  PageHandler_ToggleVisibility_ParamsSpec.$,
  "PageHandler_ToggleVisibility_Params",
  [
    mojo.internal.StructField(
      "visible",
      0,
      0,
      mojo.internal.Bool,
      false,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 16]]
);
mojo.internal.Struct(
  PageHandler_ToggleVisibility_ResponseParamsSpec.$,
  "PageHandler_ToggleVisibility_ResponseParams",
  [
    mojo.internal.StructField(
      "visible",
      0,
      0,
      mojo.internal.Bool,
      false,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 16]]
);
mojo.internal.Struct(
  PageHandler_StartQueryClusters_ParamsSpec.$,
  "PageHandler_StartQueryClusters_Params",
  [
    mojo.internal.StructField(
      "query",
      0,
      0,
      mojo.internal.String,
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "beginTime",
      8,
      0,
      TimeSpec.$,
      null,
      true,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "recluster",
      16,
      0,
      mojo.internal.Bool,
      false,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 32]]
);
mojo.internal.Struct(
  PageHandler_LoadMoreClusters_ParamsSpec.$,
  "PageHandler_LoadMoreClusters_Params",
  [
    mojo.internal.StructField(
      "query",
      0,
      0,
      mojo.internal.String,
      null,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 16]]
);
mojo.internal.Struct(
  PageHandler_HideVisits_ParamsSpec.$,
  "PageHandler_HideVisits_Params",
  [
    mojo.internal.StructField(
      "visits",
      0,
      0,
      mojo.internal.Array(URLVisitSpec.$, false),
      null,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 16]]
);
mojo.internal.Struct(
  PageHandler_HideVisits_ResponseParamsSpec.$,
  "PageHandler_HideVisits_ResponseParams",
  [
    mojo.internal.StructField(
      "success",
      0,
      0,
      mojo.internal.Bool,
      false,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 16]]
);
mojo.internal.Struct(
  PageHandler_RemoveVisits_ParamsSpec.$,
  "PageHandler_RemoveVisits_Params",
  [
    mojo.internal.StructField(
      "visits",
      0,
      0,
      mojo.internal.Array(URLVisitSpec.$, false),
      null,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 16]]
);
mojo.internal.Struct(
  PageHandler_RemoveVisits_ResponseParamsSpec.$,
  "PageHandler_RemoveVisits_ResponseParams",
  [
    mojo.internal.StructField(
      "success",
      0,
      0,
      mojo.internal.Bool,
      false,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 16]]
);
mojo.internal.Struct(
  PageHandler_RemoveVisitByUrlAndTime_ParamsSpec.$,
  "PageHandler_RemoveVisitByUrlAndTime_Params",
  [
    mojo.internal.StructField(
      "url",
      0,
      0,
      UrlSpec.$,
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "timestamp",
      8,
      0,
      mojo.internal.Double,
      0,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 24]]
);
mojo.internal.Struct(
  PageHandler_RemoveVisitByUrlAndTime_ResponseParamsSpec.$,
  "PageHandler_RemoveVisitByUrlAndTime_ResponseParams",
  [
    mojo.internal.StructField(
      "success",
      0,
      0,
      mojo.internal.Bool,
      false,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 16]]
);
mojo.internal.Struct(
  PageHandler_OpenVisitUrlsInTabGroup_ParamsSpec.$,
  "PageHandler_OpenVisitUrlsInTabGroup_Params",
  [
    mojo.internal.StructField(
      "visits",
      0,
      0,
      mojo.internal.Array(URLVisitSpec.$, false),
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "tabGroupName",
      8,
      0,
      mojo.internal.String,
      null,
      true,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 24]]
);
mojo.internal.Struct(
  PageHandler_RecordVisitAction_ParamsSpec.$,
  "PageHandler_RecordVisitAction_Params",
  [
    mojo.internal.StructField(
      "visitAction",
      0,
      0,
      VisitActionSpec.$,
      0,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "visitIndex",
      4,
      0,
      mojo.internal.Uint32,
      0,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "visitType",
      8,
      0,
      VisitTypeSpec.$,
      0,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 24]]
);
mojo.internal.Struct(
  PageHandler_RecordRelatedSearchAction_ParamsSpec.$,
  "PageHandler_RecordRelatedSearchAction_Params",
  [
    mojo.internal.StructField(
      "action",
      0,
      0,
      RelatedSearchActionSpec.$,
      0,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "visitIndex",
      4,
      0,
      mojo.internal.Uint32,
      0,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 16]]
);
mojo.internal.Struct(
  PageHandler_RecordClusterAction_ParamsSpec.$,
  "PageHandler_RecordClusterAction_Params",
  [
    mojo.internal.StructField(
      "clusterAction",
      0,
      0,
      ClusterActionSpec.$,
      0,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "clusterIndex",
      4,
      0,
      mojo.internal.Uint32,
      0,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 16]]
);
mojo.internal.Struct(
  PageHandler_RecordToggledVisibility_ParamsSpec.$,
  "PageHandler_RecordToggledVisibility_Params",
  [
    mojo.internal.StructField(
      "visible",
      0,
      0,
      mojo.internal.Bool,
      false,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 16]]
);
mojo.internal.Struct(
  Page_OnClustersQueryResult_ParamsSpec.$,
  "Page_OnClustersQueryResult_Params",
  [
    mojo.internal.StructField(
      "result",
      0,
      0,
      QueryResultSpec.$,
      null,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 16]]
);
mojo.internal.Struct(
  Page_OnClusterImageUpdated_ParamsSpec.$,
  "Page_OnClusterImageUpdated_Params",
  [
    mojo.internal.StructField(
      "clusterIndex",
      0,
      0,
      mojo.internal.Int32,
      0,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "imageUrl",
      8,
      0,
      UrlSpec.$,
      null,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 24]]
);
mojo.internal.Struct(
  Page_OnVisitsHidden_ParamsSpec.$,
  "Page_OnVisitsHidden_Params",
  [
    mojo.internal.StructField(
      "hiddenVisits",
      0,
      0,
      mojo.internal.Array(URLVisitSpec.$, false),
      null,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 16]]
);
mojo.internal.Struct(
  Page_OnVisitsRemoved_ParamsSpec.$,
  "Page_OnVisitsRemoved_Params",
  [
    mojo.internal.StructField(
      "removedVisits",
      0,
      0,
      mojo.internal.Array(URLVisitSpec.$, false),
      null,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 16]]
);
mojo.internal.Struct(
  Page_OnHistoryDeleted_ParamsSpec.$,
  "Page_OnHistoryDeleted_Params",
  [],
  [[0, 8]]
);
mojo.internal.Struct(
  Page_OnQueryChangedByUser_ParamsSpec.$,
  "Page_OnQueryChangedByUser_Params",
  [
    mojo.internal.StructField(
      "query",
      0,
      0,
      mojo.internal.String,
      null,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 16]]
);
class BrowserProxyImpl {
  handler;
  callbackRouter;
  constructor(handler, callbackRouter) {
    this.handler = handler;
    this.callbackRouter = callbackRouter;
  }
  static getInstance() {
    if (instance$A) {
      return instance$A;
    }
    const handler = PageHandler$1.getRemote();
    const callbackRouter = new PageCallbackRouter$1();
    handler.setPage(callbackRouter.$.bindNewPipeAndPassRemote());
    return (instance$A = new BrowserProxyImpl(handler, callbackRouter));
  }
  static setInstance(obj) {
    instance$A = obj;
  }
}
let instance$A = null;
class MetricsProxyImpl {
  recordClusterAction(action, index) {
    BrowserProxyImpl.getInstance().handler.recordClusterAction(action, index);
  }
  recordRelatedSearchAction(action, index) {
    BrowserProxyImpl.getInstance().handler.recordRelatedSearchAction(
      action,
      index
    );
  }
  recordToggledVisibility(visible) {
    BrowserProxyImpl.getInstance().handler.recordToggledVisibility(visible);
  }
  recordVisitAction(action, index, type) {
    BrowserProxyImpl.getInstance().handler.recordVisitAction(
      action,
      index,
      type
    );
  }
  static getInstance() {
    return instance$z || (instance$z = new MetricsProxyImpl());
  }
  static setInstance(obj) {
    instance$z = obj;
  }
  static getVisitType(visit) {
    return visit.annotations.includes(Annotation.kSearchResultsPage)
      ? VisitType.kSRP
      : VisitType.kNonSRP;
  }
}
let instance$z = null;
let instance$y = null;
function getCss$v() {
  return (
    instance$y ||
    (instance$y = [
      ...[getCss$y()],
      css`
        :host {
          --border-color: var(
            --color-suggestion-chip-border,
            var(--cr-fallback-color-tonal-outline)
          );
          --icon-color: var(
            --color-suggestion-chip-icon,
            var(--cr-fallback-color-primary)
          );
          --pill-padding-text: 12px;
          --pill-padding-icon: 8px;
          --pill-height: 28px;
          display: block;
          min-width: 0;
        }
        a {
          align-items: center;
          color: inherit;
          display: flex;
          outline: none;
          text-decoration: none;
          overflow: hidden;
          position: relative;
        }
        :host-context(.focus-outline-visible) a:focus {
          box-shadow: inset 0 0 0 2px var(--cr-focus-outline-color);
        }
        :host-context(.focus-outline-visible) a:focus {
          --pill-padding-icon: 9px;
          --pill-padding-text: 13px;
          border: none;
          box-shadow: none;
          outline: 2px solid var(--cr-focus-outline-color);
          outline-offset: 0;
        }
        span {
          position: relative;
          z-index: 1;
        }
        .icon {
          --cr-icon-button-margin-start: 0;
          --cr-icon-color: var(--icon-color);
          --cr-icon-image: url(chrome://resources/images/icon_search.svg);
          --cr-icon-ripple-margin: 0;
          --cr-icon-ripple-size: 16px;
          --cr-icon-size: 16px;
        }
        cr-ripple {
          --paper-ripple-opacity: 1;
          color: var(--cr-active-background-color);
          display: block;
        }
        #hover-layer {
          display: none;
        }
        :host(:hover) #hover-layer {
          background: var(--cr-hover-background-color);
          content: "";
          display: block;
          inset: 0;
          pointer-events: none;
          position: absolute;
        }
      `,
    ])
  );
}
function getHtml$r() {
  return html` <a
    id="searchQueryLink"
    class="pill pill-icon-start"
    href="${this.searchQuery?.url.url || nothing}"
    @click="${this.onClick_}"
    @auxclick="${this.onAuxClick_}"
    @keydown="${this.onKeydown_}"
  >
    <div id="hover-layer"></div>
    <span class="icon cr-icon"></span>
    <span class="truncate">${this.searchQuery?.query || ""}</span>
  </a>`;
}
const SearchQueryElementBase = CrRippleMixin(CrLitElement);
class SearchQueryElement extends SearchQueryElementBase {
  static get is() {
    return "search-query";
  }
  static get styles() {
    return getCss$v();
  }
  render() {
    return getHtml$r.bind(this)();
  }
  static get properties() {
    return { index: { type: Number }, searchQuery: { type: Object } };
  }
  #index_accessor_storage = -1;
  get index() {
    return this.#index_accessor_storage;
  }
  set index(value) {
    this.#index_accessor_storage = value;
  }
  #searchQuery_accessor_storage;
  get searchQuery() {
    return this.#searchQuery_accessor_storage;
  }
  set searchQuery(value) {
    this.#searchQuery_accessor_storage = value;
  }
  firstUpdated() {
    this.addEventListener("pointerdown", this.onPointerDown_.bind(this));
    this.addEventListener("pointercancel", this.onPointerCancel_.bind(this));
  }
  onAuxClick_() {
    MetricsProxyImpl.getInstance().recordRelatedSearchAction(
      RelatedSearchAction.kClicked,
      this.index
    );
    this.fire("related-search-clicked");
  }
  onClick_(event) {
    event.preventDefault();
    this.onAuxClick_();
    this.openUrl_(event);
  }
  onKeydown_(e) {
    this.noink = e.key === " ";
    if (e.key !== "Enter") {
      return;
    }
    this.getRipple().uiDownAction();
    this.onAuxClick_();
    this.openUrl_(e);
    setTimeout(() => this.getRipple().uiUpAction(), 100);
  }
  onPointerDown_() {
    this.noink = false;
    this.ensureRipple();
  }
  onPointerCancel_() {
    this.getRipple().clear();
  }
  openUrl_(event) {
    assert(this.searchQuery);
    BrowserProxyImpl.getInstance().handler.openHistoryUrl(
      this.searchQuery.url,
      {
        middleButton: false,
        altKey: event.altKey,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        shiftKey: event.shiftKey,
      }
    );
  }
  createRipple() {
    this.rippleContainer = this.$.searchQueryLink;
    const ripple = super.createRipple();
    return ripple;
  }
}
customElements.define(SearchQueryElement.is, SearchQueryElement);
const AUTO_SRC = "auto-src";
const CLEAR_SRC = "clear-src";
const IS_GOOGLE_PHOTOS = "is-google-photos";
const STATIC_ENCODE = "static-encode";
const ENCODE_TYPE = "encode-type";
class CrAutoImgElement extends HTMLImageElement {
  static get observedAttributes() {
    return [AUTO_SRC, IS_GOOGLE_PHOTOS, STATIC_ENCODE, ENCODE_TYPE];
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (
      name !== AUTO_SRC &&
      name !== IS_GOOGLE_PHOTOS &&
      name !== STATIC_ENCODE &&
      name !== ENCODE_TYPE
    ) {
      return;
    }
    if (
      name === IS_GOOGLE_PHOTOS &&
      (oldValue === null) === (newValue === null)
    ) {
      return;
    }
    if (this.hasAttribute(CLEAR_SRC)) {
      this.removeAttribute("src");
    }
    let url = null;
    try {
      url = new URL(this.getAttribute(AUTO_SRC) || "");
    } catch (_) {}
    if (!url || url.protocol === "chrome-untrusted:") {
      this.removeAttribute("src");
      return;
    }
    if (url.protocol === "data:" || url.protocol === "chrome:") {
      this.src = url.href;
      return;
    }
    if (
      !this.hasAttribute(IS_GOOGLE_PHOTOS) &&
      !this.hasAttribute(STATIC_ENCODE) &&
      !this.hasAttribute(ENCODE_TYPE)
    ) {
      this.src = "chrome://image?" + url.href;
      return;
    }
    this.src = `chrome://image?url=${encodeURIComponent(url.href)}`;
    if (this.hasAttribute(IS_GOOGLE_PHOTOS)) {
      this.src += `&isGooglePhotos=true`;
    }
    if (this.hasAttribute(STATIC_ENCODE)) {
      this.src += `&staticEncode=true`;
    }
    if (this.hasAttribute(ENCODE_TYPE)) {
      this.src += `&encodeType=${this.getAttribute(ENCODE_TYPE)}`;
    }
  }
  set autoSrc(src) {
    this.setAttribute(AUTO_SRC, src);
  }
  get autoSrc() {
    return this.getAttribute(AUTO_SRC) || "";
  }
  set clearSrc(_) {
    this.setAttribute(CLEAR_SRC, "");
  }
  get clearSrc() {
    return this.getAttribute(CLEAR_SRC) || "";
  }
  set isGooglePhotos(enabled) {
    if (enabled) {
      this.setAttribute(IS_GOOGLE_PHOTOS, "");
    } else {
      this.removeAttribute(IS_GOOGLE_PHOTOS);
    }
  }
  get isGooglePhotos() {
    return this.hasAttribute(IS_GOOGLE_PHOTOS);
  }
  set staticEncode(enabled) {
    if (enabled) {
      this.setAttribute(STATIC_ENCODE, "");
    } else {
      this.removeAttribute(STATIC_ENCODE);
    }
  }
  get staticEncode() {
    return this.hasAttribute(STATIC_ENCODE);
  }
  set encodeType(type) {
    if (type) {
      this.setAttribute(ENCODE_TYPE, type);
    } else {
      this.removeAttribute(ENCODE_TYPE);
    }
  }
  get encodeType() {
    return this.getAttribute(ENCODE_TYPE) || "";
  }
}
customElements.define("cr-auto-img", CrAutoImgElement, { extends: "img" });
const ClientIdSpec = { $: mojo.internal.Enum() };
var ClientId;
(function (ClientId) {
  ClientId[(ClientId["MIN_VALUE"] = 0)] = "MIN_VALUE";
  ClientId[(ClientId["MAX_VALUE"] = 6)] = "MAX_VALUE";
  ClientId[(ClientId["Journeys"] = 0)] = "Journeys";
  ClientId[(ClientId["JourneysSidePanel"] = 1)] = "JourneysSidePanel";
  ClientId[(ClientId["NtpRealbox"] = 2)] = "NtpRealbox";
  ClientId[(ClientId["NtpQuests"] = 3)] = "NtpQuests";
  ClientId[(ClientId["Bookmarks"] = 4)] = "Bookmarks";
  ClientId[(ClientId["NtpTabResumption"] = 5)] = "NtpTabResumption";
  ClientId[(ClientId["HistoryEmbeddings"] = 6)] = "HistoryEmbeddings";
})(ClientId || (ClientId = {}));
class PageImageServiceHandlerPendingReceiver {
  handle;
  constructor(handle) {
    this.handle = mojo.internal.interfaceSupport.getEndpointForReceiver(handle);
  }
  bindInBrowser(scope = "context") {
    mojo.internal.interfaceSupport.bind(
      this.handle,
      "page_image_service.mojom.PageImageServiceHandler",
      scope
    );
  }
}
class PageImageServiceHandlerRemote {
  proxy;
  $;
  onConnectionError;
  constructor(handle) {
    this.proxy = new mojo.internal.interfaceSupport.InterfaceRemoteBase(
      PageImageServiceHandlerPendingReceiver,
      handle
    );
    this.$ = new mojo.internal.interfaceSupport.InterfaceRemoteBaseWrapper(
      this.proxy
    );
    this.onConnectionError = this.proxy.getConnectionErrorEventRouter();
  }
  getPageImageUrl(clientId, pageUrl, options) {
    return this.proxy.sendMessage(
      61566308,
      PageImageServiceHandler_GetPageImageUrl_ParamsSpec.$,
      PageImageServiceHandler_GetPageImageUrl_ResponseParamsSpec.$,
      [clientId, pageUrl, options],
      false
    );
  }
}
class PageImageServiceHandler {
  static get $interfaceName() {
    return "page_image_service.mojom.PageImageServiceHandler";
  }
  static getRemote() {
    let remote = new PageImageServiceHandlerRemote();
    remote.$.bindNewPipeAndPassReceiver().bindInBrowser();
    return remote;
  }
}
const OptionsSpec = { $: {} };
const ImageResultSpec = { $: {} };
const PageImageServiceHandler_GetPageImageUrl_ParamsSpec = { $: {} };
const PageImageServiceHandler_GetPageImageUrl_ResponseParamsSpec = { $: {} };
mojo.internal.Struct(
  OptionsSpec.$,
  "Options",
  [
    mojo.internal.StructField(
      "suggestImages",
      0,
      0,
      mojo.internal.Bool,
      true,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "optimizationGuideImages",
      0,
      1,
      mojo.internal.Bool,
      true,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 16]]
);
mojo.internal.Struct(
  ImageResultSpec.$,
  "ImageResult",
  [
    mojo.internal.StructField(
      "imageUrl",
      0,
      0,
      UrlSpec.$,
      null,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 16]]
);
mojo.internal.Struct(
  PageImageServiceHandler_GetPageImageUrl_ParamsSpec.$,
  "PageImageServiceHandler_GetPageImageUrl_Params",
  [
    mojo.internal.StructField(
      "clientId",
      0,
      0,
      ClientIdSpec.$,
      0,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "pageUrl",
      8,
      0,
      UrlSpec.$,
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "options",
      16,
      0,
      OptionsSpec.$,
      null,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 32]]
);
mojo.internal.Struct(
  PageImageServiceHandler_GetPageImageUrl_ResponseParamsSpec.$,
  "PageImageServiceHandler_GetPageImageUrl_ResponseParams",
  [
    mojo.internal.StructField(
      "result",
      0,
      0,
      ImageResultSpec.$,
      null,
      true,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 16]]
);
class PageImageServiceBrowserProxy {
  handler;
  constructor(handler) {
    this.handler = handler;
  }
  static getInstance() {
    return (
      instance$x ||
      (instance$x = new PageImageServiceBrowserProxy(
        PageImageServiceHandler.getRemote()
      ))
    );
  }
  static setInstance(obj) {
    instance$x = obj;
  }
}
let instance$x = null;
let instance$w = null;
function getCss$u() {
  return (
    instance$w ||
    (instance$w = [
      ...[],
      css`
        :host {
          align-items: center;
          background-color: var(--entity-image-background-color);
          background-position: center;
          background-repeat: no-repeat;
          border-radius: 8px;
          display: flex;
          flex-shrink: 0;
          height: 40px;
          justify-content: center;
          margin-inline: 0 16px;
          width: 40px;
        }
        :host([in-side-panel_]) {
          margin-inline: 8px 16px;
        }
        #page-image {
          border-radius: 5px;
          max-height: 100%;
          max-width: 100%;
        }
        :host([is-image-cover_]) #page-image {
          height: 100%;
          object-fit: cover;
          width: 100%;
        }
      `,
    ])
  );
}
function getHtml$q() {
  return this.imageUrl_
    ? html`<img id="page-image"
      is="cr-auto-img" auto-src="${this.imageUrl_.url}"></img>`
    : "";
}
class PageFaviconElement extends CrLitElement {
  static get is() {
    return "page-favicon";
  }
  static get styles() {
    return getCss$u();
  }
  render() {
    return getHtml$q.bind(this)();
  }
  static get properties() {
    return {
      inSidePanel_: { type: Boolean, reflect: true },
      url: { type: Object },
      isKnownToSync: { type: Boolean },
      imageUrl_: { type: Object },
      isImageCover_: { type: Boolean, reflect: true },
    };
  }
  #isKnownToSync_accessor_storage = false;
  get isKnownToSync() {
    return this.#isKnownToSync_accessor_storage;
  }
  set isKnownToSync(value) {
    this.#isKnownToSync_accessor_storage = value;
  }
  #url_accessor_storage = null;
  get url() {
    return this.#url_accessor_storage;
  }
  set url(value) {
    this.#url_accessor_storage = value;
  }
  #imageUrl__accessor_storage = null;
  get imageUrl_() {
    return this.#imageUrl__accessor_storage;
  }
  set imageUrl_(value) {
    this.#imageUrl__accessor_storage = value;
  }
  #inSidePanel__accessor_storage = loadTimeData.getBoolean("inSidePanel");
  get inSidePanel_() {
    return this.#inSidePanel__accessor_storage;
  }
  set inSidePanel_(value) {
    this.#inSidePanel__accessor_storage = value;
  }
  #isImageCover__accessor_storage = loadTimeData.getBoolean(
    "isHistoryClustersImageCover"
  );
  get isImageCover_() {
    return this.#isImageCover__accessor_storage;
  }
  set isImageCover_(value) {
    this.#isImageCover__accessor_storage = value;
  }
  getImageUrlForTesting() {
    return this.imageUrl_;
  }
  willUpdate(changedProperties) {
    super.willUpdate(changedProperties);
    if (changedProperties.has("url") || changedProperties.has("imageUrl_")) {
      if ((this.imageUrl_ && this.imageUrl_.url) || !this.url) {
        this.style.setProperty("background-image", "");
      } else {
        this.style.setProperty(
          "background-image",
          getFaviconForPageURL(this.url.url, this.isKnownToSync, "", 16)
        );
      }
    }
    if (
      changedProperties.has("url") ||
      changedProperties.has("isKnownToSync")
    ) {
      this.urlAndIsKnownToSyncChanged_();
    }
  }
  async urlAndIsKnownToSyncChanged_() {
    if (
      !this.url ||
      !this.isKnownToSync ||
      !loadTimeData.getBoolean("isHistoryClustersImagesEnabled")
    ) {
      this.imageUrl_ = null;
      return;
    }
    const { result: result } =
      await PageImageServiceBrowserProxy.getInstance().handler.getPageImageUrl(
        ClientId.Journeys,
        this.url,
        { suggestImages: true, optimizationGuideImages: true }
      );
    if (result) {
      this.imageUrl_ = result.imageUrl;
    } else {
      this.imageUrl_ = null;
    }
  }
}
customElements.define(PageFaviconElement.is, PageFaviconElement);
let instance$v = null;
function getCss$t() {
  return (
    instance$v ||
    (instance$v = [
      ...[getCss$y()],
      css`
        :host {
          align-items: center;
          cursor: pointer;
          display: flex;
          min-height: 48px;
        }
        :host(:hover) {
          background-color: var(--cr-hover-background-color);
        }
        .suffix-icons {
          display: flex;
          opacity: 0;
          position: absolute;
          --cr-icon-button-margin-end: 8px;
        }
        :host(:hover) .suffix-icons,
        .suffix-icons:focus-within {
          opacity: 1;
          position: static;
        }
        .hide-visit-icon {
          --cr-icon-image: url(chrome://resources/cr_components/history_clusters/hide_source_gm_grey_24dp.svg);
          --cr-icon-button-icon-size: 16px;
          --cr-icon-button-size: 24px;
        }
        .icon-more-vert {
          --cr-icon-button-margin-start: 0;
          --cr-icon-button-margin-end: 21px;
          --cr-icon-button-icon-size: 16px;
          --cr-icon-button-size: 24px;
        }
        :host([in-side-panel_]) .icon-more-vert {
          --cr-icon-button-margin-end: 8px;
        }
        #header {
          align-items: center;
          display: flex;
          flex-grow: 1;
          justify-content: space-between;
          min-width: 0;
          padding-inline-start: var(--cluster-padding-horizontal);
        }
        :host([in-side-panel_]) #header {
          padding-inline-start: 8px;
        }
        a {
          color: inherit;
          text-decoration: none;
        }
        #link-container {
          align-items: center;
          display: flex;
          margin-inline-end: var(--cluster-padding-horizontal);
          min-width: 0;
          outline: none;
          padding-inline: 2px;
        }
        :host(:hover) #link-container {
          margin-inline-end: 0;
        }
        :host([in-side-panel_]) #icon {
          background-color: var(
            --color-list-item-url-favicon-background,
            var(--cr-fallback-color-neutral-container)
          );
          height: 40px;
          width: 40px;
        }
        :host-context(.focus-outline-visible) #link-container:focus {
          box-shadow: 0 0 0 2px var(--cr-focus-outline-color);
        }
        #page-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
          gap: 4px;
        }
        #title-and-annotations {
          align-items: center;
          display: flex;
          line-height: 2;
        }
        .annotation {
          align-items: center;
          background-color: var(--annotation-background-color);
          border-radius: 4px;
          color: var(--annotation-text-color);
          display: inline-flex;
          flex-shrink: 0;
          font-weight: 500;
          margin-inline-start: 12px;
          padding: 0 8px;
        }
        .annotation + .annotation {
          margin-inline-start: 8px;
        }
        #title {
          font-size: 12px;
          font-weight: 500;
          line-height: 16px;
        }
        :host([in-side-panel_]) #title {
          font-size: 0.75rem;
          font-weight: 500;
        }
        #url {
          font-size: 11px;
          color: var(--cr-secondary-text-color);
          line-height: 14px;
        }
        :host([in-side-panel_]) #url {
          color: var(
            --color-history-clusters-side-panel-card-secondary-foreground
          );
        }
        #debug-info {
          color: var(--cr-secondary-text-color);
        }
      `,
    ])
  );
}
function getHtml$p() {
  return html` <div
      id="header"
      @click="${this.onClick_}"
      @auxclick="${this.onClick_}"
      @keydown="${this.onKeydown_}"
      @contextmenu="${this.onContextMenu_}"
    >
      <a id="link-container" href="${this.visit?.normalizedUrl.url || nothing}">
        <page-favicon
          id="icon"
          .url="${this.visit?.normalizedUrl}"
          .isKnownToSync="${this.visit?.isKnownToSync || false}"
        >
        </page-favicon>
        <div id="page-info">
          <div id="title-and-annotations">
            <span id="title" class="truncate"></span>
            ${this.computeAnnotations_().map(
              (item) => html`<span class="annotation">${item}</span>`
            )}
          </div>
          <span id="url" class="truncate"></span>
          <span id="debug-info" ?hidden="${!this.computeDebugInfo_()}">
            ${this.computeDebugInfo_()}
          </span>
        </div>
      </a>
      <div class="suffix-icons">
        <cr-icon-button
          class="hide-visit-icon"
          title="${this.i18n("hideFromCluster")}"
          @click="${this.onHideSelfButtonClick_}"
          ?hidden="${!this.fromPersistence}"
        ></cr-icon-button>
        <cr-icon-button
          id="actionMenuButton"
          class="icon-more-vert"
          title="${this.i18n("actionMenuDescription")}"
          aria-haspopup="menu"
          @click="${this.onActionMenuButtonClick_}"
          ?hidden="${!this.allowDeletingHistory_}"
        >
        </cr-icon-button>
      </div>
    </div>

    ${this.renderActionMenu_
      ? html` <cr-action-menu
          role-description="${this.i18n("actionMenuDescription")}"
        >
          <button
            id="removeSelfButton"
            class="dropdown-item"
            ?hidden="${!this.allowDeletingHistory_}"
            @click="${this.onRemoveSelfButtonClick_}"
          >
            ${this.i18n("removeFromHistory")}
          </button>
        </cr-action-menu>`
      : ""}`;
}
const WRAPPER_CSS_CLASS = "search-highlight-wrapper";
const ORIGINAL_CONTENT_CSS_CLASS = "search-highlight-original-content";
const HIT_CSS_CLASS = "search-highlight-hit";
function highlight(node, ranges) {
  assert(ranges.length > 0);
  const wrapper = document.createElement("span");
  wrapper.classList.add(WRAPPER_CSS_CLASS);
  assert(node.parentNode);
  node.parentNode.replaceChild(wrapper, node);
  const span = document.createElement("span");
  span.classList.add(ORIGINAL_CONTENT_CSS_CLASS);
  span.style.display = "none";
  span.appendChild(node);
  wrapper.appendChild(span);
  const text = node.textContent;
  const tokens = [];
  for (let i = 0; i < ranges.length; ++i) {
    const range = ranges[i];
    const prev = ranges[i - 1] || { start: 0, length: 0 };
    const start = prev.start + prev.length;
    const length = range.start - start;
    tokens.push(text.substr(start, length));
    tokens.push(text.substr(range.start, range.length));
  }
  const last = ranges.slice(-1)[0];
  tokens.push(text.substr(last.start + last.length));
  for (let i = 0; i < tokens.length; ++i) {
    if (i % 2 === 0) {
      wrapper.appendChild(document.createTextNode(tokens[i]));
    } else {
      const hitSpan = document.createElement("span");
      hitSpan.classList.add(HIT_CSS_CLASS);
      hitSpan.style.backgroundColor =
        "var(--search-highlight-hit-background-color, #ffeb3b)";
      hitSpan.style.color = "var(--search-highlight-hit-color, #202124)";
      hitSpan.textContent = tokens[i];
      wrapper.appendChild(hitSpan);
    }
  }
  return wrapper;
}
function insertHighlightedTextWithMatchesIntoElement(container, text, matches) {
  container.textContent = "";
  const node = document.createTextNode(text);
  container.appendChild(node);
  const ranges = [];
  for (const match of matches) {
    ranges.push({ start: match.begin, length: match.end - match.begin });
  }
  if (ranges.length > 0) {
    highlight(node, ranges);
  }
}
const annotationToStringId = new Map([[Annotation.kBookmarked, "bookmarked"]]);
const ClusterMenuElementBase = I18nMixinLit(CrLitElement);
class UrlVisitElement extends ClusterMenuElementBase {
  static get is() {
    return "url-visit";
  }
  static get styles() {
    return getCss$t();
  }
  render() {
    return getHtml$p.bind(this)();
  }
  static get properties() {
    return {
      query: { type: String },
      visit: { type: Object },
      fromPersistence: { type: Boolean },
      allowDeletingHistory_: { type: Boolean },
      inSidePanel_: { type: Boolean, reflect: true },
      renderActionMenu_: { type: Boolean },
    };
  }
  #query_accessor_storage = "";
  get query() {
    return this.#query_accessor_storage;
  }
  set query(value) {
    this.#query_accessor_storage = value;
  }
  #visit_accessor_storage;
  get visit() {
    return this.#visit_accessor_storage;
  }
  set visit(value) {
    this.#visit_accessor_storage = value;
  }
  #fromPersistence_accessor_storage = false;
  get fromPersistence() {
    return this.#fromPersistence_accessor_storage;
  }
  set fromPersistence(value) {
    this.#fromPersistence_accessor_storage = value;
  }
  annotations_ = [];
  #allowDeletingHistory__accessor_storage = loadTimeData.getBoolean(
    "allowDeletingHistory"
  );
  get allowDeletingHistory_() {
    return this.#allowDeletingHistory__accessor_storage;
  }
  set allowDeletingHistory_(value) {
    this.#allowDeletingHistory__accessor_storage = value;
  }
  #inSidePanel__accessor_storage = loadTimeData.getBoolean("inSidePanel");
  get inSidePanel_() {
    return this.#inSidePanel__accessor_storage;
  }
  set inSidePanel_(value) {
    this.#inSidePanel__accessor_storage = value;
  }
  #renderActionMenu__accessor_storage = false;
  get renderActionMenu_() {
    return this.#renderActionMenu__accessor_storage;
  }
  set renderActionMenu_(value) {
    this.#renderActionMenu__accessor_storage = value;
  }
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has("visit")) {
      assert(this.visit);
      insertHighlightedTextWithMatchesIntoElement(
        this.$.title,
        this.visit.pageTitle,
        this.visit.titleMatchPositions
      );
      insertHighlightedTextWithMatchesIntoElement(
        this.$.url,
        this.visit.urlForDisplay,
        this.visit.urlForDisplayMatchPositions
      );
    }
  }
  onAuxClick_() {
    this.fire("visit-clicked", this.visit);
  }
  onClick_(event) {
    if (event.defaultPrevented) {
      return;
    }
    event.preventDefault();
    this.onAuxClick_();
    this.openUrl_(event);
  }
  onContextMenu_(event) {
    if (!loadTimeData.getBoolean("inSidePanel") || !this.visit) {
      return;
    }
    BrowserProxyImpl.getInstance().handler.showContextMenuForURL(
      this.visit.normalizedUrl,
      { x: event.clientX, y: event.clientY }
    );
  }
  onKeydown_(e) {
    if (e.key !== "Enter") {
      return;
    }
    this.onAuxClick_();
    this.openUrl_(e);
  }
  async onActionMenuButtonClick_(event) {
    event.preventDefault();
    if (!this.renderActionMenu_) {
      this.renderActionMenu_ = true;
      await this.updateComplete;
    }
    const menu = this.shadowRoot.querySelector("cr-action-menu");
    assert(menu);
    menu.showAt(this.$.actionMenuButton);
  }
  onHideSelfButtonClick_(event) {
    this.emitMenuButtonClick_(event, "hide-visit");
  }
  onRemoveSelfButtonClick_(event) {
    this.emitMenuButtonClick_(event, "remove-visit");
  }
  emitMenuButtonClick_(event, emitEventName) {
    event.preventDefault();
    this.fire(emitEventName, this.visit);
    if (this.renderActionMenu_) {
      const menu = this.shadowRoot.querySelector("cr-action-menu");
      assert(menu);
      menu.close();
    }
  }
  computeAnnotations_() {
    if (this.inSidePanel_ || !this.visit) {
      return [];
    }
    return this.visit.annotations
      .map((annotation) => annotationToStringId.get(annotation))
      .filter((id) => !!id)
      .map((id) => loadTimeData.getString(id));
  }
  computeDebugInfo_() {
    if (!loadTimeData.getBoolean("isHistoryClustersDebug") || !this.visit) {
      return "";
    }
    return JSON.stringify(this.visit.debugInfo);
  }
  openUrl_(event) {
    assert(this.visit);
    BrowserProxyImpl.getInstance().handler.openHistoryUrl(
      this.visit.normalizedUrl,
      {
        middleButton: event.button === 1,
        altKey: event.altKey,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        shiftKey: event.shiftKey,
      }
    );
  }
}
customElements.define(UrlVisitElement.is, UrlVisitElement);
var HistoryResultType;
(function (HistoryResultType) {
  HistoryResultType[(HistoryResultType["TRADITIONAL"] = 0)] = "TRADITIONAL";
  HistoryResultType[(HistoryResultType["GROUPED"] = 1)] = "GROUPED";
  HistoryResultType[(HistoryResultType["EMBEDDINGS"] = 2)] = "EMBEDDINGS";
  HistoryResultType[(HistoryResultType["END"] = 3)] = "END";
})(HistoryResultType || (HistoryResultType = {}));
var HistoryEmbeddingsUserActions;
(function (HistoryEmbeddingsUserActions) {
  HistoryEmbeddingsUserActions[
    (HistoryEmbeddingsUserActions["NON_EMPTY_QUERY_HISTORY_SEARCH"] = 0)
  ] = "NON_EMPTY_QUERY_HISTORY_SEARCH";
  HistoryEmbeddingsUserActions[(HistoryEmbeddingsUserActions["END"] = 7)] =
    "END";
})(HistoryEmbeddingsUserActions || (HistoryEmbeddingsUserActions = {}));
const QUERY_RESULT_MINIMUM_AGE = 2e3;
let instance$u = null;
function getCss$s() {
  return (
    instance$u ||
    (instance$u = [
      ...[getCss$y(), getCss$B()],
      css`
        :host {
          --indentation: 52px;
          --search-query-margin: 10px;
          display: block;
          padding-bottom: var(--cluster-padding-vertical);
        }
        :host([in-side-panel]) {
          --cr-icon-button-margin-start: 18px;
          --search-query-margin: 4px;
          padding-bottom: 0;
          padding-top: 8px;
        }
        :host([in-side-panel]) #container {
          background: var(--color-side-panel-card-background);
          border-radius: 12px;
          overflow: hidden;
        }
        :host([in-side-panel][is-first]) {
          padding-top: 0;
        }
        :host(:focus:focus-visible) #container {
          box-shadow: inset 0 0 0 2px var(--cr-focus-outline-color);
        }
        :host([has-hidden-visits_]) #container {
          margin-bottom: var(--cluster-padding-vertical);
        }
        :host([in-side-panel]) #container url-visit:last-of-type {
          margin-bottom: 8px;
        }
        :host(:not([in-side-panel])) #container {
          background-color: var(--cr-card-background-color);
          border-radius: var(--cr-card-border-radius);
          box-shadow: var(--cr-card-shadow);
          padding: var(--cluster-padding-vertical) 0;
        }
        .label-row {
          align-items: center;
          display: flex;
          flex-grow: 1;
          justify-content: space-between;
          min-height: 24px;
          min-width: 0;
          padding-block-end: 13px;
          padding-inline-start: var(--cluster-padding-horizontal);
        }
        :host([in-side-panel]) .label-row {
          min-height: 44px;
          padding-block-end: 0;
          padding-inline-start: 16px;
        }
        #label {
          color: var(--cr-primary-text-color);
          font-size: 16px;
          font-weight: 500;
        }
        :host([in-side-panel]) #label {
          font-size: 0.875rem;
          line-height: calc(10 / 7);
          margin-inline-end: 16px;
        }
        .timestamp {
          font-size: 11px;
        }
        :host([in-side-panel]) .timestamp {
          font-size: 0.6875rem;
          line-height: calc(5 / 3);
        }
        .debug-info {
          color: var(--cr-secondary-text-color);
        }
        #related-searches-divider {
          display: none;
        }
        :host([in-side-panel]) #related-searches-divider {
          display: block;
          background-color: var(--color-history-clusters-side-panel-divider);
          height: 1px;
          margin: 8px 16px;
        }
        #related-searches {
          margin: 16px var(--cluster-padding-horizontal) 0px;
        }
        :host([in-side-panel]) #related-searches {
          margin: 16px 2px;
        }
        :host([in-side-panel]) search-query {
          flex-shrink: 0;
          margin-top: 0;
        }
        search-query:not(:last-of-type) {
          margin-inline-end: var(--search-query-margin);
        }
        :host([in-side-panel]) search-query:first-of-type {
          margin-inline-start: 16px;
        }
      `,
    ])
  );
}
function getHtml$o() {
  return html` <div
    id="container"
    @visit-clicked="${this.onVisitClicked_}"
    @open-all-visits="${this.onOpenAllVisits_}"
    @hide-all-visits="${this.onHideAllVisits_}"
    @remove-all-visits="${this.onRemoveAllVisits_}"
    @hide-visit="${this.onHideVisit_}"
    @remove-visit="${this.onRemoveVisit_}"
  >
    <div class="label-row">
      <span id="label" class="truncate"></span>
      <img is="cr-auto-img" auto-src="${this.imageUrl_}" />
      <div class="debug-info">${this.debugInfo_()}</div>
      <div class="timestamp-and-menu">
        <div class="timestamp">${this.timestamp_()}</div>
        <cluster-menu></cluster-menu>
      </div>
    </div>
    ${this.visits_().map(
      (item) => html`<url-visit
        .visit="${item}"
        .query="${this.query}"
        .fromPersistence="${this.cluster.fromPersistence}"
      >
      </url-visit>`
    )}
    <div
      id="related-searches-divider"
      ?hidden="${this.hideRelatedSearches_()}"
    ></div>
    <horizontal-carousel
      id="related-searches"
      ?hidden="${this.hideRelatedSearches_()}"
      role="list"
      aria-label="${this.i18n("relatedSearchesHeader")}"
      @related-search-clicked="${this.onRelatedSearchClicked_}"
      @pointerdown="${this.clearSelection_}"
      ?in-side-panel="${this.inSidePanel}"
    >
      ${this.relatedSearches_.map(
        (item, index) => html`<search-query
          .searchQuery="${item}"
          .index="${index}"
          role="listitem"
        >
        </search-query>`
      )}
    </horizontal-carousel>
  </div>`;
}
const ClusterElementBase = I18nMixinLit(CrLitElement);
class ClusterElement extends ClusterElementBase {
  static get is() {
    return "history-cluster";
  }
  static get styles() {
    return getCss$s();
  }
  render() {
    return getHtml$o.bind(this)();
  }
  static get properties() {
    return {
      cluster: { type: Object },
      index: { type: Number },
      inSidePanel: { type: Boolean, reflect: true },
      query: { type: String },
      relatedSearches_: { type: Array },
      label_: { type: String, state: true },
      imageUrl_: { type: String },
    };
  }
  #cluster_accessor_storage;
  get cluster() {
    return this.#cluster_accessor_storage;
  }
  set cluster(value) {
    this.#cluster_accessor_storage = value;
  }
  #index_accessor_storage = -1;
  get index() {
    return this.#index_accessor_storage;
  }
  set index(value) {
    this.#index_accessor_storage = value;
  }
  #inSidePanel_accessor_storage = loadTimeData.getBoolean("inSidePanel");
  get inSidePanel() {
    return this.#inSidePanel_accessor_storage;
  }
  set inSidePanel(value) {
    this.#inSidePanel_accessor_storage = value;
  }
  #query_accessor_storage = "";
  get query() {
    return this.#query_accessor_storage;
  }
  set query(value) {
    this.#query_accessor_storage = value;
  }
  #imageUrl__accessor_storage = "";
  get imageUrl_() {
    return this.#imageUrl__accessor_storage;
  }
  set imageUrl_(value) {
    this.#imageUrl__accessor_storage = value;
  }
  #relatedSearches__accessor_storage = [];
  get relatedSearches_() {
    return this.#relatedSearches__accessor_storage;
  }
  set relatedSearches_(value) {
    this.#relatedSearches__accessor_storage = value;
  }
  callbackRouter_;
  onVisitsHiddenListenerId_ = null;
  onVisitsRemovedListenerId_ = null;
  #label__accessor_storage = "no_label";
  get label_() {
    return this.#label__accessor_storage;
  }
  set label_(value) {
    this.#label__accessor_storage = value;
  }
  constructor() {
    super();
    this.callbackRouter_ = BrowserProxyImpl.getInstance().callbackRouter;
  }
  connectedCallback() {
    super.connectedCallback();
    this.onVisitsHiddenListenerId_ =
      this.callbackRouter_.onVisitsHidden.addListener(
        this.onVisitsRemovedOrHidden_.bind(this)
      );
    this.onVisitsRemovedListenerId_ =
      this.callbackRouter_.onVisitsRemoved.addListener(
        this.onVisitsRemovedOrHidden_.bind(this)
      );
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    assert(this.onVisitsHiddenListenerId_);
    this.callbackRouter_.removeListener(this.onVisitsHiddenListenerId_);
    this.onVisitsHiddenListenerId_ = null;
    assert(this.onVisitsRemovedListenerId_);
    this.callbackRouter_.removeListener(this.onVisitsRemovedListenerId_);
    this.onVisitsRemovedListenerId_ = null;
  }
  willUpdate(changedProperties) {
    super.willUpdate(changedProperties);
    if (changedProperties.has("cluster")) {
      assert(this.cluster);
      this.label_ = this.cluster.label ? this.cluster.label : "no_label";
      this.imageUrl_ = this.cluster.imageUrl ? this.cluster.imageUrl.url : "";
      this.relatedSearches_ = this.cluster.relatedSearches.filter(
        (query, index) => query && !(this.inSidePanel && index > 2)
      );
    }
  }
  updated(changedProperties) {
    super.updated(changedProperties);
    const changedPrivateProperties = changedProperties;
    if (
      changedPrivateProperties.has("label_") &&
      this.label_ !== "no_label" &&
      this.cluster
    ) {
      insertHighlightedTextWithMatchesIntoElement(
        this.$.label,
        this.cluster.label,
        this.cluster.labelMatchPositions
      );
    }
    if (changedPrivateProperties.has("imageUrl_")) {
      requestIdleCallback(() => {
        this.fire("iron-resize");
      });
    } else if (changedProperties.has("cluster")) {
      this.fire("iron-resize");
    }
  }
  onRelatedSearchClicked_() {
    MetricsProxyImpl.getInstance().recordClusterAction(
      ClusterAction.kRelatedSearchClicked,
      this.index
    );
  }
  clearSelection_(event) {
    this.onBrowserIdle_().then(() => {
      if (window.getSelection() && !event.altKey) {
        window.getSelection()?.empty();
      }
    });
  }
  onVisitClicked_(event) {
    MetricsProxyImpl.getInstance().recordClusterAction(
      ClusterAction.kVisitClicked,
      this.index
    );
    const visit = event.detail;
    const visitIndex = this.getVisitIndex_(visit);
    MetricsProxyImpl.getInstance().recordVisitAction(
      VisitAction.kClicked,
      visitIndex,
      MetricsProxyImpl.getVisitType(visit)
    );
    this.fire("record-history-link-click", {
      resultType: HistoryResultType.GROUPED,
      index: visitIndex,
    });
  }
  onOpenAllVisits_() {
    assert(this.cluster);
    BrowserProxyImpl.getInstance().handler.openVisitUrlsInTabGroup(
      this.cluster.visits,
      this.cluster.tabGroupName ?? null
    );
    MetricsProxyImpl.getInstance().recordClusterAction(
      ClusterAction.kOpenedInTabGroup,
      this.index
    );
  }
  onHideAllVisits_() {
    this.fire("hide-visits", this.cluster ? this.cluster.visits : []);
  }
  onRemoveAllVisits_() {
    this.fire("remove-visits", this.cluster ? this.cluster.visits : []);
  }
  onHideVisit_(event) {
    const visit = event.detail;
    MetricsProxyImpl.getInstance().recordVisitAction(
      VisitAction.kHidden,
      this.getVisitIndex_(visit),
      MetricsProxyImpl.getVisitType(visit)
    );
  }
  onRemoveVisit_(event) {
    const visit = event.detail;
    MetricsProxyImpl.getInstance().recordVisitAction(
      VisitAction.kDeleted,
      this.getVisitIndex_(visit),
      MetricsProxyImpl.getVisitType(visit)
    );
    this.fire("remove-visits", [visit]);
  }
  onBrowserIdle_() {
    return new Promise((resolve) => {
      requestIdleCallback(() => {
        resolve();
      });
    });
  }
  onVisitsRemovedOrHidden_(removedVisits) {
    assert(this.cluster);
    const visitHasBeenRemoved = (visit) =>
      removedVisits.findIndex((removedVisit) => {
        if (visit.normalizedUrl.url !== removedVisit.normalizedUrl.url) {
          return false;
        }
        const rawVisitTime = visit.rawVisitData.visitTime.internalValue;
        return (
          removedVisit.rawVisitData.visitTime.internalValue === rawVisitTime ||
          removedVisit.duplicates
            .map((data) => data.visitTime.internalValue)
            .includes(rawVisitTime)
        );
      }) !== -1;
    const allVisits = this.cluster.visits;
    const remainingVisits = allVisits.filter((v) => !visitHasBeenRemoved(v));
    if (allVisits.length === remainingVisits.length) {
      return;
    }
    if (!remainingVisits.length) {
      this.fire("remove-cluster", this.index);
      MetricsProxyImpl.getInstance().recordClusterAction(
        ClusterAction.kDeleted,
        this.index
      );
    } else {
      this.cluster.visits = remainingVisits;
      this.requestUpdate();
    }
    this.updateComplete.then(() => {
      this.fire("iron-resize");
    });
  }
  getVisitIndex_(visit) {
    return this.cluster ? this.cluster.visits.indexOf(visit) : -1;
  }
  hideRelatedSearches_() {
    return !this.cluster || !this.cluster.relatedSearches.length;
  }
  debugInfo_() {
    return this.cluster && this.cluster.debugInfo ? this.cluster.debugInfo : "";
  }
  timestamp_() {
    return this.cluster && this.cluster.visits.length > 0
      ? this.cluster.visits[0].relativeDate
      : "";
  }
  visits_() {
    return this.cluster ? this.cluster.visits : [];
  }
}
customElements.define(ClusterElement.is, ClusterElement);
let instance$t = null;
function getCss$r() {
  return (
    instance$t ||
    (instance$t = [
      ...[],
      css`
        :host {
          display: block;
          position: relative;
        }
        :host([chunk-size="0"]) #container > ::slotted(*) {
          box-sizing: border-box;
          contain-intrinsic-size: var(--list-item-size, 100px) auto;
          content-visibility: auto;
          width: 100%;
        }
        :host(:not([chunk-size="0"])) #container > ::slotted(.chunk) {
          box-sizing: border-box;
          contain-intrinsic-size: calc(
              var(--chunk-size) * var(--list-item-size, 100px)
            )
            auto;
          content-visibility: auto;
          width: 100%;
        }
      `,
    ])
  );
}
class CrLazyListElement extends CrLitElement {
  static get is() {
    return "cr-lazy-list";
  }
  static get styles() {
    return getCss$r();
  }
  render() {
    const host =
      this.listItemHost === undefined
        ? this.getRootNode().host
        : this.listItemHost;
    if (this.chunkSize === 0) {
      render(
        this.items
          .slice(0, this.numItemsDisplayed_)
          .map((item, index) => this.template(item, index)),
        this,
        { host: host }
      );
    } else {
      const chunks = Math.ceil(this.numItemsDisplayed_ / this.chunkSize);
      const chunkArray = new Array(chunks).fill(0);
      render(
        chunkArray.map(
          (_item, index) => html`<div id="chunk-${index}" class="chunk"></div>`
        ),
        this,
        { host: host }
      );
      for (let chunkIndex = 0; chunkIndex < chunks; chunkIndex++) {
        const start = chunkIndex * this.chunkSize;
        const end = Math.min(
          this.numItemsDisplayed_,
          (chunkIndex + 1) * this.chunkSize
        );
        const chunk = this.querySelector(`#chunk-${chunkIndex}`);
        assert(chunk);
        render(
          this.items
            .slice(start, end)
            .map((item, index) => this.template(item, start + index)),
          chunk,
          { host: host }
        );
      }
    }
    return html`<div id="container"><slot id="slot"></slot></div>`;
  }
  static get properties() {
    return {
      chunkSize: { type: Number, reflect: true },
      items: { type: Array },
      itemSize: { type: Number },
      listItemHost: { type: Object },
      minViewportHeight: { type: Number },
      scrollOffset: { type: Number },
      scrollTarget: { type: Object },
      restoreFocusElement: { type: Object },
      template: { type: Object },
      numItemsDisplayed_: { state: true, type: Number },
    };
  }
  #items_accessor_storage = [];
  get items() {
    return this.#items_accessor_storage;
  }
  set items(value) {
    this.#items_accessor_storage = value;
  }
  #itemSize_accessor_storage = undefined;
  get itemSize() {
    return this.#itemSize_accessor_storage;
  }
  set itemSize(value) {
    this.#itemSize_accessor_storage = value;
  }
  #listItemHost_accessor_storage;
  get listItemHost() {
    return this.#listItemHost_accessor_storage;
  }
  set listItemHost(value) {
    this.#listItemHost_accessor_storage = value;
  }
  #minViewportHeight_accessor_storage;
  get minViewportHeight() {
    return this.#minViewportHeight_accessor_storage;
  }
  set minViewportHeight(value) {
    this.#minViewportHeight_accessor_storage = value;
  }
  #scrollOffset_accessor_storage = 0;
  get scrollOffset() {
    return this.#scrollOffset_accessor_storage;
  }
  set scrollOffset(value) {
    this.#scrollOffset_accessor_storage = value;
  }
  #scrollTarget_accessor_storage = document.documentElement;
  get scrollTarget() {
    return this.#scrollTarget_accessor_storage;
  }
  set scrollTarget(value) {
    this.#scrollTarget_accessor_storage = value;
  }
  #restoreFocusElement_accessor_storage = null;
  get restoreFocusElement() {
    return this.#restoreFocusElement_accessor_storage;
  }
  set restoreFocusElement(value) {
    this.#restoreFocusElement_accessor_storage = value;
  }
  #template_accessor_storage = () => html``;
  get template() {
    return this.#template_accessor_storage;
  }
  set template(value) {
    this.#template_accessor_storage = value;
  }
  #chunkSize_accessor_storage = 0;
  get chunkSize() {
    return this.#chunkSize_accessor_storage;
  }
  set chunkSize(value) {
    this.#chunkSize_accessor_storage = value;
  }
  #numItemsDisplayed__accessor_storage = 0;
  get numItemsDisplayed_() {
    return this.#numItemsDisplayed__accessor_storage;
  }
  set numItemsDisplayed_(value) {
    this.#numItemsDisplayed__accessor_storage = value;
  }
  lastItemsLength_ = 0;
  lastRenderedHeight_ = 0;
  resizeObserver_ = null;
  scrollListener_ = () => this.onScroll_();
  willUpdate(changedProperties) {
    super.willUpdate(changedProperties);
    if (changedProperties.has("items")) {
      this.lastItemsLength_ = this.items.length;
      this.numItemsDisplayed_ =
        this.items.length === 0
          ? 0
          : Math.min(this.numItemsDisplayed_, this.items.length);
    } else {
      assert(
        this.items.length === this.lastItemsLength_,
        "Items array changed in place; rendered result may be incorrect."
      );
    }
    if (changedProperties.has("itemSize")) {
      this.style.setProperty("--list-item-size", `${this.itemSize}px`);
    }
    if (changedProperties.has("chunkSize")) {
      this.style.setProperty("--chunk-size", `${this.chunkSize}`);
    }
  }
  updated(changedProperties) {
    super.updated(changedProperties);
    let itemsChanged = false;
    if (
      changedProperties.has("items") ||
      changedProperties.has("minViewportHeight") ||
      changedProperties.has("scrollOffset")
    ) {
      const previous = changedProperties.get("items");
      if (previous !== undefined || this.items.length !== 0) {
        this.onItemsChanged_();
        itemsChanged = true;
      }
    }
    if (changedProperties.has("scrollTarget")) {
      this.addRemoveScrollTargetListeners_(
        changedProperties.get("scrollTarget") || null
      );
      if (this.scrollTarget && this.items.length > 0 && !itemsChanged) {
        this.fillCurrentViewport();
      }
    }
  }
  fillCurrentViewport() {
    if (this.items.length === 0) {
      return Promise.resolve();
    }
    return this.update_(this.$.container.style.height === "0px");
  }
  async ensureItemRendered(index) {
    if (index < this.numItemsDisplayed_) {
      return this.domItems()[index];
    }
    assert(index < this.items.length);
    await this.updateNumItemsDisplayed_(index + 1);
    return this.domItems()[index];
  }
  addRemoveScrollTargetListeners_(oldTarget) {
    if (oldTarget) {
      const target =
        oldTarget === document.documentElement ? window : oldTarget;
      target.removeEventListener("scroll", this.scrollListener_);
      assert(this.resizeObserver_);
      this.resizeObserver_.disconnect();
    }
    if (this.scrollTarget) {
      const target =
        this.scrollTarget === document.documentElement
          ? window
          : this.scrollTarget;
      target.addEventListener("scroll", this.scrollListener_);
      this.resizeObserver_ = new ResizeObserver(() => {
        requestAnimationFrame(() => {
          const newHeight = this.getViewHeight_();
          if (newHeight > 0 && newHeight !== this.lastRenderedHeight_) {
            this.fillCurrentViewport();
          }
        });
      });
      this.resizeObserver_.observe(this.scrollTarget);
    }
  }
  shouldRestoreFocus_() {
    if (!this.restoreFocusElement) {
      return false;
    }
    const active = getDeepActiveElement();
    return (
      this.restoreFocusElement === active ||
      (!!this.restoreFocusElement.shadowRoot &&
        this.restoreFocusElement.shadowRoot.activeElement === active)
    );
  }
  async onItemsChanged_() {
    if (this.items.length > 0) {
      const restoreFocus = this.shouldRestoreFocus_();
      await this.update_(true);
      if (restoreFocus) {
        setTimeout(() => {
          if (!this.restoreFocusElement) {
            return;
          }
          this.restoreFocusElement.focus();
          this.fire("focus-restored-for-test");
        }, 0);
      }
    } else {
      this.$.container.style.height = "0px";
      this.fire("items-rendered");
      this.fire("viewport-filled");
    }
  }
  getScrollTop_() {
    return this.scrollTarget === document.documentElement
      ? window.pageYOffset
      : this.scrollTarget.scrollTop;
  }
  getViewHeight_() {
    const offsetHeight =
      this.scrollTarget === document.documentElement
        ? window.innerHeight
        : this.scrollTarget.offsetHeight;
    return (
      this.getScrollTop_() -
      this.scrollOffset +
      Math.max(this.minViewportHeight || 0, offsetHeight)
    );
  }
  async update_(forceUpdateHeight) {
    if (!this.scrollTarget) {
      return;
    }
    const height = this.getViewHeight_();
    if (height <= 0) {
      return;
    }
    const added = await this.fillViewHeight_(height);
    this.fire("items-rendered");
    if (added || forceUpdateHeight) {
      await this.updateHeight_();
      this.fire("viewport-filled");
    }
  }
  async fillViewHeight_(height) {
    this.fire("fill-height-start");
    this.lastRenderedHeight_ = height;
    assert(this.items.length);
    const initialDomItemCount = this.domItems().length;
    if (initialDomItemCount === 0) {
      await this.updateNumItemsDisplayed_(1);
    }
    const itemHeight = this.domItemAverageHeight_();
    if (itemHeight === 0) {
      this.lastRenderedHeight_ = 0;
      return false;
    }
    const desiredDomItemCount = Math.min(
      Math.ceil(height / itemHeight),
      this.items.length
    );
    if (desiredDomItemCount > this.numItemsDisplayed_) {
      await this.updateNumItemsDisplayed_(desiredDomItemCount);
    }
    const added = initialDomItemCount !== desiredDomItemCount;
    if (added) {
      this.fire("fill-height-end");
    }
    return added;
  }
  async updateNumItemsDisplayed_(itemsToDisplay) {
    this.numItemsDisplayed_ = itemsToDisplay;
    if (this.numItemsDisplayed_ > 200 && this.chunkSize < 2) {
      console.warn(
        `cr-lazy-list: ${this.numItemsDisplayed_} list items rendered. ` +
          "If this is expected, consider chunking mode (chunkSize > 1) " +
          "to improve scrolling performance."
      );
    }
    await this.updateComplete;
  }
  domItems() {
    return this.chunkSize === 0
      ? this.$.slot.assignedElements()
      : Array.from(this.querySelectorAll(".chunk > *"));
  }
  domItemAverageHeight_() {
    assert(this.items.length > 0);
    const domItems = this.domItems();
    assert(domItems.length > 0);
    const firstDomItem = domItems.at(0);
    const lastDomItem = domItems.at(-1);
    const lastDomItemHeight = lastDomItem.offsetHeight;
    if (firstDomItem === lastDomItem && lastDomItemHeight === 0) {
      return 0;
    } else if (this.itemSize) {
      return this.itemSize;
    }
    let totalHeight = lastDomItem.offsetTop + lastDomItemHeight;
    if (this.chunkSize > 0) {
      totalHeight +=
        lastDomItem.offsetParent.offsetTop -
        firstDomItem.offsetParent.offsetTop;
    } else {
      totalHeight -= firstDomItem.offsetTop;
    }
    return totalHeight / domItems.length;
  }
  async updateHeight_() {
    await new Promise((resolve) => setTimeout(resolve, 0));
    const estScrollHeight =
      this.items.length > 0
        ? this.items.length * this.domItemAverageHeight_()
        : 0;
    this.$.container.style.height = estScrollHeight + "px";
  }
  async onScroll_() {
    const scrollTop = this.getScrollTop_();
    if (scrollTop <= 0 || this.numItemsDisplayed_ === this.items.length) {
      return;
    }
    await this.fillCurrentViewport();
  }
}
customElements.define(CrLazyListElement.is, CrLazyListElement);
let instance$s = null;
function getCss$q() {
  return (
    instance$s ||
    (instance$s = [
      ...[],
      css`
        :host {
          display: block;
          position: relative;
        }
        :host([using-default-scroll-target]) {
          overflow-y: auto;
        }
      `,
    ])
  );
}
class CrInfiniteListElement extends CrLitElement {
  static get is() {
    return "cr-infinite-list";
  }
  static get styles() {
    return getCss$q();
  }
  render() {
    render(
      html`<cr-lazy-list
        id="list"
        .scrollTarget="${this.scrollTarget}"
        .chunkSize="${this.chunkSize}"
        .scrollOffset="${this.scrollOffset}"
        .listItemHost="${this.getRootNode().host}"
        .items="${this.items}"
        .itemSize="${this.itemSize}"
        .template="${(item, index) =>
          this.template(item, index, index === this.focusedIndex ? 0 : -1)}"
        .restoreFocusElement="${this.focusedItem_}"
        @keydown="${this.onKeyDown_}"
        @focusin="${this.onItemFocus_}"
        @viewport-filled="${this.updateFocusedItem_}"
      >
      </cr-lazy-list>`,
      this,
      { host: this }
    );
    return html`<slot></slot>`;
  }
  static get properties() {
    return {
      chunkSize: { type: Number },
      scrollOffset: { type: Number },
      scrollTarget: { type: Object },
      usingDefaultScrollTarget: { type: Boolean, reflect: true },
      items: { type: Array },
      focusedIndex: { type: Number },
      itemSize: { type: Number },
      template: { type: Object },
      focusedItem_: { type: Object },
    };
  }
  #chunkSize_accessor_storage = 0;
  get chunkSize() {
    return this.#chunkSize_accessor_storage;
  }
  set chunkSize(value) {
    this.#chunkSize_accessor_storage = value;
  }
  #scrollOffset_accessor_storage = 0;
  get scrollOffset() {
    return this.#scrollOffset_accessor_storage;
  }
  set scrollOffset(value) {
    this.#scrollOffset_accessor_storage = value;
  }
  #scrollTarget_accessor_storage = this;
  get scrollTarget() {
    return this.#scrollTarget_accessor_storage;
  }
  set scrollTarget(value) {
    this.#scrollTarget_accessor_storage = value;
  }
  #usingDefaultScrollTarget_accessor_storage = true;
  get usingDefaultScrollTarget() {
    return this.#usingDefaultScrollTarget_accessor_storage;
  }
  set usingDefaultScrollTarget(value) {
    this.#usingDefaultScrollTarget_accessor_storage = value;
  }
  #items_accessor_storage = [];
  get items() {
    return this.#items_accessor_storage;
  }
  set items(value) {
    this.#items_accessor_storage = value;
  }
  #itemSize_accessor_storage = undefined;
  get itemSize() {
    return this.#itemSize_accessor_storage;
  }
  set itemSize(value) {
    this.#itemSize_accessor_storage = value;
  }
  #template_accessor_storage = () => html``;
  get template() {
    return this.#template_accessor_storage;
  }
  set template(value) {
    this.#template_accessor_storage = value;
  }
  #focusedIndex_accessor_storage = -1;
  get focusedIndex() {
    return this.#focusedIndex_accessor_storage;
  }
  set focusedIndex(value) {
    this.#focusedIndex_accessor_storage = value;
  }
  #focusedItem__accessor_storage = null;
  get focusedItem_() {
    return this.#focusedItem__accessor_storage;
  }
  set focusedItem_(value) {
    this.#focusedItem__accessor_storage = value;
  }
  willUpdate(changedProperties) {
    super.willUpdate(changedProperties);
    if (changedProperties.has("scrollTarget")) {
      this.usingDefaultScrollTarget = this.scrollTarget === this;
    }
    if (changedProperties.has("items")) {
      if (this.focusedIndex >= this.items.length) {
        this.focusedIndex = this.items.length - 1;
      } else if (this.focusedIndex === -1 && this.items.length > 0) {
        this.focusedIndex = 0;
      }
    }
  }
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has("focusedIndex")) {
      this.updateFocusedItem_();
    }
  }
  fillCurrentViewport() {
    const list = this.querySelector("cr-lazy-list");
    assert(list);
    return list.fillCurrentViewport();
  }
  ensureItemRendered(index) {
    const list = this.querySelector("cr-lazy-list");
    assert(list);
    return list.ensureItemRendered(index);
  }
  updateFocusedItem_() {
    if (this.focusedIndex === -1) {
      this.focusedItem_ = null;
      return;
    }
    const list = this.querySelector("cr-lazy-list");
    assert(list);
    this.focusedItem_ = list.domItems()[this.focusedIndex + 1] || null;
  }
  onItemFocus_(e) {
    const list = this.querySelector("cr-lazy-list");
    assert(list);
    const renderedItems = list.domItems();
    const focusedIdx = Array.from(renderedItems).findIndex(
      (item) => item === e.target || item.shadowRoot?.activeElement === e.target
    );
    if (focusedIdx !== -1) {
      this.focusedIndex = focusedIdx;
    }
  }
  async onKeyDown_(e) {
    if (e.shiftKey || (e.key !== "ArrowUp" && e.key !== "ArrowDown")) {
      return;
    }
    e.stopPropagation();
    e.preventDefault();
    this.focusedIndex =
      e.key === "ArrowUp"
        ? Math.max(0, this.focusedIndex - 1)
        : Math.min(this.items.length - 1, this.focusedIndex + 1);
    const list = this.querySelector("cr-lazy-list");
    assert(list);
    const element = await list.ensureItemRendered(this.focusedIndex);
    element.focus();
    element.scrollIntoViewIfNeeded();
  }
}
customElements.define(CrInfiniteListElement.is, CrInfiniteListElement);
class CrLazyRenderElement extends PolymerElement {
  static get is() {
    return "cr-lazy-render";
  }
  static get template() {
    return html$1`<slot></slot>`;
  }
  child_ = null;
  instance_ = null;
  get() {
    if (!this.child_) {
      this.render_();
    }
    assert(this.child_);
    return this.child_;
  }
  getIfExists() {
    return this.child_;
  }
  render_() {
    const template = this.shadowRoot
      .querySelector("slot")
      .assignedNodes({ flatten: true })
      .filter((n) => n.nodeType === Node.ELEMENT_NODE)[0];
    const TemplateClass = templatize(template, this, {
      mutableData: false,
      forwardHostProp: this._forwardHostPropV2,
    });
    const parentNode = this.parentNode;
    if (parentNode && !this.child_) {
      this.instance_ = new TemplateClass();
      this.child_ = this.instance_.root.firstElementChild;
      parentNode.insertBefore(this.instance_.root, this);
    }
  }
  _forwardHostPropV2(prop, value) {
    if (this.instance_) {
      this.instance_.forwardHostProp(prop, value);
    }
  }
}
customElements.define(CrLazyRenderElement.is, CrLazyRenderElement);
let instance$r = null;
function getCss$p() {
  return (
    instance$r ||
    (instance$r = [
      ...[],
      css`
        :host {
          --cr-toast-background: var(
            --color-toast-background,
            var(--cr-fallback-color-inverse-surface)
          );
          --cr-toast-button-color: var(
            --color-toast-button,
            var(--cr-fallback-color-inverse-primary)
          );
          --cr-toast-text-color: var(
            --color-toast-foreground,
            var(--cr-fallback-color-inverse-on-surface)
          );
          --cr-focus-outline-color: var(--cr-focus-outline-inverse-color);
        }
        :host {
          align-items: center;
          background: var(--cr-toast-background);
          border-radius: 8px;
          bottom: 0;
          box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.28);
          box-sizing: border-box;
          display: flex;
          line-height: 20px;
          margin: 24px;
          max-width: var(--cr-toast-max-width, 568px);
          min-height: 52px;
          min-width: 288px;
          opacity: 0;
          padding: 0 16px;
          position: fixed;
          transform: translateY(100px);
          transition: opacity 300ms, transform 300ms;
          visibility: hidden;
          z-index: 1;
        }
        :host-context([dir="ltr"]) {
          left: 0;
        }
        :host-context([dir="rtl"]) {
          right: 0;
        }
        :host([open]) {
          opacity: 1;
          transform: translateY(0);
          visibility: visible;
        }
        :host(:not([open])) ::slotted(*) {
          display: none;
        }
        :host ::slotted(*) {
          color: var(--cr-toast-text-color);
        }
        :host ::slotted(cr-button) {
          background-color: transparent !important;
          border: none !important;
          color: var(--cr-toast-button-color) !important;
          margin-inline-start: 32px !important;
          min-width: 52px !important;
          padding: 8px !important;
        }
        :host ::slotted(cr-button:hover) {
          background-color: transparent !important;
        }
        ::slotted(cr-button:last-of-type) {
          margin-inline-end: -8px;
        }
      `,
    ])
  );
}
function getHtml$n() {
  return html`<slot></slot>`;
}
class CrToastElement extends CrLitElement {
  static get is() {
    return "cr-toast";
  }
  static get styles() {
    return getCss$p();
  }
  render() {
    return getHtml$n.bind(this)();
  }
  static get properties() {
    return {
      duration: { type: Number },
      open: { type: Boolean, reflect: true },
    };
  }
  #duration_accessor_storage = 0;
  get duration() {
    return this.#duration_accessor_storage;
  }
  set duration(value) {
    this.#duration_accessor_storage = value;
  }
  #open_accessor_storage = false;
  get open() {
    return this.#open_accessor_storage;
  }
  set open(value) {
    this.#open_accessor_storage = value;
  }
  hideTimeoutId_ = null;
  constructor() {
    super();
    this.addEventListener("focusin", this.clearTimeout_);
    this.addEventListener("focusout", this.resetAutoHide_);
  }
  willUpdate(changedProperties) {
    super.willUpdate(changedProperties);
    if (changedProperties.has("duration") || changedProperties.has("open")) {
      this.resetAutoHide_();
    }
  }
  clearTimeout_() {
    if (this.hideTimeoutId_ !== null) {
      window.clearTimeout(this.hideTimeoutId_);
      this.hideTimeoutId_ = null;
    }
  }
  resetAutoHide_() {
    this.clearTimeout_();
    if (this.open && this.duration !== 0) {
      this.hideTimeoutId_ = window.setTimeout(() => {
        this.hide();
      }, this.duration);
    }
  }
  async show() {
    const shouldResetAutohide = this.open;
    this.removeAttribute("role");
    this.open = true;
    await this.updateComplete;
    this.setAttribute("role", "alert");
    if (shouldResetAutohide) {
      this.resetAutoHide_();
    }
  }
  async hide() {
    this.open = false;
    await this.updateComplete;
  }
}
customElements.define(CrToastElement.is, CrToastElement);
let instance$q = null;
function getCss$o() {
  return (
    instance$q ||
    (instance$q = [
      ...[getCss$y()],
      css`
        :host {
          color: var(--cr-primary-text-color);
          display: block;
          font-size: 0.875rem;
        }
        :host([is-empty]) {
          padding-block: 80px;
        }
        cr-dialog::part(dialog) {
          --cr-dialog-width: min(calc(100% - 32px), 512px);
        }
        :host([in-side-panel_]) cr-toast {
          margin: 16px;
        }
        #clusters {
          margin: 0 auto;
          max-width: var(--cluster-max-width);
          min-width: var(--cluster-min-width);
          padding: var(--first-cluster-padding-top)
            var(--cluster-padding-horizontal) 0;
        }
        :host([in-side-panel_]) #clusters {
          min-width: 0;
          padding: 0;
        }
        :host(:not([in-side-panel_])) history-cluster {
          overflow-clip-margin: 8px;
        }
        :host-context(.focus-outline-visible) history-cluster:focus,
        history-cluster:focus-visible {
          outline: none;
        }
        :host([in-side-panel_]) history-cluster {
          border-bottom: none;
        }
        :host([in-side-panel_]) history-cluster[is-last] {
          border-bottom: none;
        }
        #placeholder {
          align-items: center;
          color: var(--md-loading-message-color);
          display: flex;
          flex: 1;
          font-size: inherit;
          font-weight: 500;
          height: 100%;
          justify-content: center;
        }
        #footer {
          display: flex;
          justify-content: center;
          padding: 0 var(--cluster-padding-horizontal)
            var(--cluster-padding-vertical);
        }
        :host([in-side-panel_]) #footer {
          padding-top: var(--cluster-padding-vertical);
        }
        :host([in-side-panel_]) cr-dialog {
          --cr-dialog-background-color: var(
            --color-history-clusters-side-panel-dialog-background
          );
          --cr-primary-text-color: var(
            --color-history-clusters-side-panel-dialog-primary-foreground
          );
          --cr-secondary-text-color: var(
            --color-history-clusters-side-panel-dialog-secondary-foreground
          );
          --cr-dialog-title-font-size: 16px;
          --cr-dialog-title-slot-padding-bottom: 8px;
          font-weight: 500;
        }
        :host([in-side-panel_]) cr-dialog::part(dialog) {
          --cr-scrollable-border-color: var(
            --color-history-clusters-side-panel-dialog-divider
          );
          border-radius: 12px;
          box-shadow: var(--cr-elevation-3);
        }
        .spinner-icon {
          height: 100%;
          width: 100%;
        }
      `,
    ])
  );
}
function getHtml$m() {
  return html`
<div id="placeholder" ?hidden="${!this.computePlaceholderText_()}">
  ${this.computePlaceholderText_()}
</div>
<cr-infinite-list id="clusters"
    .items="${this.clusters_}"
    @hide-visit="${this.onHideVisit_}" @hide-visits="${this.onHideVisits_}"
    @remove-visits="${this.onRemoveVisits_}"
    ?hidden="${!this.clusters_.length}" .scrollTarget="${this.scrollTarget}"
    .scrollOffset="${this.scrollOffset}"
    .template=${(item, index, tabindex) => html` <history-cluster
      .cluster="${item}"
      .index="${index}"
      .query="${this.resultQuery_}"
      tabindex="${tabindex}"
      @remove-cluster="${this.onRemoveCluster_}"
      ?is-first="${!index}"
      ?is-last="${this.isLastCluster_(index)}"
    >
    </history-cluster>`}>
</cr-infinite-list>
<div id="footer" ?hidden="${this.getLoadMoreButtonHidden_()}">
  <cr-button id="loadMoreButton" @click="${this.onLoadMoreButtonClick_}"
      ?hidden="${this.showSpinner_}">
    ${this.i18n("loadMoreButtonLabel")}
  </cr-button>
  <img class="spinner-icon" src="chrome://resources/images/throbber_small.svg"
      ?hidden="${!this.showSpinner_}"></img>
</div>
${
  this.showConfirmationDialog_
    ? html`<cr-dialog
        consume-keydown-event
        @cancel="${this.onConfirmationDialogCancel_}"
      >
        <div slot="title">${this.i18n("removeSelected")}</div>
        <div slot="body">${this.i18n("deleteWarning")}</div>
        <div slot="button-container">
          <cr-button
            class="cancel-button"
            @click="${this.onCancelButtonClick_}"
          >
            ${this.i18n("cancel")}
          </cr-button>
          <cr-button
            class="action-button"
            @click="${this.onRemoveButtonClick_}"
          >
            ${this.i18n("deleteConfirm")}
          </cr-button>
        </div>
      </cr-dialog>`
    : ""
}
<cr-toast id="confirmationToast" duration="5000">
  <div>${this.i18n("removeFromHistoryToast")}</div>
</cr-toast>`;
}
function jsDateToMojoDate$1(date) {
  const windowsEpoch = Date.UTC(1601, 0, 1, 0, 0, 0, 0);
  const unixEpoch = Date.UTC(1970, 0, 1, 0, 0, 0, 0);
  const epochDeltaInMs = unixEpoch - windowsEpoch;
  const internalValue = BigInt(date.valueOf() + epochDeltaInMs) * BigInt(1e3);
  return { internalValue: internalValue };
}
const HistoryClustersElementBase = I18nMixinLit(CrLitElement);
class HistoryClustersElement extends HistoryClustersElementBase {
  static get is() {
    return "history-clusters";
  }
  static get styles() {
    return getCss$o();
  }
  render() {
    return getHtml$m.bind(this)();
  }
  static get properties() {
    return {
      inSidePanel_: { type: Boolean, reflect: true },
      query: { type: String },
      timeRangeStart: { type: Object },
      canLoadMore_: { type: Boolean },
      clusters_: { type: Array },
      hasResult_: { type: Boolean },
      resultQuery_: { type: String },
      showSpinner_: { type: Boolean },
      showConfirmationDialog_: { type: Boolean },
      visitsToBeRemoved_: { type: Array },
      scrollOffset: { type: Number },
      scrollTarget: { type: Object },
      isActive: { type: Boolean, reflect: true },
      isEmpty: { type: Boolean, reflect: true },
    };
  }
  #isActive_accessor_storage = true;
  get isActive() {
    return this.#isActive_accessor_storage;
  }
  set isActive(value) {
    this.#isActive_accessor_storage = value;
  }
  #isEmpty_accessor_storage = true;
  get isEmpty() {
    return this.#isEmpty_accessor_storage;
  }
  set isEmpty(value) {
    this.#isEmpty_accessor_storage = value;
  }
  #query_accessor_storage = "";
  get query() {
    return this.#query_accessor_storage;
  }
  set query(value) {
    this.#query_accessor_storage = value;
  }
  #scrollOffset_accessor_storage = 0;
  get scrollOffset() {
    return this.#scrollOffset_accessor_storage;
  }
  set scrollOffset(value) {
    this.#scrollOffset_accessor_storage = value;
  }
  #scrollTarget_accessor_storage = document.documentElement;
  get scrollTarget() {
    return this.#scrollTarget_accessor_storage;
  }
  set scrollTarget(value) {
    this.#scrollTarget_accessor_storage = value;
  }
  #timeRangeStart_accessor_storage;
  get timeRangeStart() {
    return this.#timeRangeStart_accessor_storage;
  }
  set timeRangeStart(value) {
    this.#timeRangeStart_accessor_storage = value;
  }
  #canLoadMore__accessor_storage = false;
  get canLoadMore_() {
    return this.#canLoadMore__accessor_storage;
  }
  set canLoadMore_(value) {
    this.#canLoadMore__accessor_storage = value;
  }
  #clusters__accessor_storage = [];
  get clusters_() {
    return this.#clusters__accessor_storage;
  }
  set clusters_(value) {
    this.#clusters__accessor_storage = value;
  }
  #hasResult__accessor_storage = false;
  get hasResult_() {
    return this.#hasResult__accessor_storage;
  }
  set hasResult_(value) {
    this.#hasResult__accessor_storage = value;
  }
  #resultQuery__accessor_storage = "";
  get resultQuery_() {
    return this.#resultQuery__accessor_storage;
  }
  set resultQuery_(value) {
    this.#resultQuery__accessor_storage = value;
  }
  callbackRouter_;
  #inSidePanel__accessor_storage = loadTimeData.getBoolean("inSidePanel");
  get inSidePanel_() {
    return this.#inSidePanel__accessor_storage;
  }
  set inSidePanel_(value) {
    this.#inSidePanel__accessor_storage = value;
  }
  lastOffsetHeight_ = 0;
  resizeObserver_ = new ResizeObserver(() => {
    if (this.lastOffsetHeight_ === 0) {
      this.lastOffsetHeight_ = this.scrollTarget.offsetHeight;
      return;
    }
    if (this.scrollTarget.offsetHeight > this.lastOffsetHeight_) {
      this.lastOffsetHeight_ = this.scrollTarget.offsetHeight;
      this.onScrollOrResize_();
    }
  });
  scrollDebounce_ = 200;
  scrollListener_ = () => this.onScrollOrResize_();
  onClustersQueryResultListenerId_ = null;
  onClusterImageUpdatedListenerId_ = null;
  onVisitsRemovedListenerId_ = null;
  onHistoryDeletedListenerId_ = null;
  onQueryChangedByUserListenerId_ = null;
  pageHandler_;
  #showConfirmationDialog__accessor_storage = false;
  get showConfirmationDialog_() {
    return this.#showConfirmationDialog__accessor_storage;
  }
  set showConfirmationDialog_(value) {
    this.#showConfirmationDialog__accessor_storage = value;
  }
  #showSpinner__accessor_storage = false;
  get showSpinner_() {
    return this.#showSpinner__accessor_storage;
  }
  set showSpinner_(value) {
    this.#showSpinner__accessor_storage = value;
  }
  scrollTimeout_ = null;
  #visitsToBeRemoved__accessor_storage = [];
  get visitsToBeRemoved_() {
    return this.#visitsToBeRemoved__accessor_storage;
  }
  set visitsToBeRemoved_(value) {
    this.#visitsToBeRemoved__accessor_storage = value;
  }
  constructor() {
    super();
    this.pageHandler_ = BrowserProxyImpl.getInstance().handler;
    this.callbackRouter_ = BrowserProxyImpl.getInstance().callbackRouter;
  }
  connectedCallback() {
    super.connectedCallback();
    FocusOutlineManager.forDocument(document);
    this.onClustersQueryResultListenerId_ =
      this.callbackRouter_.onClustersQueryResult.addListener(
        this.onClustersQueryResult_.bind(this)
      );
    this.onClusterImageUpdatedListenerId_ =
      this.callbackRouter_.onClusterImageUpdated.addListener(
        this.onClusterImageUpdated_.bind(this)
      );
    this.onVisitsRemovedListenerId_ =
      this.callbackRouter_.onVisitsRemoved.addListener(
        this.onVisitsRemoved_.bind(this)
      );
    this.onHistoryDeletedListenerId_ =
      this.callbackRouter_.onHistoryDeleted.addListener(
        this.onHistoryDeleted_.bind(this)
      );
    this.onQueryChangedByUserListenerId_ =
      this.callbackRouter_.onQueryChangedByUser.addListener(
        this.onQueryChangedByUser_.bind(this)
      );
    if (this.inSidePanel_) {
      this.pageHandler_.showSidePanelUI();
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    assert(this.onClustersQueryResultListenerId_);
    this.callbackRouter_.removeListener(this.onClustersQueryResultListenerId_);
    this.onClustersQueryResultListenerId_ = null;
    assert(this.onVisitsRemovedListenerId_);
    this.callbackRouter_.removeListener(this.onVisitsRemovedListenerId_);
    this.onVisitsRemovedListenerId_ = null;
    assert(this.onHistoryDeletedListenerId_);
    this.callbackRouter_.removeListener(this.onHistoryDeletedListenerId_);
    this.onHistoryDeletedListenerId_ = null;
    assert(this.onQueryChangedByUserListenerId_);
    this.callbackRouter_.removeListener(this.onQueryChangedByUserListenerId_);
    this.onQueryChangedByUserListenerId_ = null;
    assert(this.onClusterImageUpdatedListenerId_);
    this.callbackRouter_.removeListener(this.onClusterImageUpdatedListenerId_);
    this.onClusterImageUpdatedListenerId_ = null;
  }
  willUpdate(changedProperties) {
    super.willUpdate(changedProperties);
    if (
      changedProperties.has("query") ||
      changedProperties.has("timeRangeStart")
    ) {
      this.onQueryChanged_();
    }
    const changedPrivateProperties = changedProperties;
    if (
      changedPrivateProperties.has("hasResult_") ||
      changedPrivateProperties.has("clusters_")
    ) {
      this.isEmpty = this.hasResult_ && this.clusters_.length === 0;
    }
  }
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has("scrollTarget")) {
      const oldTarget = changedProperties.get("scrollTarget");
      if (oldTarget) {
        this.resizeObserver_.disconnect();
        if (this.isActive || changedProperties.has("isActive")) {
          oldTarget.removeEventListener("scroll", this.scrollListener_);
        }
      }
      if (this.scrollTarget) {
        this.resizeObserver_.observe(this.scrollTarget);
        if (this.isActive) {
          this.scrollTarget.addEventListener("scroll", this.scrollListener_);
        }
      }
    } else if (changedProperties.has("isActive")) {
      if (this.isActive) {
        this.scrollTarget.addEventListener("scroll", this.scrollListener_);
      } else {
        this.scrollTarget.removeEventListener("scroll", this.scrollListener_);
      }
    }
    const changedPrivateProperties = changedProperties;
    if (changedPrivateProperties.has("clusters_")) {
      const previous = changedPrivateProperties.get("clusters_");
      const clustersRemoved =
        previous && previous.length > this.clusters_.length;
      if (
        clustersRemoved &&
        this.canLoadMore_ &&
        this.$.clusters.offsetHeight < this.scrollTarget.offsetHeight
      ) {
        this.onLoadMoreButtonClick_();
      }
    }
  }
  onCancelButtonClick_() {
    this.visitsToBeRemoved_ = [];
    this.getConfirmationDialog_().close();
  }
  onConfirmationDialogCancel_() {
    this.visitsToBeRemoved_ = [];
  }
  onLoadMoreButtonClick_() {
    if (this.hasResult_ && this.canLoadMore_) {
      this.showSpinner_ = true;
      this.canLoadMore_ = false;
      this.pageHandler_.loadMoreClusters(this.resultQuery_);
    }
  }
  onRemoveButtonClick_() {
    this.removeVisits_();
    this.getConfirmationDialog_().close();
  }
  onHideVisit_(event) {
    this.pageHandler_.hideVisits([event.detail]);
  }
  onHideVisits_(event) {
    this.pageHandler_.hideVisits(event.detail);
  }
  onRemoveCluster_(event) {
    const index = event.detail;
    this.clusters_ = [
      ...this.clusters_.slice(0, index),
      ...this.clusters_.slice(index + 1),
    ];
  }
  async onRemoveVisits_(event) {
    if (this.visitsToBeRemoved_.length) {
      return;
    }
    this.visitsToBeRemoved_ = event.detail;
    if (this.visitsToBeRemoved_.length === 1) {
      this.removeVisits_();
      return;
    }
    if (!this.showConfirmationDialog_) {
      this.showConfirmationDialog_ = true;
      await this.updateComplete;
    }
    this.getConfirmationDialog_().showModal();
  }
  setScrollDebounceForTest(debounce) {
    this.scrollDebounce_ = debounce;
  }
  onScrolledToBottom_() {
    if (this.shadowRoot.querySelector(":focus-visible")) {
      return;
    }
    this.onLoadMoreButtonClick_();
  }
  getConfirmationDialog_() {
    const dialog = this.shadowRoot.querySelector("cr-dialog");
    assert(dialog);
    return dialog;
  }
  computePlaceholderText_() {
    if (!this.hasResult_) {
      return "";
    }
    return this.clusters_.length
      ? ""
      : loadTimeData.getString(
          this.resultQuery_ ? "noSearchResults" : "historyClustersNoResults"
        );
  }
  getLoadMoreButtonHidden_() {
    return (
      !this.hasResult_ || this.clusters_.length === 0 || !this.canLoadMore_
    );
  }
  isLastCluster_(index) {
    return index === this.clusters_.length - 1;
  }
  onBrowserIdle_() {
    return new Promise((resolve) => {
      requestIdleCallback(() => {
        resolve();
      });
    });
  }
  onClustersQueryResult_(result) {
    this.hasResult_ = true;
    this.canLoadMore_ = result.canLoadMore;
    if (result.isContinuation) {
      this.clusters_ = [...this.clusters_.slice(), ...result.clusters];
    } else {
      this.scrollTarget.scrollTop = 0;
      this.clusters_ = result.clusters;
      this.resultQuery_ = result.query;
    }
    this.onBrowserIdle_().then(() => {
      if (
        (this.$.clusters.offsetHeight < this.scrollTarget.offsetHeight ||
          this.scrollTarget.scrollHeight <= this.scrollTarget.clientHeight) &&
        this.canLoadMore_
      ) {
        this.onLoadMoreButtonClick_();
      }
    });
    this.showSpinner_ = false;
  }
  onClusterImageUpdated_(clusterIndex, imageUrl) {
    const cluster = this.clusters_[clusterIndex];
    const newCluster = Object.assign({}, cluster);
    newCluster.imageUrl = imageUrl;
    this.clusters_[clusterIndex] = newCluster;
    this.requestUpdate();
  }
  onQueryChanged_() {
    this.onBrowserIdle_().then(() => {
      if (this.hasResult_ && this.canLoadMore_) {
        this.canLoadMore_ = false;
      }
      this.pageHandler_.startQueryClusters(
        this.query.trim(),
        this.timeRangeStart ? jsDateToMojoDate$1(this.timeRangeStart) : null,
        new URLSearchParams(window.location.search).has("recluster")
      );
    });
  }
  onVisitsRemoved_(removedVisits) {
    if (removedVisits.length === 1) {
      this.$.confirmationToast.show();
    }
  }
  onHistoryDeleted_() {
    this.onQueryChanged_();
  }
  onQueryChangedByUser_(query) {
    this.fire("query-changed-by-user", query);
  }
  onScrollOrResize_() {
    if (this.scrollTimeout_) {
      clearTimeout(this.scrollTimeout_);
    }
    this.scrollTimeout_ = setTimeout(
      () => this.onScrollTimeout_(),
      this.scrollDebounce_
    );
  }
  onScrollTimeout_() {
    this.scrollTimeout_ = null;
    const lowerScroll =
      this.scrollTarget.scrollHeight -
      this.scrollTarget.scrollTop -
      this.scrollTarget.offsetHeight;
    if (lowerScroll < 500) {
      this.onScrolledToBottom_();
    }
  }
  removeVisits_() {
    this.pageHandler_.removeVisits(this.visitsToBeRemoved_).then(() => {
      this.visitsToBeRemoved_ = [];
    });
  }
}
customElements.define(HistoryClustersElement.is, HistoryClustersElement);
let instance$p = null;
function getCss$n() {
  return (
    instance$p ||
    (instance$p = [
      ...[],
      css`
        :host {
          --cr-chip-border-radius: 8px;
          --cr-chip-color: var(
            --color-chip-foreground,
            var(--cr-fallback-color-on-surface)
          );
          --cr-chip-font-size: 12px;
          --cr-chip-height: 28px;
        }
        button {
          --cr-icon-button-margin-start: 0;
          --cr-icon-color: var(
            --color-chip-icon,
            var(--cr-fallback-color-primary)
          );
          --cr-icon-ripple-margin: 0;
          --cr-icon-ripple-size: 16px;
          --cr-icon-size: contain;
          --iron-icon-fill-color: var(
            --color-chip-icon,
            var(--cr-fallback-color-primary)
          );
          --iron-icon-height: 16px;
          --iron-icon-width: 16px;
          align-items: center;
          appearance: none;
          background-color: transparent;
          border: 1px solid
            var(--color-chip-border, var(--cr-fallback-color-tonal-outline));
          border-radius: var(--cr-chip-border-radius);
          color: var(--cr-chip-color);
          cursor: pointer;
          font-family: inherit;
          display: flex;
          flex-direction: row;
          font-size: var(--cr-chip-font-size);
          font-weight: 500;
          gap: 4px;
          height: var(--cr-chip-height);
          overflow: hidden;
          padding: 0 8px;
          position: relative;
          white-space: nowrap;
        }
        button:not(:is([disabled], [selected])):hover {
          background-color: transparent;
          border-color: var(
            --color-chip-border,
            var(--cr-fallback-color-tonal-outline)
          );
        }
        button:focus-visible {
          outline: solid 2px var(--cr-focus-outline-color);
          outline-offset: 2px;
        }
        button[disabled] {
          cursor: default;
          opacity: var(--cr-disabled-opacity);
        }
        button[selected] {
          --cr-icon-color: var(
            --color-chip-icon-selected,
            var(--cr-fallback-color-on-tonal-container)
          );
          --iron-icon-fill-color: var(
            --color-chip-icon-selected,
            var(--cr-fallback-color-on-tonal-container)
          );
          background-color: var(
            --color-chip-background-selected,
            var(--cr-fallback-color-tonal-container)
          );
          border-color: var(
            --color-chip-background-selected,
            var(--cr-fallback-color-tonal-container)
          );
          color: var(
            --color-chip-foreground-selected,
            var(--cr-fallback-color-on-tonal-container)
          );
          padding: 0 8px;
        }
        #hoverLayer {
          display: none;
        }
        button:hover #hoverLayer {
          background: var(--cr-hover-on-subtle-background-color);
          display: block;
          inset: 0;
          pointer-events: none;
          position: absolute;
        }
        #ink {
          --paper-ripple-opacity: 1;
          color: var(--cr-active-neutral-on-subtle-background-color);
          display: block;
        }
      `,
    ])
  );
}
function getHtml$l() {
  return html` <button
    id="button"
    ?selected="${this.selected}"
    ?disabled="${this.disabled}"
    aria-pressed="${this.selected}"
    role="${this.chipRole}"
    aria-label="${this.chipAriaLabel}"
  >
    <div id="hoverLayer"></div>
    <slot></slot>
  </button>`;
}
const CrChipElementBase = CrRippleMixin(CrLitElement);
class CrChipElement extends CrChipElementBase {
  static get is() {
    return "cr-chip";
  }
  static get styles() {
    return getCss$n();
  }
  render() {
    return getHtml$l.bind(this)();
  }
  static get properties() {
    return {
      disabled: { type: Boolean },
      chipAriaLabel: { type: String },
      chipRole: { type: String },
      selected: { type: Boolean, reflect: true },
    };
  }
  #disabled_accessor_storage = false;
  get disabled() {
    return this.#disabled_accessor_storage;
  }
  set disabled(value) {
    this.#disabled_accessor_storage = value;
  }
  #chipAriaLabel_accessor_storage = "";
  get chipAriaLabel() {
    return this.#chipAriaLabel_accessor_storage;
  }
  set chipAriaLabel(value) {
    this.#chipAriaLabel_accessor_storage = value;
  }
  #chipRole_accessor_storage = "";
  get chipRole() {
    return this.#chipRole_accessor_storage;
  }
  set chipRole(value) {
    this.#chipRole_accessor_storage = value;
  }
  #selected_accessor_storage = false;
  get selected() {
    return this.#selected_accessor_storage;
  }
  set selected(value) {
    this.#selected_accessor_storage = value;
  }
  constructor() {
    super();
    this.ensureRippleOnPointerdown();
  }
  createRipple() {
    this.rippleContainer = this.shadowRoot.querySelector("button");
    return super.createRipple();
  }
}
customElements.define(CrChipElement.is, CrChipElement);
let instance$o = null;
function getCss$m() {
  return (
    instance$o ||
    (instance$o = [
      ...[],
      css`
        .md-select {
          --md-arrow-width: 7px;
          --md-select-bg-color: transparent;
          --md-select-option-bg-color: white;
          --md-select-side-padding: 10px;
          --md-select-text-color: inherit;
          -webkit-appearance: none;
          background: url(//resources/images/arrow_down.svg)
            calc(100% - var(--md-select-side-padding)) center no-repeat;
          background-color: var(--md-select-bg-color);
          background-size: var(--md-arrow-width);
          border: solid 1px
            var(
              --color-combobox-container-outline,
              var(--cr-fallback-color-neutral-outline)
            );
          border-radius: 8px;
          box-sizing: border-box;
          color: var(--md-select-text-color);
          cursor: pointer;
          font-family: inherit;
          font-size: 12px;
          height: 36px;
          max-width: 100%;
          outline: none;
          padding-block-end: 0;
          padding-block-start: 0;
          padding-inline-end: calc(
            var(--md-select-side-padding) + var(--md-arrow-width) + 3px
          );
          padding-inline-start: var(--md-select-side-padding);
          width: var(--md-select-width, 200px);
        }
        @media (prefers-color-scheme: dark) {
          .md-select {
            --md-select-option-bg-color: var(--google-grey-900-white-4-percent);
            background-image: url(//resources/images/dark/arrow_down.svg);
          }
        }
        .md-select:hover {
          background-color: var(
            --color-comboxbox-ink-drop-hovered,
            var(--cr-hover-on-subtle-background-color)
          );
        }
        .md-select :-webkit-any(option, optgroup) {
          background-color: var(--md-select-option-bg-color);
        }
        .md-select[disabled] {
          background-color: var(
            --color-combobox-background-disabled,
            var(--cr-fallback-color-disabled-background)
          );
          border-color: transparent;
          color: var(
            --color-textfield-foreground-disabled,
            var(--cr-fallback-color-disabled-foreground)
          );
          opacity: 1;
          pointer-events: none;
        }
        .md-select:focus {
          outline: solid 2px var(--cr-focus-outline-color);
          outline-offset: -1px;
        }
        :host-context([dir="rtl"]) .md-select {
          background-position-x: var(--md-select-side-padding);
        }
      `,
    ])
  );
}
let instance$n = null;
function getCss$l() {
  return (
    instance$n ||
    (instance$n = [
      ...[getCss$m()],
      css`
        :host {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 12px;
        }
        hr {
          margin: 0;
          width: 1px;
          height: 20px;
          border: 0;
          background: var(
            --color-history-embeddings-divider,
            var(--cr-fallback-color-divider)
          );
        }
        #suggestions {
          display: flex;
          gap: 8px;
        }
        .suggestion-label {
          text-transform: lowercase;
        }
      `,
    ])
  );
}
function getHtml$k() {
  return html`<!--_html_template_start_-->
<select id="showByGroupSelectMenu" class="md-select"
    aria-label="${this.i18n("historyEmbeddingsShowByLabel")}"
    .value="${this.showResultsByGroup}"
    @change="${this.onShowByGroupSelectMenuChanged_}"
    ?hidden="${!this.enableShowResultsByGroupOption}">
  <option value="false">
    ${this.i18n("historyEmbeddingsShowByDate")}
  </option>
  <option value="true">
    ${this.i18n("historyEmbeddingsShowByGroup")}
  </option>
</select>

<hr ?hidden="${!this.enableShowResultsByGroupOption}"></hr>

<div id="suggestions">
  ${this.suggestions_.map(
    (item, index) => html`
      <cr-chip
        @click="${this.onSuggestionClick_}"
        data-index="${index}"
        ?selected="${this.isSuggestionSelected_(item)}"
        chip-aria-label="${item.ariaLabel}"
      >
        <cr-icon icon="cr:check" ?hidden="${!this.isSuggestionSelected_(item)}">
        </cr-icon>
        <span class="suggestion-label">${item.label}</span>
      </cr-chip>
    `
  )}
</div>
<!--_html_template_end_-->`;
}
function generateSuggestions() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);
  last7Days.setHours(0, 0, 0, 0);
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);
  last30Days.setHours(0, 0, 0, 0);
  return [
    {
      label: loadTimeData.getString("historyEmbeddingsSuggestion1"),
      timeRangeStart: yesterday,
      ariaLabel: loadTimeData.getString(
        "historyEmbeddingsSuggestion1AriaLabel"
      ),
    },
    {
      label: loadTimeData.getString("historyEmbeddingsSuggestion2"),
      timeRangeStart: last7Days,
      ariaLabel: loadTimeData.getString(
        "historyEmbeddingsSuggestion2AriaLabel"
      ),
    },
    {
      label: loadTimeData.getString("historyEmbeddingsSuggestion3"),
      timeRangeStart: last30Days,
      ariaLabel: loadTimeData.getString(
        "historyEmbeddingsSuggestion3AriaLabel"
      ),
    },
  ];
}
const HistoryEmbeddingsFilterChipsElementBase = I18nMixinLit(CrLitElement);
class HistoryEmbeddingsFilterChips extends HistoryEmbeddingsFilterChipsElementBase {
  static get is() {
    return "cr-history-embeddings-filter-chips";
  }
  static get styles() {
    return getCss$l();
  }
  render() {
    return getHtml$k.bind(this)();
  }
  static get properties() {
    return {
      enableShowResultsByGroupOption: { type: Boolean },
      timeRangeStart: { type: Object },
      selectedSuggestion: { type: String, notify: true },
      showResultsByGroup: { type: Boolean, notify: true },
      suggestions_: { type: Array },
    };
  }
  #enableShowResultsByGroupOption_accessor_storage = false;
  get enableShowResultsByGroupOption() {
    return this.#enableShowResultsByGroupOption_accessor_storage;
  }
  set enableShowResultsByGroupOption(value) {
    this.#enableShowResultsByGroupOption_accessor_storage = value;
  }
  #selectedSuggestion_accessor_storage;
  get selectedSuggestion() {
    return this.#selectedSuggestion_accessor_storage;
  }
  set selectedSuggestion(value) {
    this.#selectedSuggestion_accessor_storage = value;
  }
  #showResultsByGroup_accessor_storage = false;
  get showResultsByGroup() {
    return this.#showResultsByGroup_accessor_storage;
  }
  set showResultsByGroup(value) {
    this.#showResultsByGroup_accessor_storage = value;
  }
  #suggestions__accessor_storage = generateSuggestions();
  get suggestions_() {
    return this.#suggestions__accessor_storage;
  }
  set suggestions_(value) {
    this.#suggestions__accessor_storage = value;
  }
  #timeRangeStart_accessor_storage;
  get timeRangeStart() {
    return this.#timeRangeStart_accessor_storage;
  }
  set timeRangeStart(value) {
    this.#timeRangeStart_accessor_storage = value;
  }
  willUpdate(changedProperties) {
    super.willUpdate(changedProperties);
    if (changedProperties.has("timeRangeStart")) {
      this.onTimeRangeStartChanged_();
    }
  }
  isSuggestionSelected_(suggestion) {
    return this.selectedSuggestion === suggestion;
  }
  onShowByGroupSelectMenuChanged_() {
    this.showResultsByGroup = this.$.showByGroupSelectMenu.value === "true";
  }
  onTimeRangeStartChanged_() {
    if (
      this.timeRangeStart?.getTime() ===
      this.selectedSuggestion?.timeRangeStart.getTime()
    ) {
      return;
    }
    this.selectedSuggestion = this.suggestions_.find(
      (suggestion) =>
        suggestion.timeRangeStart.getTime() === this.timeRangeStart?.getTime()
    );
  }
  onSuggestionClick_(e) {
    const index = Number(e.currentTarget.dataset["index"]);
    const clickedSuggestion = this.suggestions_[index];
    assert(clickedSuggestion);
    if (this.isSuggestionSelected_(clickedSuggestion)) {
      this.selectedSuggestion = undefined;
    } else {
      this.selectedSuggestion = clickedSuggestion;
    }
  }
}
customElements.define(
  HistoryEmbeddingsFilterChips.is,
  HistoryEmbeddingsFilterChips
);
let instance$m = null;
function getCss$k() {
  return (
    instance$m ||
    (instance$m = [
      ...[],
      css`
        .buttons {
          --cr-feedback-buttons-icon-size_: 16px;
          display: grid;
          grid-auto-columns: var(--cr-feedback-buttons-icon-size_);
          grid-auto-rows: var(--cr-feedback-buttons-icon-size_);
          grid-auto-flow: column;
          gap: 12px;
          align-items: center;
          justify-items: center;
        }
        cr-icon-button {
          --cr-icon-button-fill-color: currentColor;
          --cr-icon-button-icon-size: var(--cr-feedback-buttons-icon-size_);
          --cr-icon-button-size: 24px;
          margin: 0;
        }
      `,
    ])
  );
}
function getHtml$j() {
  return html` <div class="buttons">
    <cr-icon-button
      id="thumbsUp"
      iron-icon="${this.getThumbsUpIcon_()}"
      aria-label="${this.thumbsUpLabel_}"
      title="${this.thumbsUpLabel_}"
      aria-pressed="${this.getThumbsUpAriaPressed_()}"
      @click="${this.onThumbsUpClick_}"
      ?disabled="${this.disabled}"
    >
    </cr-icon-button>
    <cr-icon-button
      id="thumbsDown"
      iron-icon="${this.getThumbsDownIcon_()}"
      aria-label="${this.thumbsDownLabel_}"
      title="${this.thumbsDownLabel_}"
      aria-pressed="${this.getThumbsDownAriaPressed_()}"
      @click="${this.onThumbsDownClick_}"
      ?disabled="${this.disabled}"
    >
    </cr-icon-button>
  </div>`;
}
var CrFeedbackOption;
(function (CrFeedbackOption) {
  CrFeedbackOption[(CrFeedbackOption["THUMBS_DOWN"] = 0)] = "THUMBS_DOWN";
  CrFeedbackOption[(CrFeedbackOption["THUMBS_UP"] = 1)] = "THUMBS_UP";
  CrFeedbackOption[(CrFeedbackOption["UNSPECIFIED"] = 2)] = "UNSPECIFIED";
})(CrFeedbackOption || (CrFeedbackOption = {}));
class CrFeedbackButtonsElement extends CrLitElement {
  static get is() {
    return "cr-feedback-buttons";
  }
  static get styles() {
    return getCss$k();
  }
  render() {
    return getHtml$j.bind(this)();
  }
  static get properties() {
    return {
      selectedOption: { type: Number },
      thumbsDownLabel_: { type: String },
      thumbsUpLabel_: { type: String },
      disabled: { type: Boolean },
    };
  }
  #selectedOption_accessor_storage = CrFeedbackOption.UNSPECIFIED;
  get selectedOption() {
    return this.#selectedOption_accessor_storage;
  }
  set selectedOption(value) {
    this.#selectedOption_accessor_storage = value;
  }
  #thumbsDownLabel__accessor_storage = loadTimeData.getString("thumbsDown");
  get thumbsDownLabel_() {
    return this.#thumbsDownLabel__accessor_storage;
  }
  set thumbsDownLabel_(value) {
    this.#thumbsDownLabel__accessor_storage = value;
  }
  #thumbsUpLabel__accessor_storage = loadTimeData.getString("thumbsUp");
  get thumbsUpLabel_() {
    return this.#thumbsUpLabel__accessor_storage;
  }
  set thumbsUpLabel_(value) {
    this.#thumbsUpLabel__accessor_storage = value;
  }
  #disabled_accessor_storage = false;
  get disabled() {
    return this.#disabled_accessor_storage;
  }
  set disabled(value) {
    this.#disabled_accessor_storage = value;
  }
  getThumbsDownAriaPressed_() {
    return this.selectedOption === CrFeedbackOption.THUMBS_DOWN;
  }
  getThumbsDownIcon_() {
    return this.selectedOption === CrFeedbackOption.THUMBS_DOWN
      ? "cr:thumbs-down-filled"
      : "cr:thumbs-down";
  }
  getThumbsUpAriaPressed_() {
    return this.selectedOption === CrFeedbackOption.THUMBS_UP;
  }
  getThumbsUpIcon_() {
    return this.selectedOption === CrFeedbackOption.THUMBS_UP
      ? "cr:thumbs-up-filled"
      : "cr:thumbs-up";
  }
  async notifySelectedOptionChanged_() {
    await this.updateComplete;
    this.fire("selected-option-changed", { value: this.selectedOption });
  }
  onThumbsDownClick_() {
    this.selectedOption =
      this.selectedOption === CrFeedbackOption.THUMBS_DOWN
        ? CrFeedbackOption.UNSPECIFIED
        : CrFeedbackOption.THUMBS_DOWN;
    this.notifySelectedOptionChanged_();
  }
  onThumbsUpClick_() {
    this.selectedOption =
      this.selectedOption === CrFeedbackOption.THUMBS_UP
        ? CrFeedbackOption.UNSPECIFIED
        : CrFeedbackOption.THUMBS_UP;
    this.notifySelectedOptionChanged_();
  }
}
customElements.define(CrFeedbackButtonsElement.is, CrFeedbackButtonsElement);
let instance$l = null;
function getCss$j() {
  return (
    instance$l ||
    (instance$l = [
      ...[],
      css`
        :host {
          --cr-loading-gradient-color-start: var(
            --color-loading-gradient-start,
            transparent
          );
          --cr-loading-gradient-color-middle: var(
            --color-loading-gradient-middle,
            var(--cr-fallback-color-primary-container)
          );
          --cr-loading-gradient-color-end: var(
            --color-loading-gradient-end,
            rgb(231, 248, 237)
          );
          display: flex;
          width: 100%;
          height: fit-content;
          position: relative;
        }
        @media (prefers-color-scheme: dark) {
          :host {
            --cr-loading-gradient-color-end: var(
              --color-loading-gradient-end,
              rgb(15, 82, 35)
            );
          }
        }
        #gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            var(--cr-loading-gradient-color-start) 0%,
            var(--cr-loading-gradient-color-middle) 20%,
            var(--cr-loading-gradient-color-end) 40%,
            var(--cr-loading-gradient-color-start) 60%,
            var(--cr-loading-gradient-color-middle) 80%,
            var(--cr-loading-gradient-color-end) 100%
          );
          background-position: 100% 100%;
          background-size: 250% 250%;
          animation: gradient 2s infinite linear;
        }
        @keyframes gradient {
          0% {
            background-position: 100% 100%;
          }
          100% {
            background-position: 0% 0%;
          }
        }
      `,
    ])
  );
}
function getHtml$i() {
  return html` <div id="gradient"></div>
    <slot @slotchange="${this.onSlotchange_}"></slot>`;
}
let count = 0;
class CrLoadingGradientElement extends CrLitElement {
  static get is() {
    return "cr-loading-gradient";
  }
  static get styles() {
    return getCss$j();
  }
  render() {
    return getHtml$i.bind(this)();
  }
  onSlotchange_() {
    const clipPath = this.querySelector("svg clipPath");
    assert(clipPath);
    const generatedId = `crLoadingGradient${count++}`;
    clipPath.id = generatedId;
    this.style.clipPath = `url(#${generatedId})`;
  }
}
customElements.define(CrLoadingGradientElement.is, CrLoadingGradientElement);
const HOVERED_STYLE = "hovered";
const MouseHoverableMixinLit = (superClass) => {
  class MouseHoverableMixinLit extends superClass {
    firstUpdated(changedProperties) {
      super.firstUpdated(changedProperties);
      this.addEventListener("pointerenter", (e) => {
        const hostElement = e.currentTarget;
        hostElement.classList.toggle(HOVERED_STYLE, e.pointerType === "mouse");
      });
      this.addEventListener("pointerleave", (e) => {
        if (e.pointerType !== "mouse") {
          return;
        }
        const hostElement = e.currentTarget;
        hostElement.classList.remove(HOVERED_STYLE);
      });
    }
  }
  return MouseHoverableMixinLit;
};
let instance$k = null;
function getCss$i() {
  return (
    instance$k ||
    (instance$k = [
      ...[getCss$A(), getCss$B()],
      css`
        :host {
          box-sizing: border-box;
          display: block;
          position: relative;
          width: 100%;
        }
        #item {
          --cr-url-list-item-image-container-border_: 2px solid white;
          --cr-url-list-item-image-container-border-radius_: 5px;
          align-items: center;
          box-sizing: border-box;
          cursor: default;
          display: flex;
          height: var(--cr-url-list-item-height, 48px);
          padding: var(--cr-url-list-item-padding, 4px 16px);
          width: 100%;
        }
        @media (prefers-color-scheme: dark) {
          #item {
            --cr-url-list-item-image-container-border_: 2px solid black;
          }
        }
        :host([size="compact"]) #item {
          padding: var(--cr-url-list-item-padding, 6px 16px);
          height: var(--cr-url-list-item-height, 36px);
        }
        :host([size="large"]) #item {
          padding: var(--cr-url-list-item-padding, 6px 16px);
          height: var(--cr-url-list-item-height, 68px);
        }
        :host([size="medium"]) #item,
        :host([size="large"]) #item {
          --cr-url-list-item-image-container-border-radius_: 9px;
        }
        :host(.hovered),
        :host([force-hover]) {
          background: var(--cr-hover-background-color);
        }
        :host(.active),
        :host-context(.focus-outline-visible):host(:focus-within) {
          background: var(--cr-active-background-color);
        }
        #anchor,
        #button {
          appearance: none;
          background: transparent;
          border: 0;
          position: absolute;
          inset: 0;
        }
        #anchor:focus,
        #button:focus {
          outline: 0;
        }
        @media (forced-colors: active) {
          #anchor:focus,
          #button:focus {
            outline: var(--cr-focus-outline-hcm);
          }
        }
        ::slotted([slot="prefix"]) {
          margin-inline-end: 16px;
        }
        #iconContainer {
          align-items: center;
          background: var(
            --color-list-item-url-favicon-background,
            var(--cr-fallback-color-neutral-container)
          );
          border-radius: 4px;
          display: flex;
          flex-shrink: 0;
          height: var(--cr-url-list-item-container-height, 40px);
          justify-content: center;
          margin-inline-end: var(--cr-url-list-item-icon-margin-end, 16px);
          overflow: hidden;
          width: var(--cr-url-list-item-container-width, 40px);
        }
        :host([size="compact"]) #iconContainer {
          height: 24px;
          margin-inline-end: 8px;
          width: 24px;
        }
        :host([is-folder_]) #iconContainer {
          background: var(
            --color-list-item-folder-icon-background,
            var(--cr-fallback-color-primary-container)
          );
          color: var(
            --color-list-item-folder-icon-foreground,
            var(--cr-fallback-color-on-primary-container)
          );
        }
        :host([size="large"]) #iconContainer {
          height: 56px;
          margin-inline-end: 16px;
          width: 56px;
        }
        :host([size="medium"]) #iconContainer,
        :host([size="large"]) #iconContainer {
          border-radius: 8px;
        }
        #folder-icon {
          display: flex;
        }
        .favicon {
          background-position: center center;
          background-repeat: no-repeat;
          height: 16px;
          width: 16px;
        }
        :host([size="large"]) .folder-and-count {
          align-items: center;
          display: grid;
          grid-template-columns: repeat(2, 50%);
          grid-template-rows: repeat(2, 50%);
          height: 100%;
          justify-items: center;
          width: 100%;
        }
        .folder-and-count .image-container {
          border-bottom: var(--cr-url-list-item-image-container-border_);
          border-radius: 0
            var(--cr-url-list-item-image-container-border-radius_) 0 0;
          box-sizing: border-box;
          height: 100%;
          width: 100%;
        }
        :host-context([dir="rtl"]) .folder-and-count .image-container {
          border-radius: var(--cr-url-list-item-image-container-border-radius_)
            0 0 0;
        }
        .folder-and-count .image-container img {
          height: 100%;
          object-fit: cover;
          opacity: 95%;
          width: 100%;
        }
        .folder-and-count:not(:has(div:nth-child(3)))
          .image-container:first-of-type {
          border-bottom: none;
          border-inline-end: var(--cr-url-list-item-image-container-border_);
          border-radius: var(--cr-url-list-item-image-container-border-radius_)
            0 0 var(--cr-url-list-item-image-container-border-radius_);
          grid-row: 1 / span 2;
        }
        :host-context([dir="rtl"])
          .folder-and-count:not(:has(div:nth-child(3)))
          .image-container:first-of-type {
          border-radius: 0
            var(--cr-url-list-item-image-container-border-radius_)
            var(--cr-url-list-item-image-container-border-radius_) 0;
        }
        .folder-and-count:not(:has(div:nth-child(2)))
          .image-container:first-of-type {
          border: none;
          border-radius: var(--cr-url-list-item-image-container-border-radius_);
          grid-column: 1 / span 2;
          grid-row: 1 / span 2;
        }
        .folder {
          --cr-icon-color: currentColor;
          --cr-icon-size: 20px;
          height: var(--cr-icon-size);
          margin: 0;
          width: var(--cr-icon-size);
        }
        :host([size="compact"]) .folder {
          --cr-icon-size: 16px;
        }
        .count {
          --cr-url-list-item-count-border-radius: 4px;
          display: none;
        }
        :host([size="large"]) .count {
          align-items: center;
          background: var(
            --color-list-item-folder-icon-background,
            var(--cr-fallback-color-primary-container)
          );
          border-radius: var(--cr-url-list-item-count-border-radius) 0 0 0;
          color: var(
            --color-list-item-folder-icon-foreground,
            var(--cr-fallback-color-on-primary-container)
          );
          display: flex;
          font-weight: 500;
          grid-column: 2;
          grid-row: 2;
          height: 100%;
          justify-content: center;
          width: 100%;
          z-index: 1;
        }
        :host-context([dir="rtl"]):host([size="large"]) .count {
          border-radius: 0 var(--cr-url-list-item-count-border-radius) 0 0;
        }
        .folder-and-count:has(div:nth-child(2)) .count {
          border-radius: 0;
        }
        :host([size="large"])
          .folder-and-count:not(:has(div:nth-child(2))):has(.image-container)
          .count {
          border-inline-start: var(--cr-url-list-item-image-container-border_);
          border-top: var(--cr-url-list-item-image-container-border_);
        }
        .image-container {
          background: black;
          border-radius: var(--cr-url-list-item-image-container-border-radius_);
          height: 100%;
          width: 100%;
        }
        @media (prefers-color-scheme: dark) {
          .image-container {
            background: transparent;
          }
        }
        .metadata {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 0;
          width: 100%;
        }
        :host([has-slotted-content_]) .metadata {
          display: none;
        }
        :host([size="compact"]) .metadata {
          align-items: center;
          flex-direction: row;
        }
        :host([size="compact"]) .metadata,
        :host([size="medium"]) .metadata {
          gap: var(--cr-url-list-item-metadata-gap, 4px);
        }
        :host([size="large"]) .metadata {
          gap: var(--cr-url-list-item-metadata-gap, 2px);
        }
        .title {
          color: var(--cr-primary-text-color);
          font-family: inherit;
          font-size: 12px;
          font-weight: 500;
        }
        .title:focus {
          outline: none;
        }
        .descriptions {
          align-items: center;
          display: flex;
          gap: 3px;
          height: 14px;
        }
        :host([size="compact"]) .descriptions {
          display: contents;
        }
        :host([size="large"]) .descriptions {
          align-items: flex-start;
          flex-direction: column;
          gap: 4px;
          height: auto;
        }
        :host(:not([has-descriptions_])) .descriptions {
          display: none;
        }
        .description {
          color: var(--cr-secondary-text-color);
          display: flex;
          font-size: 11px;
          font-weight: 400;
          max-width: 100%;
        }
        .description-text:has(+ .description-meta:not([hidden])) {
          flex-shrink: 1;
        }
        :host([reverse-elide-description]) .description-text {
          direction: rtl;
        }
        :host([size="compact"]) .description {
          font-size: 12px;
        }
        .title,
        .description-text,
        .description-meta {
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .description-meta {
          flex-shrink: 0;
          padding-inline-start: 4px;
        }
        .badges {
          align-items: flex-start;
          display: flex;
          gap: 4px;
          min-width: fit-content;
        }
        :host(:not([has-badges])) .badges {
          display: none;
        }
        :host([has-badges]) .badges {
          margin-inline-start: 4px;
        }
        .suffix {
          align-items: center;
          color: var(--cr-secondary-text-color);
          display: flex;
          flex-shrink: 0;
          font-size: 11px;
          font-weight: 400;
          line-height: 20px;
          margin-inline-end: -4px;
          margin-inline-start: auto;
        }
        ::slotted([slot="suffix"]) {
          display: none;
        }
        ::slotted(cr-icon-button[slot="suffix"]) {
          --cr-icon-button-icon-size: 16px;
          --cr-icon-button-size: 24px;
          --cr-icon-button-margin-end: 0;
          --cr-icon-button-margin-start: 0;
        }
        ::slotted([slot="suffix"]:not(cr-icon-button)) {
          margin-inline-end: 16px;
        }
        :host(.hovered) ::slotted([slot="suffix"]),
        :host-context(.focus-outline-visible):host(:focus-within)
          ::slotted([slot="suffix"]),
        :host([always-show-suffix]) ::slotted([slot="suffix"]) {
          display: block;
        }
        .url-image {
          height: 100%;
          object-fit: cover;
          object-position: center center;
          opacity: 95%;
          width: 100%;
        }
      `,
    ])
  );
}
function getImageHtml(item, index) {
  if (!this.shouldShowImageUrl_(item, index)) {
    return "";
  }
  return html` <div
    class="image-container"
    ?hidden="${!this.firstImageLoaded_}"
  >
    <img
      class="folder-image"
      is="cr-auto-img"
      auto-src="${item}"
      draggable="false"
    />
  </div>`;
}
function getFolderImagesHtml() {
  if (!this.shouldShowFolderImages_()) {
    return "";
  }
  return html`${this.imageUrls.map((item, index) =>
    getImageHtml.bind(this)(item, index)
  )}`;
}
function getHtml$h() {
  return html`
    <a
      id="anchor"
      .href="${this.url}"
      ?hidden="${!this.asAnchor}"
      target="${this.asAnchorTarget}"
      aria-label="${this.getItemAriaLabel_()}"
      aria-description="${this.getItemAriaDescription_() || nothing}"
    >
    </a>
    <button
      id="button"
      ?hidden="${this.asAnchor}"
      aria-label="${this.getItemAriaLabel_()}"
      aria-description="${this.getItemAriaDescription_() || nothing}"
    ></button>

    <div id="item">
      <slot name="prefix"></slot>
      <div id="iconContainer">
        <div
          class="favicon"
          ?hidden="${!this.shouldShowFavicon_()}"
          .style="background-image: ${this.getFavicon_()};"
        ></div>
        <div class="image-container" ?hidden="${!this.shouldShowUrlImage_()}">
          <img
            class="url-image"
            is="cr-auto-img"
            auto-src="${this.imageUrls[0]}"
            draggable="false"
          />
        </div>
        <div
          class="folder-and-count"
          ?hidden="${!this.shouldShowFolderCount_()}"
        >
          ${getFolderImagesHtml.bind(this)()}
          <slot id="folder-icon" name="folder-icon">
            <div
              class="folder cr-icon icon-folder-open"
              ?hidden="${!this.shouldShowFolderIcon_()}"
            ></div>
          </slot>
          <div class="count">${this.getDisplayedCount_()}</div>
        </div>
      </div>
      <slot
        id="content"
        name="content"
        @slotchange="${this.onContentSlotChange_}"
      >
      </slot>
      <div id="metadata" class="metadata">
        <span class="title">${this.title}</span>
        <div class="descriptions">
          <div class="description" ?hidden="${!this.description}">
            <span class="description-text">${this.description}</span>
            <span class="description-meta" ?hidden="${!this.descriptionMeta}">
              &middot; ${this.descriptionMeta}
            </span>
          </div>
          <div id="badgesContainer" class="badges">
            <slot
              id="badges"
              name="badges"
              @slotchange="${this.onBadgesSlotChange_}"
            >
            </slot>
          </div>
        </div>
      </div>
      <div class="suffix">
        <slot name="suffix"></slot>
      </div>
    </div>
    <slot name="footer"></slot>
  `;
}
var CrUrlListItemSize;
(function (CrUrlListItemSize) {
  CrUrlListItemSize["COMPACT"] = "compact";
  CrUrlListItemSize["MEDIUM"] = "medium";
  CrUrlListItemSize["LARGE"] = "large";
})(CrUrlListItemSize || (CrUrlListItemSize = {}));
const CrUrlListItemElementBase = MouseHoverableMixinLit(CrLitElement);
class CrUrlListItemElement extends CrUrlListItemElementBase {
  static get is() {
    return "cr-url-list-item";
  }
  static get styles() {
    return getCss$i();
  }
  render() {
    return getHtml$h.bind(this)();
  }
  static get properties() {
    return {
      alwaysShowSuffix: { type: Boolean, reflect: true },
      itemAriaLabel: { type: String },
      itemAriaDescription: { type: String },
      count: { type: Number },
      description: { type: String },
      url: { type: String },
      title: { reflect: true, type: String },
      hasBadges: { type: Boolean, reflect: true },
      hasDescriptions_: { type: Boolean, reflect: true },
      hasSlottedContent_: { type: Boolean, reflect: true },
      reverseElideDescription: { type: Boolean, reflect: true },
      isFolder_: { type: Boolean, reflect: true },
      size: { type: String, reflect: true },
      imageUrls: { type: Array },
      firstImageLoaded_: { type: Boolean, state: true },
      forceHover: { reflect: true, type: Boolean },
      descriptionMeta: { type: String },
      asAnchor: { type: Boolean },
      asAnchorTarget: { type: String },
    };
  }
  #alwaysShowSuffix_accessor_storage = false;
  get alwaysShowSuffix() {
    return this.#alwaysShowSuffix_accessor_storage;
  }
  set alwaysShowSuffix(value) {
    this.#alwaysShowSuffix_accessor_storage = value;
  }
  #asAnchor_accessor_storage = false;
  get asAnchor() {
    return this.#asAnchor_accessor_storage;
  }
  set asAnchor(value) {
    this.#asAnchor_accessor_storage = value;
  }
  #asAnchorTarget_accessor_storage = "_self";
  get asAnchorTarget() {
    return this.#asAnchorTarget_accessor_storage;
  }
  set asAnchorTarget(value) {
    this.#asAnchorTarget_accessor_storage = value;
  }
  #itemAriaLabel_accessor_storage;
  get itemAriaLabel() {
    return this.#itemAriaLabel_accessor_storage;
  }
  set itemAriaLabel(value) {
    this.#itemAriaLabel_accessor_storage = value;
  }
  #itemAriaDescription_accessor_storage;
  get itemAriaDescription() {
    return this.#itemAriaDescription_accessor_storage;
  }
  set itemAriaDescription(value) {
    this.#itemAriaDescription_accessor_storage = value;
  }
  #count_accessor_storage;
  get count() {
    return this.#count_accessor_storage;
  }
  set count(value) {
    this.#count_accessor_storage = value;
  }
  #description_accessor_storage;
  get description() {
    return this.#description_accessor_storage;
  }
  set description(value) {
    this.#description_accessor_storage = value;
  }
  #reverseElideDescription_accessor_storage = false;
  get reverseElideDescription() {
    return this.#reverseElideDescription_accessor_storage;
  }
  set reverseElideDescription(value) {
    this.#reverseElideDescription_accessor_storage = value;
  }
  #hasBadges_accessor_storage = false;
  get hasBadges() {
    return this.#hasBadges_accessor_storage;
  }
  set hasBadges(value) {
    this.#hasBadges_accessor_storage = value;
  }
  #hasDescriptions__accessor_storage = false;
  get hasDescriptions_() {
    return this.#hasDescriptions__accessor_storage;
  }
  set hasDescriptions_(value) {
    this.#hasDescriptions__accessor_storage = value;
  }
  #hasSlottedContent__accessor_storage = false;
  get hasSlottedContent_() {
    return this.#hasSlottedContent__accessor_storage;
  }
  set hasSlottedContent_(value) {
    this.#hasSlottedContent__accessor_storage = value;
  }
  #isFolder__accessor_storage = false;
  get isFolder_() {
    return this.#isFolder__accessor_storage;
  }
  set isFolder_(value) {
    this.#isFolder__accessor_storage = value;
  }
  #size_accessor_storage = CrUrlListItemSize.MEDIUM;
  get size() {
    return this.#size_accessor_storage;
  }
  set size(value) {
    this.#size_accessor_storage = value;
  }
  #title_accessor_storage = "";
  get title() {
    return this.#title_accessor_storage;
  }
  set title(value) {
    this.#title_accessor_storage = value;
  }
  #url_accessor_storage;
  get url() {
    return this.#url_accessor_storage;
  }
  set url(value) {
    this.#url_accessor_storage = value;
  }
  #imageUrls_accessor_storage = [];
  get imageUrls() {
    return this.#imageUrls_accessor_storage;
  }
  set imageUrls(value) {
    this.#imageUrls_accessor_storage = value;
  }
  #firstImageLoaded__accessor_storage = false;
  get firstImageLoaded_() {
    return this.#firstImageLoaded__accessor_storage;
  }
  set firstImageLoaded_(value) {
    this.#firstImageLoaded__accessor_storage = value;
  }
  #forceHover_accessor_storage = false;
  get forceHover() {
    return this.#forceHover_accessor_storage;
  }
  set forceHover(value) {
    this.#forceHover_accessor_storage = value;
  }
  #descriptionMeta_accessor_storage = "";
  get descriptionMeta() {
    return this.#descriptionMeta_accessor_storage;
  }
  set descriptionMeta(value) {
    this.#descriptionMeta_accessor_storage = value;
  }
  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
    FocusOutlineManager.forDocument(document);
    this.addEventListener("pointerdown", () => this.setActiveState_(true));
    this.addEventListener("pointerup", () => this.setActiveState_(false));
    this.addEventListener("pointerleave", () => this.setActiveState_(false));
  }
  willUpdate(changedProperties) {
    super.willUpdate(changedProperties);
    if (
      changedProperties.has("hasBadges") ||
      changedProperties.has("description")
    ) {
      this.hasDescriptions_ =
        !!this.description || this.hasBadges || !!this.descriptionMeta;
    }
    if (changedProperties.has("count")) {
      this.isFolder_ = this.count !== undefined;
    }
    if (changedProperties.has("size")) {
      assert(Object.values(CrUrlListItemSize).includes(this.size));
    }
  }
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has("imageUrls")) {
      this.resetFirstImageLoaded_();
    }
  }
  connectedCallback() {
    super.connectedCallback();
    this.resetFirstImageLoaded_();
  }
  focus() {
    this.getFocusableElement().focus();
  }
  getFocusableElement() {
    if (this.asAnchor) {
      return this.$.anchor;
    } else {
      return this.$.button;
    }
  }
  resetFirstImageLoaded_() {
    this.firstImageLoaded_ = false;
    const image = this.shadowRoot.querySelector("img");
    if (!image) {
      return;
    }
    if (image.complete) {
      this.firstImageLoaded_ = true;
      return;
    }
    image.addEventListener(
      "load",
      () => {
        this.firstImageLoaded_ = true;
      },
      { once: true }
    );
  }
  getItemAriaDescription_() {
    return this.itemAriaDescription || this.description;
  }
  getItemAriaLabel_() {
    return this.itemAriaLabel || this.title;
  }
  getDisplayedCount_() {
    if (this.count && this.count > 999) {
      return "99+";
    }
    return this.count === undefined ? "" : this.count.toString();
  }
  getFavicon_() {
    return getFaviconForPageURL(this.url || "", false);
  }
  shouldShowImageUrl_(_url, index) {
    return index <= 1;
  }
  onBadgesSlotChange_() {
    this.hasBadges =
      this.$.badges.assignedElements({ flatten: true }).length > 0;
  }
  onContentSlotChange_() {
    this.hasSlottedContent_ =
      this.$.content.assignedElements({ flatten: true }).length > 0;
  }
  setActiveState_(active) {
    this.classList.toggle("active", active);
  }
  shouldShowFavicon_() {
    return (
      this.url !== undefined &&
      (this.size === CrUrlListItemSize.COMPACT || this.imageUrls.length === 0)
    );
  }
  shouldShowUrlImage_() {
    return (
      this.url !== undefined &&
      !(
        this.size === CrUrlListItemSize.COMPACT || this.imageUrls.length === 0
      ) &&
      this.firstImageLoaded_
    );
  }
  shouldShowFolderImages_() {
    return this.size !== CrUrlListItemSize.COMPACT;
  }
  shouldShowFolderIcon_() {
    return (
      this.size === CrUrlListItemSize.COMPACT || this.imageUrls.length === 0
    );
  }
  shouldShowFolderCount_() {
    return this.url === undefined;
  }
}
customElements.define(CrUrlListItemElement.is, CrUrlListItemElement);
const div$2 = document.createElement("div");
div$2.innerHTML = getTrustedHTML`<!-- TODO(b/328300718): Replace icons. -->
<cr-iconset name="history-embeddings" size="24">
  <svg>
    <defs>
      <g id="search">
        <path d="M16.6 20L10.3 13.7C9.8 14.1 9.225 14.4167 8.575 14.65C7.925 14.8833 7.23333 15 6.5 15C4.68333 15 3.14167 14.375 1.875 13.125C0.625 11.8583 0 10.3167 0 8.5C0 6.68333 0.625 5.15 1.875 3.9C3.14167 2.63333 4.68333 2 6.5 2C7.01667 2 7.51667 2.05833 8 2.175C8.48333 2.275 8.94167 2.43333 9.375 2.65L7.825 4.2C7.60833 4.13333 7.39167 4.08333 7.175 4.05C6.95833 4.01667 6.73333 4 6.5 4C5.25 4 4.18333 4.44167 3.3 5.325C2.43333 6.19167 2 7.25 2 8.5C2 9.75 2.43333 10.8167 3.3 11.7C4.18333 12.5667 5.25 13 6.5 13C7.66667 13 8.66667 12.625 9.5 11.875C10.35 11.1083 10.8417 10.15 10.975 9H12.975C12.925 9.63333 12.7833 10.2333 12.55 10.8C12.3333 11.3667 12.05 11.8667 11.7 12.3L18 18.6L16.6 20ZM14.5 11C14.5 9.46667 13.9667 8.16667 12.9 7.1C11.8333 6.03333 10.5333 5.5 9 5.5C10.5333 5.5 11.8333 4.96667 12.9 3.9C13.9667 2.83333 14.5 1.53333 14.5 -9.53674e-07C14.5 1.53333 15.0333 2.83333 16.1 3.9C17.1667 4.96667 18.4667 5.5 20 5.5C18.4667 5.5 17.1667 6.03333 16.1 7.1C15.0333 8.16667 14.5 9.46667 14.5 11Z">
        </path>
      </g>
      <g id="by-group">
        <path d="M3 18v-2h6v2H3Zm0-5v-2h12v2H3Zm0-5V6h18v2H3Z"></path>
      </g>
      <g id="heading">
        <path d="M19 9L17.75 6.25L15 5L17.75 3.75L19 0.999999L20.25 3.75L23 5L20.25 6.25L19 9ZM19 23L17.75 20.25L15 19L17.75 17.75L19 15L20.25 17.75L23 19L20.25 20.25L19 23ZM10 20L7.5 14.5L2 12L7.5 9.5L10 4L12.5 9.5L18 12L12.5 14.5L10 20ZM10 15.15L11 13L13.15 12L11 11L10 8.85L9 11L6.85 12L9 13L10 15.15Z">
        </path>
      </g>
    </defs>
  </svg>
</cr-iconset>
`;
const iconsets$2 = div$2.querySelectorAll("cr-iconset");
for (const iconset of iconsets$2) {
  document.head.appendChild(iconset);
}
let instance$j = null;
function getCss$h() {
  return (
    instance$j ||
    (instance$j = [
      ...[],
      css`
        :host {
          --gradient-start-color_: var(
            --color-history-embeddings-image-background-gradient-start,
            var(--cr-fallback-color-primary-container)
          );
          --gradient-end-color_: var(
            --color-history-embeddings-image-background-gradient-end,
            rgb(231, 248, 237)
          );
          --illustration-color_: var(--gradient-end-color_);
          align-items: center;
          background: linear-gradient(
            131deg,
            var(--gradient-start-color_) 12.23%,
            var(--gradient-end-color_) 78.96%
          );
          display: flex;
          height: 100%;
          justify-content: center;
          overflow: hidden;
          position: relative;
          width: 100%;
        }
        #illustrationPath {
          fill: var(--illustration-color_);
        }
        #image {
          height: 100%;
          inset: 0;
          object-fit: cover;
          position: absolute;
          width: 100%;
        }
        @media (prefers-color-scheme: dark) {
          :host {
            --gradient-end-color_: var(
              --color-history-embeddings-image-background-gradient-end,
              rgb(15, 82, 35)
            );
            --illustration-color_: var(--gradient-start-color_);
          }
        }
      `,
    ])
  );
}
function getHtml$g() {
  return html`
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="42"
      height="42"
      viewBox="0 0 42 42"
    >
      <path
        id="illustrationPath"
        d="M15.1906 0.931046C6.16922 -2.98707 -2.98707 6.16923 0.931046 15.1906L1.57886 16.6822C2.77508 19.4364 2.77508 22.5636 1.57885 25.3178L0.931044 26.8094C-2.98707 35.8308 6.16923 44.9871 15.1906 41.069L16.6822 40.4211C19.4364 39.2249 22.5636 39.2249 25.3178 40.4211L26.8094 41.069C35.8308 44.9871 44.9871 35.8308 41.0689 26.8094L40.4211 25.3178C39.2249 22.5636 39.2249 19.4364 40.4211 16.6822L41.069 15.1906C44.9871 6.16922 35.8308 -2.98706 26.8094 0.931049L25.3178 1.57886C22.5635 2.77508 19.4364 2.77508 16.6822 1.57886L15.1906 0.931046Z"
      ></path>
    </svg>

    <img
      id="image"
      is="cr-auto-img"
      auto-src="${this.imageUrl_}"
      ?hidden="${!this.hasImage}"
      alt=""
    />
  `;
}
class HistoryEmbeddingsResultImageElement extends CrLitElement {
  static get is() {
    return "cr-history-embeddings-result-image";
  }
  static get styles() {
    return getCss$h();
  }
  render() {
    return getHtml$g.bind(this)();
  }
  static get properties() {
    return {
      hasImage: { type: Boolean, reflect: true },
      imageUrl_: { type: String },
      inSidePanel: { type: Boolean, reflect: true },
      searchResult: { type: Object },
    };
  }
  #hasImage_accessor_storage = false;
  get hasImage() {
    return this.#hasImage_accessor_storage;
  }
  set hasImage(value) {
    this.#hasImage_accessor_storage = value;
  }
  #imageUrl__accessor_storage = null;
  get imageUrl_() {
    return this.#imageUrl__accessor_storage;
  }
  set imageUrl_(value) {
    this.#imageUrl__accessor_storage = value;
  }
  #inSidePanel_accessor_storage = false;
  get inSidePanel() {
    return this.#inSidePanel_accessor_storage;
  }
  set inSidePanel(value) {
    this.#inSidePanel_accessor_storage = value;
  }
  #searchResult_accessor_storage = null;
  get searchResult() {
    return this.#searchResult_accessor_storage;
  }
  set searchResult(value) {
    this.#searchResult_accessor_storage = value;
  }
  willUpdate(changedProperties) {
    super.willUpdate(changedProperties);
    if (!loadTimeData.getBoolean("enableHistoryEmbeddingsImages")) {
      return;
    }
    if (changedProperties.has("searchResult")) {
      this.imageUrl_ = null;
      this.hasImage = false;
      if (this.searchResult?.isUrlKnownToSync) {
        this.fetchImageForSearchResult_();
      }
    }
  }
  async fetchImageForSearchResult_() {
    assert(this.searchResult);
    const searchResultUrl = this.searchResult.url;
    const { result: result } =
      await PageImageServiceBrowserProxy.getInstance().handler.getPageImageUrl(
        ClientId.HistoryEmbeddings,
        searchResultUrl,
        { suggestImages: true, optimizationGuideImages: true }
      );
    if (result && searchResultUrl === this.searchResult.url) {
      this.imageUrl_ = result.imageUrl.url;
      this.hasImage = true;
    }
  }
}
customElements.define(
  HistoryEmbeddingsResultImageElement.is,
  HistoryEmbeddingsResultImageElement
);
const AnswerStatusSpec = { $: mojo.internal.Enum() };
var AnswerStatus;
(function (AnswerStatus) {
  AnswerStatus[(AnswerStatus["MIN_VALUE"] = 0)] = "MIN_VALUE";
  AnswerStatus[(AnswerStatus["MAX_VALUE"] = 7)] = "MAX_VALUE";
  AnswerStatus[(AnswerStatus["kUnspecified"] = 0)] = "kUnspecified";
  AnswerStatus[(AnswerStatus["kLoading"] = 1)] = "kLoading";
  AnswerStatus[(AnswerStatus["kSuccess"] = 2)] = "kSuccess";
  AnswerStatus[(AnswerStatus["kUnanswerable"] = 3)] = "kUnanswerable";
  AnswerStatus[(AnswerStatus["kModelUnavailable"] = 4)] = "kModelUnavailable";
  AnswerStatus[(AnswerStatus["kExecutionFailure"] = 5)] = "kExecutionFailure";
  AnswerStatus[(AnswerStatus["kExecutionCanceled"] = 6)] = "kExecutionCanceled";
  AnswerStatus[(AnswerStatus["kFiltered"] = 7)] = "kFiltered";
})(AnswerStatus || (AnswerStatus = {}));
const UserFeedbackSpec = { $: mojo.internal.Enum() };
var UserFeedback;
(function (UserFeedback) {
  UserFeedback[(UserFeedback["MIN_VALUE"] = 0)] = "MIN_VALUE";
  UserFeedback[(UserFeedback["MAX_VALUE"] = 2)] = "MAX_VALUE";
  UserFeedback[(UserFeedback["kUserFeedbackUnspecified"] = 0)] =
    "kUserFeedbackUnspecified";
  UserFeedback[(UserFeedback["kUserFeedbackNegative"] = 1)] =
    "kUserFeedbackNegative";
  UserFeedback[(UserFeedback["kUserFeedbackPositive"] = 2)] =
    "kUserFeedbackPositive";
})(UserFeedback || (UserFeedback = {}));
class PageHandlerPendingReceiver {
  handle;
  constructor(handle) {
    this.handle = mojo.internal.interfaceSupport.getEndpointForReceiver(handle);
  }
  bindInBrowser(scope = "context") {
    mojo.internal.interfaceSupport.bind(
      this.handle,
      "history_embeddings.mojom.PageHandler",
      scope
    );
  }
}
class PageHandlerRemote {
  proxy;
  $;
  onConnectionError;
  constructor(handle) {
    this.proxy = new mojo.internal.interfaceSupport.InterfaceRemoteBase(
      PageHandlerPendingReceiver,
      handle
    );
    this.$ = new mojo.internal.interfaceSupport.InterfaceRemoteBaseWrapper(
      this.proxy
    );
    this.onConnectionError = this.proxy.getConnectionErrorEventRouter();
  }
  setPage(page) {
    this.proxy.sendMessage(
      578368592,
      PageHandler_SetPage_ParamsSpec.$,
      null,
      [page],
      false
    );
  }
  search(query) {
    this.proxy.sendMessage(
      1836875116,
      PageHandler_Search_ParamsSpec.$,
      null,
      [query],
      false
    );
  }
  sendQualityLog(selectedIndices, numEnteredChars) {
    this.proxy.sendMessage(
      935934490,
      PageHandler_SendQualityLog_ParamsSpec.$,
      null,
      [selectedIndices, numEnteredChars],
      false
    );
  }
  recordSearchResultsMetrics(
    nonEmptyResults,
    userClickedResult,
    answerShown,
    answerCitationClicked,
    otherHistoryResultClicked,
    queryWordCount
  ) {
    this.proxy.sendMessage(
      602978586,
      PageHandler_RecordSearchResultsMetrics_ParamsSpec.$,
      null,
      [
        nonEmptyResults,
        userClickedResult,
        answerShown,
        answerCitationClicked,
        otherHistoryResultClicked,
        queryWordCount,
      ],
      false
    );
  }
  setUserFeedback(feedback) {
    this.proxy.sendMessage(
      1814277516,
      PageHandler_SetUserFeedback_ParamsSpec.$,
      null,
      [feedback],
      false
    );
  }
  maybeShowFeaturePromo() {
    this.proxy.sendMessage(
      868673673,
      PageHandler_MaybeShowFeaturePromo_ParamsSpec.$,
      null,
      [],
      false
    );
  }
  openSettingsPage() {
    this.proxy.sendMessage(
      867834232,
      PageHandler_OpenSettingsPage_ParamsSpec.$,
      null,
      [],
      false
    );
  }
}
class PageHandler {
  static get $interfaceName() {
    return "history_embeddings.mojom.PageHandler";
  }
  static getRemote() {
    let remote = new PageHandlerRemote();
    remote.$.bindNewPipeAndPassReceiver().bindInBrowser();
    return remote;
  }
}
class PagePendingReceiver {
  handle;
  constructor(handle) {
    this.handle = mojo.internal.interfaceSupport.getEndpointForReceiver(handle);
  }
  bindInBrowser(scope = "context") {
    mojo.internal.interfaceSupport.bind(
      this.handle,
      "history_embeddings.mojom.Page",
      scope
    );
  }
}
class PageRemote {
  proxy;
  $;
  onConnectionError;
  constructor(handle) {
    this.proxy = new mojo.internal.interfaceSupport.InterfaceRemoteBase(
      PagePendingReceiver,
      handle
    );
    this.$ = new mojo.internal.interfaceSupport.InterfaceRemoteBaseWrapper(
      this.proxy
    );
    this.onConnectionError = this.proxy.getConnectionErrorEventRouter();
  }
  searchResultChanged(result) {
    this.proxy.sendMessage(
      893657314,
      Page_SearchResultChanged_ParamsSpec.$,
      null,
      [result],
      false
    );
  }
}
class PageCallbackRouter {
  helper_internal_;
  $;
  router_;
  searchResultChanged;
  onConnectionError;
  constructor() {
    this.helper_internal_ =
      new mojo.internal.interfaceSupport.InterfaceReceiverHelperInternal(
        PageRemote
      );
    this.$ = new mojo.internal.interfaceSupport.InterfaceReceiverHelper(
      this.helper_internal_
    );
    this.router_ = new mojo.internal.interfaceSupport.CallbackRouter();
    this.searchResultChanged =
      new mojo.internal.interfaceSupport.InterfaceCallbackReceiver(
        this.router_
      );
    this.helper_internal_.registerHandler(
      893657314,
      Page_SearchResultChanged_ParamsSpec.$,
      null,
      this.searchResultChanged.createReceiverHandler(false),
      false
    );
    this.onConnectionError =
      this.helper_internal_.getConnectionErrorEventRouter();
  }
  removeListener(id) {
    return this.router_.removeListener(id);
  }
}
const AnswerDataSpec = { $: {} };
const SearchResultItemSpec = { $: {} };
const SearchQuerySpec = { $: {} };
const SearchResultSpec = { $: {} };
const PageHandler_SetPage_ParamsSpec = { $: {} };
const PageHandler_Search_ParamsSpec = { $: {} };
const PageHandler_SendQualityLog_ParamsSpec = { $: {} };
const PageHandler_RecordSearchResultsMetrics_ParamsSpec = { $: {} };
const PageHandler_SetUserFeedback_ParamsSpec = { $: {} };
const PageHandler_MaybeShowFeaturePromo_ParamsSpec = { $: {} };
const PageHandler_OpenSettingsPage_ParamsSpec = { $: {} };
const Page_SearchResultChanged_ParamsSpec = { $: {} };
mojo.internal.Struct(
  AnswerDataSpec.$,
  "AnswerData",
  [
    mojo.internal.StructField(
      "answerTextDirectives",
      0,
      0,
      mojo.internal.Array(mojo.internal.String, false),
      null,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 16]]
);
mojo.internal.Struct(
  SearchResultItemSpec.$,
  "SearchResultItem",
  [
    mojo.internal.StructField(
      "title",
      0,
      0,
      mojo.internal.String,
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "url",
      8,
      0,
      UrlSpec.$,
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "urlForDisplay",
      16,
      0,
      mojo.internal.String,
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "relativeTime",
      24,
      0,
      mojo.internal.String,
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "shortDateTime",
      32,
      0,
      mojo.internal.String,
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "lastUrlVisitTimestamp",
      40,
      0,
      mojo.internal.Double,
      0,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "sourcePassage",
      48,
      0,
      mojo.internal.String,
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "answerData",
      56,
      0,
      AnswerDataSpec.$,
      null,
      true,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "isUrlKnownToSync",
      64,
      0,
      mojo.internal.Bool,
      false,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 80]]
);
mojo.internal.Struct(
  SearchQuerySpec.$,
  "SearchQuery",
  [
    mojo.internal.StructField(
      "query",
      0,
      0,
      mojo.internal.String,
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "timeRangeStart",
      8,
      0,
      TimeSpec.$,
      null,
      true,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 24]]
);
mojo.internal.Struct(
  SearchResultSpec.$,
  "SearchResult",
  [
    mojo.internal.StructField(
      "query",
      0,
      0,
      mojo.internal.String,
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "answerStatus",
      8,
      0,
      AnswerStatusSpec.$,
      0,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "answer",
      16,
      0,
      mojo.internal.String,
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "items",
      24,
      0,
      mojo.internal.Array(SearchResultItemSpec.$, false),
      null,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 40]]
);
mojo.internal.Struct(
  PageHandler_SetPage_ParamsSpec.$,
  "PageHandler_SetPage_Params",
  [
    mojo.internal.StructField(
      "page",
      0,
      0,
      mojo.internal.InterfaceProxy(PageRemote),
      null,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 16]]
);
mojo.internal.Struct(
  PageHandler_Search_ParamsSpec.$,
  "PageHandler_Search_Params",
  [
    mojo.internal.StructField(
      "query",
      0,
      0,
      SearchQuerySpec.$,
      null,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 16]]
);
mojo.internal.Struct(
  PageHandler_SendQualityLog_ParamsSpec.$,
  "PageHandler_SendQualityLog_Params",
  [
    mojo.internal.StructField(
      "selectedIndices",
      0,
      0,
      mojo.internal.Array(mojo.internal.Uint32, false),
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "numEnteredChars",
      8,
      0,
      mojo.internal.Uint32,
      0,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 24]]
);
mojo.internal.Struct(
  PageHandler_RecordSearchResultsMetrics_ParamsSpec.$,
  "PageHandler_RecordSearchResultsMetrics_Params",
  [
    mojo.internal.StructField(
      "nonEmptyResults",
      0,
      0,
      mojo.internal.Bool,
      false,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "userClickedResult",
      0,
      1,
      mojo.internal.Bool,
      false,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "answerShown",
      0,
      2,
      mojo.internal.Bool,
      false,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "answerCitationClicked",
      0,
      3,
      mojo.internal.Bool,
      false,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "otherHistoryResultClicked",
      0,
      4,
      mojo.internal.Bool,
      false,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "queryWordCount",
      4,
      0,
      mojo.internal.Uint32,
      0,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 16]]
);
mojo.internal.Struct(
  PageHandler_SetUserFeedback_ParamsSpec.$,
  "PageHandler_SetUserFeedback_Params",
  [
    mojo.internal.StructField(
      "feedback",
      0,
      0,
      UserFeedbackSpec.$,
      0,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 16]]
);
mojo.internal.Struct(
  PageHandler_MaybeShowFeaturePromo_ParamsSpec.$,
  "PageHandler_MaybeShowFeaturePromo_Params",
  [],
  [[0, 8]]
);
mojo.internal.Struct(
  PageHandler_OpenSettingsPage_ParamsSpec.$,
  "PageHandler_OpenSettingsPage_Params",
  [],
  [[0, 8]]
);
mojo.internal.Struct(
  Page_SearchResultChanged_ParamsSpec.$,
  "Page_SearchResultChanged_Params",
  [
    mojo.internal.StructField(
      "result",
      0,
      0,
      SearchResultSpec.$,
      null,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 16]]
);
class HistoryEmbeddingsBrowserProxyImpl {
  static instance = null;
  handler;
  callbackRouter;
  constructor(handler, callbackRouter) {
    this.handler = handler;
    this.callbackRouter = callbackRouter || new PageCallbackRouter();
  }
  static getInstance() {
    if (HistoryEmbeddingsBrowserProxyImpl.instance) {
      return HistoryEmbeddingsBrowserProxyImpl.instance;
    }
    const handler = PageHandler.getRemote();
    const callbackRouter = new PageCallbackRouter();
    handler.setPage(callbackRouter.$.bindNewPipeAndPassRemote());
    HistoryEmbeddingsBrowserProxyImpl.instance =
      new HistoryEmbeddingsBrowserProxyImpl(handler, callbackRouter);
    return HistoryEmbeddingsBrowserProxyImpl.instance;
  }
  static setInstance(newInstance) {
    HistoryEmbeddingsBrowserProxyImpl.instance = newInstance;
  }
  search(query) {
    this.handler.search(query);
  }
  sendQualityLog(selectedIndices, numCharsForQuery) {
    return this.handler.sendQualityLog(selectedIndices, numCharsForQuery);
  }
  recordSearchResultsMetrics(
    nonEmptyResults,
    userClickedResult,
    answerShown,
    answerCitationClicked,
    otherHistoryResultClicked,
    queryWordCount
  ) {
    this.handler.recordSearchResultsMetrics(
      nonEmptyResults,
      userClickedResult,
      answerShown,
      answerCitationClicked,
      otherHistoryResultClicked,
      queryWordCount
    );
  }
  setUserFeedback(userFeedback) {
    this.handler.setUserFeedback(userFeedback);
  }
  maybeShowFeaturePromo() {
    this.handler.maybeShowFeaturePromo();
  }
  openSettingsPage() {
    this.handler.openSettingsPage();
  }
}
let instance$i = null;
function getCss$g() {
  return (
    instance$i ||
    (instance$i = [
      ...[getCss$A()],
      css`
        :host {
          display: block;
        }
        :host([is-empty]) {
          display: none;
        }
        .card {
          background: var(
            --color-history-embeddings-background,
            var(--cr-card-background-color)
          );
          border-radius: var(--cr-card-border-radius);
          box-shadow: var(--cr-card-shadow);
          padding-block: var(--cr-history-embeddings-card-padding-block, 0);
        }
        :host([enable-answers_]) .card {
          padding-block: var(
            --cr-history-embeddings-card-padding-block-with-answers,
            16px
          );
        }
        h2 {
          display: flex;
          align-items: center;
          gap: 14px;
          margin: 0;
          padding: var(--cr-history-embeddings-heading-padding, 23px 24px 13px);
          font-size: var(--cr-history-embeddings-heading-font-size, 16px);
          font-weight: 500;
          line-height: var(--cr-history-embeddings-heading-line-height, 24px);
          color: var(
            --color-history-embeddings-foreground,
            var(--cr-primary-text-color)
          );
        }
        h2 cr-icon {
          flex-shrink: 0;
        }
        :host([enable-answers_]) h2 {
          font-size: var(--cr-history-embeddings-heading-font-size, 14px);
          line-height: var(--cr-history-embeddings-heading-line-height, 20px);
          padding: var(--cr-history-embeddings-heading-padding, 8px 24px);
        }
        :host([enable-answers_]) .answer-section {
          margin-block-end: var(
            --cr-history-embeddings-answer-section-margin-block-end,
            16px
          );
        }
        :host([enable-answers_]) .answer {
          font-size: 16px;
          font-weight: 500;
          line-height: 24px;
          padding: var(--cr-history-embeddings-answer-padding, 8px 24px);
        }
        :host([enable-answers_]) .answer[is-error] {
          color: var(--cr-secondary-text-color);
          font-size: 11px;
          font-weight: 400;
        }
        :host([enable-answers_]) .answer-source {
          align-items: center;
          color: var(
            --color-history-embeddings-foreground-subtle,
            var(--cr-secondary-text-color)
          );
          display: inline-flex;
          font-size: 11px;
          gap: 4px;
          margin: var(--cr-history-embeddings-answer-source-margin, 8px 24px);
          max-width: calc(100% - 48px);
          line-height: 16px;
          text-decoration: none;
        }
        :host([enable-answers_]) .answer-link {
          align-items: center;
          display: flex;
          gap: 4px;
          min-width: 0;
        }
        :host([enable-answers_]) .answer-link .result-url {
          text-decoration: underline;
        }
        :host([enable-answers_]) .answer-source .time {
          margin-inline-start: 0;
        }
        .loading {
          padding: var(
            --cr-history-embeddings-loading-padding,
            4px 24px 24px 24px
          );
        }
        :host([enable-answers_]) .loading {
          padding: var(
            --cr-history-embeddings-loading-padding,
            4px 24px 8px 24px
          );
        }
        hr {
          border: 0;
          display: var(--cr-history-embeddings-hr-display, block);
          height: 1px;
          background: var(
            --color-history-embeddings-divider,
            var(--cr-fallback-color-divider)
          );
          margin: 0px 24px;
        }
        :host([enable-answers_]) hr {
          display: none;
        }
        hr:last-of-type {
          display: none;
        }
        cr-url-list-item {
          --cr-url-list-item-height: auto;
          --cr-url-list-item-padding: var(
            --cr-history-embeddings-url-list-item-padding,
            14px 24px
          );
        }
        cr-url-list-item:has(.source-passage:not([hidden])) {
          --cr-url-list-item-padding: 14px 24px 6px;
        }
        hr:has(+ cr-url-list-item:hover),
        cr-url-list-item:hover + hr {
          opacity: 0;
        }
        :host([enable-answers_]) cr-url-list-item {
          --cr-url-list-item-padding: var(
            --cr-history-embeddings-url-list-item-padding,
            8px 24px
          );
        }
        :host([enable-answers_]) .result-item {
          align-items: center;
          color: var(
            --color-history-embeddings-foreground,
            var(--cr-primary-text-color)
          );
          display: flex;
          gap: 16px;
          padding: 8px 24px;
          text-decoration: none;
        }
        :host([enable-answers_][in-side-panel]) .result-item {
          padding: 4px 16px;
        }
        :host([enable-answers_]) .result-image {
          align-items: center;
          background: var(
            --color-history-embeddings-image-background,
            var(--cr-fallback-color-neutral-container)
          );
          border-radius: 8px;
          display: flex;
          flex-shrink: 0;
          justify-content: center;
          height: 58px;
          overflow: hidden;
          width: 104px;
        }
        :host([enable-answers_][in-side-panel]) .result-image {
          height: 40px;
          width: 40px;
        }
        :host([enable-answers_][in-side-panel])
          cr-history-embeddings-result-image:not([has-image]) {
          display: none;
        }
        :host([enable-answers_]:not([in-side-panel])) .result-image .favicon {
          display: none;
        }
        :host([enable-answers_][in-side-panel])
          cr-history-embeddings-result-image[has-image]
          ~ .favicon {
          display: none;
        }
        :host([enable-answers_]) .result-metadata {
          display: flex;
          flex: 1;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }
        :host([enable-answers_]) .result-title,
        :host([enable-answers_]) .result-url {
          line-height: 16px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        :host([enable-answers_]) .result-title {
          font-size: 12px;
          font-weight: 500;
        }
        :host([enable-answers_]) .result-url-and-favicon {
          align-items: center;
          display: flex;
          gap: 4px;
        }
        :host([enable-answers_]) .result-url {
          color: var(
            --color-history-embeddings-foreground-subtle,
            var(--cr-secondary-text-color)
          );
          font-size: 11px;
        }
        :host([enable-answers_]) .favicon {
          background-position: center center;
          background-repeat: no-repeat;
          flex-shrink: 0;
          height: 16px;
          width: 16px;
        }
        :host([enable-answers_][in-side-panel])
          .result-url-and-favicon
          .favicon {
          display: none;
        }
        .time {
          margin-inline-start: 16px;
        }
        :host([enable-answers_]) .time {
          color: var(
            --color-history-embeddings-foreground-subtle,
            var(--cr-secondary-text-color)
          );
          font-size: 11px;
          line-height: 16px;
          white-space: nowrap;
        }
        :host([enable-answers_]) .more-actions {
          --cr-icon-button-icon-size: 16px;
          --cr-icon-button-size: 24px;
          --cr-icon-button-margin-end: 0;
          --cr-icon-button-margin-start: 0;
        }
        .footer {
          display: flex;
          align-items: center;
          font-size: var(--cr-history-embeddings-footer-font-size, inherit);
          line-height: var(--cr-history-embeddings-footer-line-height, inherit);
          gap: 8px;
          padding: var(--cr-history-embeddings-footer-padding, 16px 24px 24px);
          color: var(
            --color-history-embeddings-foreground-subtle,
            var(--cr-secondary-text-color)
          );
        }
        :host([enable-answers_]) .footer {
          padding: var(
            --cr-history-embeddings-footer-padding-with-answers,
            16px 24px 24px
          );
        }
        .source-passage {
          display: flex;
          font-size: 11px;
          font-style: italic;
          line-height: 16px;
          padding: 6px 24px 14px;
        }
        .source-passage-line {
          background: var(
            --color-history-embeddings-divider,
            var(--cr-fallback-color-divider)
          );
          width: 1px;
          margin-inline-start: 20px;
          margin-inline-end: 36px;
        }
      `,
    ])
  );
}
function getHtml$f() {
  return html`<!--_html_template_start_-->
    ${!this.enableAnswers_
      ? html`
          <div id="cardWithoutAnswers" class="card">
            <h2 class="heading results-heading">
              <cr-icon icon="history-embeddings:heading"></cr-icon>
              ${this.getHeadingText_()}
            </h2>

            ${this.loadingResults_
              ? html`
                  <div class="loading loading-results">
                    <cr-loading-gradient>
                      <svg width="482" height="40">
                        <clipPath>
                          <rect width="40" height="40" rx="8" ry="8"></rect>
                          <rect
                            x="55"
                            y="4"
                            width="calc(100% - 55px)"
                            height="14"
                            rx="4"
                            ry="4"
                          ></rect>
                          <rect
                            x="55"
                            y="24"
                            width="calc(78% - 55px)"
                            height="14"
                            rx="4"
                            ry="4"
                          ></rect>
                        </clipPath>
                      </svg>
                    </cr-loading-gradient>
                  </div>
                `
              : html`
                  <div>
                    <div class="result-items">
                      ${this.searchResult_?.items.map(
                        (item, index) => html`
                          <cr-url-list-item
                            url="${item.url.url}"
                            title="${item.title}"
                            description="${item.urlForDisplay}"
                            @click="${this.onResultClick_}"
                            @auxclick="${this.onResultClick_}"
                            data-index="${index}"
                            @contextmenu="${this.onResultContextMenu_}"
                            as-anchor
                            as-anchor-target="_blank"
                            always-show-suffix
                          >
                            <span class="time" slot="suffix"
                              >${this.getDateTime_(item)}</span
                            >
                            <cr-icon-button
                              slot="suffix"
                              iron-icon="cr:more-vert"
                              data-index="${index}"
                              @click="${this.onMoreActionsClick_}"
                              aria-label="${this.i18n("actionMenuDescription")}"
                              aria-description="${item.title}"
                            >
                            </cr-icon-button>
                            <div
                              slot="footer"
                              class="source-passage"
                              ?hidden="${!item.sourcePassage}"
                            >
                              <div class="source-passage-line"></div>
                              ${item.sourcePassage}
                            </div>
                          </cr-url-list-item>
                          <hr />
                        `
                      )}
                    </div>

                    <div class="footer">
                      <div>${this.i18n("historyEmbeddingsFooter")}</div>
                      <cr-feedback-buttons
                        selected-option="${this.feedbackState_}"
                        @selected-option-changed="${this
                          .onFeedbackSelectedOptionChanged_}"
                      >
                      </cr-feedback-buttons>
                    </div>
                  </div>
                `}
          </div>
        `
      : ""}
    ${this.enableAnswers_
      ? html`
          <div id="cardWithAnswers" class="card">
            ${this.showAnswerSection_()
              ? html`
                  <div class="answer-section">
                    <h2 class="heading">
                      ${this.getHeadingTextForAnswerSection_()}
                    </h2>
                    ${this.loadingAnswer_
                      ? html`
                          <div class="loading loading-answer">
                            <cr-loading-gradient>
                              <svg
                                width="100%"
                                height="72"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <clipPath>
                                  <rect
                                    width="100%"
                                    height="12"
                                    rx="4"
                                    1
                                  ></rect>
                                  <rect
                                    y="20"
                                    width="85%"
                                    height="12"
                                    rx="4"
                                  ></rect>
                                  <rect
                                    y="40"
                                    width="75%"
                                    height="12"
                                    rx="4"
                                  ></rect>
                                  <rect
                                    y="60"
                                    width="33%"
                                    height="12"
                                    rx="4"
                                  ></rect>
                                </clipPath>
                              </svg>
                            </cr-loading-gradient>
                          </div>
                        `
                      : html`
                          <div
                            class="answer"
                            ?is-error="${this.isAnswerErrorState_()}"
                          >
                            ${this.getAnswerOrError_()}
                          </div>
                        `}
                    ${this.answerSource_
                      ? html`
                          <div class="answer-source">
                            <a
                              class="answer-link"
                              href="${this.getAnswerSourceUrl_()}"
                              target="_blank"
                              @click="${this.onAnswerLinkClick_}"
                              @auxclick="${this.onAnswerLinkClick_}"
                              @contextmenu="${this.onAnswerLinkContextMenu_}"
                            >
                              <div
                                class="favicon"
                                .style="background-image: ${this.getFavicon_(
                                  this.answerSource_
                                )}"
                              ></div>
                              <div class="result-url">
                                ${this.answerSource_.urlForDisplay}
                              </div>
                            </a>
                            &bull;
                            <div class="time">${this.getAnswerDateTime_()}</div>
                          </div>
                        `
                      : ""}
                  </div>
                `
              : ""}

            <h2 class="heading results-heading">${this.getHeadingText_()}</h2>
            ${this.loadingResults_
              ? html`
                  <div class="loading loading-results">
                    <cr-loading-gradient>
                      <svg width="100%" height="40">
                        <clipPath>
                          <rect width="40" height="40" rx="8" ry="8"></rect>
                          <rect
                            x="55"
                            y="4"
                            width="calc(100% - 55px)"
                            height="14"
                            rx="4"
                            ry="4"
                          ></rect>
                          <rect
                            x="55"
                            y="24"
                            width="calc(78% - 55px)"
                            height="14"
                            rx="4"
                            ry="4"
                          ></rect>
                        </clipPath>
                      </svg>
                    </cr-loading-gradient>
                  </div>
                `
              : html`
                  <div class="result-items">
                    ${this.searchResult_?.items.map(
                      (item, index) => html`
                        ${this.enableImages_
                          ? html`
                              <a
                                class="result-item"
                                href="${item.url.url}"
                                target="_blank"
                                @click="${this.onResultClick_}"
                                @auxclick="${this.onResultClick_}"
                                data-index="${index}"
                                @contextmenu="${this.onResultContextMenu_}"
                              >
                                <div class="result-image">
                                  <cr-history-embeddings-result-image
                                    ?in-side-panel="${this.inSidePanel}"
                                    .searchResult="${item}"
                                  >
                                  </cr-history-embeddings-result-image>
                                  <div
                                    class="favicon"
                                    .style="background-image: ${this.getFavicon_(
                                      item
                                    )}"
                                  ></div>
                                </div>
                                <div class="result-metadata">
                                  <div class="result-title">${item.title}</div>
                                  <div class="result-url-and-favicon">
                                    <div
                                      class="favicon"
                                      .style="background-image: ${this.getFavicon_(
                                        item
                                      )}"
                                    ></div>
                                    <div class="result-url">
                                      ${item.urlForDisplay}
                                    </div>
                                  </div>
                                </div>
                                <span class="time"
                                  >${this.getDateTime_(item)}</span
                                >
                                <cr-icon-button
                                  class="more-actions"
                                  iron-icon="cr:more-vert"
                                  data-index="${index}"
                                  @click="${this.onMoreActionsClick_}"
                                  aria-label="${this.i18n(
                                    "actionMenuDescription"
                                  )}"
                                  aria-description="${item.title}"
                                >
                                </cr-icon-button>
                              </a>
                            `
                          : html`
                              <cr-url-list-item
                                url="${item.url.url}"
                                title="${item.title}"
                                description="${item.urlForDisplay}"
                                @click="${this.onResultClick_}"
                                @auxclick="${this.onResultClick_}"
                                @contextmenu="${this.onResultContextMenu_}"
                                data-index="${index}"
                                as-anchor
                                as-anchor-target="_blank"
                                always-show-suffix
                              >
                                <span class="time" slot="suffix"
                                  >${this.getDateTime_(item)}</span
                                >
                                <cr-icon-button
                                  slot="suffix"
                                  iron-icon="cr:more-vert"
                                  data-index="${index}"
                                  @click="${this.onMoreActionsClick_}"
                                  aria-label="${this.i18n(
                                    "actionMenuDescription"
                                  )}"
                                  aria-description="${item.title}"
                                >
                                </cr-icon-button>
                                <div
                                  slot="footer"
                                  class="source-passage"
                                  ?hidden="${!item.sourcePassage}"
                                >
                                  <div class="source-passage-line"></div>
                                  ${item.sourcePassage}
                                </div>
                              </cr-url-list-item>
                              <hr />
                            `}
                      `
                    )}
                  </div>
                `}
          </div>
          <div class="footer">
            <div>${this.i18n("historyEmbeddingsFooter")}</div>
            <cr-feedback-buttons
              selected-option="${this.feedbackState_}"
              @selected-option-changed="${this
                .onFeedbackSelectedOptionChanged_}"
            >
            </cr-feedback-buttons>
          </div>
        `
      : ""}

    <cr-lazy-render-lit
      id="sharedMenu"
      .template="${() => html` <cr-action-menu
        role-description="${this.i18n("actionMenuDescription")}"
      >
        ${this.showMoreFromSiteMenuOption
          ? html`
              <button
                id="moreFromSiteOption"
                class="dropdown-item"
                @click="${this.onMoreFromSiteClick_}"
              >
                ${this.i18n("moreFromSite")}
              </button>
            `
          : ""}
        <button
          id="removeFromHistoryOption"
          class="dropdown-item"
          @click="${this.onRemoveFromHistoryClick_}"
        >
          ${this.i18n("removeFromHistory")}
        </button>
      </cr-action-menu>`}"
    >
    </cr-lazy-render-lit>
    <!--_html_template_end_-->`;
}
function jsDateToMojoDate(date) {
  const windowsEpoch = Date.UTC(1601, 0, 1, 0, 0, 0, 0);
  const unixEpoch = Date.UTC(1970, 0, 1, 0, 0, 0, 0);
  const epochDeltaInMs = unixEpoch - windowsEpoch;
  const internalValue = BigInt(date.valueOf() + epochDeltaInMs) * BigInt(1e3);
  return { internalValue: internalValue };
}
const LOADING_STATE_MINIMUM_MS = 300;
const HistoryEmbeddingsElementBase = I18nMixinLit(CrLitElement);
class HistoryEmbeddingsElement extends HistoryEmbeddingsElementBase {
  static get is() {
    return "cr-history-embeddings";
  }
  static get styles() {
    return getCss$g();
  }
  render() {
    return getHtml$f.bind(this)();
  }
  static get properties() {
    return {
      clickedIndices_: { type: Array },
      forceSuppressLogging: { type: Boolean },
      numCharsForQuery: { type: Number },
      feedbackState_: { type: String },
      loadingAnswer_: { type: Boolean },
      loadingResults_: { type: Boolean },
      searchResult_: { type: Object },
      searchResultDirty_: { type: Boolean },
      searchQuery: { type: String },
      timeRangeStart: { type: Object },
      isEmpty: { type: Boolean, reflect: true, notify: true },
      enableAnswers_: { type: Boolean, reflect: true },
      enableImages_: { type: Boolean },
      answerSource_: { type: Object },
      showMoreFromSiteMenuOption: { type: Boolean },
      showRelativeTimes: { type: Boolean },
      otherHistoryResultClicked: { type: Boolean },
      inSidePanel: { type: Boolean, reflect: true },
    };
  }
  actionMenuItem_ = null;
  #answerSource__accessor_storage = null;
  get answerSource_() {
    return this.#answerSource__accessor_storage;
  }
  set answerSource_(value) {
    this.#answerSource__accessor_storage = value;
  }
  answerLinkClicked_ = false;
  browserProxy_ = HistoryEmbeddingsBrowserProxyImpl.getInstance();
  #clickedIndices__accessor_storage = new Set();
  get clickedIndices_() {
    return this.#clickedIndices__accessor_storage;
  }
  set clickedIndices_(value) {
    this.#clickedIndices__accessor_storage = value;
  }
  #enableAnswers__accessor_storage = loadTimeData.getBoolean(
    "enableHistoryEmbeddingsAnswers"
  );
  get enableAnswers_() {
    return this.#enableAnswers__accessor_storage;
  }
  set enableAnswers_(value) {
    this.#enableAnswers__accessor_storage = value;
  }
  #enableImages__accessor_storage = loadTimeData.getBoolean(
    "enableHistoryEmbeddingsImages"
  );
  get enableImages_() {
    return this.#enableImages__accessor_storage;
  }
  set enableImages_(value) {
    this.#enableImages__accessor_storage = value;
  }
  #feedbackState__accessor_storage = CrFeedbackOption.UNSPECIFIED;
  get feedbackState_() {
    return this.#feedbackState__accessor_storage;
  }
  set feedbackState_(value) {
    this.#feedbackState__accessor_storage = value;
  }
  #loadingAnswer__accessor_storage = false;
  get loadingAnswer_() {
    return this.#loadingAnswer__accessor_storage;
  }
  set loadingAnswer_(value) {
    this.#loadingAnswer__accessor_storage = value;
  }
  #loadingResults__accessor_storage = false;
  get loadingResults_() {
    return this.#loadingResults__accessor_storage;
  }
  set loadingResults_(value) {
    this.#loadingResults__accessor_storage = value;
  }
  loadingStateMinimumMs_ = LOADING_STATE_MINIMUM_MS;
  queryResultMinAge_ = QUERY_RESULT_MINIMUM_AGE;
  #searchResult__accessor_storage = null;
  get searchResult_() {
    return this.#searchResult__accessor_storage;
  }
  set searchResult_(value) {
    this.#searchResult__accessor_storage = value;
  }
  #searchResultDirty__accessor_storage = false;
  get searchResultDirty_() {
    return this.#searchResultDirty__accessor_storage;
  }
  set searchResultDirty_(value) {
    this.#searchResultDirty__accessor_storage = value;
  }
  searchTimestamp_ = 0;
  resultPendingMetricsTimestamp_ = null;
  eventTracker_ = new EventTracker();
  #forceSuppressLogging_accessor_storage = false;
  get forceSuppressLogging() {
    return this.#forceSuppressLogging_accessor_storage;
  }
  set forceSuppressLogging(value) {
    this.#forceSuppressLogging_accessor_storage = value;
  }
  #isEmpty_accessor_storage = true;
  get isEmpty() {
    return this.#isEmpty_accessor_storage;
  }
  set isEmpty(value) {
    this.#isEmpty_accessor_storage = value;
  }
  #numCharsForQuery_accessor_storage = 0;
  get numCharsForQuery() {
    return this.#numCharsForQuery_accessor_storage;
  }
  set numCharsForQuery(value) {
    this.#numCharsForQuery_accessor_storage = value;
  }
  numCharsForLastResultQuery_ = 0;
  #searchQuery_accessor_storage = "";
  get searchQuery() {
    return this.#searchQuery_accessor_storage;
  }
  set searchQuery(value) {
    this.#searchQuery_accessor_storage = value;
  }
  #timeRangeStart_accessor_storage;
  get timeRangeStart() {
    return this.#timeRangeStart_accessor_storage;
  }
  set timeRangeStart(value) {
    this.#timeRangeStart_accessor_storage = value;
  }
  searchResultChangedId_ = null;
  searchResultPromise_ = null;
  #showRelativeTimes_accessor_storage = false;
  get showRelativeTimes() {
    return this.#showRelativeTimes_accessor_storage;
  }
  set showRelativeTimes(value) {
    this.#showRelativeTimes_accessor_storage = value;
  }
  #showMoreFromSiteMenuOption_accessor_storage = false;
  get showMoreFromSiteMenuOption() {
    return this.#showMoreFromSiteMenuOption_accessor_storage;
  }
  set showMoreFromSiteMenuOption(value) {
    this.#showMoreFromSiteMenuOption_accessor_storage = value;
  }
  #otherHistoryResultClicked_accessor_storage = false;
  get otherHistoryResultClicked() {
    return this.#otherHistoryResultClicked_accessor_storage;
  }
  set otherHistoryResultClicked(value) {
    this.#otherHistoryResultClicked_accessor_storage = value;
  }
  #inSidePanel_accessor_storage = false;
  get inSidePanel() {
    return this.#inSidePanel_accessor_storage;
  }
  set inSidePanel(value) {
    this.#inSidePanel_accessor_storage = value;
  }
  connectedCallback() {
    super.connectedCallback();
    this.eventTracker_.add(window, "beforeunload", () => {
      this.flushDebouncedUserMetrics_(true);
    });
    if (this.inSidePanel) {
      this.eventTracker_.add(document, "visibilitychange", () => {
        if (document.visibilityState === "hidden") {
          this.flushDebouncedUserMetrics_();
        }
      });
    }
    this.searchResultChangedId_ =
      this.browserProxy_.callbackRouter.searchResultChanged.addListener(
        this.searchResultChanged_.bind(this)
      );
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.flushDebouncedUserMetrics_(true);
    this.eventTracker_.removeAll();
    if (this.searchResultChangedId_ !== null) {
      this.browserProxy_.callbackRouter.removeListener(
        this.searchResultChangedId_
      );
      this.searchResultChangedId_ = null;
    }
  }
  willUpdate(changedProperties) {
    super.willUpdate(changedProperties);
    const changedPrivateProperties = changedProperties;
    if (
      changedPrivateProperties.has("loadingResults_") ||
      changedPrivateProperties.has("searchResult_") ||
      (changedPrivateProperties.has("searchResultDirty_") &&
        this.searchResultDirty_)
    ) {
      this.isEmpty = this.computeIsEmpty_();
    }
    if (
      changedPrivateProperties.has("loadingAnswer_") ||
      changedPrivateProperties.has("searchResult_") ||
      (changedPrivateProperties.has("searchResultDirty_") &&
        this.searchResultDirty_)
    ) {
      this.answerSource_ = this.computeAnswerSource_();
    }
    const isSearchQueryInitialization =
      changedProperties.get("searchQuery") === undefined &&
      this.searchQuery === "";
    if (
      (changedProperties.has("searchQuery") && !isSearchQueryInitialization) ||
      changedProperties.has("timeRangeStart")
    ) {
      this.onSearchQueryChanged_();
    }
    if (
      changedPrivateProperties.has("searchResultDirty_") &&
      this.searchResultDirty_
    ) {
      this.searchResultDirty_ = false;
    }
  }
  computeAnswerSource_() {
    if (!this.enableAnswers_ || this.loadingAnswer_) {
      return null;
    }
    return this.searchResult_?.items.find((item) => item.answerData) || null;
  }
  computeIsEmpty_() {
    return !this.loadingResults_ && this.searchResult_?.items.length === 0;
  }
  getAnswerOrError_() {
    if (!this.searchResult_) {
      return undefined;
    }
    switch (this.searchResult_.answerStatus) {
      case AnswerStatus.kUnspecified:
      case AnswerStatus.kLoading:
      case AnswerStatus.kExecutionCanceled:
      case AnswerStatus.kUnanswerable:
      case AnswerStatus.kFiltered:
      case AnswerStatus.kModelUnavailable:
        return undefined;
      case AnswerStatus.kSuccess:
        return this.searchResult_.answer;
      case AnswerStatus.kExecutionFailure:
        return this.i18n("historyEmbeddingsAnswererErrorTryAgain");
      default:
        assertNotReached();
    }
  }
  getAnswerSourceUrl_() {
    if (!this.answerSource_) {
      return undefined;
    }
    const sourceUrl = new URL(this.answerSource_.url.url);
    const textDirectives = this.answerSource_.answerData?.answerTextDirectives;
    if (textDirectives && textDirectives.length > 0) {
      sourceUrl.hash = `:~:text=${textDirectives[0]
        .split(",")
        .map(encodeURIComponent)
        .join(",")}`;
    }
    return sourceUrl.toString();
  }
  getFavicon_(item) {
    return getFaviconForPageURL(item?.url.url || "", true);
  }
  getHeadingText_() {
    if (this.loadingResults_) {
      return this.i18n("historyEmbeddingsHeadingLoading", this.searchQuery);
    }
    if (this.enableAnswers_) {
      return this.i18n("historyEmbeddingsWithAnswersResultsHeading");
    }
    return this.i18n("historyEmbeddingsHeading", this.searchQuery);
  }
  getHeadingTextForAnswerSection_() {
    if (this.loadingAnswer_) {
      return this.i18n("historyEmbeddingsAnswerLoadingHeading");
    }
    return this.i18n("historyEmbeddingsAnswerHeading");
  }
  getAnswerDateTime_() {
    if (!this.answerSource_) {
      return "";
    }
    const dateTime = this.getDateTime_(this.answerSource_);
    return this.i18n("historyEmbeddingsAnswerSourceDate", dateTime);
  }
  getDateTime_(item) {
    if (this.showRelativeTimes) {
      return item.relativeTime;
    }
    return item.shortDateTime;
  }
  hasAnswer_() {
    if (!this.enableAnswers_) {
      return false;
    }
    return this.searchResult_?.answer !== "";
  }
  isAnswerErrorState_() {
    if (!this.searchResult_) {
      return false;
    }
    return this.searchResult_.answerStatus === AnswerStatus.kExecutionFailure;
  }
  onFeedbackSelectedOptionChanged_(e) {
    this.feedbackState_ = e.detail.value;
    switch (e.detail.value) {
      case CrFeedbackOption.UNSPECIFIED:
        this.browserProxy_.setUserFeedback(
          UserFeedback.kUserFeedbackUnspecified
        );
        return;
      case CrFeedbackOption.THUMBS_UP:
        this.browserProxy_.setUserFeedback(UserFeedback.kUserFeedbackPositive);
        return;
      case CrFeedbackOption.THUMBS_DOWN:
        this.browserProxy_.setUserFeedback(UserFeedback.kUserFeedbackNegative);
        return;
    }
  }
  onAnswerLinkContextMenu_(e) {
    this.fire("answer-context-menu", {
      item: this.answerSource_,
      x: e.clientX,
      y: e.clientY,
    });
  }
  onAnswerLinkClick_(e) {
    this.answerLinkClicked_ = true;
    this.fire("answer-click", {
      item: this.answerSource_,
      middleButton: e.button === 1,
      altKey: e.altKey,
      ctrlKey: e.ctrlKey,
      metaKey: e.metaKey,
      shiftKey: e.shiftKey,
    });
  }
  onMoreActionsClick_(e) {
    e.preventDefault();
    e.stopPropagation();
    assert(this.searchResult_);
    const target = e.target;
    const index = Number(target.dataset["index"]);
    const item = this.searchResult_.items[index];
    assert(item);
    this.actionMenuItem_ = item;
    this.$.sharedMenu.get().showAt(target);
  }
  onMoreFromSiteClick_() {
    assert(this.actionMenuItem_);
    this.fire("more-from-site-click", this.actionMenuItem_);
    this.$.sharedMenu.get().close();
  }
  async onRemoveFromHistoryClick_() {
    assert(this.searchResult_);
    assert(this.actionMenuItem_);
    this.searchResult_.items.splice(
      this.searchResult_.items.indexOf(this.actionMenuItem_),
      1
    );
    this.searchResultDirty_ = true;
    await this.updateComplete;
    this.fire("remove-item-click", this.actionMenuItem_);
    this.$.sharedMenu.get().close();
  }
  onResultContextMenu_(e) {
    assert(this.searchResult_);
    const index = Number(e.currentTarget.dataset["index"]);
    this.fire("result-context-menu", {
      item: this.searchResult_.items[index],
      x: e.clientX,
      y: e.clientY,
    });
  }
  onResultClick_(e) {
    assert(this.searchResult_);
    const index = Number(e.currentTarget.dataset["index"]);
    this.fire("result-click", {
      item: this.searchResult_.items[index],
      middleButton: e.button === 1,
      altKey: e.altKey,
      ctrlKey: e.ctrlKey,
      metaKey: e.metaKey,
      shiftKey: e.shiftKey,
    });
    this.fire("record-history-link-click", {
      resultType: HistoryResultType.EMBEDDINGS,
      index: index,
    });
    this.clickedIndices_.add(index);
    this.browserProxy_.recordSearchResultsMetrics(
      true,
      true,
      this.hasAnswer_(),
      this.answerLinkClicked_,
      this.otherHistoryResultClicked,
      this.searchQuery.split(" ").length
    );
  }
  onSearchQueryChanged_() {
    this.flushDebouncedUserMetrics_();
    this.clickedIndices_.clear();
    this.answerLinkClicked_ = false;
    this.numCharsForLastResultQuery_ = this.numCharsForQuery;
    this.searchResultPromise_ = null;
    this.loadingResults_ = true;
    this.loadingAnswer_ = false;
    const query = {
      query: this.searchQuery,
      timeRangeStart: this.timeRangeStart
        ? jsDateToMojoDate(this.timeRangeStart)
        : null,
    };
    this.searchTimestamp_ = performance.now();
    this.browserProxy_.search(query);
  }
  searchResultChanged_(result) {
    if (this.searchResultPromise_) {
      this.searchResultPromise_ = this.searchResultPromise_.then(() =>
        this.searchResultChangedImpl_(result)
      );
    } else {
      this.searchResultPromise_ = new Promise((resolve) => {
        setTimeout(() => {
          this.searchResultChangedImpl_(result);
          resolve();
        }, Math.max(0, this.searchTimestamp_ + this.loadingStateMinimumMs_ - performance.now()));
      });
    }
  }
  searchResultChangedImpl_(result) {
    if (result.query !== this.searchQuery) {
      return;
    }
    const isNewQuery = this.searchResult_?.query !== result.query;
    const hasResults = result.items.length > 0;
    const hasNewResults =
      this.searchResult_?.items.length !== result.items.length;
    const shouldAnnounceForResults =
      (isNewQuery && hasResults) || (!isNewQuery && hasNewResults);
    this.feedbackState_ = CrFeedbackOption.UNSPECIFIED;
    this.searchResult_ = result;
    this.loadingResults_ = false;
    this.loadingAnswer_ = result.answerStatus === AnswerStatus.kLoading;
    this.resultPendingMetricsTimestamp_ = performance.now();
    if (shouldAnnounceForResults) {
      const resultsLabelId =
        result.items.length === 1
          ? "historyEmbeddingsMatch"
          : "historyEmbeddingsMatches";
      const message = loadTimeData.getStringF(
        "foundSearchResults",
        result.items.length,
        loadTimeData.getString(resultsLabelId),
        result.query
      );
      getInstance().announce(message);
    }
  }
  showAnswerSection_() {
    if (!this.searchResult_) {
      return false;
    } else if (this.searchResult_.query !== this.searchQuery) {
      return false;
    } else {
      return (
        this.searchResult_.answerStatus !== AnswerStatus.kUnspecified &&
        this.searchResult_.answerStatus !== AnswerStatus.kUnanswerable &&
        this.searchResult_.answerStatus !== AnswerStatus.kFiltered &&
        this.searchResult_.answerStatus !== AnswerStatus.kModelUnavailable
      );
    }
  }
  flushDebouncedUserMetrics_(forceFlush = false) {
    if (this.resultPendingMetricsTimestamp_ === null) {
      return;
    }
    const userClickedResult = this.clickedIndices_.size > 0;
    const resultsWereStable =
      performance.now() - this.resultPendingMetricsTimestamp_ >=
      this.queryResultMinAge_;
    const canLog = resultsWereStable || forceFlush;
    if (canLog && !userClickedResult) {
      const nonEmptyResults =
        !!this.searchResult_ &&
        this.searchResult_.items &&
        this.searchResult_.items.length > 0;
      this.browserProxy_.recordSearchResultsMetrics(
        nonEmptyResults,
        false,
        this.hasAnswer_(),
        this.answerLinkClicked_,
        this.otherHistoryResultClicked,
        this.searchQuery.split(" ").length
      );
    }
    if (!this.forceSuppressLogging && canLog) {
      this.browserProxy_.sendQualityLog(
        Array.from(this.clickedIndices_),
        this.numCharsForLastResultQuery_
      );
    }
    this.resultPendingMetricsTimestamp_ = null;
  }
  overrideLoadingStateMinimumMsForTesting(ms) {
    this.loadingStateMinimumMs_ = ms;
  }
  overrideQueryResultMinAgeForTesting(ms) {
    this.queryResultMinAge_ = ms;
  }
  searchResultChangedForTesting(result) {
    this.searchResultChanged_(result);
  }
}
customElements.define(HistoryEmbeddingsElement.is, HistoryEmbeddingsElement);
let instance$h = null;
function getCss$f() {
  return (
    instance$h ||
    (instance$h = [
      ...[getCss$A()],
      css`
        :host {
          cursor: pointer;
          display: flex;
          flex-direction: row;
          font-size: var(--cr-tabs-font-size, 14px);
          font-weight: 500;
          height: var(--cr-tabs-height, 48px);
          user-select: none;
        }
        .tab {
          align-items: center;
          color: var(--cr-secondary-text-color);
          display: flex;
          flex: var(--cr-tabs-flex, auto);
          height: 100%;
          justify-content: center;
          opacity: 1;
          outline: none;
          padding: 0 var(--cr-tabs-tab-inline-padding, 0);
          position: relative;
          transition: opacity 100ms cubic-bezier(0.4, 0, 1, 1);
        }
        :host-context(.focus-outline-visible) .tab:focus {
          outline: var(--cr-tabs-focus-outline, auto);
          outline-offset: var(--cr-tabs-focus-outline-offset, 0);
        }
        .selected {
          color: var(--cr-tabs-selected-color, var(--google-blue-600));
          opacity: 1;
        }
        @media (prefers-color-scheme: dark) {
          .selected {
            color: var(--cr-tabs-selected-color, var(--google-blue-300));
          }
        }
        .tab-icon {
          -webkit-mask-position: center;
          -webkit-mask-repeat: no-repeat;
          -webkit-mask-size: var(--cr-tabs-icon-size, var(--cr-icon-size));
          background-color: var(--cr-secondary-text-color);
          display: none;
          height: var(--cr-tabs-icon-size, var(--cr-icon-size));
          margin-inline-end: var(
            --cr-tabs-icon-margin-end,
            var(--cr-icon-size)
          );
          width: var(--cr-tabs-icon-size, var(--cr-icon-size));
        }
        .selected .tab-icon {
          background-color: var(
            --cr-tabs-selected-color,
            var(--google-blue-600)
          );
        }
        @media (prefers-color-scheme: dark) {
          .selected .tab-icon {
            background-color: var(
              --cr-tabs-selected-color,
              var(--google-blue-300)
            );
          }
        }
        .tab-indicator,
        .tab-indicator-background {
          bottom: 0;
          height: var(--cr-tabs-selection-bar-width, 2px);
          left: var(--cr-tabs-tab-inline-padding, 0);
          position: absolute;
          right: var(--cr-tabs-tab-inline-padding, 0);
        }
        .tab-indicator {
          border-top-left-radius: var(
            --cr-tabs-selection-bar-radius,
            var(--cr-tabs-selection-bar-width, 2px)
          );
          border-top-right-radius: var(
            --cr-tabs-selection-bar-radius,
            var(--cr-tabs-selection-bar-width, 2px)
          );
          opacity: 0;
          transform-origin: left center;
          transition: transform;
        }
        .selected .tab-indicator {
          background: var(--cr-tabs-selected-color, var(--google-blue-600));
          opacity: 1;
        }
        .tab-indicator.expand {
          transition-duration: 150ms;
          transition-timing-function: cubic-bezier(0.4, 0, 1, 1);
        }
        .tab-indicator.contract {
          transition-duration: 180ms;
          transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
        }
        .tab-indicator-background {
          background: var(--cr-tabs-unselected-color, var(--google-blue-600));
          opacity: var(--cr-tabs-selection-bar-unselected-opacity, 0);
          z-index: -1;
        }
        @media (prefers-color-scheme: dark) {
          .tab-indicator-background {
            background: var(--cr-tabs-unselected-color, var(--google-blue-300));
          }
          .selected .tab-indicator {
            background: var(--cr-tabs-selected-color, var(--google-blue-300));
          }
        }
        @media (forced-colors: active) {
          .tab-indicator {
            background: SelectedItem;
          }
        }
      `,
    ])
  );
}
function getHtml$e() {
  return html`${this.tabNames.map(
    (item, index) => html`
      <div
        role="tab"
        class="tab ${this.getSelectedClass_(index)}"
        aria-selected="${this.getAriaSelected_(index)}"
        tabindex="${this.getTabindex_(index)}"
        data-index="${index}"
        @click="${this.onTabClick_}"
      >
        <div class="tab-icon" .style="${this.getIconStyle_(index)}"></div>
        ${item}
        <div class="tab-indicator-background"></div>
        <div class="tab-indicator"></div>
      </div>
    `
  )}`;
}
const NONE_SELECTED = -1;
class CrTabsElement extends CrLitElement {
  static get is() {
    return "cr-tabs";
  }
  static get styles() {
    return getCss$f();
  }
  render() {
    return getHtml$e.bind(this)();
  }
  static get properties() {
    return {
      tabIcons: { type: Array },
      tabNames: { type: Array },
      selected: { type: Number, notify: true },
    };
  }
  #tabIcons_accessor_storage = [];
  get tabIcons() {
    return this.#tabIcons_accessor_storage;
  }
  set tabIcons(value) {
    this.#tabIcons_accessor_storage = value;
  }
  #tabNames_accessor_storage = [];
  get tabNames() {
    return this.#tabNames_accessor_storage;
  }
  set tabNames(value) {
    this.#tabNames_accessor_storage = value;
  }
  #selected_accessor_storage = NONE_SELECTED;
  get selected() {
    return this.#selected_accessor_storage;
  }
  set selected(value) {
    this.#selected_accessor_storage = value;
  }
  isRtl_ = false;
  connectedCallback() {
    super.connectedCallback();
    this.isRtl_ = this.matches(":host-context([dir=rtl]) cr-tabs");
  }
  firstUpdated() {
    this.setAttribute("role", "tablist");
    this.addEventListener("keydown", this.onKeyDown_.bind(this));
  }
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has("selected")) {
      this.onSelectedChanged_(this.selected, changedProperties.get("selected"));
    }
  }
  getAriaSelected_(index) {
    return index === this.selected ? "true" : "false";
  }
  getIconStyle_(index) {
    const icon = this.tabIcons[index];
    return icon ? `-webkit-mask-image: url(${icon}); display: block;` : "";
  }
  getTabindex_(index) {
    return index === this.selected ? "0" : "-1";
  }
  getSelectedClass_(index) {
    return index === this.selected ? "selected" : "";
  }
  onSelectedChanged_(newSelected, oldSelected) {
    if (
      newSelected === NONE_SELECTED ||
      oldSelected === NONE_SELECTED ||
      oldSelected === undefined
    ) {
      return;
    }
    const tabs = this.shadowRoot.querySelectorAll(".tab");
    if (tabs.length <= oldSelected) {
      return;
    }
    const oldTabRect = tabs[oldSelected].getBoundingClientRect();
    const newTabRect = tabs[newSelected].getBoundingClientRect();
    const newIndicator = tabs[newSelected].querySelector(".tab-indicator");
    newIndicator.classList.remove("expand", "contract");
    this.updateIndicator_(
      newIndicator,
      newTabRect,
      oldTabRect.left,
      oldTabRect.width
    );
    newIndicator.getBoundingClientRect();
    newIndicator.classList.add("expand");
    newIndicator.addEventListener(
      "transitionend",
      (e) => this.onIndicatorTransitionEnd_(e),
      { once: true }
    );
    const leftmostEdge = Math.min(oldTabRect.left, newTabRect.left);
    const fullWidth =
      newTabRect.left > oldTabRect.left
        ? newTabRect.right - oldTabRect.left
        : oldTabRect.right - newTabRect.left;
    this.updateIndicator_(newIndicator, newTabRect, leftmostEdge, fullWidth);
  }
  async onKeyDown_(e) {
    const count = this.tabNames.length;
    let newSelection;
    if (e.key === "Home") {
      newSelection = 0;
    } else if (e.key === "End") {
      newSelection = count - 1;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      const delta =
        e.key === "ArrowLeft" ? (this.isRtl_ ? 1 : -1) : this.isRtl_ ? -1 : 1;
      newSelection = (count + this.selected + delta) % count;
    } else {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    this.selected = newSelection;
    await this.updateComplete;
    this.shadowRoot.querySelector(".tab.selected").focus();
  }
  onIndicatorTransitionEnd_(event) {
    const indicator = event.target;
    indicator.classList.replace("expand", "contract");
    indicator.style.transform = `translateX(0) scaleX(1)`;
  }
  onTabClick_(e) {
    const target = e.currentTarget;
    this.selected = Number(target.dataset["index"]);
  }
  updateIndicator_(indicator, originRect, newLeft, newWidth) {
    const leftDiff = (100 * (newLeft - originRect.left)) / originRect.width;
    const widthRatio = newWidth / originRect.width;
    const transform = `translateX(${leftDiff}%) scaleX(${widthRatio})`;
    indicator.style.transform = transform;
  }
}
customElements.define(CrTabsElement.is, CrTabsElement);
const CrSelectableMixin = (superClass) => {
  class CrSelectableMixin extends superClass {
    static get properties() {
      return {
        attrForSelected: { type: String },
        selected: { type: String, notify: true },
        selectedAttribute: { type: String },
        selectable: { type: String },
      };
    }
    #attrForSelected_accessor_storage = null;
    get attrForSelected() {
      return this.#attrForSelected_accessor_storage;
    }
    set attrForSelected(value) {
      this.#attrForSelected_accessor_storage = value;
    }
    #selectable_accessor_storage;
    get selectable() {
      return this.#selectable_accessor_storage;
    }
    set selectable(value) {
      this.#selectable_accessor_storage = value;
    }
    #selected_accessor_storage;
    get selected() {
      return this.#selected_accessor_storage;
    }
    set selected(value) {
      this.#selected_accessor_storage = value;
    }
    #selectedAttribute_accessor_storage = null;
    get selectedAttribute() {
      return this.#selectedAttribute_accessor_storage;
    }
    set selectedAttribute(value) {
      this.#selectedAttribute_accessor_storage = value;
    }
    selectOnClick = true;
    items_ = [];
    selectedItem_ = null;
    firstUpdated(changedProperties) {
      super.firstUpdated(changedProperties);
      if (this.selectOnClick) {
        this.addEventListener("click", (e) => this.onClick_(e));
      }
      this.observeItems();
    }
    observeItems() {
      this.getSlot().addEventListener("slotchange", () => this.itemsChanged());
    }
    connectedCallback() {
      super.connectedCallback();
      this.updateItems_();
    }
    willUpdate(changedProperties) {
      super.willUpdate(changedProperties);
      if (changedProperties.has("attrForSelected")) {
        if (this.selectedItem_) {
          assert(this.attrForSelected);
          const value = this.selectedItem_.getAttribute(this.attrForSelected);
          assert(value !== null);
          this.selected = value;
        }
      }
    }
    updated(changedProperties) {
      super.updated(changedProperties);
      if (changedProperties.has("selected")) {
        this.updateSelectedItem_();
      }
    }
    select(value) {
      this.selected = value;
    }
    selectPrevious() {
      const length = this.items_.length;
      let index = length - 1;
      if (this.selected !== undefined) {
        index = (this.valueToIndex_(this.selected) - 1 + length) % length;
      }
      this.selected = this.indexToValue_(index);
    }
    selectNext() {
      const index =
        this.selected === undefined
          ? 0
          : (this.valueToIndex_(this.selected) + 1) % this.items_.length;
      this.selected = this.indexToValue_(index);
    }
    getItemsForTest() {
      return this.items_;
    }
    getSlot() {
      const slot = this.shadowRoot.querySelector("slot");
      assert(slot);
      return slot;
    }
    queryItems() {
      const selectable = this.selectable === undefined ? "*" : this.selectable;
      return Array.from(this.querySelectorAll(`:scope > ${selectable}`));
    }
    queryMatchingItem(selector) {
      const selectable = this.selectable || "*";
      return this.querySelector(`:scope > :is(${selectable})${selector}`);
    }
    updateItems_() {
      this.items_ = this.queryItems();
      this.items_.forEach((item, index) =>
        item.setAttribute("data-selection-index", index.toString())
      );
    }
    get selectedItem() {
      return this.selectedItem_;
    }
    updateSelectedItem_() {
      if (!this.items_) {
        return;
      }
      const item =
        this.selected == null
          ? null
          : this.items_[this.valueToIndex_(this.selected)];
      if (!!item && this.selectedItem_ !== item) {
        this.setItemSelected_(this.selectedItem_, false);
        this.setItemSelected_(item, true);
      } else if (!item) {
        this.setItemSelected_(this.selectedItem_, false);
      }
    }
    setItemSelected_(item, isSelected) {
      if (!item) {
        return;
      }
      item.classList.toggle("selected", isSelected);
      if (this.selectedAttribute) {
        item.toggleAttribute(this.selectedAttribute, isSelected);
      }
      this.selectedItem_ = isSelected ? item : null;
      this.fire("iron-" + (isSelected ? "select" : "deselect"), { item: item });
    }
    valueToIndex_(value) {
      if (!this.attrForSelected) {
        return Number(value);
      }
      const match = this.queryMatchingItem(
        `[${this.attrForSelected}="${value}"]`
      );
      return match ? Number(match.dataset["selectionIndex"]) : -1;
    }
    indexToValue_(index) {
      if (!this.attrForSelected) {
        return index;
      }
      const item = this.items_[index];
      if (!item) {
        return index;
      }
      return item.getAttribute(this.attrForSelected) || index;
    }
    itemsChanged() {
      this.updateItems_();
      this.updateSelectedItem_();
      this.fire("iron-items-changed");
    }
    onClick_(e) {
      let element = e.target;
      while (element && element !== this) {
        const idx = this.items_.indexOf(element);
        if (idx >= 0) {
          const value = this.indexToValue_(idx);
          assert(value !== null);
          this.fire("iron-activate", { item: element, selected: value });
          this.select(value);
          return;
        }
        element = element.parentNode;
      }
    }
  }
  return CrSelectableMixin;
};
let instance$g = null;
function getCss$e() {
  return (
    instance$g ||
    (instance$g = [
      ...[],
      css`
        :host {
          display: block;
        }
        :host(:not([show-all])) > ::slotted(:not(slot):not(.selected)) {
          display: none !important;
        }
      `,
    ])
  );
}
function getHtml$d() {
  return html`<slot></slot>`;
}
const CrPageSelectorElementBase = CrSelectableMixin(CrLitElement);
class CrPageSelectorElement extends CrPageSelectorElementBase {
  static get is() {
    return "cr-page-selector";
  }
  static get styles() {
    return getCss$e();
  }
  static get properties() {
    return { hasNestedSlots: { type: Boolean } };
  }
  render() {
    return getHtml$d.bind(this)();
  }
  #hasNestedSlots_accessor_storage = false;
  get hasNestedSlots() {
    return this.#hasNestedSlots_accessor_storage;
  }
  set hasNestedSlots(value) {
    this.#hasNestedSlots_accessor_storage = value;
  }
  constructor() {
    super();
    this.selectOnClick = false;
  }
  queryItems() {
    return this.hasNestedSlots
      ? Array.from(this.getSlot().assignedElements({ flatten: true }))
      : super.queryItems();
  }
  queryMatchingItem(selector) {
    if (this.hasNestedSlots) {
      const match = this.queryItems().find((el) => el.matches(selector));
      return match ? match : null;
    }
    return super.queryMatchingItem(selector);
  }
  observeItems() {
    if (this.hasNestedSlots) {
      this.addEventListener("slotchange", () => this.itemsChanged());
    }
    super.observeItems();
  }
}
customElements.define(CrPageSelectorElement.is, CrPageSelectorElement);
let instance$f = null;
function getCss$d() {
  return (
    instance$f ||
    (instance$f = [
      ...[getCss$A()],
      css`
        :host {
          display: block;
          box-sizing: border-box;
        }
        #promo {
          display: flex;
          align-items: center;
          background: var(--cr-card-background-color);
          border-radius: 8px;
          box-shadow: var(--cr-card-shadow);
          box-sizing: border-box;
          margin-block-start: 16px;
          margin-block-end: 8px;
          padding: 32px 48px 32px 27px;
          gap: 18px;
          position: relative;
          width: 100%;
        }
        #close {
          --cr-icon-button-margin-end: 0;
          position: absolute;
          inset-block-start: 12px;
          inset-inline-end: 12px;
        }
        #illustration {
          flex-shrink: 0;
          width: 250px;
          height: 121px;
          background: url(images/history_embeddings_promo.svg) no-repeat center
            center;
        }
        @media (prefers-color-scheme: dark) {
          #illustration {
            background-image: url(images/history_embeddings_promo_dark.svg);
          }
        }
        #text {
          max-width: 573px;
        }
        #title {
          margin-block-start: 0;
          margin-block-end: 8px;
          color: var(--cr-primary-text-color);
          font-size: 16px;
          font-weight: 500;
          line-height: 24px;
        }
        #description {
          color: var(--cr-secondary-text-color);
          font-size: 13px;
          font-style: normal;
          font-weight: 400;
          line-height: 20px;
        }
        #description-first-block {
          margin-block-end: 1em;
        }
        a {
          color: var(--cr-link-color);
          display: inline-block;
        }
      `,
    ])
  );
}
function getHtml$c() {
  return html`<!--_html_template_start_-->

    <div id="promo" role="dialog" aria-label="Promo" ?hidden="${!this.shown_}">
      <cr-icon-button
        id="close"
        iron-icon="cr:close"
        aria-label="Close promo"
        @click="${this.onCloseClick_}"
      >
      </cr-icon-button>

      <div id="illustration" aria-hidden="true"></div>
      <div id="text">
        <h2 id="title" ?hidden="${this.isAnswersEnabled_}">
          Pesquise o seu histÃ³rico com tecnologia de IA
        </h2>
        <h2 id="title" ?hidden="${!this.isAnswersEnabled_}">
          Get answers from your history, powered by AI
        </h2>
        <div id="description">
          <div id="description-first-block" ?hidden="${this.isAnswersEnabled_}">
            In a few words, describe what youâ€™re looking for, like
            &quot;comfortable walking shoes&quot; or &quot;vegetarian pasta
            recipes.&quot; As you visit more sites on this device, youâ€™ll see
            more results powered by AI.
          </div>
          <div
            id="description-first-block"
            ?hidden="${!this.isAnswersEnabled_}"
          >
            You can ask questions like &quot;what ingredients were in that pasta
            recipe?&quot; Using question words like &quot;what&quot; or
            &quot;where&quot; helps Chrome give you better answers. Or describe
            what you&#39;re looking for in a few words. As you visit more sites,
            you&#39;ll see more AI-powered results.
          </div>
          <div>
            As suas pesquisas, as melhores correspondÃªncias e o respetivo
            conteÃºdo da pÃ¡gina sÃ£o enviados para a Google e podem ser vistos
            por revisores humanos para melhorar esta funcionalidade.
            <a href="chrome://settings/ai/historySearch" target="_blank">
              Manage your history search setting
            </a>
          </div>
        </div>
      </div>
    </div>
    <!--_html_template_end_-->`;
}
const HISTORY_EMBEDDINGS_PROMO_SHOWN_KEY = "history-embeddings-promo";
const HISTORY_EMBEDDINGS_ANSWERS_PROMO_SHOWN_KEY =
  "history-embeddings-answers-promo";
function getPromoShownKey() {
  return loadTimeData.getBoolean("enableHistoryEmbeddingsAnswers")
    ? HISTORY_EMBEDDINGS_ANSWERS_PROMO_SHOWN_KEY
    : HISTORY_EMBEDDINGS_PROMO_SHOWN_KEY;
}
class HistoryEmbeddingsPromoElement extends CrLitElement {
  static get is() {
    return "history-embeddings-promo";
  }
  static get styles() {
    return getCss$d();
  }
  render() {
    return getHtml$c.bind(this)();
  }
  static get properties() {
    return { isAnswersEnabled_: { type: Boolean }, shown_: { type: Boolean } };
  }
  #isAnswersEnabled__accessor_storage = loadTimeData.getBoolean(
    "enableHistoryEmbeddingsAnswers"
  );
  get isAnswersEnabled_() {
    return this.#isAnswersEnabled__accessor_storage;
  }
  set isAnswersEnabled_(value) {
    this.#isAnswersEnabled__accessor_storage = value;
  }
  #shown__accessor_storage = !window.localStorage.getItem(getPromoShownKey());
  get shown_() {
    return this.#shown__accessor_storage;
  }
  set shown_(value) {
    this.#shown__accessor_storage = value;
  }
  onCloseClick_() {
    window.localStorage.setItem(getPromoShownKey(), true.toString());
    this.shown_ = false;
  }
}
customElements.define(
  HistoryEmbeddingsPromoElement.is,
  HistoryEmbeddingsPromoElement
);
const div$1 = document.createElement("div");
div$1.innerHTML = getTrustedHTML`<cr-iconset name="history" size="24">
  <svg>
    <defs>
      <!-- This is a copy of images/journeys.svg for use in <iron-icon>. See: crbug.com/1268282 -->
      <g id="journeys-on">
        <path d="M19 15c-1.3 0-2.4.84-2.82 2H11c-1.1 0-2-.9-2-2s.9-2 2-2h2c2.21 0 4-1.79 4-4s-1.79-4-4-4H7.82C7.4 3.84 6.3 3 5 3 3.34 3 2 4.34 2 6s1.34 3 3 3c1.3 0 2.4-.84 2.82-2H13c1.1 0 2 .9 2 2s-.9 2-2 2h-2c-2.21 0-4 1.79-4 4s1.79 4 4 4h5.18A2.996 2.996 0 0 0 22 18c0-1.66-1.34-3-3-3ZM5 7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1Z"></path>
      </g>
      <g id="journeys-off">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M2.104 2.099.69 3.513l1.482 1.482A3.005 3.005 0 0 0 2 6a2.996 2.996 0 0 0 4.003 2.826l2.818 2.818A3.999 3.999 0 0 0 11 19h5.177l.005.004 1.827 1.828 2.48 2.48 1.414-1.414-19.799-19.8Zm8.2 11.027A2.008 2.008 0 0 0 9 15c0 1.1.9 2 2 2h3.177l-3.874-3.874Z"></path>
        <path d="M15 9c0 .852-.54 1.584-1.295 1.871l1.48 1.48A3.999 3.999 0 0 0 13 5H7.834l2 2H13c1.1 0 2 .9 2 2ZM21.831 18.997l-3.825-3.825A2.996 2.996 0 0 1 22 18c0 .35-.06.685-.169.997Z"></path>
      </g>
      <g id="table-chart-organize">
        <path
            d="M5 21C4.45 21 3.975 20.8083 3.575 20.425C3.19167 20.025 3 19.55 3 19V5C3 4.45 3.19167 3.98333 3.575 3.6C3.975 3.2 4.45 3 5 3H12.025C11.8417 3.3 11.675 3.61667 11.525 3.95C11.375 4.28333 11.2583 4.63333 11.175 5H5V8H11.175C11.2583 8.36667 11.3667 8.71667 11.5 9.05C11.65 9.38333 11.825 9.7 12.025 10H9.5V19H14.5V12.275C14.8167 12.4417 15.1417 12.5833 15.475 12.7C15.8083 12.8 16.15 12.875 16.5 12.925V19H19V12.825C19.3667 12.7417 19.7167 12.625 20.05 12.475C20.3833 12.325 20.7 12.1583 21 11.975V19C21 19.55 20.8 20.025 20.4 20.425C20.0167 20.8083 19.55 21 19 21H5ZM5 19H7.5V10H5V19ZM5 21H7.5H3C3 21 3.19167 21 3.575 21C3.975 21 4.45 21 5 21ZM3 8C3 7.76667 3 7.525 3 7.275C3 7.025 3 6.76667 3 6.5C3 5.85 3 5.23333 3 4.65C3 4.05 3 3.5 3 3C3 3 3 3.2 3 3.6C3 3.98333 3 4.45 3 5V8ZM9.5 21H14.5C14 21 13.5333 21 13.1 21C12.6833 21 12.325 21 12.025 21H9.5ZM16.5 21H19C19.55 21 20.0167 21 20.4 21C20.8 21 21 21 21 21C20.5 21 19.95 21 19.35 21C18.7667 21 18.15 21 17.5 21C17.3167 21 17.1417 21 16.975 21C16.825 21 16.6667 21 16.5 21ZM17.5 12C17.5 10.4667 16.9667 9.16667 15.9 8.1C14.8333 7.03333 13.5333 6.5 12 6.5C13.5333 6.5 14.8333 5.96667 15.9 4.9C16.9667 3.83333 17.5 2.53333 17.5 0.999999C17.5 2.53333 18.0333 3.83333 19.1 4.9C20.1667 5.96667 21.4667 6.5 23 6.5C21.4667 6.5 20.1667 7.03333 19.1 8.1C18.0333 9.16667 17.5 10.4667 17.5 12Z">
        </path>
      </g>
    </defs>
  </svg>
</cr-iconset>

<cr-iconset name="history20" size="20">
  <svg>
    <defs>
      <g id="auto-nav">
        <path fill-rule="evenodd" clip-rule="evenodd"
          d="M3.5 5V15V5ZM3.5 16.5C3.08333 16.5 2.72917 16.3542 2.4375 16.0625C2.14583 15.7708 2 15.4167 2 15V5C2 4.58333 2.14583 4.22917 2.4375 3.9375C2.72917 3.64583 3.08333 3.5 3.5 3.5H9C9 3.73611 9 3.97917 9 4.22917C9 4.47917 9 4.73611 9 5H3.5V15H16.5V10C16.7778 10 17.0417 10 17.2917 10C17.5417 10 17.7778 10 18 10V15C18 15.4167 17.8542 15.7708 17.5625 16.0625C17.2708 16.3542 16.9167 16.5 16.5 16.5H3.5ZM14.5 10C14.5 8.75 14.0625 7.6875 13.1875 6.8125C12.3125 5.9375 11.25 5.5 10 5.5C11.25 5.5 12.3125 5.0625 13.1875 4.1875C14.0625 3.3125 14.5 2.25 14.5 0.999999C14.5 2.25 14.9375 3.3125 15.8125 4.1875C16.6875 5.0625 17.75 5.5 19 5.5C17.75 5.5 16.6875 5.9375 15.8125 6.8125C14.9375 7.6875 14.5 8.75 14.5 10Z">
        </path>
      </g>
    </defs>
  </svg>
</cr-iconset>`;
const iconsets$1 = div$1.querySelectorAll("cr-iconset");
for (const iconset of iconsets$1) {
  document.head.appendChild(iconset);
}
let instance$e = null;
function getCss$c() {
  return (
    instance$e ||
    (instance$e = [
      ...[getCss$A()],
      css`
        :host {
          display: block;
          position: absolute;
          outline: none;
          z-index: 1002;
          user-select: none;
          cursor: default;
        }
        #tooltip {
          display: block;
          outline: none;
          font-size: 10px;
          line-height: 1;
          background-color: var(--paper-tooltip-background, #616161);
          color: var(--paper-tooltip-text-color, white);
          padding: 8px;
          border-radius: 2px;
        }
        @keyframes keyFrameFadeInOpacity {
          0% {
            opacity: 0;
          }
          100% {
            opacity: var(--paper-tooltip-opacity, 0.9);
          }
        }
        @keyframes keyFrameFadeOutOpacity {
          0% {
            opacity: var(--paper-tooltip-opacity, 0.9);
          }
          100% {
            opacity: 0;
          }
        }
        .fade-in-animation {
          opacity: 0;
          animation-delay: var(--paper-tooltip-delay-in, 500ms);
          animation-name: keyFrameFadeInOpacity;
          animation-iteration-count: 1;
          animation-timing-function: ease-in;
          animation-duration: var(--paper-tooltip-duration-in, 500ms);
          animation-fill-mode: forwards;
        }
        .fade-out-animation {
          opacity: var(--paper-tooltip-opacity, 0.9);
          animation-delay: var(--paper-tooltip-delay-out, 0ms);
          animation-name: keyFrameFadeOutOpacity;
          animation-iteration-count: 1;
          animation-timing-function: ease-in;
          animation-duration: var(--paper-tooltip-duration-out, 500ms);
          animation-fill-mode: forwards;
        }
        #tooltipOffsetFiller {
          position: absolute;
          :host([position="top"]) & {
            top: 100%;
          }
          :host([position="bottom"]) & {
            bottom: 100%;
          }
          :host([position="left"]) & {
            left: 100%;
          }
          :host([position="right"]) & {
            right: 100%;
          }
          :host(:is([position="top"], [position="bottom"])) & {
            left: 0;
            height: var(--cr-tooltip-offset);
            width: 100%;
          }
          :host(:is([position="left"], [position="right"])) & {
            top: 0;
            height: 100%;
            width: var(--cr-tooltip-offset);
          }
        }
      `,
    ])
  );
}
function getHtml$b() {
  return html` <div id="tooltip" hidden part="tooltip">
      <slot></slot>
    </div>
    <div id="tooltipOffsetFiller"></div>`;
}
var TooltipPosition;
(function (TooltipPosition) {
  TooltipPosition["TOP"] = "top";
  TooltipPosition["BOTTOM"] = "bottom";
  TooltipPosition["LEFT"] = "left";
  TooltipPosition["RIGHT"] = "right";
})(TooltipPosition || (TooltipPosition = {}));
class CrTooltipElement extends CrLitElement {
  static get is() {
    return "cr-tooltip";
  }
  static get styles() {
    return getCss$c();
  }
  render() {
    return getHtml$b.bind(this)();
  }
  static get properties() {
    return {
      for: { type: String },
      manualMode: { type: Boolean },
      position: { type: String, reflect: true },
      fitToVisibleBounds: { type: Boolean },
      offset: { type: Number },
      animationDelay: { type: Number },
      hideDelay: { type: Number },
    };
  }
  #animationDelay_accessor_storage = 500;
  get animationDelay() {
    return this.#animationDelay_accessor_storage;
  }
  set animationDelay(value) {
    this.#animationDelay_accessor_storage = value;
  }
  #fitToVisibleBounds_accessor_storage = false;
  get fitToVisibleBounds() {
    return this.#fitToVisibleBounds_accessor_storage;
  }
  set fitToVisibleBounds(value) {
    this.#fitToVisibleBounds_accessor_storage = value;
  }
  #hideDelay_accessor_storage = 600;
  get hideDelay() {
    return this.#hideDelay_accessor_storage;
  }
  set hideDelay(value) {
    this.#hideDelay_accessor_storage = value;
  }
  #for_accessor_storage = "";
  get for() {
    return this.#for_accessor_storage;
  }
  set for(value) {
    this.#for_accessor_storage = value;
  }
  #manualMode_accessor_storage = false;
  get manualMode() {
    return this.#manualMode_accessor_storage;
  }
  set manualMode(value) {
    this.#manualMode_accessor_storage = value;
  }
  #offset_accessor_storage = 14;
  get offset() {
    return this.#offset_accessor_storage;
  }
  set offset(value) {
    this.#offset_accessor_storage = value;
  }
  #position_accessor_storage = TooltipPosition.BOTTOM;
  get position() {
    return this.#position_accessor_storage;
  }
  set position(value) {
    this.#position_accessor_storage = value;
  }
  animationPlaying_ = false;
  showing_ = false;
  manualTarget_;
  target_ = null;
  tracker_ = new EventTracker();
  hideTimeout_ = null;
  connectedCallback() {
    super.connectedCallback();
    this.findTarget_();
  }
  disconnectedCallback() {
    if (!this.manualMode) {
      this.removeListeners_();
    }
    this.resetHideTimeout_();
  }
  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
    this.addEventListener("animationend", () => this.onAnimationEnd_());
  }
  willUpdate(changedProperties) {
    super.willUpdate(changedProperties);
    if (changedProperties.has("animationDelay")) {
      this.style.setProperty(
        "--paper-tooltip-delay-in",
        `${this.animationDelay}ms`
      );
    }
  }
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has("for")) {
      this.findTarget_();
    }
    if (changedProperties.has("manualMode")) {
      if (this.manualMode) {
        this.removeListeners_();
      } else {
        this.addListeners_();
      }
    }
    if (changedProperties.has("offset")) {
      this.style.setProperty("--cr-tooltip-offset", `${this.offset}px`);
    }
  }
  get target() {
    if (this.manualTarget_) {
      return this.manualTarget_;
    }
    const ownerRoot = this.getRootNode();
    if (this.for) {
      return ownerRoot.querySelector(`#${this.for}`);
    }
    const parentNode = this.parentNode;
    return !!parentNode && parentNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE
      ? ownerRoot.host
      : parentNode;
  }
  set target(target) {
    this.manualTarget_ = target;
    this.findTarget_();
  }
  show() {
    this.resetHideTimeout_();
    if (this.showing_) {
      return;
    }
    if (!!this.textContent && this.textContent.trim() === "") {
      const children = this.shadowRoot.querySelector("slot").assignedElements();
      const hasNonEmptyChild = Array.from(children).some(
        (el) => !!el.textContent && el.textContent.trim() !== ""
      );
      if (!hasNonEmptyChild) {
        return;
      }
    }
    this.showing_ = true;
    this.$.tooltip.hidden = false;
    this.$.tooltip.classList.remove("fade-out-animation");
    this.updatePosition();
    this.animationPlaying_ = true;
    this.$.tooltip.classList.add("fade-in-animation");
  }
  hide() {
    if (!this.showing_) {
      return;
    }
    if (this.animationPlaying_) {
      this.showing_ = false;
      this.$.tooltip.classList.remove(
        "fade-in-animation",
        "fade-out-animation"
      );
      this.$.tooltip.hidden = true;
      return;
    }
    this.$.tooltip.classList.remove("fade-in-animation");
    this.$.tooltip.classList.add("fade-out-animation");
    this.showing_ = false;
    this.animationPlaying_ = true;
  }
  queueHide_() {
    this.resetHideTimeout_();
    this.hideTimeout_ = setTimeout(() => {
      this.hide();
      this.hideTimeout_ = null;
    }, this.hideDelay);
  }
  resetHideTimeout_() {
    if (this.hideTimeout_ !== null) {
      clearTimeout(this.hideTimeout_);
      this.hideTimeout_ = null;
    }
  }
  updatePosition() {
    if (!this.target_) {
      return;
    }
    const offsetParent = this.offsetParent || this.composedOffsetParent_();
    if (!offsetParent) {
      return;
    }
    const offset = this.offset;
    const parentRect = offsetParent.getBoundingClientRect();
    const targetRect = this.target_.getBoundingClientRect();
    const tooltipRect = this.$.tooltip.getBoundingClientRect();
    const horizontalCenterOffset = (targetRect.width - tooltipRect.width) / 2;
    const verticalCenterOffset = (targetRect.height - tooltipRect.height) / 2;
    const targetLeft = targetRect.left - parentRect.left;
    const targetTop = targetRect.top - parentRect.top;
    let tooltipLeft;
    let tooltipTop;
    switch (this.position) {
      case TooltipPosition.TOP:
        tooltipLeft = targetLeft + horizontalCenterOffset;
        tooltipTop = targetTop - tooltipRect.height - offset;
        break;
      case TooltipPosition.BOTTOM:
        tooltipLeft = targetLeft + horizontalCenterOffset;
        tooltipTop = targetTop + targetRect.height + offset;
        break;
      case TooltipPosition.LEFT:
        tooltipLeft = targetLeft - tooltipRect.width - offset;
        tooltipTop = targetTop + verticalCenterOffset;
        break;
      case TooltipPosition.RIGHT:
        tooltipLeft = targetLeft + targetRect.width + offset;
        tooltipTop = targetTop + verticalCenterOffset;
        break;
    }
    if (this.fitToVisibleBounds) {
      if (
        parentRect.left + tooltipLeft + tooltipRect.width >
        window.innerWidth
      ) {
        this.style.right = "0px";
        this.style.left = "auto";
      } else {
        this.style.left = Math.max(0, tooltipLeft) + "px";
        this.style.right = "auto";
      }
      if (
        parentRect.top + tooltipTop + tooltipRect.height >
        window.innerHeight
      ) {
        this.style.bottom = parentRect.height - targetTop + offset + "px";
        this.style.top = "auto";
      } else {
        this.style.top = Math.max(-parentRect.top, tooltipTop) + "px";
        this.style.bottom = "auto";
      }
    } else {
      this.style.left = tooltipLeft + "px";
      this.style.top = tooltipTop + "px";
    }
  }
  findTarget_() {
    if (!this.manualMode) {
      this.removeListeners_();
    }
    this.target_ = this.target;
    if (!this.manualMode) {
      this.addListeners_();
    }
  }
  onAnimationEnd_() {
    this.animationPlaying_ = false;
    if (!this.showing_) {
      this.$.tooltip.classList.remove("fade-out-animation");
      this.$.tooltip.hidden = true;
    }
  }
  addListeners_() {
    if (this.target_) {
      this.tracker_.add(this.target_, "pointerenter", () => this.show());
      this.tracker_.add(this.target_, "focus", () => this.show());
      this.tracker_.add(this.target_, "pointerleave", () => this.queueHide_());
      this.tracker_.add(this.target_, "blur", () => this.hide());
      this.tracker_.add(this.target_, "click", () => this.hide());
    }
    this.tracker_.add(this.$.tooltip, "animationend", () =>
      this.onAnimationEnd_()
    );
    this.tracker_.add(this, "pointerenter", () => this.show());
    this.tracker_.add(this, "pointerleave", () => this.queueHide_());
  }
  removeListeners_() {
    this.tracker_.removeAll();
  }
  composedOffsetParent_() {
    if (this.computedStyleMap().get("display").value === "none") {
      return null;
    }
    for (
      let ancestor = flatTreeParent(this);
      ancestor !== null;
      ancestor = flatTreeParent(ancestor)
    ) {
      if (!(ancestor instanceof Element)) {
        continue;
      }
      const style = ancestor.computedStyleMap();
      if (style.get("display").value === "none") {
        return null;
      }
      if (style.get("display").value === "contents") {
        continue;
      }
      if (style.get("position").value !== "static") {
        return ancestor;
      }
      if (ancestor.tagName === "BODY") {
        return ancestor;
      }
    }
    return null;
    function flatTreeParent(element) {
      if (element.assignedSlot) {
        return element.assignedSlot;
      }
      if (element.parentNode instanceof ShadowRoot) {
        return element.parentNode.host;
      }
      return element.parentElement;
    }
  }
}
customElements.define(CrTooltipElement.is, CrTooltipElement);
let instance$d = null;
function getCss$b() {
  return (
    instance$d ||
    (instance$d = [
      ...[getCss$z()],
      css`
        :host {
          display: flex;
        }
        cr-icon {
          --iron-icon-width: var(--cr-icon-size);
          --iron-icon-height: var(--cr-icon-size);
          --iron-icon-fill-color: var(
            --cr-tooltip-icon-fill-color,
            var(--google-grey-700)
          );
        }
        @media (prefers-color-scheme: dark) {
          cr-icon {
            --iron-icon-fill-color: var(
              --cr-tooltip-icon-fill-color,
              var(--google-grey-500)
            );
          }
        }
      `,
    ])
  );
}
function getHtml$a() {
  return html` <cr-icon
      id="indicator"
      tabindex="0"
      aria-label="${this.iconAriaLabel}"
      aria-describedby="tooltip"
      icon="${this.iconClass}"
      role="img"
    >
    </cr-icon>
    <cr-tooltip
      id="tooltip"
      for="indicator"
      position="${this.tooltipPosition}"
      fit-to-visible-bounds
      part="tooltip"
    >
      <slot name="tooltip-text">${this.tooltipText}</slot>
    </cr-tooltip>`;
}
class CrTooltipIconElement extends CrLitElement {
  static get is() {
    return "cr-tooltip-icon";
  }
  static get styles() {
    return getCss$b();
  }
  render() {
    return getHtml$a.bind(this)();
  }
  static get properties() {
    return {
      iconAriaLabel: { type: String },
      iconClass: { type: String },
      tooltipText: { type: String },
      tooltipPosition: { type: String },
    };
  }
  #iconAriaLabel_accessor_storage = "";
  get iconAriaLabel() {
    return this.#iconAriaLabel_accessor_storage;
  }
  set iconAriaLabel(value) {
    this.#iconAriaLabel_accessor_storage = value;
  }
  #iconClass_accessor_storage = "";
  get iconClass() {
    return this.#iconClass_accessor_storage;
  }
  set iconClass(value) {
    this.#iconClass_accessor_storage = value;
  }
  #tooltipText_accessor_storage = "";
  get tooltipText() {
    return this.#tooltipText_accessor_storage;
  }
  set tooltipText(value) {
    this.#tooltipText_accessor_storage = value;
  }
  #tooltipPosition_accessor_storage = "top";
  get tooltipPosition() {
    return this.#tooltipPosition_accessor_storage;
  }
  set tooltipPosition(value) {
    this.#tooltipPosition_accessor_storage = value;
  }
  getFocusableElement() {
    return this.$.indicator;
  }
}
customElements.define(CrTooltipIconElement.is, CrTooltipIconElement);
class FocusRowMixinDelegate {
  listItem_;
  constructor(listItem) {
    this.listItem_ = listItem;
  }
  onFocus(_row, e) {
    const element = e.composedPath()[0];
    const focusableElement = FocusRow.getFocusableElement(element);
    if (element !== focusableElement) {
      focusableElement.focus();
    }
    this.listItem_.lastFocused = focusableElement;
  }
  onKeydown(_row, e) {
    if (e.key === "Enter") {
      e.stopPropagation();
    }
    return false;
  }
  getCustomEquivalent(sampleElement) {
    return this.listItem_.overrideCustomEquivalent
      ? this.listItem_.getCustomEquivalent(sampleElement)
      : null;
  }
}
const FocusRowMixinLit = (superClass) => {
  class FocusRowMixinLit extends superClass {
    static get properties() {
      return {
        row_: { type: Object },
        mouseFocused_: { type: Boolean },
        id: { type: String, reflect: true },
        isFocused: { type: Boolean, notify: true },
        focusRowIndex: { type: Number },
        lastFocused: { type: Object, notify: true },
        listTabIndex: { type: Number },
        listBlurred: { type: Boolean, notify: true },
      };
    }
    #row__accessor_storage = null;
    get row_() {
      return this.#row__accessor_storage;
    }
    set row_(value) {
      this.#row__accessor_storage = value;
    }
    #mouseFocused__accessor_storage = false;
    get mouseFocused_() {
      return this.#mouseFocused__accessor_storage;
    }
    set mouseFocused_(value) {
      this.#mouseFocused__accessor_storage = value;
    }
    #isFocused_accessor_storage = false;
    get isFocused() {
      return this.#isFocused_accessor_storage;
    }
    set isFocused(value) {
      this.#isFocused_accessor_storage = value;
    }
    #focusRowIndex_accessor_storage;
    get focusRowIndex() {
      return this.#focusRowIndex_accessor_storage;
    }
    set focusRowIndex(value) {
      this.#focusRowIndex_accessor_storage = value;
    }
    #lastFocused_accessor_storage = null;
    get lastFocused() {
      return this.#lastFocused_accessor_storage;
    }
    set lastFocused(value) {
      this.#lastFocused_accessor_storage = value;
    }
    #listTabIndex_accessor_storage;
    get listTabIndex() {
      return this.#listTabIndex_accessor_storage;
    }
    set listTabIndex(value) {
      this.#listTabIndex_accessor_storage = value;
    }
    #listBlurred_accessor_storage = false;
    get listBlurred() {
      return this.#listBlurred_accessor_storage;
    }
    set listBlurred(value) {
      this.#listBlurred_accessor_storage = value;
    }
    firstControl_ = null;
    controlObservers_ = [];
    subtreeObserver_ = null;
    boundOnFirstControlKeydown_ = null;
    connectedCallback() {
      super.connectedCallback();
      this.classList.add("no-outline");
      this.boundOnFirstControlKeydown_ = this.onFirstControlKeydown_.bind(this);
      this.updateComplete.then(() => {
        const rowContainer = this.shadowRoot.querySelector(
          "[focus-row-container]"
        );
        assert(rowContainer);
        this.row_ = new VirtualFocusRow(
          rowContainer,
          new FocusRowMixinDelegate(this)
        );
        this.addItems_();
        this.addEventListener("focus", this.onFocus_);
        this.subtreeObserver_ = new MutationObserver(() => this.addItems_());
        this.subtreeObserver_.observe(this.shadowRoot, {
          childList: true,
          subtree: true,
        });
        this.addEventListener("mousedown", this.onMouseDown_);
        this.addEventListener("blur", this.onBlur_);
      });
    }
    disconnectedCallback() {
      super.disconnectedCallback();
      this.removeEventListener("focus", this.onFocus_);
      if (this.subtreeObserver_) {
        this.subtreeObserver_.disconnect();
        this.subtreeObserver_ = null;
      }
      this.removeEventListener("mousedown", this.onMouseDown_);
      this.removeEventListener("blur", this.onBlur_);
      this.removeObservers_();
      if (this.firstControl_ && this.boundOnFirstControlKeydown_) {
        this.firstControl_.removeEventListener(
          "keydown",
          this.boundOnFirstControlKeydown_
        );
        this.boundOnFirstControlKeydown_ = null;
      }
      if (this.row_) {
        this.row_.destroy();
      }
    }
    willUpdate(changedProperties) {
      super.willUpdate(changedProperties);
      if (
        changedProperties.has("focusRowIndex") &&
        this.focusRowIndex !== undefined
      ) {
        this.setAttribute("aria-rowindex", (this.focusRowIndex + 1).toString());
        const oldIndex = changedProperties.get("focusRowIndex");
        if (this.id === this.computeId_(oldIndex)) {
          this.id = this.computeId_(this.focusRowIndex) || "";
        }
      }
    }
    updated(changedProperties) {
      super.updated(changedProperties);
      if (changedProperties.has("listTabIndex")) {
        this.listTabIndexChanged_();
      }
    }
    computeId_(index) {
      return index !== undefined ? `frb${index}` : undefined;
    }
    getFocusRow() {
      assert(this.row_);
      return this.row_;
    }
    updateFirstControl_() {
      assert(this.row_);
      const newFirstControl = this.row_.getFirstFocusable();
      if (newFirstControl === this.firstControl_) {
        return;
      }
      if (this.firstControl_) {
        this.firstControl_.removeEventListener(
          "keydown",
          this.boundOnFirstControlKeydown_
        );
      }
      this.firstControl_ = newFirstControl;
      if (this.firstControl_) {
        this.firstControl_.addEventListener(
          "keydown",
          this.boundOnFirstControlKeydown_
        );
      }
    }
    removeObservers_() {
      if (this.controlObservers_.length > 0) {
        this.controlObservers_.forEach((observer) => {
          observer.disconnect();
        });
      }
      this.controlObservers_ = [];
    }
    addItems_() {
      this.listTabIndexChanged_();
      if (this.row_) {
        this.removeObservers_();
        this.row_.destroy();
        const controls = this.shadowRoot.querySelectorAll(
          "[focus-row-control]"
        );
        controls.forEach((control) => {
          assert(control);
          assert(this.row_);
          this.row_.addItem(
            control.getAttribute("focus-type"),
            FocusRow.getFocusableElement(control)
          );
          this.addMutationObservers_(control);
        });
        this.updateFirstControl_();
      }
    }
    createObserver_() {
      return new MutationObserver((mutations) => {
        const mutation = mutations[0];
        if (mutation.attributeName === "style" && mutation.oldValue) {
          const newStyle = window.getComputedStyle(mutation.target);
          const oldDisplayValue = mutation.oldValue.match(/^display:(.*)(?=;)/);
          const oldVisibilityValue = mutation.oldValue.match(
            /^visibility:(.*)(?=;)/
          );
          if (
            oldDisplayValue &&
            newStyle.display === oldDisplayValue[1].trim() &&
            oldVisibilityValue &&
            newStyle.visibility === oldVisibilityValue[1].trim()
          ) {
            return;
          }
        }
        this.updateFirstControl_();
      });
    }
    addMutationObservers_(control) {
      let current = control;
      while (current && current !== this.shadowRoot) {
        const currentObserver = this.createObserver_();
        currentObserver.observe(current, {
          attributes: true,
          attributeFilter: ["hidden", "disabled", "style"],
          attributeOldValue: true,
        });
        this.controlObservers_.push(currentObserver);
        current = current.parentNode;
      }
    }
    onFocus_(e) {
      if (this.mouseFocused_) {
        this.mouseFocused_ = false;
        return;
      }
      const restoreFocusToFirst =
        this.listBlurred && e.composedPath()[0] === this;
      if (this.lastFocused && !restoreFocusToFirst) {
        assert(this.row_);
        focusWithoutInk(this.row_.getEquivalentElement(this.lastFocused));
      } else {
        assert(this.firstControl_);
        const firstFocusable = this.firstControl_;
        focusWithoutInk(firstFocusable);
      }
      this.listBlurred = false;
      this.isFocused = true;
    }
    onFirstControlKeydown_(e) {
      const keyEvent = e;
      if (keyEvent.shiftKey && keyEvent.key === "Tab") {
        this.focus();
      }
    }
    listTabIndexChanged_() {
      if (this.row_) {
        this.row_.makeActive(this.listTabIndex === 0);
      }
      if (this.listTabIndex === 0) {
        this.listBlurred = false;
      }
    }
    onMouseDown_() {
      this.mouseFocused_ = true;
    }
    onBlur_(e) {
      this.mouseFocused_ = false;
      this.isFocused = false;
      const node = e.relatedTarget ? e.relatedTarget : null;
      if (!this.parentNode.contains(node)) {
        this.listBlurred = true;
      }
    }
  }
  return FocusRowMixinLit;
};
let instance$c = null;
function getCss$a() {
  return (
    instance$c ||
    (instance$c = [
      ...[getCss$A(), getCss$C()],
      css`
        :host {
          display: block;
          outline: none;
          pointer-events: none;
        }
        #main-container {
          position: relative;
        }
        :host([is-card-end]) #main-container {
          margin-bottom: var(--card-padding-between);
        }
        :host([is-card-start][is-card-end]) #main-container {
          border-radius: var(--cr-card-border-radius);
        }
        #date-accessed {
          display: none;
        }
        :host([is-card-start]) #date-accessed {
          display: block;
        }
        #item-container {
          align-items: center;
          display: flex;
          min-height: var(--item-height);
          padding-inline-start: 14px;
          pointer-events: auto;
        }
        :host([is-card-start]) #item-container {
          padding-top: var(--card-first-last-item-padding);
        }
        :host([is-card-end]) #item-container {
          padding-bottom: var(--card-first-last-item-padding);
        }
        #item-info {
          align-items: center;
          display: flex;
          flex: 1;
          min-width: 0;
        }
        #title-and-domain {
          align-items: center;
          display: flex;
          flex: 1;
          height: var(--item-height);
          margin-inline-end: auto;
          overflow: hidden;
          padding-inline-start: 5px;
        }
        #checkbox {
          margin: 0 10px;
        }
        #checkbox:not(:defined) {
          border: 2px solid var(--cr-secondary-text-color);
          border-radius: 2px;
          content: "";
          display: block;
          height: 12px;
          width: 12px;
        }
        #time-accessed {
          color: var(--history-item-time-color);
          font-size: 12px;
          margin-inline-start: 6px;
          min-width: 96px;
        }
        #domain {
          color: var(--cr-secondary-text-color);
          font-size: 12px;
          margin-inline-start: 8px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        #menu-button {
          --cr-icon-button-margin-end: 20px;
          --cr-icon-button-margin-start: 12px;
          --cr-icon-button-icon-size: 16px;
          --cr-icon-button-size: 24px;
        }
        #actor-icon {
          --cr-icon-size: 20px;
          padding-inline-start: 12px;
        }
        #bookmark-star {
          --cr-icon-button-fill-color: var(--interactive-color);
          --cr-icon-button-icon-size: 16px;
          --cr-icon-button-margin-start: 12px;
          --cr-icon-button-size: 32px;
        }
        #icons {
          align-items: center;
          display: flex;
        }
        #debug-container {
          color: var(--history-item-time-color);
          display: flex;
          padding-inline-start: 22px;
          pointer-events: auto;
        }
        .debug-info:not(:first-child) {
          margin-inline-start: 15px;
        }
        #time-gap-separator {
          border-inline-start: 1px solid #888;
          height: 15px;
          margin-inline-start: 77px;
        }
        @media (prefers-color-scheme: dark) {
          #time-gap-separator {
            border-color: var(--google-grey-500);
          }
        }
        #background-clip {
          bottom: -0.4px;
          clip: rect(auto 999px auto -5px);
          left: 0;
          position: absolute;
          right: 0;
          top: 0;
          z-index: -1;
        }
        :host([is-card-end]) #background-clip {
          bottom: 0;
          clip: rect(auto 999px 500px -5px);
        }
        :host([is-card-start]) #background-clip {
          clip: auto;
        }
        #background {
          background-color: var(--cr-card-background-color);
          bottom: 0;
          box-shadow: var(--cr-card-shadow);
          left: 0;
          position: absolute;
          right: 0;
          top: 0;
        }
        :host(:not([is-card-start])) #background {
          top: -5px;
        }
        :host([is-card-start]) #background {
          border-radius: var(--cr-card-border-radius)
            var(--cr-card-border-radius) 0 0;
        }
        :host([is-card-end]) #background {
          border-radius: 0 0 var(--cr-card-border-radius)
            var(--cr-card-border-radius);
        }
        :host([is-card-start][is-card-end]) #background {
          border-radius: var(--cr-card-border-radius);
        }
        #options {
          align-items: center;
          display: flex;
        }
        cr-checkbox::part(label-container) {
          clip: rect(0, 0, 0, 0);
          display: block;
          position: fixed;
        }
      `,
    ])
  );
}
function getHtml$9() {
  return html`<!--_html_template_start_-->
    <div id="main-container">
      <div id="background-clip" aria-hidden="true">
        <div id="background"></div>
      </div>
      <div id="date-accessed" class="card-title" role="row">
        <div role="rowheader">
          <div role="heading" aria-level="2">${this.cardTitle_()}</div>
        </div>
      </div>
      <div
        role="row"
        @mousedown="${this.onRowMousedown_}"
        @click="${this.onRowClick_}"
      >
        <div id="item-container" focus-row-container>
          <div role="gridcell">
            <cr-checkbox
              id="checkbox"
              .checked="${this.selected}"
              focus-row-control
              focus-type="cr-checkbox"
              @mousedown="${this.onCheckboxClick_}"
              @keydown="${this.onCheckboxClick_}"
              @change="${this.onCheckboxChange_}"
              class="no-label"
              ?hidden="${this.selectionNotAllowed_}"
              .disabled="${this.selectionNotAllowed_}"
            >
              ${this.getEntrySummary_()}
            </cr-checkbox>
          </div>
          <!-- ARIA hidden to avoid redundancy since timestamp is already part of
              |getEntrySummary_|. -->
          <span id="time-accessed" aria-hidden="true">
            ${this.item?.readableTimestamp}
          </span>
          <div role="gridcell" id="item-info">
            <div id="title-and-domain">
              <a
                href="${this.item?.url}"
                id="link"
                class="website-link"
                focus-row-control
                focus-type="link"
                title="${this.item?.title}"
                @click="${this.onLinkClick_}"
                @auxclick="${this.onLinkClick_}"
                @contextmenu="${this.onLinkRightClick_}"
                aria-describedby="${this.getAriaDescribedByForHeading_()}"
              >
                <div class="website-icon" id="icon"></div>
                <history-searched-label
                  class="website-title"
                  title="${this.item?.title}"
                  search-term="${this.searchTerm}"
                ></history-searched-label>
              </a>
              <span id="domain">${this.item?.domain}</span>
            </div>
            <div id="icons">
              ${this.shouldShowActorTooltip_()
                ? html`
                    <cr-tooltip-icon
                      id="actor-icon"
                      icon-class="history20:auto-nav"
                      tooltip-text="Gemini task"
                      icon-aria-label="Gemini task"
                    >
                    </cr-tooltip-icon>
                  `
                : ""}
              ${this.item?.starred
                ? html`
                    <cr-icon-button
                      id="bookmark-star"
                      iron-icon="cr:star"
                      @click="${this.onRemoveBookmarkClick_}"
                      title="Remover marcador"
                      aria-hidden="true"
                    >
                    </cr-icon-button>
                  `
                : ""}
            </div>
          </div>
          <div role="gridcell" id="options">
            <cr-icon-button
              id="menu-button"
              iron-icon="cr:more-vert"
              focus-row-control
              focus-type="cr-menu-button"
              title="AÃ§Ãµes"
              @click="${this.onMenuButtonClick_}"
              @keydown="${this.onMenuButtonKeydown_}"
              aria-haspopup="menu"
              aria-describedby="${this.getAriaDescribedByForActions_()}"
            >
            </cr-icon-button>
          </div>
        </div>
        ${this.item?.debug
          ? html` <div id="debug-container" aria-hidden="true">
              <div class="debug-info">DEBUG</div>
              <div
                class="debug-info"
                ?hidden="${!this.item?.debug.isUrlInLocalDatabase}"
              >
                in local data
              </div>
              <div
                class="debug-info"
                ?hidden="${!this.item?.isUrlInRemoteUserData}"
              >
                in remote data
              </div>
              <div
                class="debug-info"
                ?hidden="${!this.item?.debug.isUrlInLocalDatabase}"
              >
                typed count: ${this.item?.debug.typedCount}
              </div>
              <div
                class="debug-info"
                hidden="${!this.item?.debug.isUrlInLocalDatabase}"
              >
                visit count: ${this.item?.debug.visitCount}
              </div>
            </div>`
          : ""}
        <div id="time-gap-separator" ?hidden="${!this.hasTimeGap}"></div>
      </div>
    </div>
    <!--_html_template_end_-->`;
}
const HistoryItemElementBase = FocusRowMixinLit(CrLitElement);
class HistoryItemElement extends HistoryItemElementBase {
  static get is() {
    return "history-item";
  }
  static get styles() {
    return getCss$a();
  }
  render() {
    return getHtml$9.bind(this)();
  }
  static get properties() {
    return {
      item: { type: Object },
      selected: { type: Boolean, reflect: true },
      isCardStart: { type: Boolean, reflect: true },
      isCardEnd: { type: Boolean, reflect: true },
      selectionNotAllowed_: { type: Boolean },
      hasTimeGap: { type: Boolean },
      index: { type: Number },
      numberOfItems: { type: Number },
      searchTerm: { type: String },
    };
  }
  isShiftKeyDown_ = false;
  #selectionNotAllowed__accessor_storage = !loadTimeData.getBoolean(
    "allowDeletingHistory"
  );
  get selectionNotAllowed_() {
    return this.#selectionNotAllowed__accessor_storage;
  }
  set selectionNotAllowed_(value) {
    this.#selectionNotAllowed__accessor_storage = value;
  }
  eventTracker_ = new EventTracker();
  #item_accessor_storage;
  get item() {
    return this.#item_accessor_storage;
  }
  set item(value) {
    this.#item_accessor_storage = value;
  }
  #hasTimeGap_accessor_storage = false;
  get hasTimeGap() {
    return this.#hasTimeGap_accessor_storage;
  }
  set hasTimeGap(value) {
    this.#hasTimeGap_accessor_storage = value;
  }
  #index_accessor_storage = -1;
  get index() {
    return this.#index_accessor_storage;
  }
  set index(value) {
    this.#index_accessor_storage = value;
  }
  #searchTerm_accessor_storage = "";
  get searchTerm() {
    return this.#searchTerm_accessor_storage;
  }
  set searchTerm(value) {
    this.#searchTerm_accessor_storage = value;
  }
  #isCardStart_accessor_storage = false;
  get isCardStart() {
    return this.#isCardStart_accessor_storage;
  }
  set isCardStart(value) {
    this.#isCardStart_accessor_storage = value;
  }
  #isCardEnd_accessor_storage = false;
  get isCardEnd() {
    return this.#isCardEnd_accessor_storage;
  }
  set isCardEnd(value) {
    this.#isCardEnd_accessor_storage = value;
  }
  #numberOfItems_accessor_storage = 0;
  get numberOfItems() {
    return this.#numberOfItems_accessor_storage;
  }
  set numberOfItems(value) {
    this.#numberOfItems_accessor_storage = value;
  }
  #selected_accessor_storage = false;
  get selected() {
    return this.#selected_accessor_storage;
  }
  set selected(value) {
    this.#selected_accessor_storage = value;
  }
  connectedCallback() {
    super.connectedCallback();
    this.updateComplete.then(() => {
      this.eventTracker_.add(this.$.checkbox, "keydown", (e) =>
        this.onCheckboxKeydown_(e)
      );
    });
  }
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has("item")) {
      this.itemChanged_();
      this.fire("iron-resize");
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.eventTracker_.remove(this.$.checkbox, "keydown");
  }
  focusOnMenuButton() {
    focusWithoutInk(this.$["menu-button"]);
  }
  onCheckboxKeydown_(e) {
    if (e.shiftKey && e.key === "Tab") {
      this.focus();
    }
  }
  onRowClick_(e) {
    const path = e.composedPath();
    let inItemContainer = false;
    for (let i = 0; i < path.length; i++) {
      const elem = path[i];
      if (
        elem.id !== "checkbox" &&
        (elem.nodeName === "A" || elem.nodeName === "CR-ICON-BUTTON")
      ) {
        return;
      }
      if (!inItemContainer && elem.id === "item-container") {
        inItemContainer = true;
      }
    }
    if (this.selectionNotAllowed_ || !inItemContainer) {
      return;
    }
    this.$.checkbox.focus();
    this.fire("history-checkbox-select", {
      index: this.index,
      shiftKey: e.shiftKey,
    });
  }
  onCheckboxClick_(e) {
    this.isShiftKeyDown_ = e.shiftKey;
  }
  onCheckboxChange_() {
    this.fire("history-checkbox-select", {
      index: this.index,
      shiftKey: this.isShiftKeyDown_,
    });
    this.isShiftKeyDown_ = false;
  }
  onRowMousedown_(e) {
    if (e.shiftKey) {
      e.preventDefault();
    }
  }
  getEntrySummary_() {
    const item = this.item;
    if (!item) {
      return "";
    }
    return loadTimeData.getStringF(
      "entrySummary",
      this.isCardStart || this.isCardEnd ? this.cardTitle_() : "",
      item.dateTimeOfDay,
      item.starred ? loadTimeData.getString("bookmarked") : "",
      item.title,
      item.domain
    );
  }
  getAriaDescribedByForHeading_() {
    return this.isCardStart || this.isCardEnd ? "date-accessed" : "";
  }
  getAriaDescribedByForActions_() {
    return this.isCardStart || this.isCardEnd
      ? "title-and-domain date-accessed"
      : "title-and-domain";
  }
  shouldShowActorTooltip_() {
    return (
      loadTimeData.getBoolean("enableBrowsingHistoryActorIntegrationM1") &&
      this.item?.isActorVisit
    );
  }
  onRemoveBookmarkClick_() {
    if (!this.item?.starred) {
      return;
    }
    if (
      this.shadowRoot.querySelector("#bookmark-star") ===
      this.shadowRoot.activeElement
    ) {
      focusWithoutInk(this.$["menu-button"]);
    }
    const browserService = BrowserServiceImpl.getInstance();
    browserService.handler.removeBookmark(this.item.url);
    browserService.recordAction("BookmarkStarClicked");
    this.fire("remove-bookmark-stars", this.item.url);
  }
  onMenuButtonClick_(e) {
    this.fire("open-menu", {
      target: e.target,
      index: this.index,
      item: this.item,
    });
    e.stopPropagation();
  }
  onMenuButtonKeydown_(e) {
    if (this.item?.starred && e.shiftKey && e.key === "Tab") {
      e.stopImmediatePropagation();
    }
  }
  onLinkClick_() {
    const browserService = BrowserServiceImpl.getInstance();
    browserService.recordAction("EntryLinkClick");
    if (this.searchTerm) {
      browserService.recordAction("SearchResultClick");
    }
    this.fire("record-history-link-click", {
      resultType: HistoryResultType.TRADITIONAL,
      index: this.index,
    });
  }
  onLinkRightClick_() {
    BrowserServiceImpl.getInstance().recordAction("EntryLinkRightClick");
  }
  itemChanged_() {
    if (!this.item) {
      return;
    }
    this.$.icon.style.backgroundImage = getFaviconForPageURL(
      this.item.url,
      this.item.isUrlInRemoteUserData,
      this.item.remoteIconUrlForUma
    );
    this.eventTracker_.add(this.$["time-accessed"], "mouseover", () =>
      this.addTimeTitle_()
    );
  }
  cardTitle_() {
    if (this.item === undefined) {
      return "";
    }
    if (!this.searchTerm) {
      return this.item.dateRelativeDay;
    }
    return searchResultsTitle(this.numberOfItems, this.searchTerm);
  }
  addTimeTitle_() {
    if (!this.item) {
      return;
    }
    const el = this.$["time-accessed"];
    el.setAttribute("title", new Date(this.item.time).toString());
    this.eventTracker_.remove(el, "mouseover");
  }
}
customElements.define(HistoryItemElement.is, HistoryItemElement);
function searchResultsTitle(numberOfResults, searchTerm) {
  const resultId = numberOfResults === 1 ? "searchResult" : "searchResults";
  return loadTimeData.getStringF(
    "foundSearchResults",
    numberOfResults,
    loadTimeData.getString(resultId),
    searchTerm
  );
}
let instance$b = null;
function getCss$9() {
  return (
    instance$b ||
    (instance$b = [
      ...[getCss$z(), getCss$C()],
      css`
        :host {
          box-sizing: border-box;
          display: block;
        }
        :host([is-empty]) {
          padding-block: 80px;
        }
        .history-cards {
          margin-block-start: var(--first-card-padding-top);
        }
        dialog [slot="body"] {
          white-space: pre-wrap;
        }
        .chunk {
          overflow-clip-margin: 8px;
        }
      `,
    ])
  );
}
function getHtml$8() {
  return html`<!--_html_template_start_-->
    <div
      id="noResults"
      class="centered-message"
      ?hidden="${this.hasResults_()}"
    >
      ${this.noResultsMessage_()}
    </div>

    <cr-infinite-list
      id="infiniteList"
      class="history-cards"
      .items="${this.historyData_}"
      item-size="36"
      chunk-size="50"
      role="grid"
      aria-rowcount="${this.historyData_.length}"
      ?hidden="${!this.hasResults_()}"
      .scrollTarget="${this.scrollTarget}"
      .scrollOffset="${this.scrollOffset}"
      .template="${(item, index, tabindex) => html` <history-item
        tabindex="${tabindex}"
        .item="${item}"
        ?selected="${item.selected}"
        ?is-card-start="${this.isCardStart_(item, index)}"
        ?is-card-end="${this.isCardEnd_(item, index)}"
        ?has-time-gap="${this.needsTimeGap_(item, index)}"
        .searchTerm="${this.searchedTerm}"
        .numberOfItems="${this.historyData_.length}"
        .index="${index}"
        .focusRowIndex="${index}"
        .listTabIndex="${tabindex}"
        .lastFocused="${this.lastFocused_}"
        @last-focused-changed="${this.onLastFocusedChanged_}"
        .listBlurred="${this.listBlurred_}"
        @list-blurred-changed="${this.onListBlurredChanged_}"
      >
      </history-item>`}"
    >
    </cr-infinite-list>

    <cr-lazy-render-lit
      id="dialog"
      .template="${() => html` <cr-dialog consume-keydown-event>
        <div slot="title" id="title">Remover itens seleccionados</div>
        <div slot="body" id="body">
          Tem a certeza de que quer eliminar estas pÃ¡ginas do seu histÃ³rico?
        </div>
        <div slot="button-container">
          <cr-button
            class="cancel-button"
            @click="${this.onDialogCancelClick_}"
          >
            Cancelar
          </cr-button>
          <cr-button
            class="action-button"
            @click="${this.onDialogConfirmClick_}"
          >
            Remover
          </cr-button>
        </div>
      </cr-dialog>`}"
    >
    </cr-lazy-render-lit>

    <cr-lazy-render-lit
      id="sharedMenu"
      .template="${() => html` <cr-action-menu role-description="AÃ§Ãµes">
        <button
          id="menuMoreButton"
          class="dropdown-item"
          ?hidden="${!this.canSearchMoreFromSite_()}"
          @click="${this.onMoreFromSiteClick_}"
        >
          Mais a partir deste Website
        </button>
        <button
          id="menuRemoveButton"
          class="dropdown-item"
          ?hidden="${!this.canDeleteHistory_}"
          ?disabled="${this.pendingDelete}"
          @click="${this.onRemoveFromHistoryClick_}"
        >
          Remover do histÃ³rico
        </button>
        <button
          id="menuRemoveBookmarkButton"
          class="dropdown-item"
          ?hidden="${!this.actionMenuModel_?.item.starred}"
          @click="${this.onRemoveBookmarkClick_}"
        >
          Remover marcador
        </button>
      </cr-action-menu>`}"
    >
    </cr-lazy-render-lit>
    <!--_html_template_end_-->`;
}
const HistoryListElementBase = I18nMixinLit(CrLitElement);
class HistoryListElement extends HistoryListElementBase {
  static get is() {
    return "history-list";
  }
  static get styles() {
    return getCss$9();
  }
  render() {
    return getHtml$8.bind(this)();
  }
  static get properties() {
    return {
      searchedTerm: { type: String },
      resultLoadingDisabled_: { type: Boolean },
      selectedItems: { type: Object },
      canDeleteHistory_: { type: Boolean },
      historyData_: { type: Array },
      lastFocused_: { type: Object },
      listBlurred_: { type: Boolean },
      lastSelectedIndex: { type: Number },
      pendingDelete: { notify: true, type: Boolean },
      queryState: { type: Object },
      actionMenuModel_: { type: Object },
      scrollTarget: { type: Object },
      scrollOffset: { type: Number },
      isActive: { type: Boolean },
      isEmpty: { type: Boolean, reflect: true },
    };
  }
  #historyData__accessor_storage = [];
  get historyData_() {
    return this.#historyData__accessor_storage;
  }
  set historyData_(value) {
    this.#historyData__accessor_storage = value;
  }
  browserService_ = BrowserServiceImpl.getInstance();
  callbackRouter_ = BrowserServiceImpl.getInstance().callbackRouter;
  #canDeleteHistory__accessor_storage = loadTimeData.getBoolean(
    "allowDeletingHistory"
  );
  get canDeleteHistory_() {
    return this.#canDeleteHistory__accessor_storage;
  }
  set canDeleteHistory_(value) {
    this.#canDeleteHistory__accessor_storage = value;
  }
  #actionMenuModel__accessor_storage = null;
  get actionMenuModel_() {
    return this.#actionMenuModel__accessor_storage;
  }
  set actionMenuModel_(value) {
    this.#actionMenuModel__accessor_storage = value;
  }
  lastOffsetHeight_ = 0;
  pageHandler_ = BrowserServiceImpl.getInstance().handler;
  resizeObserver_ = new ResizeObserver(() => {
    if (this.lastOffsetHeight_ === 0) {
      this.lastOffsetHeight_ = this.scrollTarget.offsetHeight;
      return;
    }
    if (this.scrollTarget.offsetHeight > this.lastOffsetHeight_) {
      this.lastOffsetHeight_ = this.scrollTarget.offsetHeight;
      this.onScrollOrResize_();
    }
  });
  #resultLoadingDisabled__accessor_storage = false;
  get resultLoadingDisabled_() {
    return this.#resultLoadingDisabled__accessor_storage;
  }
  set resultLoadingDisabled_(value) {
    this.#resultLoadingDisabled__accessor_storage = value;
  }
  scrollDebounce_ = 200;
  scrollListener_ = () => this.onScrollOrResize_();
  scrollTimeout_ = null;
  #isActive_accessor_storage = true;
  get isActive() {
    return this.#isActive_accessor_storage;
  }
  set isActive(value) {
    this.#isActive_accessor_storage = value;
  }
  #isEmpty_accessor_storage = false;
  get isEmpty() {
    return this.#isEmpty_accessor_storage;
  }
  set isEmpty(value) {
    this.#isEmpty_accessor_storage = value;
  }
  #searchedTerm_accessor_storage = "";
  get searchedTerm() {
    return this.#searchedTerm_accessor_storage;
  }
  set searchedTerm(value) {
    this.#searchedTerm_accessor_storage = value;
  }
  #selectedItems_accessor_storage = new Set();
  get selectedItems() {
    return this.#selectedItems_accessor_storage;
  }
  set selectedItems(value) {
    this.#selectedItems_accessor_storage = value;
  }
  #pendingDelete_accessor_storage = false;
  get pendingDelete() {
    return this.#pendingDelete_accessor_storage;
  }
  set pendingDelete(value) {
    this.#pendingDelete_accessor_storage = value;
  }
  #lastFocused__accessor_storage;
  get lastFocused_() {
    return this.#lastFocused__accessor_storage;
  }
  set lastFocused_(value) {
    this.#lastFocused__accessor_storage = value;
  }
  #listBlurred__accessor_storage;
  get listBlurred_() {
    return this.#listBlurred__accessor_storage;
  }
  set listBlurred_(value) {
    this.#listBlurred__accessor_storage = value;
  }
  #lastSelectedIndex_accessor_storage = -1;
  get lastSelectedIndex() {
    return this.#lastSelectedIndex_accessor_storage;
  }
  set lastSelectedIndex(value) {
    this.#lastSelectedIndex_accessor_storage = value;
  }
  #queryState_accessor_storage;
  get queryState() {
    return this.#queryState_accessor_storage;
  }
  set queryState(value) {
    this.#queryState_accessor_storage = value;
  }
  #scrollTarget_accessor_storage = document.documentElement;
  get scrollTarget() {
    return this.#scrollTarget_accessor_storage;
  }
  set scrollTarget(value) {
    this.#scrollTarget_accessor_storage = value;
  }
  #scrollOffset_accessor_storage = 0;
  get scrollOffset() {
    return this.#scrollOffset_accessor_storage;
  }
  set scrollOffset(value) {
    this.#scrollOffset_accessor_storage = value;
  }
  onHistoryDeletedListenerId_ = null;
  connectedCallback() {
    super.connectedCallback();
    this.onHistoryDeletedListenerId_ =
      this.callbackRouter_.onHistoryDeleted.addListener(
        this.onHistoryDeleted_.bind(this)
      );
  }
  firstUpdated() {
    this.setAttribute("role", "application");
    this.setAttribute("aria-roledescription", this.i18n("ariaRoleDescription"));
    this.addEventListener("history-checkbox-select", this.onItemSelected_);
    this.addEventListener("open-menu", this.onOpenMenu_);
    this.addEventListener("remove-bookmark-stars", (e) =>
      this.onRemoveBookmarkStars_(e)
    );
  }
  willUpdate(changedProperties) {
    super.willUpdate(changedProperties);
    const changedPrivateProperties = changedProperties;
    if (changedPrivateProperties.has("historyData_")) {
      this.isEmpty = this.historyData_.length === 0;
    }
  }
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has("isActive")) {
      this.onIsActiveChanged_();
    }
    if (changedProperties.has("scrollTarget")) {
      this.onScrollTargetChanged_(changedProperties.get("scrollTarget"));
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    assert(this.onHistoryDeletedListenerId_);
    this.callbackRouter_.removeListener(this.onHistoryDeletedListenerId_);
    this.onHistoryDeletedListenerId_ = null;
  }
  historyResult(info, results) {
    if (!info) {
      return;
    }
    this.initializeResults_(info, results);
    this.closeMenu_();
    if (info.term && !this.queryState.incremental) {
      let resultsLabelId;
      if (loadTimeData.getBoolean("enableHistoryEmbeddings")) {
        resultsLabelId =
          results.length === 1
            ? "searchResultExactMatch"
            : "searchResultExactMatches";
      } else {
        resultsLabelId =
          results.length === 1 ? "searchResult" : "searchResults";
      }
      const message = loadTimeData.getStringF(
        "foundSearchResults",
        results.length,
        loadTimeData.getString(resultsLabelId),
        info.term
      );
      getInstance().announce(message);
    }
    this.addNewResults(results, this.queryState.incremental, info.finished);
  }
  addNewResults(historyResults, incremental, finished) {
    const results = historyResults.slice();
    if (this.scrollTimeout_) {
      clearTimeout(this.scrollTimeout_);
    }
    if (!incremental) {
      this.resultLoadingDisabled_ = false;
      this.historyData_ = [];
      this.fire("unselect-all");
      this.scrollTarget.scrollTop = 0;
    }
    this.historyData_ = [...this.historyData_, ...results];
    this.resultLoadingDisabled_ = finished;
    if (loadTimeData.getBoolean("enableBrowsingHistoryActorIntegrationM1")) {
      this.recordActorVisitShown_(results);
    }
  }
  recordActorVisitShown_(historyResults) {
    const historyResultsContainActorVisit = historyResults.some(
      (result) => result.isActorVisit
    );
    this.browserService_.recordBooleanHistogram(
      "HistoryPage.ActorItemsShown",
      historyResultsContainActorVisit
    );
  }
  onHistoryDeleted_() {
    if (this.getSelectedItemCount() > 0) {
      return;
    }
    this.fire("query-history", false);
  }
  selectOrUnselectAll() {
    if (this.historyData_.length === this.getSelectedItemCount()) {
      this.unselectAllItems();
    } else {
      this.selectAllItems();
    }
  }
  selectAllItems() {
    if (this.historyData_.length === this.getSelectedItemCount()) {
      return;
    }
    const indices = this.historyData_.map((_, index) => index);
    this.changeSelections_(indices, true);
  }
  unselectAllItems() {
    this.changeSelections_(Array.from(this.selectedItems), false);
    assert(this.selectedItems.size === 0);
  }
  getSelectedItemCount() {
    return this.selectedItems.size;
  }
  deleteSelectedWithPrompt() {
    if (!this.canDeleteHistory_) {
      return;
    }
    this.browserService_.recordAction("RemoveSelected");
    if (this.queryState.searchTerm !== "") {
      this.browserService_.recordAction("SearchResultRemove");
    }
    this.$.dialog.get().showModal();
    const button = this.shadowRoot.querySelector(".action-button");
    assert(button);
    button.focus();
  }
  fillCurrentViewport() {
    this.$.infiniteList.fillCurrentViewport();
  }
  openSelected() {
    const selected = this.getSelectedEntries_();
    for (const entry of selected) {
      window.open(entry.url, "_blank");
    }
  }
  changeSelections_(indices, selected) {
    indices.forEach((index) => {
      if (this.historyData_[index]) {
        this.historyData_[index].selected = selected;
      }
      if (selected) {
        this.selectedItems.add(index);
      } else {
        this.selectedItems.delete(index);
      }
    });
    this.requestUpdate();
  }
  deleteSelected_() {
    assert(!this.pendingDelete);
    const toBeRemoved = this.getSelectedEntries_();
    this.deleteItems_(toBeRemoved).then(() => {
      this.pendingDelete = false;
      this.removeItemsByIndex_(Array.from(this.selectedItems));
      this.fire("unselect-all");
      if (this.historyData_.length === 0) {
        this.fire("query-history", false);
      }
    });
  }
  removeItemsByIndex_(indices) {
    const indicesSet = new Set(indices);
    this.historyData_ = this.historyData_.filter(
      (_, index) => !indicesSet.has(index)
    );
  }
  removeItemsByIndexForTesting(indices) {
    this.removeItemsByIndex_(indices);
  }
  closeMenu_() {
    const menu = this.$.sharedMenu.getIfExists();
    if (menu && menu.open) {
      this.actionMenuModel_ = null;
      menu.close();
    }
  }
  onDialogConfirmClick_() {
    this.browserService_.recordAction("ConfirmRemoveSelected");
    this.deleteSelected_();
    const dialog = this.$.dialog.getIfExists();
    assert(dialog);
    dialog.close();
  }
  onDialogCancelClick_() {
    this.browserService_.recordAction("CancelRemoveSelected");
    const dialog = this.$.dialog.getIfExists();
    assert(dialog);
    dialog.close();
  }
  onRemoveBookmarkStars_(e) {
    const url = e.detail;
    if (this.historyData_ === undefined) {
      return;
    }
    this.historyData_.forEach((data) => {
      if (data.url === url) {
        data.starred = false;
      }
    });
    this.requestUpdate();
  }
  onScrollToBottom_() {
    if (this.resultLoadingDisabled_ || this.queryState.querying) {
      return;
    }
    this.fire("query-history", true);
  }
  onOpenMenu_(e) {
    const target = e.detail.target;
    this.actionMenuModel_ = e.detail;
    this.$.sharedMenu.get().showAt(target);
  }
  deleteItems_(items) {
    const removalList = items.map((item) => ({
      url: item.url,
      timestamps: item.allTimestamps,
    }));
    this.pendingDelete = true;
    return this.pageHandler_.removeVisits(removalList);
  }
  recordContextMenuActionsHistogram_(action) {
    if (!loadTimeData.getBoolean("enableBrowsingHistoryActorIntegrationM1")) {
      return;
    }
    this.browserService_.recordHistogram(
      this.actionMenuModel_.item.isActorVisit
        ? "HistoryPage.ActorContextMenuActions"
        : "HistoryPage.NonActorContextMenuActions",
      action,
      VisitContextMenuAction.MAX_VALUE
    );
  }
  onMoreFromSiteClick_() {
    this.browserService_.recordAction("EntryMenuShowMoreFromSite");
    this.recordContextMenuActionsHistogram_(
      VisitContextMenuAction.MORE_FROM_THIS_SITE_CLICKED
    );
    assert(this.$.sharedMenu.getIfExists());
    this.fire("change-query", {
      search: "host:" + this.actionMenuModel_.item.domain,
    });
    this.actionMenuModel_ = null;
    this.closeMenu_();
  }
  onRemoveBookmarkClick_() {
    this.recordContextMenuActionsHistogram_(
      VisitContextMenuAction.REMOVE_BOOKMARK_CLICKED
    );
    this.pageHandler_.removeBookmark(this.actionMenuModel_.item.url);
    this.fire("remove-bookmark-stars", this.actionMenuModel_.item.url);
    this.closeMenu_();
  }
  onRemoveFromHistoryClick_() {
    this.browserService_.recordAction("EntryMenuRemoveFromHistory");
    this.recordContextMenuActionsHistogram_(
      VisitContextMenuAction.REMOVE_FROM_HISTORY_CLICKED
    );
    assert(!this.pendingDelete);
    assert(this.$.sharedMenu.getIfExists());
    const itemData = this.actionMenuModel_;
    this.deleteItems_([itemData.item]).then(() => {
      getInstance().announce(this.i18n("deleteSuccess", itemData.item.title));
      this.pendingDelete = false;
      this.fire("unselect-all");
      this.removeItemsByIndex_([itemData.index]);
      const index = itemData.index;
      if (index === undefined) {
        return;
      }
      if (this.historyData_.length > 0) {
        setTimeout(async () => {
          const item = await this.$.infiniteList.ensureItemRendered(
            Math.min(this.historyData_.length - 1, index)
          );
          item.focusOnMenuButton();
        }, 1);
      }
    });
    this.closeMenu_();
  }
  onItemSelected_(e) {
    const index = e.detail.index;
    const indices = [];
    if (e.detail.shiftKey && this.lastSelectedIndex !== undefined) {
      for (
        let i = Math.min(index, this.lastSelectedIndex);
        i <= Math.max(index, this.lastSelectedIndex);
        i++
      ) {
        indices.push(i);
      }
    }
    if (indices.length === 0) {
      indices.push(index);
    }
    const selected = !this.selectedItems.has(index);
    this.changeSelections_(indices, selected);
    this.lastSelectedIndex = index;
  }
  needsTimeGap_(_item, index) {
    const length = this.historyData_.length;
    if (index === undefined || index >= length - 1 || length === 0) {
      return false;
    }
    const currentItem = this.historyData_[index];
    const nextItem = this.historyData_[index + 1];
    if (this.searchedTerm) {
      return currentItem.dateShort !== nextItem.dateShort;
    }
    return (
      currentItem.time - nextItem.time > BROWSING_GAP_TIME &&
      currentItem.dateRelativeDay === nextItem.dateRelativeDay
    );
  }
  isCardStart_(_item, i) {
    const length = this.historyData_.length;
    if (i === undefined || length === 0 || i > length - 1) {
      return false;
    }
    return (
      i === 0 ||
      this.historyData_[i].dateRelativeDay !==
        this.historyData_[i - 1].dateRelativeDay
    );
  }
  isCardEnd_(_item, i) {
    const length = this.historyData_.length;
    if (i === undefined || length === 0 || i > length - 1) {
      return false;
    }
    return (
      i === length - 1 ||
      this.historyData_[i].dateRelativeDay !==
        this.historyData_[i + 1].dateRelativeDay
    );
  }
  hasResults_() {
    return this.historyData_.length > 0;
  }
  noResultsMessage_() {
    const messageId =
      this.searchedTerm !== "" ? "noSearchResults" : "noResults";
    return loadTimeData.getString(messageId);
  }
  canSearchMoreFromSite_() {
    return (
      this.searchedTerm === "" ||
      this.searchedTerm !== this.actionMenuModel_?.item.domain
    );
  }
  initializeResults_(info, results) {
    if (results.length === 0) {
      return;
    }
    let currentDate = results[0].dateRelativeDay;
    for (let i = 0; i < results.length; i++) {
      results[i].selected = false;
      results[i].readableTimestamp =
        info.term === "" ? results[i].dateTimeOfDay : results[i].dateShort;
      if (results[i].dateRelativeDay !== currentDate) {
        currentDate = results[i].dateRelativeDay;
      }
    }
  }
  getHistoryEmbeddingsMatches_() {
    return this.historyData_.slice(0, 3);
  }
  showHistoryEmbeddings_() {
    return (
      loadTimeData.getBoolean("enableHistoryEmbeddings") &&
      !!this.searchedTerm &&
      this.historyData_?.length > 0
    );
  }
  onIsActiveChanged_() {
    if (this.isActive) {
      this.scrollTarget.addEventListener("scroll", this.scrollListener_);
    } else {
      this.scrollTarget.removeEventListener("scroll", this.scrollListener_);
    }
  }
  onScrollTargetChanged_(oldTarget) {
    if (oldTarget) {
      this.resizeObserver_.disconnect();
      oldTarget.removeEventListener("scroll", this.scrollListener_);
    }
    if (this.scrollTarget) {
      this.resizeObserver_.observe(this.scrollTarget);
      this.scrollTarget.addEventListener("scroll", this.scrollListener_);
      this.fillCurrentViewport();
    }
  }
  setScrollDebounceForTest(debounce) {
    this.scrollDebounce_ = debounce;
  }
  onScrollOrResize_() {
    if (this.scrollTimeout_) {
      clearTimeout(this.scrollTimeout_);
    }
    this.scrollTimeout_ = setTimeout(
      () => this.onScrollTimeout_(),
      this.scrollDebounce_
    );
  }
  onScrollTimeout_() {
    this.scrollTimeout_ = null;
    const lowerScroll =
      this.scrollTarget.scrollHeight -
      this.scrollTarget.scrollTop -
      this.scrollTarget.offsetHeight;
    if (lowerScroll < 500) {
      this.onScrollToBottom_();
    }
    this.fire("scroll-timeout-for-test");
  }
  onLastFocusedChanged_(e) {
    this.lastFocused_ = e.detail.value;
  }
  onListBlurredChanged_(e) {
    this.listBlurred_ = e.detail.value;
  }
  getSelectedEntries_() {
    return Array.from(this.selectedItems, (idx) => this.historyData_[idx]);
  }
}
customElements.define(HistoryListElement.is, HistoryListElement);
const CrSearchFieldMixinLit = (superClass) => {
  class CrSearchFieldMixinLit extends superClass {
    static get properties() {
      return {
        label: { type: String },
        clearLabel: { type: String },
        hasSearchText: { type: Boolean, reflect: true },
      };
    }
    #label_accessor_storage = "";
    get label() {
      return this.#label_accessor_storage;
    }
    set label(value) {
      this.#label_accessor_storage = value;
    }
    #clearLabel_accessor_storage = "";
    get clearLabel() {
      return this.#clearLabel_accessor_storage;
    }
    set clearLabel(value) {
      this.#clearLabel_accessor_storage = value;
    }
    #hasSearchText_accessor_storage = false;
    get hasSearchText() {
      return this.#hasSearchText_accessor_storage;
    }
    set hasSearchText(value) {
      this.#hasSearchText_accessor_storage = value;
    }
    effectiveValue_ = "";
    searchDelayTimer_ = -1;
    getSearchInput() {
      assertNotReached();
    }
    getValue() {
      return this.getSearchInput().value;
    }
    setValue(value, noEvent) {
      const updated = this.updateEffectiveValue_(value);
      this.getSearchInput().value = this.effectiveValue_;
      if (!updated) {
        if (value === "" && this.hasSearchText) {
          this.hasSearchText = false;
        }
        return;
      }
      this.onSearchTermInput();
      if (!noEvent) {
        this.fire("search-changed", this.effectiveValue_);
      }
    }
    scheduleSearch_() {
      if (this.searchDelayTimer_ >= 0) {
        clearTimeout(this.searchDelayTimer_);
      }
      const length = this.getValue().length;
      const timeoutMs = length > 0 ? 500 - 100 * (Math.min(length, 4) - 1) : 0;
      this.searchDelayTimer_ = setTimeout(() => {
        this.getSearchInput().dispatchEvent(
          new CustomEvent("search", { composed: true, detail: this.getValue() })
        );
        this.searchDelayTimer_ = -1;
      }, timeoutMs);
    }
    onSearchTermSearch() {
      this.onValueChanged_(this.getValue(), false);
    }
    onSearchTermInput() {
      this.hasSearchText = this.getSearchInput().value !== "";
      this.scheduleSearch_();
    }
    onValueChanged_(newValue, noEvent) {
      const updated = this.updateEffectiveValue_(newValue);
      if (updated && !noEvent) {
        this.fire("search-changed", this.effectiveValue_);
      }
    }
    updateEffectiveValue_(value) {
      const effectiveValue = value.replace(/\s+/g, " ").replace(/^\s/, "");
      if (effectiveValue === this.effectiveValue_) {
        return false;
      }
      this.effectiveValue_ = effectiveValue;
      return true;
    }
  }
  return CrSearchFieldMixinLit;
};
let instance$a = null;
function getCss$8() {
  return (
    instance$a ||
    (instance$a = [
      ...[],
      css`
        .spinner {
          --cr-spinner-size: 28px;
          mask-image: url(//resources/images/throbber_small.svg);
          mask-position: center;
          mask-repeat: no-repeat;
          mask-size: var(--cr-spinner-size) var(--cr-spinner-size);
          background-color: var(--cr-spinner-color, var(--google-blue-500));
          height: var(--cr-spinner-size);
          width: var(--cr-spinner-size);
        }
        @media (prefers-color-scheme: dark) {
          .spinner {
            background-color: var(--cr-spinner-color, var(--google-blue-300));
          }
        }
      `,
    ])
  );
}
let instance$9 = null;
function getCss$7() {
  return (
    instance$9 ||
    (instance$9 = [
      ...[getCss$z(), getCss$B(), getCss$8()],
      css`
        :host {
          display: block;
          height: 40px;
          isolation: isolate;
          transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1),
            width 150ms cubic-bezier(0.4, 0, 0.2, 1);
          width: 44px;
        }
        :host([disabled]) {
          opacity: var(--cr-disabled-opacity);
        }
        [hidden] {
          display: none !important;
        }
        @media (prefers-color-scheme: light) {
          cr-icon-button {
            --cr-icon-button-fill-color: var(
              --cr-toolbar-search-field-input-icon-color,
              var(--google-grey-700)
            );
            --cr-icon-button-focus-outline-color: var(
              --cr-toolbar-icon-button-focus-outline-color,
              var(--cr-focus-outline-color)
            );
          }
        }
        @media (prefers-color-scheme: dark) {
          cr-icon-button {
            --cr-icon-button-fill-color: var(
              --cr-toolbar-search-field-input-icon-color,
              var(--google-grey-500)
            );
          }
        }
        cr-icon-button {
          --cr-icon-button-fill-color: var(
            --cr-toolbar-search-field-icon-color,
            var(
              --color-toolbar-search-field-icon,
              var(--cr-secondary-text-color)
            )
          );
          --cr-icon-button-size: var(--cr-toolbar-icon-container-size, 28px);
          --cr-icon-button-icon-size: 20px;
          margin: var(--cr-toolbar-icon-margin, 0);
        }
        #icon {
          transition: margin 150ms, opacity 200ms;
        }
        #prompt {
          color: var(
            --cr-toolbar-search-field-prompt-color,
            var(
              --color-toolbar-search-field-foreground-placeholder,
              var(--cr-secondary-text-color)
            )
          );
          opacity: 0;
        }
        @media (prefers-color-scheme: dark) {
          #prompt {
            color: var(--cr-toolbar-search-field-prompt-color, white);
          }
        }
        @media (prefers-color-scheme: dark) {
          #prompt {
            --cr-toolbar-search-field-prompt-opacity: 1;
            color: var(--cr-secondary-text-color, white);
          }
        }
        .spinner {
          --cr-spinner-color: var(
            --cr-toolbar-search-field-input-icon-color,
            var(--google-grey-700)
          );
          --cr-spinner-size: var(--cr-icon-size);
          margin: 0;
          opacity: 1;
          padding: 2px;
          position: absolute;
        }
        @media (prefers-color-scheme: dark) {
          .spinner {
            --cr-spinner-color: var(
              --cr-toolbar-search-field-input-icon-color,
              white
            );
          }
        }
        #prompt {
          transition: opacity 200ms;
        }
        #searchTerm {
          -webkit-font-smoothing: antialiased;
          flex: 1;
          font-size: 12px;
          font-weight: 500;
          line-height: 185%;
          margin: var(--cr-toolbar-search-field-term-margin, 0);
          position: relative;
        }
        label {
          bottom: 0;
          cursor: var(--cr-toolbar-search-field-cursor, text);
          left: 0;
          overflow: hidden;
          position: absolute;
          right: 0;
          top: 0;
          white-space: nowrap;
        }
        :host([has-search-text]) label {
          visibility: hidden;
        }
        input {
          -webkit-appearance: none;
          background: transparent;
          border: none;
          caret-color: var(
            --cr-toolbar-search-field-input-caret-color,
            currentColor
          );
          color: var(
            --cr-toolbar-search-field-input-text-color,
            var(
              --color-toolbar-search-field-foreground,
              var(--cr-fallback-color-on-surface)
            )
          );
          font: inherit;
          font-size: 12px;
          font-weight: 500;
          outline: none;
          padding: 0;
          position: relative;
          width: 100%;
        }
        @media (prefers-color-scheme: dark) {
          input {
            color: var(--cr-toolbar-search-field-input-text-color, white);
          }
        }
        input[type="search"]::-webkit-search-cancel-button {
          display: none;
        }
        :host([narrow]) {
          border-radius: var(--cr-toolbar-search-field-border-radius, 0);
        }
        :host(:not([narrow])) {
          background: none;
          border-radius: var(--cr-toolbar-search-field-border-radius, 46px);
          cursor: var(--cr-toolbar-search-field-cursor, default);
          height: 36px;
          max-width: var(--cr-toolbar-field-max-width, none);
          overflow: hidden;
          padding: 0 6px;
          position: relative;
          width: var(--cr-toolbar-field-width, 680px);
          --cr-toolbar-search-field-border-radius: 100px;
        }
        @media (prefers-color-scheme: dark) {
          :host(:not([narrow])) {
            background: var(
              --cr-toolbar-search-field-background,
              rgba(0, 0, 0, 0.22)
            );
          }
        }
        #background,
        #stateBackground {
          display: none;
        }
        :host(:not([narrow])) #background {
          background: var(
            --cr-toolbar-search-field-background,
            var(
              --color-toolbar-search-field-background,
              var(--cr-fallback-color-base-container)
            )
          );
          border-radius: inherit;
          display: block;
          inset: 0;
          pointer-events: none;
          position: absolute;
          z-index: 0;
        }
        :host([search-focused_]:not([narrow])) {
          outline: 2px solid var(--cr-focus-outline-color);
          outline-offset: 2px;
        }
        :host(:not([narrow])) #stateBackground {
          display: block;
          inset: 0;
          pointer-events: none;
          position: absolute;
        }
        :host(:hover:not([search-focused_], [narrow])) #stateBackground {
          background: var(
            --color-toolbar-search-field-background-hover,
            var(--cr-hover-background-color)
          );
          z-index: 1;
        }
        :host(:not([narrow]):not([showing-search])) #icon {
          opacity: var(--cr-toolbar-search-field-icon-opacity, 1);
        }
        :host(:not([narrow])) #prompt {
          opacity: var(--cr-toolbar-search-field-prompt-opacity, 1);
        }
        :host([narrow]) #prompt {
          opacity: var(--cr-toolbar-search-field-narrow-mode-prompt-opacity, 0);
        }
        :host([narrow]:not([showing-search])) #searchTerm {
          display: none;
        }
        :host([showing-search][spinner-active]) #icon {
          opacity: 0;
        }
        :host([narrow][showing-search]) {
          width: 100%;
        }
        :host([narrow][showing-search]) #icon,
        :host([narrow][showing-search]) .spinner {
          margin-inline-start: var(
            --cr-toolbar-search-icon-margin-inline-start,
            18px
          );
        }
        #content {
          align-items: center;
          display: flex;
          height: 100%;
          position: relative;
          z-index: 2;
        }
      `,
    ])
  );
}
function getHtml$7() {
  return html` <div id="background"></div>
    <div id="stateBackground"></div>
    <div id="content">
      ${this.shouldShowSpinner_() ? html` <div class="spinner"></div>` : ""}
      <cr-icon-button
        id="icon"
        iron-icon="${this.iconOverride || "cr:search"}"
        title="${this.label}"
        tabindex="${this.getIconTabIndex_()}"
        aria-hidden="${this.getIconAriaHidden_()}"
        suppress-rtl-flip
        @click="${this.onSearchIconClicked_}"
        ?disabled="${this.disabled}"
      >
      </cr-icon-button>
      <div id="searchTerm">
        <label id="prompt" for="searchInput" aria-hidden="true">
          ${this.label}
        </label>
        <input
          id="searchInput"
          aria-labelledby="prompt"
          aria-description="${this.inputAriaDescription}"
          autocapitalize="off"
          autocomplete="off"
          type="search"
          @beforeinput="${this.onSearchTermNativeBeforeInput}"
          @input="${this.onSearchTermNativeInput}"
          @search="${this.onSearchTermSearch}"
          @keydown="${this.onSearchTermKeydown_}"
          @focus="${this.onInputFocus_}"
          @blur="${this.onInputBlur_}"
          ?autofocus="${this.autofocus}"
          spellcheck="false"
          ?disabled="${this.disabled}"
        />
      </div>
      ${this.hasSearchText
        ? html` <cr-icon-button
            id="clearSearch"
            iron-icon="cr:cancel"
            title="${this.clearLabel}"
            @click="${this.clearSearch_}"
            ?disabled="${this.disabled}"
          ></cr-icon-button>`
        : ""}
    </div>`;
}
const CrToolbarSearchFieldElementBase = CrSearchFieldMixinLit(CrLitElement);
class CrToolbarSearchFieldElement extends CrToolbarSearchFieldElementBase {
  static get is() {
    return "cr-toolbar-search-field";
  }
  static get styles() {
    return getCss$7();
  }
  render() {
    return getHtml$7.bind(this)();
  }
  static get properties() {
    return {
      narrow: { type: Boolean, reflect: true },
      showingSearch: { type: Boolean, notify: true, reflect: true },
      disabled: { type: Boolean, reflect: true },
      autofocus: { type: Boolean, reflect: true },
      spinnerActive: { type: Boolean, reflect: true },
      searchFocused_: { type: Boolean, reflect: true },
      iconOverride: { type: String },
      inputAriaDescription: { type: String },
    };
  }
  #narrow_accessor_storage = false;
  get narrow() {
    return this.#narrow_accessor_storage;
  }
  set narrow(value) {
    this.#narrow_accessor_storage = value;
  }
  #showingSearch_accessor_storage = false;
  get showingSearch() {
    return this.#showingSearch_accessor_storage;
  }
  set showingSearch(value) {
    this.#showingSearch_accessor_storage = value;
  }
  #disabled_accessor_storage = false;
  get disabled() {
    return this.#disabled_accessor_storage;
  }
  set disabled(value) {
    this.#disabled_accessor_storage = value;
  }
  #autofocus_accessor_storage = false;
  get autofocus() {
    return this.#autofocus_accessor_storage;
  }
  set autofocus(value) {
    this.#autofocus_accessor_storage = value;
  }
  #spinnerActive_accessor_storage = false;
  get spinnerActive() {
    return this.#spinnerActive_accessor_storage;
  }
  set spinnerActive(value) {
    this.#spinnerActive_accessor_storage = value;
  }
  #searchFocused__accessor_storage = false;
  get searchFocused_() {
    return this.#searchFocused__accessor_storage;
  }
  set searchFocused_(value) {
    this.#searchFocused__accessor_storage = value;
  }
  #iconOverride_accessor_storage;
  get iconOverride() {
    return this.#iconOverride_accessor_storage;
  }
  set iconOverride(value) {
    this.#iconOverride_accessor_storage = value;
  }
  #inputAriaDescription_accessor_storage = "";
  get inputAriaDescription() {
    return this.#inputAriaDescription_accessor_storage;
  }
  set inputAriaDescription(value) {
    this.#inputAriaDescription_accessor_storage = value;
  }
  firstUpdated() {
    this.addEventListener("click", (e) => this.showSearch_(e));
  }
  getSearchInput() {
    return this.$.searchInput;
  }
  isSearchFocused() {
    return this.searchFocused_;
  }
  async showAndFocus() {
    this.showingSearch = true;
    await this.updateComplete;
    this.focus_();
  }
  onSearchTermNativeBeforeInput(e) {
    this.fire("search-term-native-before-input", { e: e });
  }
  onSearchTermInput() {
    super.onSearchTermInput();
    this.showingSearch = this.hasSearchText || this.isSearchFocused();
  }
  onSearchTermNativeInput(e) {
    this.onSearchTermInput();
    this.fire("search-term-native-input", {
      e: e,
      inputValue: this.getValue(),
    });
  }
  getIconTabIndex_() {
    return this.narrow && !this.hasSearchText ? 0 : -1;
  }
  getIconAriaHidden_() {
    return Boolean(!this.narrow || this.hasSearchText).toString();
  }
  shouldShowSpinner_() {
    return this.spinnerActive && this.showingSearch;
  }
  onSearchIconClicked_() {
    this.fire("search-icon-clicked");
  }
  focus_() {
    this.getSearchInput().focus();
  }
  onInputFocus_() {
    this.searchFocused_ = true;
  }
  onInputBlur_() {
    this.searchFocused_ = false;
    if (!this.hasSearchText) {
      this.showingSearch = false;
    }
  }
  onSearchTermKeydown_(e) {
    if (e.key === "Escape") {
      this.showingSearch = false;
      this.setValue("");
      this.getSearchInput().blur();
    }
  }
  async showSearch_(e) {
    if (e.target !== this.shadowRoot.querySelector("#clearSearch")) {
      this.showingSearch = true;
    }
    if (this.narrow) {
      await this.updateComplete;
      this.focus_();
    }
  }
  clearSearch_() {
    this.setValue("");
    this.focus_();
    this.spinnerActive = false;
    this.fire("search-term-cleared");
  }
}
customElements.define(
  CrToolbarSearchFieldElement.is,
  CrToolbarSearchFieldElement
);
let instance$8 = null;
function getCss$6() {
  return (
    instance$8 ||
    (instance$8 = [
      ...[getCss$A(), getCss$B()],
      css`
        :host {
          align-items: center;
          box-sizing: border-box;
          color: var(--google-grey-900);
          display: flex;
          height: var(--cr-toolbar-height);
        }
        @media (prefers-color-scheme: dark) {
          :host {
            color: var(--cr-secondary-text-color);
          }
        }
        h1 {
          flex: 1;
          font-size: 170%;
          font-weight: var(--cr-toolbar-header-font-weight, 500);
          letter-spacing: 0.25px;
          line-height: normal;
          margin-inline-start: 6px;
          padding-inline-end: 12px;
          white-space: var(--cr-toolbar-header-white-space, normal);
        }
        @media (prefers-color-scheme: dark) {
          h1 {
            color: var(--cr-primary-text-color);
          }
        }
        #leftContent {
          position: relative;
          transition: opacity 100ms;
        }
        #leftSpacer {
          align-items: center;
          box-sizing: border-box;
          display: flex;
          padding-inline-start: calc(12px + 6px);
          width: var(--cr-toolbar-left-spacer-width, auto);
        }
        cr-icon-button {
          --cr-icon-button-size: 32px;
          min-width: 32px;
        }
        @media (prefers-color-scheme: light) {
          cr-icon-button {
            --cr-icon-button-fill-color: currentColor;
            --cr-icon-button-focus-outline-color: var(--cr-focus-outline-color);
          }
        }
        #centeredContent {
          display: flex;
          flex: 1 1 0;
          justify-content: center;
        }
        #rightSpacer {
          padding-inline-end: 12px;
        }
        :host([narrow]) #centeredContent {
          justify-content: flex-end;
        }
        :host([has-overlay]) {
          transition: visibility var(--cr-toolbar-overlay-animation-duration);
          visibility: hidden;
        }
        :host([narrow][showing-search_]) #leftContent {
          opacity: 0;
          position: absolute;
        }
        :host(:not([narrow])) #leftContent {
          flex: 1 1 var(--cr-toolbar-field-margin, 0);
        }
        :host(:not([narrow])) #centeredContent {
          flex-basis: var(--cr-toolbar-center-basis, 0);
        }
        :host(:not([narrow])[disable-right-content-grow]) #centeredContent {
          justify-content: start;
          padding-inline-start: 12px;
        }
        :host(:not([narrow])) #rightContent {
          flex: 1 1 0;
          text-align: end;
        }
        :host(:not([narrow])[disable-right-content-grow]) #rightContent {
          flex: 0 1 0;
        }
        picture {
          display: none;
        }
        #menuButton {
          margin-inline-end: 9px;
        }
        #menuButton ~ h1 {
          margin-inline-start: 0;
        }
        :host([always-show-logo]) picture,
        :host(:not([narrow])) picture {
          display: initial;
          margin-inline-end: 16px;
        }
        :host([always-show-logo]) #leftSpacer,
        :host(:not([narrow])) #leftSpacer {
          padding-inline-start: calc(12px + 9px);
        }
        :host([always-show-logo]) :is(picture, #product-logo),
        :host(:not([narrow])) :is(picture, #product-logo) {
          height: 24px;
          width: 24px;
        }
      `,
    ])
  );
}
function getHtml$6() {
  return html` <div id="leftContent">
      <div id="leftSpacer">
        ${this.showMenu
          ? html` <cr-icon-button
              id="menuButton"
              class="no-overlap"
              iron-icon="cr20:menu"
              @click="${this.onMenuClick_}"
              aria-label="${this.menuLabel || nothing}"
              title="${this.menuLabel}"
            >
            </cr-icon-button>`
          : ""}
        <slot name="product-logo">
          <picture>
            <source
              media="(prefers-color-scheme: dark)"
              srcset="//resources/images/chrome_logo_dark.svg"
            />
            <img
              id="product-logo"
              srcset="
                chrome://theme/current-channel-logo@1x 1x,
                chrome://theme/current-channel-logo@2x 2x
              "
              role="presentation"
            />
          </picture>
        </slot>
        <h1>${this.pageName}</h1>
      </div>
    </div>

    <div id="centeredContent" ?hidden="${!this.showSearch}">
      <cr-toolbar-search-field
        id="search"
        ?narrow="${this.narrow}"
        label="${this.searchPrompt}"
        clear-label="${this.clearLabel}"
        ?spinner-active="${this.spinnerActive}"
        ?showing-search="${this.showingSearch_}"
        @showing-search-changed="${this.onShowingSearchChanged_}"
        ?autofocus="${this.autofocus}"
        icon-override="${this.searchIconOverride}"
        input-aria-description="${this.searchInputAriaDescription}"
      >
      </cr-toolbar-search-field>
    </div>

    <div id="rightContent">
      <div id="rightSpacer">
        <slot></slot>
      </div>
    </div>`;
}
class CrToolbarElement extends CrLitElement {
  static get is() {
    return "cr-toolbar";
  }
  static get styles() {
    return getCss$6();
  }
  render() {
    return getHtml$6.bind(this)();
  }
  static get properties() {
    return {
      pageName: { type: String },
      searchPrompt: { type: String },
      clearLabel: { type: String },
      menuLabel: { type: String },
      spinnerActive: { type: Boolean },
      showMenu: { type: Boolean },
      showSearch: { type: Boolean },
      autofocus: { type: Boolean, reflect: true },
      narrow: { type: Boolean, reflect: true, notify: true },
      narrowThreshold: { type: Number },
      alwaysShowLogo: { type: Boolean, reflect: true },
      showingSearch_: { type: Boolean, reflect: true },
      searchIconOverride: { type: String },
      searchInputAriaDescription: { type: String },
    };
  }
  #pageName_accessor_storage = "";
  get pageName() {
    return this.#pageName_accessor_storage;
  }
  set pageName(value) {
    this.#pageName_accessor_storage = value;
  }
  #searchPrompt_accessor_storage = "";
  get searchPrompt() {
    return this.#searchPrompt_accessor_storage;
  }
  set searchPrompt(value) {
    this.#searchPrompt_accessor_storage = value;
  }
  #clearLabel_accessor_storage = "";
  get clearLabel() {
    return this.#clearLabel_accessor_storage;
  }
  set clearLabel(value) {
    this.#clearLabel_accessor_storage = value;
  }
  #menuLabel_accessor_storage;
  get menuLabel() {
    return this.#menuLabel_accessor_storage;
  }
  set menuLabel(value) {
    this.#menuLabel_accessor_storage = value;
  }
  #spinnerActive_accessor_storage = false;
  get spinnerActive() {
    return this.#spinnerActive_accessor_storage;
  }
  set spinnerActive(value) {
    this.#spinnerActive_accessor_storage = value;
  }
  #showMenu_accessor_storage = false;
  get showMenu() {
    return this.#showMenu_accessor_storage;
  }
  set showMenu(value) {
    this.#showMenu_accessor_storage = value;
  }
  #showSearch_accessor_storage = true;
  get showSearch() {
    return this.#showSearch_accessor_storage;
  }
  set showSearch(value) {
    this.#showSearch_accessor_storage = value;
  }
  #autofocus_accessor_storage = false;
  get autofocus() {
    return this.#autofocus_accessor_storage;
  }
  set autofocus(value) {
    this.#autofocus_accessor_storage = value;
  }
  #narrow_accessor_storage = false;
  get narrow() {
    return this.#narrow_accessor_storage;
  }
  set narrow(value) {
    this.#narrow_accessor_storage = value;
  }
  #narrowThreshold_accessor_storage = 900;
  get narrowThreshold() {
    return this.#narrowThreshold_accessor_storage;
  }
  set narrowThreshold(value) {
    this.#narrowThreshold_accessor_storage = value;
  }
  #alwaysShowLogo_accessor_storage = false;
  get alwaysShowLogo() {
    return this.#alwaysShowLogo_accessor_storage;
  }
  set alwaysShowLogo(value) {
    this.#alwaysShowLogo_accessor_storage = value;
  }
  #showingSearch__accessor_storage = false;
  get showingSearch_() {
    return this.#showingSearch__accessor_storage;
  }
  set showingSearch_(value) {
    this.#showingSearch__accessor_storage = value;
  }
  #searchIconOverride_accessor_storage;
  get searchIconOverride() {
    return this.#searchIconOverride_accessor_storage;
  }
  set searchIconOverride(value) {
    this.#searchIconOverride_accessor_storage = value;
  }
  #searchInputAriaDescription_accessor_storage = "";
  get searchInputAriaDescription() {
    return this.#searchInputAriaDescription_accessor_storage;
  }
  set searchInputAriaDescription(value) {
    this.#searchInputAriaDescription_accessor_storage = value;
  }
  narrowQuery_ = null;
  willUpdate(changedProperties) {
    super.willUpdate(changedProperties);
    if (changedProperties.has("narrowThreshold")) {
      this.narrowQuery_ = window.matchMedia(
        `(max-width: ${this.narrowThreshold}px)`
      );
      this.narrow = this.narrowQuery_.matches;
      this.narrowQuery_.addListener(() => this.onQueryChanged_());
    }
  }
  getSearchField() {
    return this.$.search;
  }
  onMenuClick_() {
    this.fire("cr-toolbar-menu-click");
  }
  async focusMenuButton() {
    assert(this.showMenu);
    await this.updateComplete;
    const menuButton = this.shadowRoot.querySelector("#menuButton");
    assert(!!menuButton);
    menuButton.focus();
  }
  isMenuFocused() {
    return (
      !!this.shadowRoot.activeElement &&
      this.shadowRoot.activeElement.id === "menuButton"
    );
  }
  onShowingSearchChanged_(e) {
    this.showingSearch_ = e.detail.value;
  }
  onQueryChanged_() {
    assert(this.narrowQuery_);
    this.narrow = this.narrowQuery_.matches;
  }
}
customElements.define(CrToolbarElement.is, CrToolbarElement);
let instance$7 = null;
function getCss$5() {
  return (
    instance$7 ||
    (instance$7 = [
      ...[getCss$C()],
      css`
        :host {
          display: flex;
          position: relative;
        }
        cr-toolbar {
          --cr-toolbar-center-basis: var(--cluster-max-width);
          --cr-toolbar-left-spacer-width: var(--side-bar-width);
          --cr-toolbar-field-margin: var(--side-bar-width);
          flex: 1;
        }
        :host([has-drawer]) cr-toolbar,
        :host([has-drawer]) cr-toolbar-selection-overlay {
          --cr-toolbar-field-margin: 0;
        }
        cr-toolbar-selection-overlay {
          opacity: 0;
          --cr-toolbar-selection-overlay-max-width: var(--card-max-width);
          --cr-toolbar-field-margin: var(--side-bar-width);
        }
        cr-toolbar-selection-overlay[show] {
          opacity: 1;
        }
      `,
    ])
  );
}
function getHtml$5() {
  return html`<!--_html_template_start_--><cr-toolbar
      id="mainToolbar"
      disable-right-content-grow
      ?has-overlay="${this.itemsSelected_}"
      page-name="HistÃ³rico"
      clear-label="Limpar pesquisa"
      search-icon-override="${this.computeSearchIconOverride_()}"
      search-input-aria-description="${this.computeSearchInputAriaDescriptionOverride_()}"
      search-prompt="${this.computeSearchPrompt_()}"
      ?spinner-active="${this.spinnerActive}"
      autofocus
      ?show-menu="${this.hasDrawer}"
      menu-label="Menu principal"
      narrow-threshold="1023"
      @search-changed="${this.onSearchChanged_}"
    >
    </cr-toolbar>
    <cr-toolbar-selection-overlay
      ?show="${this.itemsSelected_}"
      cancel-label="Cancelar"
      selection-label="${this.numberOfItemsSelected_(this.count)}"
      @clear-selected-items="${this.clearSelectedItems}"
    >
      <cr-button
        @click="${this.openSelectedItems}"
        ?disabled="${this.pendingDelete}"
      >
        Abrir
      </cr-button>

      <cr-button
        @click="${this.deleteSelectedItems}"
        ?disabled="${this.pendingDelete}"
      >
        Eliminar
      </cr-button>
    </cr-toolbar-selection-overlay>
    <!--_html_template_end_-->`;
}
function safeDecodeURIComponent(s) {
  try {
    return window.decodeURIComponent(s);
  } catch (_e) {
    return s;
  }
}
function getCurrentPathname() {
  return safeDecodeURIComponent(window.location.pathname);
}
function getCurrentHash() {
  return safeDecodeURIComponent(window.location.hash.slice(1));
}
let instance$6 = null;
class CrRouter extends EventTarget {
  path_ = getCurrentPathname();
  query_ = window.location.search.slice(1);
  hash_ = getCurrentHash();
  dwellTime_ = 2e3;
  lastChangedAt_;
  constructor() {
    super();
    this.lastChangedAt_ = window.performance.now() - (this.dwellTime_ - 200);
    window.addEventListener("hashchange", () => this.hashChanged_());
    window.addEventListener("popstate", () => this.urlChanged_());
  }
  setDwellTime(dwellTime) {
    this.dwellTime_ = dwellTime;
    this.lastChangedAt_ = window.performance.now() - this.dwellTime_;
  }
  getPath() {
    return this.path_;
  }
  getQueryParams() {
    return new URLSearchParams(this.query_);
  }
  getHash() {
    return this.hash_;
  }
  setHash(hash) {
    this.hash_ = safeDecodeURIComponent(hash);
    if (this.hash_ !== getCurrentHash()) {
      this.updateState_();
    }
  }
  setQueryParams(params) {
    this.query_ = params.toString();
    if (this.query_ !== window.location.search.substring(1)) {
      this.updateState_();
    }
  }
  setPath(path) {
    assert(path.startsWith("/"));
    this.path_ = safeDecodeURIComponent(path);
    if (this.path_ !== getCurrentPathname()) {
      this.updateState_();
    }
  }
  hashChanged_() {
    const oldHash = this.hash_;
    this.hash_ = getCurrentHash();
    if (this.hash_ !== oldHash) {
      this.dispatchEvent(
        new CustomEvent("cr-router-hash-changed", {
          bubbles: true,
          composed: true,
          detail: this.hash_,
        })
      );
    }
  }
  urlChanged_() {
    this.hashChanged_();
    const oldPath = this.path_;
    this.path_ = getCurrentPathname();
    if (oldPath !== this.path_) {
      this.dispatchEvent(
        new CustomEvent("cr-router-path-changed", {
          bubbles: true,
          composed: true,
          detail: this.path_,
        })
      );
    }
    const oldQuery = this.query_;
    this.query_ = window.location.search.substring(1);
    if (oldQuery !== this.query_) {
      this.dispatchEvent(
        new CustomEvent("cr-router-query-params-changed", {
          bubbles: true,
          composed: true,
          detail: this.getQueryParams(),
        })
      );
    }
  }
  updateState_() {
    const url = new URL(window.location.origin);
    const pathPieces = this.path_.split("/");
    url.pathname = pathPieces
      .map((piece) => window.encodeURIComponent(piece))
      .join("/");
    if (this.query_) {
      url.search = this.query_;
    }
    if (this.hash_) {
      url.hash = window.encodeURIComponent(this.hash_);
    }
    const now = window.performance.now();
    const shouldReplace = this.lastChangedAt_ + this.dwellTime_ > now;
    this.lastChangedAt_ = now;
    if (shouldReplace) {
      window.history.replaceState({}, "", url.href);
    } else {
      window.history.pushState({}, "", url.href);
    }
  }
  static getInstance() {
    return instance$6 || (instance$6 = new CrRouter());
  }
  static resetForTesting() {
    instance$6 = null;
  }
}
const Page = {
  HISTORY: "history",
  HISTORY_CLUSTERS: "grouped",
  SYNCED_TABS: "syncedTabs",
  PRODUCT_SPECIFICATIONS_LISTS: "comparisonTables",
};
const TABBED_PAGES = [Page.HISTORY, Page.HISTORY_CLUSTERS];
class HistoryRouterElement extends CrLitElement {
  static get is() {
    return "history-router";
  }
  static get template() {
    return null;
  }
  static get properties() {
    return {
      lastSelectedTab: { type: Number },
      selectedPage: { type: String, notify: true },
      queryState: { type: Object },
    };
  }
  #lastSelectedTab_accessor_storage;
  get lastSelectedTab() {
    return this.#lastSelectedTab_accessor_storage;
  }
  set lastSelectedTab(value) {
    this.#lastSelectedTab_accessor_storage = value;
  }
  #selectedPage_accessor_storage;
  get selectedPage() {
    return this.#selectedPage_accessor_storage;
  }
  set selectedPage(value) {
    this.#selectedPage_accessor_storage = value;
  }
  #queryState_accessor_storage;
  get queryState() {
    return this.#queryState_accessor_storage;
  }
  set queryState(value) {
    this.#queryState_accessor_storage = value;
  }
  timeRangeStart;
  eventTracker_ = new EventTracker();
  connectedCallback() {
    super.connectedCallback();
    if (window.location.hash) {
      window.location.href =
        window.location.href.split("#")[0] +
        "?" +
        window.location.hash.substr(1);
    }
    const router = CrRouter.getInstance();
    this.onPathChanged_(router.getPath());
    this.onQueryParamsChanged_(router.getQueryParams());
    this.eventTracker_.add(router, "cr-router-path-changed", (e) =>
      this.onPathChanged_(e.detail)
    );
    this.eventTracker_.add(router, "cr-router-query-params-changed", (e) =>
      this.onQueryParamsChanged_(e.detail)
    );
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.eventTracker_.removeAll();
  }
  willUpdate(changedProperties) {
    super.willUpdate(changedProperties);
    if (
      (changedProperties.has("queryState") &&
        changedProperties.get("queryState")) ||
      (changedProperties.has("selectedPage") &&
        changedProperties.get("selectedPage"))
    ) {
      this.serializeUrl();
    }
  }
  serializeUrl() {
    let path = this.selectedPage;
    if (path === Page.HISTORY) {
      path = "";
    }
    const router = CrRouter.getInstance();
    router.setPath("/" + path);
    if (!this.queryState) {
      return;
    }
    const queryParams = new URLSearchParams();
    if (this.queryState.searchTerm) {
      queryParams.set("q", this.queryState.searchTerm);
    }
    if (this.queryState.after) {
      queryParams.set("after", this.queryState.after);
    }
    router.setQueryParams(queryParams);
  }
  onPathChanged_(newPath) {
    const sections = newPath.substr(1).split("/");
    const page =
      sections[0] ||
      (window.location.search ? "history" : TABBED_PAGES[this.lastSelectedTab]);
    this.selectedPage = page;
  }
  onQueryParamsChanged_(newParams) {
    const changes = { search: "" };
    changes.search = newParams.get("q") || "";
    let after = "";
    const afterFromParams = newParams.get("after");
    if (!!afterFromParams && afterFromParams.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const afterAsDate = new Date(afterFromParams);
      if (!isNaN(afterAsDate.getTime())) {
        after = afterFromParams;
      }
    }
    changes.after = after;
    this.dispatchEvent(
      new CustomEvent("change-query", {
        bubbles: true,
        composed: true,
        detail: changes,
      })
    );
  }
}
customElements.define(HistoryRouterElement.is, HistoryRouterElement);
class HistoryToolbarElement extends CrLitElement {
  static get is() {
    return "history-toolbar";
  }
  static get styles() {
    return getCss$5();
  }
  render() {
    return getHtml$5.bind(this)();
  }
  static get properties() {
    return {
      count: { type: Number },
      itemsSelected_: { type: Boolean },
      pendingDelete: { type: Boolean },
      searchTerm: { type: String },
      selectedPage: { type: String },
      spinnerActive: { type: Boolean },
      hasDrawer: { type: Boolean, reflect: true },
      hasMoreResults: { type: Boolean },
      querying: { type: Boolean },
      queryInfo: { type: Object },
      showMenuPromo: { type: Boolean },
    };
  }
  #count_accessor_storage = 0;
  get count() {
    return this.#count_accessor_storage;
  }
  set count(value) {
    this.#count_accessor_storage = value;
  }
  #pendingDelete_accessor_storage = false;
  get pendingDelete() {
    return this.#pendingDelete_accessor_storage;
  }
  set pendingDelete(value) {
    this.#pendingDelete_accessor_storage = value;
  }
  #searchTerm_accessor_storage = "";
  get searchTerm() {
    return this.#searchTerm_accessor_storage;
  }
  set searchTerm(value) {
    this.#searchTerm_accessor_storage = value;
  }
  #selectedPage_accessor_storage = "";
  get selectedPage() {
    return this.#selectedPage_accessor_storage;
  }
  set selectedPage(value) {
    this.#selectedPage_accessor_storage = value;
  }
  #hasDrawer_accessor_storage = false;
  get hasDrawer() {
    return this.#hasDrawer_accessor_storage;
  }
  set hasDrawer(value) {
    this.#hasDrawer_accessor_storage = value;
  }
  #hasMoreResults_accessor_storage = false;
  get hasMoreResults() {
    return this.#hasMoreResults_accessor_storage;
  }
  set hasMoreResults(value) {
    this.#hasMoreResults_accessor_storage = value;
  }
  #querying_accessor_storage = false;
  get querying() {
    return this.#querying_accessor_storage;
  }
  set querying(value) {
    this.#querying_accessor_storage = value;
  }
  #queryInfo_accessor_storage;
  get queryInfo() {
    return this.#queryInfo_accessor_storage;
  }
  set queryInfo(value) {
    this.#queryInfo_accessor_storage = value;
  }
  #spinnerActive_accessor_storage = false;
  get spinnerActive() {
    return this.#spinnerActive_accessor_storage;
  }
  set spinnerActive(value) {
    this.#spinnerActive_accessor_storage = value;
  }
  #showMenuPromo_accessor_storage = false;
  get showMenuPromo() {
    return this.#showMenuPromo_accessor_storage;
  }
  set showMenuPromo(value) {
    this.#showMenuPromo_accessor_storage = value;
  }
  #itemsSelected__accessor_storage = false;
  get itemsSelected_() {
    return this.#itemsSelected__accessor_storage;
  }
  set itemsSelected_(value) {
    this.#itemsSelected__accessor_storage = value;
  }
  willUpdate(changedProperties) {
    super.willUpdate(changedProperties);
    if (changedProperties.has("count")) {
      this.changeToolbarView_();
    }
  }
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has("searchTerm")) {
      this.searchTermChanged_();
    }
  }
  get searchField() {
    return this.$.mainToolbar.getSearchField();
  }
  deleteSelectedItems() {
    this.fire("delete-selected");
  }
  openSelectedItems() {
    this.fire("open-selected");
  }
  clearSelectedItems() {
    this.fire("unselect-all");
    getInstance().announce(loadTimeData.getString("itemsUnselected"));
  }
  changeToolbarView_() {
    this.itemsSelected_ = this.count > 0;
  }
  searchTermChanged_() {
    if (this.searchField.getValue() !== this.searchTerm) {
      this.searchField.showAndFocus();
      this.searchField.setValue(this.searchTerm);
    }
  }
  canShowMenuPromo_() {
    return this.showMenuPromo && !loadTimeData.getBoolean("isGuestSession");
  }
  onSearchChanged_(event) {
    this.fire("change-query", { search: event.detail, after: null });
  }
  numberOfItemsSelected_(count) {
    return count > 0 ? loadTimeData.getStringF("itemsSelected", count) : "";
  }
  computeSearchIconOverride_() {
    if (
      loadTimeData.getBoolean("enableHistoryEmbeddings") &&
      TABBED_PAGES.includes(this.selectedPage)
    ) {
      return "history-embeddings:search";
    }
    return undefined;
  }
  computeSearchInputAriaDescriptionOverride_() {
    if (
      loadTimeData.getBoolean("enableHistoryEmbeddings") &&
      TABBED_PAGES.includes(this.selectedPage)
    ) {
      return loadTimeData.getString("historyEmbeddingsDisclaimer");
    }
    return undefined;
  }
  computeSearchPrompt_() {
    if (
      loadTimeData.getBoolean("enableHistoryEmbeddings") &&
      TABBED_PAGES.includes(this.selectedPage)
    ) {
      if (loadTimeData.getBoolean("enableHistoryEmbeddingsAnswers")) {
        const possiblePrompts = [
          "historyEmbeddingsSearchPrompt",
          "historyEmbeddingsAnswersSearchAlternativePrompt1",
          "historyEmbeddingsAnswersSearchAlternativePrompt2",
          "historyEmbeddingsAnswersSearchAlternativePrompt3",
          "historyEmbeddingsAnswersSearchAlternativePrompt4",
        ];
        const randomIndex = Math.floor(Math.random() * possiblePrompts.length);
        return loadTimeData.getString(possiblePrompts[randomIndex]);
      }
      return loadTimeData.getString("historyEmbeddingsSearchPrompt");
    }
    return loadTimeData.getString("searchPrompt");
  }
}
customElements.define(HistoryToolbarElement.is, HistoryToolbarElement);
function convertDateToQueryValue(date) {
  const fullYear = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  function twoDigits(value) {
    return value >= 10 ? `${value}` : `0${value}`;
  }
  return `${fullYear}-${twoDigits(month)}-${twoDigits(day)}`;
}
class HistoryQueryManagerElement extends CrLitElement {
  static get is() {
    return "history-query-manager";
  }
  static get template() {
    return null;
  }
  static get properties() {
    return {
      queryState: { type: Object, notify: true },
      queryResult: { type: Object },
    };
  }
  #queryState_accessor_storage;
  get queryState() {
    return this.#queryState_accessor_storage;
  }
  set queryState(value) {
    this.#queryState_accessor_storage = value;
  }
  #queryResult_accessor_storage;
  get queryResult() {
    return this.#queryResult_accessor_storage;
  }
  set queryResult(value) {
    this.#queryResult_accessor_storage = value;
  }
  eventTracker_ = new EventTracker();
  resultPendingMetricsTimestamp_ = null;
  constructor() {
    super();
    this.queryState = {
      incremental: false,
      querying: true,
      searchTerm: "",
      after: "",
    };
  }
  connectedCallback() {
    super.connectedCallback();
    this.eventTracker_.add(
      document,
      "change-query",
      this.onChangeQuery_.bind(this)
    );
    this.eventTracker_.add(
      document,
      "query-history",
      this.onQueryHistory_.bind(this)
    );
    this.eventTracker_.add(document, "visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        this.flushDebouncedQueryResultMetric_();
      }
    });
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.flushDebouncedQueryResultMetric_();
    this.eventTracker_.removeAll();
  }
  initialize() {
    this.queryHistory_(false);
  }
  queryHistory_(incremental) {
    this.queryState = {
      ...this.queryState,
      querying: true,
      incremental: incremental,
    };
    let afterTimestamp;
    if (
      loadTimeData.getBoolean("enableHistoryEmbeddings") &&
      this.queryState.after
    ) {
      const afterDate = new Date(this.queryState.after);
      afterDate.setHours(0, 0, 0, 0);
      afterTimestamp = afterDate.getTime();
    }
    const browserService = BrowserServiceImpl.getInstance();
    const promise = incremental
      ? browserService.handler.queryHistoryContinuation()
      : browserService.handler.queryHistory(
          this.queryState.searchTerm,
          RESULTS_PER_PAGE,
          afterTimestamp ? afterTimestamp : null
        );
    promise.then(
      (result) => this.onQueryResult_(result.results),
      () => {}
    );
  }
  onChangeQuery_(e) {
    const changes = e.detail;
    let needsUpdate = false;
    if (
      changes.search !== null &&
      changes.search !== this.queryState.searchTerm
    ) {
      this.queryState = { ...this.queryState, searchTerm: changes.search };
      this.searchTermChanged_();
      needsUpdate = true;
    }
    if (
      loadTimeData.getBoolean("enableHistoryEmbeddings") &&
      changes.after !== null &&
      changes.after !== this.queryState.after &&
      (Boolean(changes.after) || Boolean(this.queryState.after))
    ) {
      this.queryState = { ...this.queryState, after: changes.after };
      needsUpdate = true;
    }
    if (needsUpdate) {
      this.queryHistory_(false);
    }
  }
  onQueryHistory_(e) {
    this.queryHistory_(e.detail);
    return false;
  }
  onQueryResult_(results) {
    this.queryState = { ...this.queryState, querying: false };
    this.queryResult = {
      ...this.queryResult,
      info: results.info,
      value: results.value,
    };
    this.fire("query-finished", { result: this.queryResult });
  }
  searchTermChanged_() {
    this.flushDebouncedQueryResultMetric_();
    if (this.queryState.searchTerm) {
      BrowserServiceImpl.getInstance().recordAction("Search");
      this.resultPendingMetricsTimestamp_ = performance.now();
    }
  }
  flushDebouncedQueryResultMetric_() {
    if (
      this.resultPendingMetricsTimestamp_ &&
      performance.now() - this.resultPendingMetricsTimestamp_ >=
        QUERY_RESULT_MINIMUM_AGE
    ) {
      BrowserServiceImpl.getInstance().recordHistogram(
        "History.Embeddings.UserActions",
        HistoryEmbeddingsUserActions.NON_EMPTY_QUERY_HISTORY_SEARCH,
        HistoryEmbeddingsUserActions.END
      );
    }
    this.resultPendingMetricsTimestamp_ = null;
  }
}
customElements.define(
  HistoryQueryManagerElement.is,
  HistoryQueryManagerElement
);
const WebUiListenerMixinLit = (superClass) => {
  class WebUiListenerMixinLit extends superClass {
    webUiListeners_ = [];
    addWebUiListener(eventName, callback) {
      this.webUiListeners_.push(addWebUiListener(eventName, callback));
    }
    disconnectedCallback() {
      super.disconnectedCallback();
      while (this.webUiListeners_.length > 0) {
        removeWebUiListener(this.webUiListeners_.pop());
      }
    }
  }
  return WebUiListenerMixinLit;
};
let instance$5 = null;
function getCss$4() {
  return (
    instance$5 ||
    (instance$5 = [
      ...[],
      css`
        :host {
          align-items: center;
          border-top: 1px solid var(--cr-separator-color);
          color: var(--cr-secondary-text-color);
          display: none;
          font-size: 0.8125rem;
          justify-content: center;
          padding: 0 24px;
        }
        :host([is-managed_]) {
          display: flex;
        }
        a[href] {
          color: var(--cr-link-color);
        }
        cr-icon {
          align-self: flex-start;
          flex-shrink: 0;
          height: 20px;
          padding-inline-end: var(--managed-footnote-icon-padding, 8px);
          width: 20px;
        }
      `,
    ])
  );
}
function getHtml$4() {
  return html`${this.isManaged_
    ? html`
        <cr-icon .icon="${this.managedByIcon_}"></cr-icon>
        <div id="content" .innerHTML="${this.getManagementString_()}"></div>
      `
    : ""}`;
}
const ManagedFootnoteElementBase = I18nMixinLit(
  WebUiListenerMixinLit(CrLitElement)
);
class ManagedFootnoteElement extends ManagedFootnoteElementBase {
  static get is() {
    return "managed-footnote";
  }
  static get styles() {
    return getCss$4();
  }
  render() {
    return getHtml$4.bind(this)();
  }
  static get properties() {
    return {
      isManaged_: { reflect: true, type: Boolean },
      managedByIcon_: { reflect: true, type: String },
    };
  }
  #isManaged__accessor_storage = loadTimeData.getBoolean("isManaged");
  get isManaged_() {
    return this.#isManaged__accessor_storage;
  }
  set isManaged_(value) {
    this.#isManaged__accessor_storage = value;
  }
  #managedByIcon__accessor_storage = loadTimeData.getString("managedByIcon");
  get managedByIcon_() {
    return this.#managedByIcon__accessor_storage;
  }
  set managedByIcon_(value) {
    this.#managedByIcon__accessor_storage = value;
  }
  firstUpdated() {
    this.addWebUiListener("is-managed-changed", (managed) => {
      loadTimeData.overrideValues({ isManaged: managed });
      this.isManaged_ = managed;
    });
  }
  getManagementString_() {
    return this.i18nAdvanced("browserManagedByOrg");
  }
}
customElements.define(ManagedFootnoteElement.is, ManagedFootnoteElement);
chrome.send("observeManagedUI");
function getHtml$3() {
  return html`<slot></slot>`;
}
const CrMenuSelectorBase = CrSelectableMixin(CrLitElement);
class CrMenuSelector extends CrMenuSelectorBase {
  static get is() {
    return "cr-menu-selector";
  }
  render() {
    return getHtml$3.bind(this)();
  }
  connectedCallback() {
    super.connectedCallback();
    FocusOutlineManager.forDocument(document);
  }
  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
    this.setAttribute("role", "menu");
    this.addEventListener("focusin", this.onFocusin_.bind(this));
    this.addEventListener("keydown", this.onKeydown_.bind(this));
    this.addEventListener("iron-deselect", (e) => this.onIronDeselected_(e));
    this.addEventListener("iron-select", (e) => this.onIronSelected_(e));
  }
  getAllFocusableItems_() {
    return Array.from(
      this.querySelectorAll("[role=menuitem]:not([disabled]):not([hidden])")
    );
  }
  onFocusin_(e) {
    const focusMovedWithKeyboard =
      FocusOutlineManager.forDocument(document).visible;
    const focusMovedFromOutside =
      e.relatedTarget === null || !this.contains(e.relatedTarget);
    if (focusMovedWithKeyboard && focusMovedFromOutside) {
      this.getAllFocusableItems_()[0].focus();
    }
  }
  onIronDeselected_(e) {
    e.detail.item.removeAttribute("aria-current");
  }
  onIronSelected_(e) {
    e.detail.item.setAttribute("aria-current", "page");
  }
  onKeydown_(event) {
    const items = this.getAllFocusableItems_();
    assert(items.length >= 1);
    const currentFocusedIndex = items.indexOf(this.querySelector(":focus"));
    let newFocusedIndex = currentFocusedIndex;
    switch (event.key) {
      case "Tab":
        if (event.shiftKey) {
          items[0].focus();
        } else {
          items[items.length - 1].focus({ preventScroll: true });
        }
        return;
      case "ArrowDown":
        newFocusedIndex = (currentFocusedIndex + 1) % items.length;
        break;
      case "ArrowUp":
        newFocusedIndex =
          (currentFocusedIndex + items.length - 1) % items.length;
        break;
      case "Home":
        newFocusedIndex = 0;
        break;
      case "End":
        newFocusedIndex = items.length - 1;
        break;
    }
    if (newFocusedIndex === currentFocusedIndex) {
      return;
    }
    event.preventDefault();
    items[newFocusedIndex].focus();
  }
}
customElements.define(CrMenuSelector.is, CrMenuSelector);
let instance$4 = null;
function getCss$3() {
  return (
    instance$4 ||
    (instance$4 = [
      ...[],
      css`
        .cr-nav-menu-item {
          --iron-icon-fill-color: var(--google-grey-700);
          --iron-icon-height: 20px;
          --iron-icon-width: 20px;
          --cr-icon-ripple-size: 20px;
          align-items: center;
          border-end-end-radius: 100px;
          border-start-end-radius: 100px;
          box-sizing: border-box;
          color: var(--google-grey-900);
          display: flex;
          font-size: 14px;
          font-weight: 500;
          line-height: 14px;
          margin-inline-end: 2px;
          margin-inline-start: 1px;
          min-height: 40px;
          overflow: hidden;
          padding-block-end: 10px;
          padding-block-start: 10px;
          padding-inline-start: 23px;
          padding-inline-end: 16px;
          position: relative;
          text-decoration: none;
        }
        :host-context(cr-drawer) .cr-nav-menu-item {
          margin-inline-end: 8px;
        }
        .cr-nav-menu-item:hover {
          background: var(--google-grey-200);
        }
        .cr-nav-menu-item[selected] {
          --iron-icon-fill-color: var(--google-blue-600);
          background: var(--google-blue-50);
          color: var(--google-blue-700);
        }
        @media (prefers-color-scheme: dark) {
          .cr-nav-menu-item {
            --iron-icon-fill-color: var(--google-grey-500);
            color: white;
          }
          .cr-nav-menu-item:hover {
            --iron-icon-fill-color: white;
            background: var(--google-grey-800);
          }
          .cr-nav-menu-item[selected] {
            --iron-icon-fill-color: black;
            background: var(--google-blue-300);
            color: var(--google-grey-900);
          }
        }
        .cr-nav-menu-item:focus {
          outline: auto 5px -webkit-focus-ring-color;
          z-index: 1;
        }
        .cr-nav-menu-item:focus:not([selected]):not(:hover) {
          background: transparent;
        }
        .cr-nav-menu-item cr-icon,
        .cr-nav-menu-item iron-icon {
          flex-shrink: 0;
          margin-inline-end: 20px;
          pointer-events: none;
          vertical-align: top;
        }
      `,
    ])
  );
}
let instance$3 = null;
function getCss$2() {
  return (
    instance$3 ||
    (instance$3 = [
      ...[getCss$A(), getCss$B(), getCss$3()],
      css`
        :host {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow-x: hidden;
          overflow-y: auto;
          width: var(--side-bar-width);
        }
        .separator {
          background-color: var(--separator-color);
          flex-shrink: 0;
          height: 1px;
          margin: 8px 0;
        }
        cr-menu-selector {
          padding-top: 8px;
          user-select: none;
        }
        cr-menu-selector > a[disabled] {
          opacity: 0.65;
          pointer-events: none;
        }
        #spacer {
          flex: 1;
        }
        #footer {
          color: var(--sidebar-footer-text-color);
          width: var(--side-bar-width);
        }
        managed-footnote {
          --managed-footnote-icon-padding: 12px;
          border: none;
          margin: 24px 0;
          padding-inline-end: 16px;
          padding-inline-start: 24px;
        }
        #google-account-footer {
          display: flex;
          margin: 24px 0;
          padding-inline-end: 16px;
          padding-inline-start: 24px;
        }
        #google-account-footer cr-icon {
          align-self: flex-start;
          flex-shrink: 0;
          height: 20px;
          padding-inline-end: 12px;
          width: 20px;
        }
        #google-account-footer > div {
          overflow-x: hidden;
        }
        cr-icon {
          display: block;
          margin-inline-end: 20px;
        }
        #clear-browsing-data {
          justify-content: normal;
        }
        #clear-browsing-data .cr-icon {
          margin-inline-end: 0;
          margin-inline-start: 9px;
        }
      `,
    ])
  );
}
function getHtml$2() {
  return html`<!--_html_template_start_--><cr-menu-selector
      id="menu"
      selected="${this.selectedPage}"
      @selected-changed="${this.onSelectorSelectedChanged_}"
      selectable=".page-item"
      attr-for-selected="path"
      @iron-activate="${this.onSelectorActivate_}"
      selected-attribute="selected"
    >
      <a
        id="history"
        role="menuitem"
        class="page-item cr-nav-menu-item"
        href="${this.getHistoryItemHref_()}"
        path="${this.getHistoryItemPath_()}"
        @click="${this.onItemClick_}"
      >
        <cr-icon icon="cr:history"></cr-icon>
        HistÃ³rico do Chrome
        <cr-ripple></cr-ripple>
      </a>
      <a
        id="syncedTabs"
        role="menuitem"
        href="/syncedTabs"
        class="page-item cr-nav-menu-item"
        path="syncedTabs"
        @click="${this.onItemClick_}"
      >
        <cr-icon icon="cr:phonelink"></cr-icon>
        Separadores de outros dispositivos
        <cr-ripple></cr-ripple>
      </a>
      <a
        role="menuitem"
        id="clear-browsing-data"
        class="cr-nav-menu-item"
        href="chrome://settings/clearBrowserData"
        @click="${this.onClearBrowsingDataClick_}"
        ?disabled="${this.guestSession_}"
        title="Abre-se num novo separador"
      >
        <cr-icon icon="cr:delete"></cr-icon>
        Eliminar dados de navegaÃ§Ã£o
        <div class="cr-icon icon-external"></div>
        <cr-ripple></cr-ripple>
      </a>
    </cr-menu-selector>
    <div id="spacer"></div>
    <div id="footer" ?hidden="${!this.showFooter_}">
      <div class="separator"></div>
      <managed-footnote></managed-footnote>
      <div
        id="google-account-footer"
        ?hidden="${!this.showGoogleAccountFooter_}"
        @click="${this.onGoogleAccountFooterClick_}"
      >
        <cr-icon icon="cr:info-outline"></cr-icon>
        <div ?hidden="${!this.showGMAOnly_}">
          A sua Conta Google pode ter outras formas do histÃ³rico de navegaÃ§Ã£o
          em
          <a
            target="_blank"
            id="footerGoogleMyActivityLink"
            href="https://myactivity.google.com/myactivity/?utm_source=chrome_h"
            >myactivity.google.com</a
          >.
        </div>
        <div ?hidden="${!this.showGAAOnly_}">
          A sua Conta Google pode ter a sua
          <a
            target="_blank"
            id="footerGeminiAppsActivityLink"
            href="https://myactivity.google.com/product/gemini"
            >Atividade das Apps Gemini</a
          >
        </div>
        <div ?hidden="${!this.showGMAAndGAA_}">
          A sua Conta Google pode ter outras formas do histÃ³rico de navegaÃ§Ã£o
          em
          <a
            target="_blank"
            id="footerGoogleMyActivityLink"
            href="https://myactivity.google.com/myactivity/?utm_source=chrome_h"
            >myactivity.google.com</a
          >, como a sua
          <a
            target="_blank"
            id="footerGeminiAppsActivityLink"
            href="https://myactivity.google.com/product/gemini"
            >Atividade das Apps Gemini</a
          >
        </div>
      </div>
    </div>
    <!--_html_template_end_-->`;
}
class HistorySideBarElement extends CrLitElement {
  static get is() {
    return "history-side-bar";
  }
  static get styles() {
    return getCss$2();
  }
  render() {
    return getHtml$2.bind(this)();
  }
  static get properties() {
    return {
      footerInfo: { type: Object },
      historyClustersEnabled: { type: Boolean },
      historyClustersVisible: { type: Boolean, notify: true },
      selectedPage: { type: String, notify: true },
      selectedTab: { type: Number, notify: true },
      guestSession_: { type: Boolean },
      historyClustersVisibleManagedByPolicy_: { type: Boolean },
      showFooter_: { type: Boolean },
      showGoogleAccountFooter_: { type: Boolean },
      showGMAOnly_: { type: Boolean },
      showGAAOnly_: { type: Boolean },
      showGMAAndGAA_: { type: Boolean },
      showHistoryClusters_: { type: Boolean },
    };
  }
  #footerInfo_accessor_storage;
  get footerInfo() {
    return this.#footerInfo_accessor_storage;
  }
  set footerInfo(value) {
    this.#footerInfo_accessor_storage = value;
  }
  #historyClustersEnabled_accessor_storage = false;
  get historyClustersEnabled() {
    return this.#historyClustersEnabled_accessor_storage;
  }
  set historyClustersEnabled(value) {
    this.#historyClustersEnabled_accessor_storage = value;
  }
  #historyClustersVisible_accessor_storage = false;
  get historyClustersVisible() {
    return this.#historyClustersVisible_accessor_storage;
  }
  set historyClustersVisible(value) {
    this.#historyClustersVisible_accessor_storage = value;
  }
  #selectedPage_accessor_storage;
  get selectedPage() {
    return this.#selectedPage_accessor_storage;
  }
  set selectedPage(value) {
    this.#selectedPage_accessor_storage = value;
  }
  #selectedTab_accessor_storage;
  get selectedTab() {
    return this.#selectedTab_accessor_storage;
  }
  set selectedTab(value) {
    this.#selectedTab_accessor_storage = value;
  }
  #guestSession__accessor_storage = loadTimeData.getBoolean("isGuestSession");
  get guestSession_() {
    return this.#guestSession__accessor_storage;
  }
  set guestSession_(value) {
    this.#guestSession__accessor_storage = value;
  }
  #historyClustersVisibleManagedByPolicy__accessor_storage =
    loadTimeData.getBoolean("isHistoryClustersVisibleManagedByPolicy");
  get historyClustersVisibleManagedByPolicy_() {
    return this.#historyClustersVisibleManagedByPolicy__accessor_storage;
  }
  set historyClustersVisibleManagedByPolicy_(value) {
    this.#historyClustersVisibleManagedByPolicy__accessor_storage = value;
  }
  #showFooter__accessor_storage = false;
  get showFooter_() {
    return this.#showFooter__accessor_storage;
  }
  set showFooter_(value) {
    this.#showFooter__accessor_storage = value;
  }
  #showGoogleAccountFooter__accessor_storage = false;
  get showGoogleAccountFooter_() {
    return this.#showGoogleAccountFooter__accessor_storage;
  }
  set showGoogleAccountFooter_(value) {
    this.#showGoogleAccountFooter__accessor_storage = value;
  }
  #showGMAOnly__accessor_storage = false;
  get showGMAOnly_() {
    return this.#showGMAOnly__accessor_storage;
  }
  set showGMAOnly_(value) {
    this.#showGMAOnly__accessor_storage = value;
  }
  #showGAAOnly__accessor_storage = false;
  get showGAAOnly_() {
    return this.#showGAAOnly__accessor_storage;
  }
  set showGAAOnly_(value) {
    this.#showGAAOnly__accessor_storage = value;
  }
  #showGMAAndGAA__accessor_storage = false;
  get showGMAAndGAA_() {
    return this.#showGMAAndGAA__accessor_storage;
  }
  set showGMAAndGAA_(value) {
    this.#showGMAAndGAA__accessor_storage = value;
  }
  #showHistoryClusters__accessor_storage = false;
  get showHistoryClusters_() {
    return this.#showHistoryClusters__accessor_storage;
  }
  set showHistoryClusters_(value) {
    this.#showHistoryClusters__accessor_storage = value;
  }
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("keydown", (e) => this.onKeydown_(e));
  }
  willUpdate(changedProperties) {
    super.willUpdate(changedProperties);
    if (changedProperties.has("footerInfo")) {
      this.updateFooterVisibility();
    }
    if (
      changedProperties.has("historyClustersEnabled") ||
      changedProperties.has("historyClustersVisible")
    ) {
      this.showHistoryClusters_ =
        this.historyClustersEnabled && this.historyClustersVisible;
    }
  }
  updateFooterVisibility() {
    this.showGMAOnly_ = false;
    this.showGAAOnly_ = false;
    this.showGMAAndGAA_ = false;
    if (
      this.footerInfo.otherFormsOfHistory &&
      this.footerInfo.geminiAppsActivity
    ) {
      this.showGMAAndGAA_ = true;
    } else if (this.footerInfo.otherFormsOfHistory) {
      this.showGMAOnly_ = true;
    } else if (this.footerInfo.geminiAppsActivity) {
      this.showGAAOnly_ = true;
    }
    this.showGoogleAccountFooter_ =
      this.showGMAAndGAA_ || this.showGMAOnly_ || this.showGAAOnly_;
    this.showFooter_ = this.footerInfo.managed || this.showGoogleAccountFooter_;
  }
  onGoogleAccountFooterClick_(e) {
    if (e.target.tagName !== "A") {
      return;
    }
    e.preventDefault();
    const browserService = BrowserServiceImpl.getInstance();
    switch (e.target.id) {
      case "footerGoogleMyActivityLink":
        browserService.recordAction("SideBarFooterGoogleMyActivityClick");
        browserService.navigateToUrl(
          loadTimeData.getString("sidebarFooterGMALink"),
          "_blank",
          e
        );
        break;
      case "footerGeminiAppsActivityLink":
        browserService.recordAction("SideBarFooterGeminiAppsActivityClick");
        browserService.navigateToUrl(
          loadTimeData.getString("sidebarFooterGAALink"),
          "_blank",
          e
        );
        break;
    }
  }
  onKeydown_(e) {
    if (e.key === " ") {
      e.composedPath()[0].click();
    }
  }
  onSelectorActivate_() {
    this.fire("history-close-drawer");
  }
  onSelectorSelectedChanged_(e) {
    this.selectedPage = e.detail.value;
  }
  onClearBrowsingDataClick_(e) {
    const browserService = BrowserServiceImpl.getInstance();
    browserService.recordAction("InitClearBrowsingData");
    browserService.handler.openClearBrowsingDataDialog();
    e.preventDefault();
  }
  onItemClick_(e) {
    e.preventDefault();
  }
  getHistoryItemHref_() {
    return this.showHistoryClusters_ &&
      TABBED_PAGES[this.selectedTab] === Page.HISTORY_CLUSTERS
      ? "/" + Page.HISTORY_CLUSTERS
      : "/";
  }
  getHistoryItemPath_() {
    return this.showHistoryClusters_ &&
      TABBED_PAGES[this.selectedTab] === Page.HISTORY_CLUSTERS
      ? Page.HISTORY_CLUSTERS
      : Page.HISTORY;
  }
}
customElements.define(HistorySideBarElement.is, HistorySideBarElement);
const div = document.createElement("div");
div.innerHTML = getTrustedHTML`<cr-iconset name="iph" size="24">
  <svg>
    <defs>
      <!--
      These icons are copied from Material UI and optimized through SVGOMG
      See http://goo.gl/Y1OdAq for instructions on adding additional icons.
      -->
      <g id="celebration">
        <path fill="none" d="M0 0h20v20H0z"></path>
        <path fill-rule="evenodd"
          d="m2 22 14-5-9-9-5 14Zm10.35-5.82L5.3 18.7l2.52-7.05 4.53 4.53ZM14.53 12.53l5.59-5.59a1.25 1.25 0 0 1 1.77 0l.59.59 1.06-1.06-.59-.59a2.758 2.758 0 0 0-3.89 0l-5.59 5.59 1.06 1.06ZM10.06 6.88l-.59.59 1.06 1.06.59-.59a2.758 2.758 0 0 0 0-3.89l-.59-.59-1.06 1.07.59.59c.48.48.48 1.28 0 1.76ZM17.06 11.88l-1.59 1.59 1.06 1.06 1.59-1.59a1.25 1.25 0 0 1 1.77 0l1.61 1.61 1.06-1.06-1.61-1.61a2.758 2.758 0 0 0-3.89 0ZM15.06 5.88l-3.59 3.59 1.06 1.06 3.59-3.59a2.758 2.758 0 0 0 0-3.89l-1.59-1.59-1.06 1.06 1.59 1.59c.48.49.48 1.29 0 1.77Z">
        </path>
      </g>
      <g id="lightbulb_outline">
        <path fill="none" d="M0 0h24v24H0z"></path>
        <path
          d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2 11.7V16h-4v-2.3C8.48 12.63 7 11.53 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 2.49-1.51 3.65-3 4.7z">
        </path>
      </g>
      <g id="lightbulb_outline_chrome_refresh" width="20" height="20" viewBox="0 -960 960 960">
        <path
          d="M479.779-81.413q-30.975 0-52.812-22.704-21.837-22.704-21.837-55.035h149.74q0 32.631-22.058 55.185-22.058 22.554-53.033 22.554ZM333.848-209.065v-75.587h292.304v75.587H333.848Zm-15-125.5Q254.696-374 219.282-440.533q-35.413-66.532-35.413-142.163 0-123.288 86.364-209.59 86.363-86.301 209.739-86.301t209.767 86.301q86.392 86.302 86.392 209.59 0 75.87-35.413 142.283Q705.304-374 641.152-334.565H318.848Zm26.348-83h269.608q37.283-30.522 57.805-73.566 20.521-43.043 20.521-91.512 0-89.424-61.812-151.184-61.813-61.76-151.087-61.76-89.274 0-151.318 61.76-62.043 61.76-62.043 151.184 0 48.469 20.521 91.512 20.522 43.044 57.805 73.566Zm134.804 0Z">
        </path>
      </g>
    </defs>
  </svg>
</cr-iconset>
`;
const iconsets = div.querySelectorAll("cr-iconset");
for (const iconset of iconsets) {
  document.head.appendChild(iconset);
}
let instance$2 = null;
function getCss$1() {
  return (
    instance$2 ||
    (instance$2 = [
      ...[getCss$A()],
      css`
        :host {
          --help-bubble-background: var(
            --color-feature-promo-bubble-background,
            var(--google-blue-700)
          );
          --help-bubble-foreground: var(
            --color-feature-promo-bubble-foreground,
            var(--google-grey-200)
          );
          --help-bubble-border-radius: 12px;
          --help-bubble-close-button-icon-size: 16px;
          --help-bubble-close-button-size: 20px;
          --help-bubble-element-spacing: 8px;
          --help-bubble-padding: 20px;
          --help-bubble-font-weight: 400;
          border-radius: var(--help-bubble-border-radius);
          box-shadow: 0 6px 10px 4px rgba(60, 64, 67, 0.15),
            0 2px 3px rgba(60, 64, 67, 0.3);
          box-sizing: border-box;
          position: absolute;
          z-index: 1;
        }
        #arrow {
          --help-bubble-arrow-size: 11.3px;
          --help-bubble-arrow-size-half: calc(
            var(--help-bubble-arrow-size) / 2
          );
          --help-bubble-arrow-diameter: 16px;
          --help-bubble-arrow-radius: calc(
            var(--help-bubble-arrow-diameter) / 2
          );
          --help-bubble-arrow-edge-offset: 22px;
          --help-bubble-arrow-offset: calc(
            var(--help-bubble-arrow-edge-offset) +
              var(--help-bubble-arrow-radius)
          );
          --help-bubble-arrow-border-radius: 2px;
          position: absolute;
        }
        #inner-arrow {
          background-color: var(--help-bubble-background);
          height: var(--help-bubble-arrow-size);
          left: calc(0px - var(--help-bubble-arrow-size-half));
          position: absolute;
          top: calc(0px - var(--help-bubble-arrow-size-half));
          transform: rotate(45deg);
          width: var(--help-bubble-arrow-size);
          z-index: -1;
        }
        #arrow.bottom-edge {
          bottom: 0;
        }
        #arrow.bottom-edge #inner-arrow {
          border-bottom-right-radius: var(--help-bubble-arrow-border-radius);
        }
        #arrow.top-edge {
          top: 0;
        }
        #arrow.top-edge #inner-arrow {
          border-top-left-radius: var(--help-bubble-arrow-border-radius);
        }
        #arrow.right-edge {
          right: 0;
        }
        #arrow.right-edge #inner-arrow {
          border-top-right-radius: var(--help-bubble-arrow-border-radius);
        }
        #arrow.left-edge {
          left: 0;
        }
        #arrow.left-edge #inner-arrow {
          border-bottom-left-radius: var(--help-bubble-arrow-border-radius);
        }
        #arrow.top-position {
          top: var(--help-bubble-arrow-offset);
        }
        #arrow.vertical-center-position {
          top: 50%;
        }
        #arrow.bottom-position {
          bottom: var(--help-bubble-arrow-offset);
        }
        #arrow.left-position {
          left: var(--help-bubble-arrow-offset);
        }
        #arrow.horizontal-center-position {
          left: 50%;
        }
        #arrow.right-position {
          right: var(--help-bubble-arrow-offset);
        }
        #topContainer {
          display: flex;
          flex-direction: row;
        }
        #progress {
          display: inline-block;
          flex: auto;
        }
        #progress div {
          --help-bubble-progress-size: 8px;
          background-color: var(--help-bubble-foreground);
          border: 1px solid var(--help-bubble-foreground);
          border-radius: 50%;
          display: inline-block;
          height: var(--help-bubble-progress-size);
          margin-inline-end: var(--help-bubble-element-spacing);
          margin-top: 5px;
          width: var(--help-bubble-progress-size);
        }
        #progress .total-progress {
          background-color: var(--help-bubble-background);
        }
        #topBody,
        #mainBody {
          flex: 1;
          font-size: 14px;
          font-style: normal;
          font-weight: var(--help-bubble-font-weight);
          letter-spacing: 0.3px;
          line-height: 20px;
          margin: 0;
        }
        #title {
          flex: 1;
          font-size: 18px;
          font-style: normal;
          font-weight: 500;
          line-height: 24px;
          margin: 0;
        }
        .help-bubble {
          --cr-focus-outline-color: var(--help-bubble-foreground);
          background-color: var(--help-bubble-background);
          border-radius: var(--help-bubble-border-radius);
          box-sizing: border-box;
          color: var(--help-bubble-foreground);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          max-width: 340px;
          min-width: 260px;
          padding: var(--help-bubble-padding);
          position: relative;
        }
        #main {
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          margin-top: var(--help-bubble-element-spacing);
        }
        #middleRowSpacer {
          margin-inline-start: 32px;
        }
        cr-icon-button,
        cr-button {
          --help-bubble-button-foreground: var(--help-bubble-foreground);
          --help-bubble-button-background: var(--help-bubble-background);
          --help-bubble-button-hover-alpha: 10%;
        }
        cr-button.default-button {
          --help-bubble-button-foreground: var(
            --color-feature-promo-bubble-default-button-foreground,
            var(--help-bubble-background)
          );
          --help-bubble-button-background: var(
            --color-feature-promo-bubble-default-button-background,
            var(--help-bubble-foreground)
          );
          --help-bubble-button-hover-alpha: 6%;
        }
        @media (prefers-color-scheme: dark) {
          cr-icon-button,
          cr-button {
            --help-bubble-button-hover-alpha: 6%;
          }
          cr-button.default-button {
            --help-bubble-button-hover-alpha: 10%;
          }
        }
        cr-icon-button:hover,
        #buttons cr-button:hover {
          background-color: color-mix(
            in srgb,
            var(--help-bubble-button-foreground)
              var(--help-bubble-button-hover-alpha),
            var(--help-bubble-button-background)
          );
        }
        cr-icon-button {
          --cr-icon-button-fill-color: var(--help-bubble-button-foreground);
          --cr-icon-button-icon-size: var(--help-bubble-close-button-icon-size);
          --cr-icon-button-size: var(--help-bubble-close-button-size);
          --cr-icon-button-stroke-color: var(--help-bubble-button-foreground);
          box-sizing: border-box;
          display: block;
          flex: none;
          float: right;
          height: var(--cr-icon-button-size);
          margin: 0;
          margin-inline-start: var(--help-bubble-element-spacing);
          order: 2;
          width: var(--cr-icon-button-size);
        }
        cr-icon-button:focus-visible:focus {
          box-shadow: inset 0 0 0 1px var(--cr-focus-outline-color);
        }
        #bodyIcon {
          --help-bubble-body-icon-image-size: 18px;
          --help-bubble-body-icon-size: 24px;
          --iron-icon-height: var(--help-bubble-body-icon-image-size);
          --iron-icon-width: var(--help-bubble-body-icon-image-size);
          background-color: var(--help-bubble-foreground);
          border-radius: 50%;
          box-sizing: border-box;
          color: var(--help-bubble-background);
          height: var(--help-bubble-body-icon-size);
          margin-inline-end: var(--help-bubble-element-spacing);
          padding: calc(
            (
                var(--help-bubble-body-icon-size) -
                  var(--help-bubble-body-icon-image-size)
              ) / 2
          );
          text-align: center;
          width: var(--help-bubble-body-icon-size);
        }
        #bodyIcon cr-icon {
          display: block;
        }
        #buttons {
          display: flex;
          flex-direction: row;
          justify-content: flex-end;
          margin-top: 16px;
        }
        #buttons cr-button {
          --cr-button-border-color: var(--help-bubble-foreground);
          --cr-button-text-color: var(--help-bubble-button-foreground);
          --cr-button-background-color: var(--help-bubble-button-background);
        }
        #buttons cr-button:focus {
          box-shadow: none;
          outline: 2px solid var(--cr-focus-outline-color);
          outline-offset: 1px;
        }
        #buttons cr-button:not(:first-child) {
          margin-inline-start: var(--help-bubble-element-spacing);
        }
      `,
    ])
  );
}
function getHtml$1() {
  return html` <link
      rel="stylesheet"
      href="chrome://theme/colors.css?sets=ui,chrome&shadow_host=true"
    />
    <div
      class="help-bubble"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="title"
      aria-describedby="body"
      aria-live="assertive"
      @keydown="${this.onKeyDown_}"
      @click="${this.blockPropagation_}"
    >
      <div id="topContainer">
        <div
          id="bodyIcon"
          ?hidden="${!this.shouldShowBodyIcon_()}"
          role="image"
          aria-label="${this.bodyIconAltText}"
        >
          <cr-icon icon="iph:${this.bodyIconName}"></cr-icon>
        </div>
        <div
          id="progress"
          ?hidden="${!this.progress}"
          role="progressbar"
          aria-valuenow="${this.progress ? this.progress.current : nothing}"
          aria-valuemin="1"
          aria-valuemax="${this.progress ? this.progress.total : nothing}"
        >
          ${this.progressData_.map(
            (_item, index) => html` <div
              class="${this.getProgressClass_(index)}"
            ></div>`
          )}
        </div>
        <h1 id="title" ?hidden="${!this.shouldShowTitleInTopContainer_()}">
          ${this.titleText}
        </h1>
        <p id="topBody" ?hidden="${!this.shouldShowBodyInTopContainer_()}">
          ${this.bodyText}
        </p>
        <cr-icon-button
          id="close"
          iron-icon="cr:close"
          aria-label="${this.closeButtonAltText}"
          @click="${this.dismiss_}"
          tabindex="${this.closeButtonTabIndex}"
        >
        </cr-icon-button>
      </div>
      <div id="main" ?hidden="${!this.shouldShowBodyInMain_()}">
        <div
          id="middleRowSpacer"
          ?hidden="!${this.shouldShowBodyIcon_()}"
        ></div>
        <p id="mainBody">${this.bodyText}</p>
      </div>
      <div id="buttons" ?hidden="${!this.buttons.length}">
        ${this.sortedButtons.map(
          (item) => html` <cr-button
            id="${this.getButtonId_(item)}"
            tabindex="${this.getButtonTabIndex_(item)}"
            class="${this.getButtonClass_(item.isDefault)}"
            @click="${this.onButtonClick_}"
            role="button"
            aria-label="${item.text}"
            >${item.text}</cr-button
          >`
        )}
      </div>
      <div id="arrow" class="${this.getArrowClass_()}">
        <div id="inner-arrow"></div>
      </div>
    </div>`;
}
class TrackedElementHandlerPendingReceiver {
  handle;
  constructor(handle) {
    this.handle = mojo.internal.interfaceSupport.getEndpointForReceiver(handle);
  }
  bindInBrowser(scope = "context") {
    mojo.internal.interfaceSupport.bind(
      this.handle,
      "tracked_element.mojom.TrackedElementHandler",
      scope
    );
  }
}
class TrackedElementHandlerRemote {
  proxy;
  $;
  onConnectionError;
  constructor(handle) {
    this.proxy = new mojo.internal.interfaceSupport.InterfaceRemoteBase(
      TrackedElementHandlerPendingReceiver,
      handle
    );
    this.$ = new mojo.internal.interfaceSupport.InterfaceRemoteBaseWrapper(
      this.proxy
    );
    this.onConnectionError = this.proxy.getConnectionErrorEventRouter();
  }
  trackedElementVisibilityChanged(nativeIdentifier, visible, rect) {
    this.proxy.sendMessage(
      1598090386,
      TrackedElementHandler_TrackedElementVisibilityChanged_ParamsSpec.$,
      null,
      [nativeIdentifier, visible, rect],
      false
    );
  }
  trackedElementActivated(nativeIdentifier) {
    this.proxy.sendMessage(
      861778735,
      TrackedElementHandler_TrackedElementActivated_ParamsSpec.$,
      null,
      [nativeIdentifier],
      false
    );
  }
  trackedElementCustomEvent(nativeIdentifier, customEventName) {
    this.proxy.sendMessage(
      608092550,
      TrackedElementHandler_TrackedElementCustomEvent_ParamsSpec.$,
      null,
      [nativeIdentifier, customEventName],
      false
    );
  }
}
const TrackedElementHandler_TrackedElementVisibilityChanged_ParamsSpec = {
  $: {},
};
const TrackedElementHandler_TrackedElementActivated_ParamsSpec = { $: {} };
const TrackedElementHandler_TrackedElementCustomEvent_ParamsSpec = { $: {} };
mojo.internal.Struct(
  TrackedElementHandler_TrackedElementVisibilityChanged_ParamsSpec.$,
  "TrackedElementHandler_TrackedElementVisibilityChanged_Params",
  [
    mojo.internal.StructField(
      "nativeIdentifier",
      0,
      0,
      mojo.internal.String,
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "visible",
      8,
      0,
      mojo.internal.Bool,
      false,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "rect",
      16,
      0,
      RectFSpec.$,
      null,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 32]]
);
mojo.internal.Struct(
  TrackedElementHandler_TrackedElementActivated_ParamsSpec.$,
  "TrackedElementHandler_TrackedElementActivated_Params",
  [
    mojo.internal.StructField(
      "nativeIdentifier",
      0,
      0,
      mojo.internal.String,
      null,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 16]]
);
mojo.internal.Struct(
  TrackedElementHandler_TrackedElementCustomEvent_ParamsSpec.$,
  "TrackedElementHandler_TrackedElementCustomEvent_Params",
  [
    mojo.internal.StructField(
      "nativeIdentifier",
      0,
      0,
      mojo.internal.String,
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "customEventName",
      8,
      0,
      mojo.internal.String,
      null,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 24]]
);
const HelpBubbleArrowPositionSpec = { $: mojo.internal.Enum() };
var HelpBubbleArrowPosition;
(function (HelpBubbleArrowPosition) {
  HelpBubbleArrowPosition[(HelpBubbleArrowPosition["MIN_VALUE"] = 0)] =
    "MIN_VALUE";
  HelpBubbleArrowPosition[(HelpBubbleArrowPosition["MAX_VALUE"] = 11)] =
    "MAX_VALUE";
  HelpBubbleArrowPosition[(HelpBubbleArrowPosition["TOP_LEFT"] = 0)] =
    "TOP_LEFT";
  HelpBubbleArrowPosition[(HelpBubbleArrowPosition["TOP_CENTER"] = 1)] =
    "TOP_CENTER";
  HelpBubbleArrowPosition[(HelpBubbleArrowPosition["TOP_RIGHT"] = 2)] =
    "TOP_RIGHT";
  HelpBubbleArrowPosition[(HelpBubbleArrowPosition["BOTTOM_LEFT"] = 3)] =
    "BOTTOM_LEFT";
  HelpBubbleArrowPosition[(HelpBubbleArrowPosition["BOTTOM_CENTER"] = 4)] =
    "BOTTOM_CENTER";
  HelpBubbleArrowPosition[(HelpBubbleArrowPosition["BOTTOM_RIGHT"] = 5)] =
    "BOTTOM_RIGHT";
  HelpBubbleArrowPosition[(HelpBubbleArrowPosition["LEFT_TOP"] = 6)] =
    "LEFT_TOP";
  HelpBubbleArrowPosition[(HelpBubbleArrowPosition["LEFT_CENTER"] = 7)] =
    "LEFT_CENTER";
  HelpBubbleArrowPosition[(HelpBubbleArrowPosition["LEFT_BOTTOM"] = 8)] =
    "LEFT_BOTTOM";
  HelpBubbleArrowPosition[(HelpBubbleArrowPosition["RIGHT_TOP"] = 9)] =
    "RIGHT_TOP";
  HelpBubbleArrowPosition[(HelpBubbleArrowPosition["RIGHT_CENTER"] = 10)] =
    "RIGHT_CENTER";
  HelpBubbleArrowPosition[(HelpBubbleArrowPosition["RIGHT_BOTTOM"] = 11)] =
    "RIGHT_BOTTOM";
})(HelpBubbleArrowPosition || (HelpBubbleArrowPosition = {}));
const HelpBubbleClosedReasonSpec = { $: mojo.internal.Enum() };
var HelpBubbleClosedReason;
(function (HelpBubbleClosedReason) {
  HelpBubbleClosedReason[(HelpBubbleClosedReason["MIN_VALUE"] = 0)] =
    "MIN_VALUE";
  HelpBubbleClosedReason[(HelpBubbleClosedReason["MAX_VALUE"] = 2)] =
    "MAX_VALUE";
  HelpBubbleClosedReason[(HelpBubbleClosedReason["kPageChanged"] = 0)] =
    "kPageChanged";
  HelpBubbleClosedReason[(HelpBubbleClosedReason["kDismissedByUser"] = 1)] =
    "kDismissedByUser";
  HelpBubbleClosedReason[(HelpBubbleClosedReason["kTimedOut"] = 2)] =
    "kTimedOut";
})(HelpBubbleClosedReason || (HelpBubbleClosedReason = {}));
class HelpBubbleHandlerFactoryPendingReceiver {
  handle;
  constructor(handle) {
    this.handle = mojo.internal.interfaceSupport.getEndpointForReceiver(handle);
  }
  bindInBrowser(scope = "context") {
    mojo.internal.interfaceSupport.bind(
      this.handle,
      "help_bubble.mojom.HelpBubbleHandlerFactory",
      scope
    );
  }
}
class HelpBubbleHandlerFactoryRemote {
  proxy;
  $;
  onConnectionError;
  constructor(handle) {
    this.proxy = new mojo.internal.interfaceSupport.InterfaceRemoteBase(
      HelpBubbleHandlerFactoryPendingReceiver,
      handle
    );
    this.$ = new mojo.internal.interfaceSupport.InterfaceRemoteBaseWrapper(
      this.proxy
    );
    this.onConnectionError = this.proxy.getConnectionErrorEventRouter();
  }
  createHelpBubbleHandler(client, handler) {
    this.proxy.sendMessage(
      146693769,
      HelpBubbleHandlerFactory_CreateHelpBubbleHandler_ParamsSpec.$,
      null,
      [client, handler],
      false
    );
  }
}
class HelpBubbleHandlerFactory {
  static get $interfaceName() {
    return "help_bubble.mojom.HelpBubbleHandlerFactory";
  }
  static getRemote() {
    let remote = new HelpBubbleHandlerFactoryRemote();
    remote.$.bindNewPipeAndPassReceiver().bindInBrowser();
    return remote;
  }
}
class HelpBubbleHandlerPendingReceiver {
  handle;
  constructor(handle) {
    this.handle = mojo.internal.interfaceSupport.getEndpointForReceiver(handle);
  }
  bindInBrowser(scope = "context") {
    mojo.internal.interfaceSupport.bind(
      this.handle,
      "help_bubble.mojom.HelpBubbleHandler",
      scope
    );
  }
}
class HelpBubbleHandlerRemote {
  proxy;
  $;
  onConnectionError;
  constructor(handle) {
    this.proxy = new mojo.internal.interfaceSupport.InterfaceRemoteBase(
      HelpBubbleHandlerPendingReceiver,
      handle
    );
    this.$ = new mojo.internal.interfaceSupport.InterfaceRemoteBaseWrapper(
      this.proxy
    );
    this.onConnectionError = this.proxy.getConnectionErrorEventRouter();
  }
  bindTrackedElementHandler(handler) {
    this.proxy.sendMessage(
      694160678,
      HelpBubbleHandler_BindTrackedElementHandler_ParamsSpec.$,
      null,
      [handler],
      false
    );
  }
  helpBubbleButtonPressed(nativeIdentifier, buttonIndex) {
    this.proxy.sendMessage(
      1239386196,
      HelpBubbleHandler_HelpBubbleButtonPressed_ParamsSpec.$,
      null,
      [nativeIdentifier, buttonIndex],
      false
    );
  }
  helpBubbleClosed(nativeIdentifier, reason) {
    this.proxy.sendMessage(
      135115942,
      HelpBubbleHandler_HelpBubbleClosed_ParamsSpec.$,
      null,
      [nativeIdentifier, reason],
      false
    );
  }
}
class HelpBubbleClientPendingReceiver {
  handle;
  constructor(handle) {
    this.handle = mojo.internal.interfaceSupport.getEndpointForReceiver(handle);
  }
  bindInBrowser(scope = "context") {
    mojo.internal.interfaceSupport.bind(
      this.handle,
      "help_bubble.mojom.HelpBubbleClient",
      scope
    );
  }
}
class HelpBubbleClientRemote {
  proxy;
  $;
  onConnectionError;
  constructor(handle) {
    this.proxy = new mojo.internal.interfaceSupport.InterfaceRemoteBase(
      HelpBubbleClientPendingReceiver,
      handle
    );
    this.$ = new mojo.internal.interfaceSupport.InterfaceRemoteBaseWrapper(
      this.proxy
    );
    this.onConnectionError = this.proxy.getConnectionErrorEventRouter();
  }
  showHelpBubble(params) {
    this.proxy.sendMessage(
      1372411473,
      HelpBubbleClient_ShowHelpBubble_ParamsSpec.$,
      null,
      [params],
      false
    );
  }
  toggleFocusForAccessibility(nativeIdentifier) {
    this.proxy.sendMessage(
      1963727756,
      HelpBubbleClient_ToggleFocusForAccessibility_ParamsSpec.$,
      null,
      [nativeIdentifier],
      false
    );
  }
  hideHelpBubble(nativeIdentifier) {
    this.proxy.sendMessage(
      794939676,
      HelpBubbleClient_HideHelpBubble_ParamsSpec.$,
      null,
      [nativeIdentifier],
      false
    );
  }
  externalHelpBubbleUpdated(nativeIdentifier, shown) {
    this.proxy.sendMessage(
      1397747859,
      HelpBubbleClient_ExternalHelpBubbleUpdated_ParamsSpec.$,
      null,
      [nativeIdentifier, shown],
      false
    );
  }
}
class HelpBubbleClientCallbackRouter {
  helper_internal_;
  $;
  router_;
  showHelpBubble;
  toggleFocusForAccessibility;
  hideHelpBubble;
  externalHelpBubbleUpdated;
  onConnectionError;
  constructor() {
    this.helper_internal_ =
      new mojo.internal.interfaceSupport.InterfaceReceiverHelperInternal(
        HelpBubbleClientRemote
      );
    this.$ = new mojo.internal.interfaceSupport.InterfaceReceiverHelper(
      this.helper_internal_
    );
    this.router_ = new mojo.internal.interfaceSupport.CallbackRouter();
    this.showHelpBubble =
      new mojo.internal.interfaceSupport.InterfaceCallbackReceiver(
        this.router_
      );
    this.helper_internal_.registerHandler(
      1372411473,
      HelpBubbleClient_ShowHelpBubble_ParamsSpec.$,
      null,
      this.showHelpBubble.createReceiverHandler(false),
      false
    );
    this.toggleFocusForAccessibility =
      new mojo.internal.interfaceSupport.InterfaceCallbackReceiver(
        this.router_
      );
    this.helper_internal_.registerHandler(
      1963727756,
      HelpBubbleClient_ToggleFocusForAccessibility_ParamsSpec.$,
      null,
      this.toggleFocusForAccessibility.createReceiverHandler(false),
      false
    );
    this.hideHelpBubble =
      new mojo.internal.interfaceSupport.InterfaceCallbackReceiver(
        this.router_
      );
    this.helper_internal_.registerHandler(
      794939676,
      HelpBubbleClient_HideHelpBubble_ParamsSpec.$,
      null,
      this.hideHelpBubble.createReceiverHandler(false),
      false
    );
    this.externalHelpBubbleUpdated =
      new mojo.internal.interfaceSupport.InterfaceCallbackReceiver(
        this.router_
      );
    this.helper_internal_.registerHandler(
      1397747859,
      HelpBubbleClient_ExternalHelpBubbleUpdated_ParamsSpec.$,
      null,
      this.externalHelpBubbleUpdated.createReceiverHandler(false),
      false
    );
    this.onConnectionError =
      this.helper_internal_.getConnectionErrorEventRouter();
  }
  removeListener(id) {
    return this.router_.removeListener(id);
  }
}
const HelpBubbleButtonParamsSpec = { $: {} };
const ProgressSpec = { $: {} };
const HelpBubbleParamsSpec = { $: {} };
const HelpBubbleHandlerFactory_CreateHelpBubbleHandler_ParamsSpec = { $: {} };
const HelpBubbleHandler_BindTrackedElementHandler_ParamsSpec = { $: {} };
const HelpBubbleHandler_HelpBubbleButtonPressed_ParamsSpec = { $: {} };
const HelpBubbleHandler_HelpBubbleClosed_ParamsSpec = { $: {} };
const HelpBubbleClient_ShowHelpBubble_ParamsSpec = { $: {} };
const HelpBubbleClient_ToggleFocusForAccessibility_ParamsSpec = { $: {} };
const HelpBubbleClient_HideHelpBubble_ParamsSpec = { $: {} };
const HelpBubbleClient_ExternalHelpBubbleUpdated_ParamsSpec = { $: {} };
mojo.internal.Struct(
  HelpBubbleButtonParamsSpec.$,
  "HelpBubbleButtonParams",
  [
    mojo.internal.StructField(
      "text",
      0,
      0,
      mojo.internal.String,
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "isDefault",
      8,
      0,
      mojo.internal.Bool,
      false,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 24]]
);
mojo.internal.Struct(
  ProgressSpec.$,
  "Progress",
  [
    mojo.internal.StructField(
      "current",
      0,
      0,
      mojo.internal.Uint8,
      0,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "total",
      1,
      0,
      mojo.internal.Uint8,
      0,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 16]]
);
mojo.internal.Struct(
  HelpBubbleParamsSpec.$,
  "HelpBubbleParams",
  [
    mojo.internal.StructField(
      "nativeIdentifier",
      0,
      0,
      mojo.internal.String,
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "position",
      8,
      0,
      HelpBubbleArrowPositionSpec.$,
      HelpBubbleArrowPosition.TOP_CENTER,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "titleText",
      16,
      0,
      mojo.internal.String,
      null,
      true,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "bodyText",
      24,
      0,
      mojo.internal.String,
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "closeButtonAltText",
      32,
      0,
      mojo.internal.String,
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "bodyIconName",
      40,
      0,
      mojo.internal.String,
      null,
      true,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "bodyIconAltText",
      48,
      0,
      mojo.internal.String,
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "progress",
      56,
      0,
      ProgressSpec.$,
      null,
      true,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "buttons",
      64,
      0,
      mojo.internal.Array(HelpBubbleButtonParamsSpec.$, false),
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "focus_on_show_hint_$flag",
      12,
      0,
      mojo.internal.Bool,
      false,
      false,
      0,
      {
        isPrimary: true,
        linkedValueFieldName: "focus_on_show_hint_$value",
        originalFieldName: "focusOnShowHint",
      },
      undefined
    ),
    mojo.internal.StructField(
      "focus_on_show_hint_$value",
      12,
      1,
      mojo.internal.Bool,
      false,
      false,
      0,
      { isPrimary: false, originalFieldName: "focusOnShowHint" },
      undefined
    ),
    mojo.internal.StructField(
      "timeout",
      72,
      0,
      TimeDeltaSpec.$,
      null,
      true,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 88]]
);
mojo.internal.Struct(
  HelpBubbleHandlerFactory_CreateHelpBubbleHandler_ParamsSpec.$,
  "HelpBubbleHandlerFactory_CreateHelpBubbleHandler_Params",
  [
    mojo.internal.StructField(
      "client",
      0,
      0,
      mojo.internal.InterfaceProxy(HelpBubbleClientRemote),
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "handler",
      8,
      0,
      mojo.internal.InterfaceRequest(HelpBubbleHandlerPendingReceiver),
      null,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 24]]
);
mojo.internal.Struct(
  HelpBubbleHandler_BindTrackedElementHandler_ParamsSpec.$,
  "HelpBubbleHandler_BindTrackedElementHandler_Params",
  [
    mojo.internal.StructField(
      "handler",
      0,
      0,
      mojo.internal.InterfaceRequest(TrackedElementHandlerPendingReceiver),
      null,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 16]]
);
mojo.internal.Struct(
  HelpBubbleHandler_HelpBubbleButtonPressed_ParamsSpec.$,
  "HelpBubbleHandler_HelpBubbleButtonPressed_Params",
  [
    mojo.internal.StructField(
      "nativeIdentifier",
      0,
      0,
      mojo.internal.String,
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "buttonIndex",
      8,
      0,
      mojo.internal.Uint8,
      0,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 24]]
);
mojo.internal.Struct(
  HelpBubbleHandler_HelpBubbleClosed_ParamsSpec.$,
  "HelpBubbleHandler_HelpBubbleClosed_Params",
  [
    mojo.internal.StructField(
      "nativeIdentifier",
      0,
      0,
      mojo.internal.String,
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "reason",
      8,
      0,
      HelpBubbleClosedReasonSpec.$,
      0,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 24]]
);
mojo.internal.Struct(
  HelpBubbleClient_ShowHelpBubble_ParamsSpec.$,
  "HelpBubbleClient_ShowHelpBubble_Params",
  [
    mojo.internal.StructField(
      "params",
      0,
      0,
      HelpBubbleParamsSpec.$,
      null,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 16]]
);
mojo.internal.Struct(
  HelpBubbleClient_ToggleFocusForAccessibility_ParamsSpec.$,
  "HelpBubbleClient_ToggleFocusForAccessibility_Params",
  [
    mojo.internal.StructField(
      "nativeIdentifier",
      0,
      0,
      mojo.internal.String,
      null,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 16]]
);
mojo.internal.Struct(
  HelpBubbleClient_HideHelpBubble_ParamsSpec.$,
  "HelpBubbleClient_HideHelpBubble_Params",
  [
    mojo.internal.StructField(
      "nativeIdentifier",
      0,
      0,
      mojo.internal.String,
      null,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 16]]
);
mojo.internal.Struct(
  HelpBubbleClient_ExternalHelpBubbleUpdated_ParamsSpec.$,
  "HelpBubbleClient_ExternalHelpBubbleUpdated_Params",
  [
    mojo.internal.StructField(
      "nativeIdentifier",
      0,
      0,
      mojo.internal.String,
      null,
      false,
      0,
      undefined,
      undefined
    ),
    mojo.internal.StructField(
      "shown",
      8,
      0,
      mojo.internal.Bool,
      false,
      false,
      0,
      undefined,
      undefined
    ),
  ],
  [[0, 24]]
);
const ACTION_BUTTON_ID_PREFIX = "action-button-";
const HELP_BUBBLE_DISMISSED_EVENT = "help-bubble-dismissed";
const HELP_BUBBLE_TIMED_OUT_EVENT = "help-bubble-timed-out";
const HELP_BUBBLE_SCROLL_ANCHOR_OPTIONS = {
  behavior: "smooth",
  block: "center",
};
class HelpBubbleElement extends CrLitElement {
  static get is() {
    return "help-bubble";
  }
  static get styles() {
    return getCss$1();
  }
  render() {
    return getHtml$1.bind(this)();
  }
  static get properties() {
    return {
      nativeId: { type: String, reflect: true },
      position: { type: HelpBubbleArrowPosition, reflect: true },
      bodyIconName: { type: String },
      bodyIconAltText: { type: String },
      progress: { type: Object },
      titleText: { type: String },
      bodyText: { type: String },
      buttons: { type: Array },
      sortedButtons: { type: Array },
      closeButtonAltText: { type: String },
      closeButtonTabIndex: { type: Number },
      progressData_: { type: Array, state: true },
    };
  }
  #nativeId_accessor_storage = "";
  get nativeId() {
    return this.#nativeId_accessor_storage;
  }
  set nativeId(value) {
    this.#nativeId_accessor_storage = value;
  }
  #bodyText_accessor_storage = "";
  get bodyText() {
    return this.#bodyText_accessor_storage;
  }
  set bodyText(value) {
    this.#bodyText_accessor_storage = value;
  }
  #titleText_accessor_storage = "";
  get titleText() {
    return this.#titleText_accessor_storage;
  }
  set titleText(value) {
    this.#titleText_accessor_storage = value;
  }
  #closeButtonAltText_accessor_storage = "";
  get closeButtonAltText() {
    return this.#closeButtonAltText_accessor_storage;
  }
  set closeButtonAltText(value) {
    this.#closeButtonAltText_accessor_storage = value;
  }
  #closeButtonTabIndex_accessor_storage = 0;
  get closeButtonTabIndex() {
    return this.#closeButtonTabIndex_accessor_storage;
  }
  set closeButtonTabIndex(value) {
    this.#closeButtonTabIndex_accessor_storage = value;
  }
  #position_accessor_storage = HelpBubbleArrowPosition.TOP_CENTER;
  get position() {
    return this.#position_accessor_storage;
  }
  set position(value) {
    this.#position_accessor_storage = value;
  }
  #buttons_accessor_storage = [];
  get buttons() {
    return this.#buttons_accessor_storage;
  }
  set buttons(value) {
    this.#buttons_accessor_storage = value;
  }
  #sortedButtons_accessor_storage = [];
  get sortedButtons() {
    return this.#sortedButtons_accessor_storage;
  }
  set sortedButtons(value) {
    this.#sortedButtons_accessor_storage = value;
  }
  #progress_accessor_storage = null;
  get progress() {
    return this.#progress_accessor_storage;
  }
  set progress(value) {
    this.#progress_accessor_storage = value;
  }
  #bodyIconName_accessor_storage = null;
  get bodyIconName() {
    return this.#bodyIconName_accessor_storage;
  }
  set bodyIconName(value) {
    this.#bodyIconName_accessor_storage = value;
  }
  #bodyIconAltText_accessor_storage = "";
  get bodyIconAltText() {
    return this.#bodyIconAltText_accessor_storage;
  }
  set bodyIconAltText(value) {
    this.#bodyIconAltText_accessor_storage = value;
  }
  timeoutMs = null;
  timeoutTimerId = null;
  debouncedUpdate = null;
  padding = { top: 0, bottom: 0, left: 0, right: 0 };
  fixed = false;
  focusAnchor = false;
  buttonListObserver_ = null;
  anchorElement_ = null;
  #progressData__accessor_storage = [];
  get progressData_() {
    return this.#progressData__accessor_storage;
  }
  set progressData_(value) {
    this.#progressData__accessor_storage = value;
  }
  resizeObserver_ = null;
  willUpdate(changedProperties) {
    super.willUpdate(changedProperties);
    if (changedProperties.has("buttons")) {
      this.sortedButtons = this.buttons.toSorted(this.buttonSortFunc_);
    }
  }
  show(anchorElement) {
    this.anchorElement_ = anchorElement;
    if (this.progress) {
      this.progressData_ = new Array(this.progress.total);
      this.progressData_.fill(true);
    } else {
      this.progressData_ = [];
    }
    this.closeButtonTabIndex = this.buttons.length
      ? this.buttons.length + 2
      : 1;
    assert(
      this.anchorElement_,
      "Tried to show a help bubble but anchorElement does not exist"
    );
    this.style.display = "block";
    this.style.position = this.fixed ? "fixed" : "absolute";
    this.removeAttribute("aria-hidden");
    this.updatePosition_();
    this.debouncedUpdate = debounceEnd(() => {
      if (this.anchorElement_) {
        this.updatePosition_();
      }
    }, 50);
    this.buttonListObserver_ = new MutationObserver(this.debouncedUpdate);
    this.buttonListObserver_.observe(this.$.buttons, { childList: true });
    window.addEventListener("resize", this.debouncedUpdate);
    if (this.timeoutMs !== null) {
      const timedOutCallback = () => {
        this.fire(HELP_BUBBLE_TIMED_OUT_EVENT, { nativeId: this.nativeId });
      };
      this.timeoutTimerId = setTimeout(timedOutCallback, this.timeoutMs);
    }
    if (this.offsetParent && !this.fixed) {
      this.resizeObserver_ = new ResizeObserver(() => {
        this.updatePosition_();
        this.anchorElement_?.scrollIntoView(HELP_BUBBLE_SCROLL_ANCHOR_OPTIONS);
      });
      this.resizeObserver_.observe(this.offsetParent);
    }
  }
  hide() {
    if (this.resizeObserver_) {
      this.resizeObserver_.disconnect();
      this.resizeObserver_ = null;
    }
    this.style.display = "none";
    this.setAttribute("aria-hidden", "true");
    this.anchorElement_ = null;
    if (this.timeoutTimerId !== null) {
      clearInterval(this.timeoutTimerId);
      this.timeoutTimerId = null;
    }
    if (this.buttonListObserver_) {
      this.buttonListObserver_.disconnect();
      this.buttonListObserver_ = null;
    }
    if (this.debouncedUpdate) {
      window.removeEventListener("resize", this.debouncedUpdate);
      this.debouncedUpdate = null;
    }
  }
  getAnchorElement() {
    return this.anchorElement_;
  }
  getButtonForTesting(buttonIndex) {
    return this.$.buttons.querySelector(
      `[id="${ACTION_BUTTON_ID_PREFIX + buttonIndex}"]`
    );
  }
  focus() {
    const defaultButton =
      this.$.buttons.querySelector("cr-button.default-button") ||
      this.$.buttons.querySelector("cr-button");
    if (defaultButton) {
      defaultButton.focus();
      return;
    }
    this.$.close.focus();
    if (this.anchorElement_ && this.focusAnchor) {
      this.anchorElement_.focus();
    }
  }
  static isDefaultButtonLeading() {
    return isWindows;
  }
  dismiss_() {
    assert(this.nativeId, "Dismiss: expected help bubble to have a native id.");
    this.fire(HELP_BUBBLE_DISMISSED_EVENT, {
      nativeId: this.nativeId,
      fromActionButton: false,
    });
  }
  onKeyDown_(e) {
    if (e.key === "Escape") {
      e.stopPropagation();
      this.dismiss_();
    }
  }
  blockPropagation_(e) {
    e.stopPropagation();
  }
  getProgressClass_(index) {
    return index < this.progress.current
      ? "current-progress"
      : "total-progress";
  }
  shouldShowTitleInTopContainer_() {
    return !!this.titleText && !this.progress;
  }
  shouldShowBodyInTopContainer_() {
    return !this.progress && !this.titleText;
  }
  shouldShowBodyInMain_() {
    return !!this.progress || !!this.titleText;
  }
  shouldShowBodyIcon_() {
    return this.bodyIconName !== null && this.bodyIconName !== "";
  }
  onButtonClick_(e) {
    assert(
      this.nativeId,
      "Action button clicked: expected help bubble to have a native ID."
    );
    const index = parseInt(
      e.target.id.substring(ACTION_BUTTON_ID_PREFIX.length)
    );
    this.fire(HELP_BUBBLE_DISMISSED_EVENT, {
      nativeId: this.nativeId,
      fromActionButton: true,
      buttonIndex: index,
    });
  }
  getButtonId_(item) {
    const index = this.buttons.indexOf(item);
    assert(index > -1);
    return ACTION_BUTTON_ID_PREFIX + index;
  }
  getButtonClass_(isDefault) {
    return isDefault
      ? "default-button focus-outline-visible"
      : "focus-outline-visible";
  }
  getButtonTabIndex_(item) {
    const index = this.buttons.indexOf(item);
    assert(index > -1);
    return item.isDefault ? 1 : index + 2;
  }
  buttonSortFunc_(button1, button2) {
    if (button1.isDefault) {
      return isWindows ? -1 : 1;
    }
    if (button2.isDefault) {
      return isWindows ? 1 : -1;
    }
    return 0;
  }
  getArrowClass_() {
    let classList = "";
    switch (this.position) {
      case HelpBubbleArrowPosition.TOP_LEFT:
      case HelpBubbleArrowPosition.TOP_CENTER:
      case HelpBubbleArrowPosition.TOP_RIGHT:
        classList = "top-edge ";
        break;
      case HelpBubbleArrowPosition.BOTTOM_LEFT:
      case HelpBubbleArrowPosition.BOTTOM_CENTER:
      case HelpBubbleArrowPosition.BOTTOM_RIGHT:
        classList = "bottom-edge ";
        break;
      case HelpBubbleArrowPosition.LEFT_TOP:
      case HelpBubbleArrowPosition.LEFT_CENTER:
      case HelpBubbleArrowPosition.LEFT_BOTTOM:
        classList = "left-edge ";
        break;
      case HelpBubbleArrowPosition.RIGHT_TOP:
      case HelpBubbleArrowPosition.RIGHT_CENTER:
      case HelpBubbleArrowPosition.RIGHT_BOTTOM:
        classList = "right-edge ";
        break;
      default:
        assertNotReached("Unknown help bubble position: " + this.position);
    }
    switch (this.position) {
      case HelpBubbleArrowPosition.TOP_LEFT:
      case HelpBubbleArrowPosition.BOTTOM_LEFT:
        classList += "left-position";
        break;
      case HelpBubbleArrowPosition.TOP_CENTER:
      case HelpBubbleArrowPosition.BOTTOM_CENTER:
        classList += "horizontal-center-position";
        break;
      case HelpBubbleArrowPosition.TOP_RIGHT:
      case HelpBubbleArrowPosition.BOTTOM_RIGHT:
        classList += "right-position";
        break;
      case HelpBubbleArrowPosition.LEFT_TOP:
      case HelpBubbleArrowPosition.RIGHT_TOP:
        classList += "top-position";
        break;
      case HelpBubbleArrowPosition.LEFT_CENTER:
      case HelpBubbleArrowPosition.RIGHT_CENTER:
        classList += "vertical-center-position";
        break;
      case HelpBubbleArrowPosition.LEFT_BOTTOM:
      case HelpBubbleArrowPosition.RIGHT_BOTTOM:
        classList += "bottom-position";
        break;
      default:
        assertNotReached("Unknown help bubble position: " + this.position);
    }
    return classList;
  }
  updatePosition_() {
    assert(
      this.anchorElement_,
      "Update position: expected valid anchor element."
    );
    const ANCHOR_OFFSET = 16;
    const ARROW_WIDTH = 16;
    const ARROW_OFFSET_FROM_EDGE = 22 + ARROW_WIDTH / 2;
    const anchorRect = this.anchorElement_.getBoundingClientRect();
    const anchorRectCenter = {
      x: anchorRect.left + anchorRect.width / 2,
      y: anchorRect.top + anchorRect.height / 2,
    };
    const helpBubbleRect = this.getBoundingClientRect();
    let offsetX = this.anchorElement_.offsetLeft;
    let offsetY = this.anchorElement_.offsetTop;
    switch (this.position) {
      case HelpBubbleArrowPosition.TOP_LEFT:
      case HelpBubbleArrowPosition.TOP_CENTER:
      case HelpBubbleArrowPosition.TOP_RIGHT:
        offsetY += anchorRect.height + ANCHOR_OFFSET + this.padding.bottom;
        break;
      case HelpBubbleArrowPosition.BOTTOM_LEFT:
      case HelpBubbleArrowPosition.BOTTOM_CENTER:
      case HelpBubbleArrowPosition.BOTTOM_RIGHT:
        offsetY -= helpBubbleRect.height + ANCHOR_OFFSET + this.padding.top;
        break;
      case HelpBubbleArrowPosition.LEFT_TOP:
      case HelpBubbleArrowPosition.LEFT_CENTER:
      case HelpBubbleArrowPosition.LEFT_BOTTOM:
        offsetX += anchorRect.width + ANCHOR_OFFSET + this.padding.right;
        break;
      case HelpBubbleArrowPosition.RIGHT_TOP:
      case HelpBubbleArrowPosition.RIGHT_CENTER:
      case HelpBubbleArrowPosition.RIGHT_BOTTOM:
        offsetX -= helpBubbleRect.width + ANCHOR_OFFSET + this.padding.left;
        break;
      default:
        assertNotReached();
    }
    switch (this.position) {
      case HelpBubbleArrowPosition.TOP_LEFT:
      case HelpBubbleArrowPosition.BOTTOM_LEFT:
        if (anchorRect.left + ARROW_OFFSET_FROM_EDGE > anchorRectCenter.x) {
          offsetX += anchorRect.width / 2 - ARROW_OFFSET_FROM_EDGE;
        }
        break;
      case HelpBubbleArrowPosition.TOP_CENTER:
      case HelpBubbleArrowPosition.BOTTOM_CENTER:
        offsetX += anchorRect.width / 2 - helpBubbleRect.width / 2;
        break;
      case HelpBubbleArrowPosition.TOP_RIGHT:
      case HelpBubbleArrowPosition.BOTTOM_RIGHT:
        if (anchorRect.right - ARROW_OFFSET_FROM_EDGE < anchorRectCenter.x) {
          offsetX +=
            anchorRect.width / 2 -
            helpBubbleRect.width +
            ARROW_OFFSET_FROM_EDGE;
        } else {
          offsetX += anchorRect.width - helpBubbleRect.width;
        }
        break;
      case HelpBubbleArrowPosition.LEFT_TOP:
      case HelpBubbleArrowPosition.RIGHT_TOP:
        if (anchorRect.top + ARROW_OFFSET_FROM_EDGE > anchorRectCenter.y) {
          offsetY += anchorRect.height / 2 - ARROW_OFFSET_FROM_EDGE;
        }
        break;
      case HelpBubbleArrowPosition.LEFT_CENTER:
      case HelpBubbleArrowPosition.RIGHT_CENTER:
        offsetY += anchorRect.height / 2 - helpBubbleRect.height / 2;
        break;
      case HelpBubbleArrowPosition.LEFT_BOTTOM:
      case HelpBubbleArrowPosition.RIGHT_BOTTOM:
        if (anchorRect.bottom - ARROW_OFFSET_FROM_EDGE < anchorRectCenter.y) {
          offsetY +=
            anchorRect.height / 2 -
            helpBubbleRect.height +
            ARROW_OFFSET_FROM_EDGE;
        } else {
          offsetY += anchorRect.height - helpBubbleRect.height;
        }
        break;
      default:
        assertNotReached();
    }
    this.style.top = offsetY.toString() + "px";
    this.style.left = offsetX.toString() + "px";
  }
}
customElements.define(HelpBubbleElement.is, HelpBubbleElement);
const ANCHOR_HIGHLIGHT_CLASS = "help-anchor-highlight";
function isRtlLang(element) {
  return window.getComputedStyle(element).direction === "rtl";
}
function reflectArrowPosition(position) {
  switch (position) {
    case HelpBubbleArrowPosition.TOP_LEFT:
      return HelpBubbleArrowPosition.TOP_RIGHT;
    case HelpBubbleArrowPosition.TOP_RIGHT:
      return HelpBubbleArrowPosition.TOP_LEFT;
    case HelpBubbleArrowPosition.BOTTOM_LEFT:
      return HelpBubbleArrowPosition.BOTTOM_RIGHT;
    case HelpBubbleArrowPosition.BOTTOM_RIGHT:
      return HelpBubbleArrowPosition.BOTTOM_LEFT;
    case HelpBubbleArrowPosition.LEFT_TOP:
      return HelpBubbleArrowPosition.RIGHT_TOP;
    case HelpBubbleArrowPosition.LEFT_CENTER:
      return HelpBubbleArrowPosition.RIGHT_CENTER;
    case HelpBubbleArrowPosition.LEFT_BOTTOM:
      return HelpBubbleArrowPosition.RIGHT_BOTTOM;
    case HelpBubbleArrowPosition.RIGHT_TOP:
      return HelpBubbleArrowPosition.LEFT_TOP;
    case HelpBubbleArrowPosition.RIGHT_CENTER:
      return HelpBubbleArrowPosition.LEFT_CENTER;
    case HelpBubbleArrowPosition.RIGHT_BOTTOM:
      return HelpBubbleArrowPosition.LEFT_BOTTOM;
    default:
      return position;
  }
}
class HelpBubbleController {
  nativeId_;
  root_;
  anchor_ = null;
  bubble_ = null;
  options_ = {
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
    fixed: false,
  };
  isBubbleShowing_ = false;
  isAnchorVisible_ = false;
  lastAnchorBounds_ = { x: 0, y: 0, width: 0, height: 0 };
  isExternal_ = false;
  constructor(nativeId, root) {
    assert(
      nativeId,
      "HelpBubble: nativeId was not defined when registering help bubble"
    );
    assert(
      root,
      "HelpBubble: shadowRoot was not defined when registering help bubble"
    );
    this.nativeId_ = nativeId;
    this.root_ = root;
  }
  isBubbleShowing() {
    return this.isBubbleShowing_;
  }
  canShowBubble() {
    return this.hasAnchor();
  }
  hasBubble() {
    return !!this.bubble_;
  }
  getBubble() {
    return this.bubble_;
  }
  hasAnchor() {
    return !!this.anchor_;
  }
  getAnchor() {
    return this.anchor_;
  }
  getNativeId() {
    return this.nativeId_;
  }
  getPadding() {
    return this.options_.padding;
  }
  getAnchorVisibility() {
    return this.isAnchorVisible_;
  }
  getLastAnchorBounds() {
    return this.lastAnchorBounds_;
  }
  updateAnchorVisibility(isVisible, bounds) {
    const changed =
      isVisible !== this.isAnchorVisible_ ||
      bounds.x !== this.lastAnchorBounds_.x ||
      bounds.y !== this.lastAnchorBounds_.y ||
      bounds.width !== this.lastAnchorBounds_.width ||
      bounds.height !== this.lastAnchorBounds_.height;
    this.isAnchorVisible_ = isVisible;
    this.lastAnchorBounds_ = bounds;
    return changed;
  }
  isAnchorFixed() {
    return this.options_.fixed;
  }
  isExternal() {
    return this.isExternal_;
  }
  updateExternalShowingStatus(isShowing) {
    this.isExternal_ = true;
    this.isBubbleShowing_ = isShowing;
    this.setAnchorHighlight_(isShowing);
  }
  track(trackable, options) {
    assert(!this.anchor_);
    let anchor = null;
    if (typeof trackable === "string") {
      anchor = this.root_.querySelector(trackable);
    } else if (Array.isArray(trackable)) {
      anchor = this.deepQuery(trackable);
    } else if (trackable instanceof HTMLElement) {
      anchor = trackable;
    } else {
      assertNotReached(
        "HelpBubble: anchor argument was unrecognized when registering " +
          "help bubble"
      );
    }
    if (!anchor) {
      return false;
    }
    anchor.dataset["nativeId"] = this.nativeId_;
    this.anchor_ = anchor;
    this.options_ = options;
    return true;
  }
  deepQuery(selectors) {
    let cur = this.root_;
    for (const selector of selectors) {
      if (cur.shadowRoot) {
        cur = cur.shadowRoot;
      }
      const el = cur.querySelector(selector);
      if (!el) {
        return null;
      } else {
        cur = el;
      }
    }
    return cur;
  }
  show() {
    this.isExternal_ = false;
    if (!(this.bubble_ && this.anchor_)) {
      return;
    }
    this.bubble_.show(this.anchor_);
    this.isBubbleShowing_ = true;
    this.setAnchorHighlight_(true);
  }
  hide() {
    if (!this.bubble_) {
      return;
    }
    this.bubble_.hide();
    this.bubble_.remove();
    this.bubble_ = null;
    this.isBubbleShowing_ = false;
    this.setAnchorHighlight_(false);
  }
  createBubble(params) {
    assert(
      this.anchor_,
      "HelpBubble: anchor was not defined when showing help bubble"
    );
    assert(this.anchor_.parentNode, "HelpBubble: anchor element not in DOM");
    this.bubble_ = document.createElement("help-bubble");
    this.bubble_.nativeId = this.nativeId_;
    this.bubble_.position = isRtlLang(this.anchor_)
      ? reflectArrowPosition(params.position)
      : params.position;
    this.bubble_.closeButtonAltText = params.closeButtonAltText;
    this.bubble_.bodyText = params.bodyText;
    this.bubble_.bodyIconName = params.bodyIconName || null;
    this.bubble_.bodyIconAltText = params.bodyIconAltText;
    this.bubble_.titleText = params.titleText || "";
    this.bubble_.progress = params.progress || null;
    this.bubble_.buttons = params.buttons;
    this.bubble_.padding = this.options_.padding;
    this.bubble_.focusAnchor = params.focusOnShowHint === false;
    if (params.timeout) {
      this.bubble_.timeoutMs = Number(params.timeout.microseconds / 1000n);
      assert(this.bubble_.timeoutMs > 0);
    }
    assert(
      !this.bubble_.progress ||
        this.bubble_.progress.total >= this.bubble_.progress.current
    );
    assert(this.root_);
    if (
      getComputedStyle(this.anchor_).getPropertyValue("position") === "fixed"
    ) {
      this.bubble_.fixed = true;
    }
    this.anchor_.parentNode.insertBefore(this.bubble_, this.anchor_);
    return this.bubble_;
  }
  setAnchorHighlight_(highlight) {
    assert(
      this.anchor_,
      "Set anchor highlight: expected valid anchor element."
    );
    this.anchor_.classList.toggle(ANCHOR_HIGHLIGHT_CLASS, highlight);
    if (highlight) {
      (this.bubble_ || this.anchor_).focus();
      this.anchor_.scrollIntoView(HELP_BUBBLE_SCROLL_ANCHOR_OPTIONS);
    }
  }
}
class HelpBubbleProxyImpl {
  trackedElementHandler_ = new TrackedElementHandlerRemote();
  callbackRouter_ = new HelpBubbleClientCallbackRouter();
  handler_ = new HelpBubbleHandlerRemote();
  constructor() {
    const factory = HelpBubbleHandlerFactory.getRemote();
    factory.createHelpBubbleHandler(
      this.callbackRouter_.$.bindNewPipeAndPassRemote(),
      this.handler_.$.bindNewPipeAndPassReceiver()
    );
    this.handler_.bindTrackedElementHandler(
      this.trackedElementHandler_.$.bindNewPipeAndPassReceiver()
    );
  }
  static getInstance() {
    return instance$1 || (instance$1 = new HelpBubbleProxyImpl());
  }
  static setInstance(obj) {
    instance$1 = obj;
  }
  getTrackedElementHandler() {
    return this.trackedElementHandler_;
  }
  getHandler() {
    return this.handler_;
  }
  getCallbackRouter() {
    return this.callbackRouter_;
  }
}
let instance$1 = null;
const HelpBubbleMixinLit = (superClass) => {
  class HelpBubbleMixinLit extends superClass {
    trackedElementHandler_;
    helpBubbleHandler_;
    helpBubbleCallbackRouter_;
    helpBubbleControllerById_ = new Map();
    helpBubbleListenerIds_ = [];
    helpBubbleFixedAnchorObserver_ = null;
    helpBubbleResizeObserver_ = null;
    helpBubbleDismissedEventTracker_ = new EventTracker();
    debouncedAnchorMayHaveChangedCallback_ = null;
    constructor(...args) {
      super(...args);
      this.trackedElementHandler_ =
        HelpBubbleProxyImpl.getInstance().getTrackedElementHandler();
      this.helpBubbleHandler_ = HelpBubbleProxyImpl.getInstance().getHandler();
      this.helpBubbleCallbackRouter_ =
        HelpBubbleProxyImpl.getInstance().getCallbackRouter();
    }
    connectedCallback() {
      super.connectedCallback();
      const router = this.helpBubbleCallbackRouter_;
      this.helpBubbleListenerIds_.push(
        router.showHelpBubble.addListener(this.onShowHelpBubble_.bind(this)),
        router.toggleFocusForAccessibility.addListener(
          this.onToggleHelpBubbleFocusForAccessibility_.bind(this)
        ),
        router.hideHelpBubble.addListener(this.onHideHelpBubble_.bind(this)),
        router.externalHelpBubbleUpdated.addListener(
          this.onExternalHelpBubbleUpdated_.bind(this)
        )
      );
      const isVisible = (element) => {
        const rect = element.getBoundingClientRect();
        return rect.height > 0 && rect.width > 0;
      };
      this.debouncedAnchorMayHaveChangedCallback_ = debounceEnd(
        this.onAnchorBoundsMayHaveChanged_.bind(this),
        50
      );
      this.helpBubbleResizeObserver_ = new ResizeObserver((entries) =>
        entries.forEach(({ target: target }) => {
          if (target === document.body) {
            if (this.debouncedAnchorMayHaveChangedCallback_) {
              this.debouncedAnchorMayHaveChangedCallback_();
            }
          } else {
            this.onAnchorVisibilityChanged_(target, isVisible(target));
          }
        })
      );
      this.helpBubbleFixedAnchorObserver_ = new IntersectionObserver(
        (entries) =>
          entries.forEach(
            ({ target: target, isIntersecting: isIntersecting }) =>
              this.onAnchorVisibilityChanged_(target, isIntersecting)
          ),
        { root: null }
      );
      document.addEventListener(
        "scroll",
        this.debouncedAnchorMayHaveChangedCallback_,
        { passive: true }
      );
      this.helpBubbleResizeObserver_.observe(document.body);
      this.controllers.forEach((ctrl) => this.observeControllerAnchor_(ctrl));
    }
    get controllers() {
      return Array.from(this.helpBubbleControllerById_.values());
    }
    disconnectedCallback() {
      super.disconnectedCallback();
      for (const listenerId of this.helpBubbleListenerIds_) {
        this.helpBubbleCallbackRouter_.removeListener(listenerId);
      }
      this.helpBubbleListenerIds_ = [];
      assert(this.helpBubbleResizeObserver_);
      this.helpBubbleResizeObserver_.disconnect();
      this.helpBubbleResizeObserver_ = null;
      assert(this.helpBubbleFixedAnchorObserver_);
      this.helpBubbleFixedAnchorObserver_.disconnect();
      this.helpBubbleFixedAnchorObserver_ = null;
      this.helpBubbleDismissedEventTracker_.removeAll();
      this.helpBubbleControllerById_.clear();
      if (this.debouncedAnchorMayHaveChangedCallback_) {
        document.removeEventListener(
          "scroll",
          this.debouncedAnchorMayHaveChangedCallback_
        );
        this.debouncedAnchorMayHaveChangedCallback_ = null;
      }
    }
    registerHelpBubble(nativeId, trackable, options = {}) {
      if (this.helpBubbleControllerById_.has(nativeId)) {
        const ctrl = this.helpBubbleControllerById_.get(nativeId);
        if (ctrl && ctrl.isBubbleShowing()) {
          return null;
        }
        this.unregisterHelpBubble(nativeId);
      }
      const controller = new HelpBubbleController(nativeId, this.shadowRoot);
      controller.track(trackable, parseOptions(options));
      this.helpBubbleControllerById_.set(nativeId, controller);
      if (this.helpBubbleResizeObserver_) {
        this.observeControllerAnchor_(controller);
      }
      return controller;
    }
    unregisterHelpBubble(nativeId) {
      const ctrl = this.helpBubbleControllerById_.get(nativeId);
      if (ctrl && ctrl.hasAnchor()) {
        this.onAnchorVisibilityChanged_(ctrl.getAnchor(), false);
        this.unobserveControllerAnchor_(ctrl);
      }
      this.helpBubbleControllerById_.delete(nativeId);
    }
    observeControllerAnchor_(controller) {
      const anchor = controller.getAnchor();
      assert(anchor, "Help bubble does not have anchor");
      if (controller.isAnchorFixed()) {
        assert(this.helpBubbleFixedAnchorObserver_);
        this.helpBubbleFixedAnchorObserver_.observe(anchor);
      } else {
        assert(this.helpBubbleResizeObserver_);
        this.helpBubbleResizeObserver_.observe(anchor);
      }
    }
    unobserveControllerAnchor_(controller) {
      const anchor = controller.getAnchor();
      assert(anchor, "Help bubble does not have anchor");
      if (controller.isAnchorFixed()) {
        assert(this.helpBubbleFixedAnchorObserver_);
        this.helpBubbleFixedAnchorObserver_.unobserve(anchor);
      } else {
        assert(this.helpBubbleResizeObserver_);
        this.helpBubbleResizeObserver_.unobserve(anchor);
      }
    }
    isHelpBubbleShowing() {
      return this.controllers.some((ctrl) => ctrl.isBubbleShowing());
    }
    isHelpBubbleShowingForTesting(id) {
      const ctrls = this.controllers.filter(
        this.filterMatchingIdForTesting_(id)
      );
      return !!ctrls[0];
    }
    getHelpBubbleForTesting(id) {
      const ctrls = this.controllers.filter(
        this.filterMatchingIdForTesting_(id)
      );
      return ctrls[0] ? ctrls[0].getBubble() : null;
    }
    filterMatchingIdForTesting_(anchorId) {
      return (ctrl) =>
        ctrl.isBubbleShowing() &&
        ctrl.getAnchor() !== null &&
        ctrl.getAnchor().id === anchorId;
    }
    getSortedAnchorStatusesForTesting() {
      return this.controllers
        .sort((a, b) => a.getNativeId().localeCompare(b.getNativeId()))
        .map((ctrl) => [ctrl.getNativeId(), ctrl.hasAnchor()]);
    }
    canShowHelpBubble(controller) {
      if (!this.helpBubbleControllerById_.has(controller.getNativeId())) {
        return false;
      }
      if (!controller.canShowBubble()) {
        return false;
      }
      const anchor = controller.getAnchor();
      const anchorIsUsed = this.controllers.some(
        (otherCtrl) =>
          otherCtrl.isBubbleShowing() && otherCtrl.getAnchor() === anchor
      );
      return !anchorIsUsed;
    }
    showHelpBubble(controller, params) {
      assert(this.canShowHelpBubble(controller), "Can't show help bubble");
      const bubble = controller.createBubble(params);
      this.helpBubbleDismissedEventTracker_.add(
        bubble,
        HELP_BUBBLE_DISMISSED_EVENT,
        this.onHelpBubbleDismissed_.bind(this)
      );
      this.helpBubbleDismissedEventTracker_.add(
        bubble,
        HELP_BUBBLE_TIMED_OUT_EVENT,
        this.onHelpBubbleTimedOut_.bind(this)
      );
      controller.show();
    }
    hideHelpBubble(nativeId) {
      const ctrl = this.helpBubbleControllerById_.get(nativeId);
      if (!ctrl || !ctrl.hasBubble()) {
        return false;
      }
      this.helpBubbleDismissedEventTracker_.remove(
        ctrl.getBubble(),
        HELP_BUBBLE_DISMISSED_EVENT
      );
      this.helpBubbleDismissedEventTracker_.remove(
        ctrl.getBubble(),
        HELP_BUBBLE_TIMED_OUT_EVENT
      );
      ctrl.hide();
      return true;
    }
    notifyHelpBubbleAnchorActivated(nativeId) {
      const ctrl = this.helpBubbleControllerById_.get(nativeId);
      if (!ctrl || !ctrl.isBubbleShowing()) {
        return false;
      }
      this.trackedElementHandler_.trackedElementActivated(nativeId);
      return true;
    }
    notifyHelpBubbleAnchorCustomEvent(nativeId, customEvent) {
      const ctrl = this.helpBubbleControllerById_.get(nativeId);
      if (!ctrl || !ctrl.isBubbleShowing()) {
        return false;
      }
      this.trackedElementHandler_.trackedElementCustomEvent(
        nativeId,
        customEvent
      );
      return true;
    }
    onAnchorVisibilityChanged_(target, isVisible) {
      const nativeId = target.dataset["nativeId"];
      assert(nativeId);
      const ctrl = this.helpBubbleControllerById_.get(nativeId);
      const hidden = this.hideHelpBubble(nativeId);
      if (hidden) {
        this.helpBubbleHandler_.helpBubbleClosed(
          nativeId,
          HelpBubbleClosedReason.kPageChanged
        );
      }
      const bounds = isVisible
        ? this.getElementBounds_(target)
        : { x: 0, y: 0, width: 0, height: 0 };
      if (!ctrl || ctrl.updateAnchorVisibility(isVisible, bounds)) {
        this.trackedElementHandler_.trackedElementVisibilityChanged(
          nativeId,
          isVisible,
          bounds
        );
      }
    }
    onAnchorBoundsMayHaveChanged_() {
      for (const ctrl of this.controllers) {
        if (ctrl.hasAnchor() && ctrl.getAnchorVisibility()) {
          const bounds = this.getElementBounds_(ctrl.getAnchor());
          if (ctrl.updateAnchorVisibility(true, bounds)) {
            this.trackedElementHandler_.trackedElementVisibilityChanged(
              ctrl.getNativeId(),
              true,
              bounds
            );
          }
        }
      }
    }
    getElementBounds_(element) {
      const rect = { x: 0, y: 0, width: 0, height: 0 };
      const bounds = element.getBoundingClientRect();
      rect.x = bounds.x;
      rect.y = bounds.y;
      rect.width = bounds.width;
      rect.height = bounds.height;
      const nativeId = element.dataset["nativeId"];
      if (!nativeId) {
        return rect;
      }
      const ctrl = this.helpBubbleControllerById_.get(nativeId);
      if (ctrl) {
        const padding = ctrl.getPadding();
        rect.x -= padding.left;
        rect.y -= padding.top;
        rect.width += padding.left + padding.right;
        rect.height += padding.top + padding.bottom;
      }
      return rect;
    }
    onShowHelpBubble_(params) {
      if (!this.helpBubbleControllerById_.has(params.nativeIdentifier)) {
        return;
      }
      const ctrl = this.helpBubbleControllerById_.get(params.nativeIdentifier);
      this.showHelpBubble(ctrl, params);
    }
    onToggleHelpBubbleFocusForAccessibility_(nativeId) {
      if (!this.helpBubbleControllerById_.has(nativeId)) {
        return;
      }
      const ctrl = this.helpBubbleControllerById_.get(nativeId);
      if (ctrl) {
        const anchor = ctrl.getAnchor();
        if (anchor) {
          anchor.focus();
        }
      }
    }
    onHideHelpBubble_(nativeId) {
      this.hideHelpBubble(nativeId);
    }
    onExternalHelpBubbleUpdated_(nativeId, shown) {
      if (!this.helpBubbleControllerById_.has(nativeId)) {
        return;
      }
      const ctrl = this.helpBubbleControllerById_.get(nativeId);
      ctrl.updateExternalShowingStatus(shown);
    }
    onHelpBubbleDismissed_(e) {
      const nativeId = e.detail.nativeId;
      assert(nativeId);
      const hidden = this.hideHelpBubble(nativeId);
      assert(hidden);
      if (nativeId) {
        if (e.detail.fromActionButton) {
          this.helpBubbleHandler_.helpBubbleButtonPressed(
            nativeId,
            e.detail.buttonIndex
          );
        } else {
          this.helpBubbleHandler_.helpBubbleClosed(
            nativeId,
            HelpBubbleClosedReason.kDismissedByUser
          );
        }
      }
    }
    onHelpBubbleTimedOut_(e) {
      const nativeId = e.detail.nativeId;
      const ctrl = this.helpBubbleControllerById_.get(nativeId);
      assert(ctrl);
      const hidden = this.hideHelpBubble(nativeId);
      assert(hidden);
      if (nativeId) {
        this.helpBubbleHandler_.helpBubbleClosed(
          nativeId,
          HelpBubbleClosedReason.kTimedOut
        );
      }
    }
  }
  return HelpBubbleMixinLit;
};
function parseOptions(options) {
  const padding = { top: 0, bottom: 0, left: 0, right: 0 };
  padding.top = clampPadding(options.anchorPaddingTop);
  padding.left = clampPadding(options.anchorPaddingLeft);
  padding.bottom = clampPadding(options.anchorPaddingBottom);
  padding.right = clampPadding(options.anchorPaddingRight);
  return { padding: padding, fixed: !!options.fixed };
}
function clampPadding(n = 0) {
  return Math.max(0, Math.min(20, n));
}
class KeyboardShortcut {
  useKeyCode_ = false;
  mods_ = {};
  key_ = null;
  keyCode_ = null;
  constructor(shortcut) {
    shortcut.split("|").forEach((part) => {
      const partLc = part.toLowerCase();
      switch (partLc) {
        case "alt":
        case "ctrl":
        case "meta":
        case "shift":
          this.mods_[partLc + "Key"] = true;
          break;
        default:
          if (this.key_) {
            throw Error("Invalid shortcut");
          }
          this.key_ = part;
          if (part.match(/^[a-z]$/)) {
            this.useKeyCode_ = true;
            this.keyCode_ = part.toUpperCase().charCodeAt(0);
          }
      }
    });
  }
  matchesEvent(e) {
    if (
      (this.useKeyCode_ && e.keyCode === this.keyCode_) ||
      e.key === this.key_
    ) {
      const mods = this.mods_;
      return ["altKey", "ctrlKey", "metaKey", "shiftKey"].every(function (k) {
        return e[k] === !!mods[k];
      });
    }
    return false;
  }
}
class KeyboardShortcutList {
  shortcuts_;
  constructor(shortcuts) {
    this.shortcuts_ = shortcuts.split(/\s+/).map(function (shortcut) {
      return new KeyboardShortcut(shortcut);
    });
  }
  matchesEvent(e) {
    return this.shortcuts_.some(function (keyboardShortcut) {
      return keyboardShortcut.matchesEvent(e);
    });
  }
}
const FindShortcutManager = (() => {
  const listeners = [];
  let modalContextOpen = false;
  const shortcutCtrlF = new KeyboardShortcutList(isMac ? "meta|f" : "ctrl|f");
  const shortcutSlash = new KeyboardShortcutList("/");
  window.addEventListener("keydown", (e) => {
    if (e.defaultPrevented || listeners.length === 0) {
      return;
    }
    const element = e.composedPath()[0];
    if (
      !shortcutCtrlF.matchesEvent(e) &&
      (element.tagName === "INPUT" ||
        element.tagName === "TEXTAREA" ||
        !shortcutSlash.matchesEvent(e))
    ) {
      return;
    }
    const focusIndex = listeners.findIndex((listener) =>
      listener.searchInputHasFocus()
    );
    const index = focusIndex <= 0 ? listeners.length - 1 : focusIndex - 1;
    if (listeners[index].handleFindShortcut(modalContextOpen)) {
      e.preventDefault();
    }
  });
  window.addEventListener("cr-dialog-open", () => {
    modalContextOpen = true;
  });
  window.addEventListener("cr-drawer-opened", () => {
    modalContextOpen = true;
  });
  window.addEventListener("close", (e) => {
    if (["CR-DIALOG", "CR-DRAWER"].includes(e.composedPath()[0].nodeName)) {
      modalContextOpen = false;
    }
  });
  return Object.freeze({ listeners: listeners });
})();
const FindShortcutMixinLit = (superClass) => {
  class FindShortcutMixinLit extends superClass {
    findShortcutListenOnAttach = true;
    connectedCallback() {
      super.connectedCallback();
      if (this.findShortcutListenOnAttach) {
        this.becomeActiveFindShortcutListener();
      }
    }
    disconnectedCallback() {
      super.disconnectedCallback();
      if (this.findShortcutListenOnAttach) {
        this.removeSelfAsFindShortcutListener();
      }
    }
    becomeActiveFindShortcutListener() {
      const listeners = FindShortcutManager.listeners;
      assert(
        !listeners.includes(this),
        "Already listening for find shortcuts."
      );
      listeners.push(this);
    }
    handleFindShortcutInternal_() {
      assertNotReached("Must override handleFindShortcut()");
    }
    handleFindShortcut(_modalContextOpen) {
      this.handleFindShortcutInternal_();
      return false;
    }
    removeSelfAsFindShortcutListener() {
      const listeners = FindShortcutManager.listeners;
      const index = listeners.indexOf(this);
      assert(listeners.includes(this), "Find shortcut listener not found.");
      listeners.splice(index, 1);
    }
    searchInputHasFocusInternal_() {
      assertNotReached("Must override searchInputHasFocus()");
    }
    searchInputHasFocus() {
      this.searchInputHasFocusInternal_();
      return false;
    }
  }
  return FindShortcutMixinLit;
};
let instance = null;
function getCss() {
  return (
    instance ||
    (instance = [
      ...[getCss$z(), getCss$C(), getCss$D()],
      css`
        :host {
          color: var(--cr-primary-text-color);
          display: flex;
          flex-direction: column;
          height: 100%;
          line-height: 1.54;
          overflow: hidden;
        }
        :host([enable-history-embeddings_]) {
          --first-card-padding-top: 0;
          --first-cluster-padding-top: 0;
        }
        #main-container {
          anchor-name: --main-container;
          display: flex;
          flex: 1;
          overflow: hidden;
          position: relative;
        }
        #content {
          flex: 1;
          min-width: 0;
        }
        #content,
        #content > * {
          height: 100%;
        }
        #historyEmbeddingsDisclaimer {
          box-sizing: border-box;
          width: 100%;
          margin: 0 auto;
          padding: 6px 10px 8px;
          color: var(--cr-secondary-text-color);
          font-size: 11px;
          font-weight: 400;
          text-wrap: pretty;
        }
        #historyEmbeddingsDisclaimer[narrow] {
          padding-inline: 24px;
          max-width: none;
        }
        #historyEmbeddingsDisclaimer:not([narrow])
          #historyEmbeddingsDisclaimerContent {
          max-width: 680px;
        }
        cr-history-embeddings-filter-chips {
          margin: 0 auto;
          padding: 16px 8px;
        }
        cr-history-embeddings-filter-chips ~ #tabsContent {
          --first-card-padding-top: 8px;
          --first-cluster-padding-top: 8px;
        }
        #tabsContainer {
          display: flex;
          flex-direction: column;
          --cr-tabs-height: 48px;
          --tabs-margin-top: 16px;
        }
        #tabs {
          --cr-tabs-icon-margin-end: 12px;
          --cr-tabs-selection-bar-width: 3px;
          --cr-tabs-tab-inline-padding: 16px;
          border-bottom: 1px solid var(--separator-color);
          display: flex;
          justify-content: start;
          margin: 0 auto;
          max-width: var(--cluster-max-width);
          width: 100%;
        }
        #tabsScrollContainer {
          overflow: auto;
          height: 100%;
          scrollbar-gutter: stable;
        }
        .cr-scrollable-top-shadow {
          position-anchor: --main-container;
        }
        :host([has-history-embeddings-results_]) history-list[is-empty],
        :host([has-history-embeddings-results_]) history-clusters[is-empty] {
          display: none;
        }
        cr-history-embeddings {
          margin-block-end: var(--card-padding-between);
        }
      `,
    ])
  );
}
function getHtml() {
  return html`<!--_html_template_start_-->
    <history-query-manager
      .queryResult="${this.queryResult_}"
      @query-finished="${this.onQueryFinished_}"
      @query-state-changed="${this.onQueryStateChanged_}"
    >
    </history-query-manager>
    <history-router
      id="router"
      .selectedPage="${this.selectedPage_}"
      .queryState="${this.queryState_}"
      .lastSelectedTab="${this.lastSelectedTab_}"
      @selected-page-changed="${this.onSelectedPageChanged_}"
    >
    </history-router>
    <history-toolbar
      id="toolbar"
      ?has-drawer="${this.hasDrawer_}"
      ?has-more-results="${!this.queryResult_.info?.finished}"
      ?pending-delete="${this.pendingDelete_}"
      .queryInfo="${this.queryResult_.info}"
      ?querying="${this.queryState_.querying}"
      .searchTerm="${this.queryState_.searchTerm}"
      ?spinner-active="${this.shouldShowSpinner_()}"
      .selectedPage="${this.selectedPage_}"
      @search-term-native-before-input="${this
        .onToolbarSearchInputNativeBeforeInput_}"
      @search-term-native-input="${this.onToolbarSearchInputNativeInput_}"
      @search-term-cleared="${this.onToolbarSearchCleared_}"
    >
    </history-toolbar>
    <div id="drop-shadow" class="cr-container-shadow"></div>
    <div id="main-container">
      <history-side-bar
        id="contentSideBar"
        .selectedPage="${this.selectedPage_}"
        @selected-page-changed="${this.onSelectedPageChanged_}"
        .selectedTab="${this.selectedTab_}"
        @selected-tab-changed="${this.onSelectedTabChanged_}"
        .footerInfo="${this.footerInfo}"
        ?history-clusters-enabled="${this.historyClustersEnabled_}"
        ?history-clusters-visible="${this.historyClustersVisible_}"
        @history-clusters-visible-changed="${this
          .onHistoryClustersVisibleChanged_}"
        ?hidden="${this.hasDrawer_}"
      >
      </history-side-bar>
      <cr-page-selector
        id="content"
        attr-for-selected="path"
        selected="${this.contentPage_}"
        @iron-select="${this.updateScrollTarget_}"
      >
        <div id="tabsContainer" path="history">
          <div
            id="historyEmbeddingsDisclaimer"
            class="history-cards"
            ?hidden="${!this.enableHistoryEmbeddings_}"
            ?narrow="${this.hasDrawer_}"
          >
            <div id="historyEmbeddingsDisclaimerContent">
              As suas pesquisas, as melhores correspondÃªncias e o respetivo
              conteÃºdo da pÃ¡gina sÃ£o enviados para a Google e podem ser
              vistos por revisores humanos para melhorar esta funcionalidade.
              <a
                id="historyEmbeddingsDisclaimerLink"
                href="chrome://settings/ai/historySearch"
                target="_blank"
                aria-describedby="historyEmbeddingsDisclaimer"
                @click="${this.onHistoryEmbeddingsDisclaimerLinkClick_}"
                @auxclick="${this.onHistoryEmbeddingsDisclaimerLinkClick_}"
              >
                Saiba mais
              </a>
            </div>
          </div>
          ${this.showTabs_
            ? html` <div id="tabs">
                <cr-tabs
                  .tabNames="${this.tabsNames_}"
                  .tabIcons="${this.tabsIcons_}"
                  selected="${this.selectedTab_}"
                  @selected-changed="${this.onSelectedTabChanged_}"
                >
                </cr-tabs>
              </div>`
            : ""}
          <div id="tabsScrollContainer" class="cr-scrollable">
            <div
              class="cr-scrollable-top-shadow"
              ?hidden="${this.showTabs_}"
            ></div>
            ${this.enableHistoryEmbeddings_
              ? html` <div
                  id="historyEmbeddingsContainer"
                  class="history-cards"
                >
                  <history-embeddings-promo></history-embeddings-promo>
                  <cr-history-embeddings-filter-chips
                    .timeRangeStart="${this.queryStateAfterDate_}"
                    ?enable-show-results-by-group-option="${this
                      .showHistoryClusters_}"
                    ?show-results-by-group="${this.getShowResultsByGroup_()}"
                    @show-results-by-group-changed="${this
                      .onShowResultsByGroupChanged_}"
                    @selected-suggestion-changed="${this
                      .onSelectedSuggestionChanged_}"
                  >
                  </cr-history-embeddings-filter-chips>
                  ${this.shouldShowHistoryEmbeddings_()
                    ? html` <cr-history-embeddings
                        .searchQuery="${this.queryState_.searchTerm}"
                        .timeRangeStart="${this.queryStateAfterDate_}"
                        .numCharsForQuery="${this.numCharsTypedInSearch_}"
                        @more-from-site-click="${this
                          .onHistoryEmbeddingsItemMoreFromSiteClick_}"
                        @remove-item-click="${this
                          .onHistoryEmbeddingsItemRemoveClick_}"
                        @is-empty-changed="${this
                          .onHistoryEmbeddingsIsEmptyChanged_}"
                        ?force-suppress-logging="${this
                          .historyEmbeddingsDisclaimerLinkClicked_}"
                        ?show-more-from-site-menu-option="${!this.getShowResultsByGroup_()}"
                        ?show-relative-times="${this.getShowResultsByGroup_()}"
                        ?other-history-result-clicked="${this
                          .nonEmbeddingsResultClicked_}"
                      >
                      </cr-history-embeddings>`
                    : ""}
                </div>`
              : ""}
            <cr-page-selector
              id="tabsContent"
              attr-for-selected="path"
              selected="${this.tabsContentPage_}"
              @iron-select="${this.updateScrollTarget_}"
            >
              <history-list
                id="history"
                .queryState="${this.queryState_}"
                ?is-active="${this.getShowHistoryList_()}"
                searched-term="${this.queryResult_.info?.term}"
                ?pending-delete="${this.pendingDelete_}"
                @pending-delete-changed="${this.onListPendingDeleteChanged_}"
                .queryResult="${this.queryResult_}"
                path="history"
                .scrollTarget="${this.scrollTarget_}"
                .scrollOffset="${this.tabContentScrollOffset_}"
              >
              </history-list>
              ${this.historyClustersSelected_()
                ? html` <history-clusters
                    id="history-clusters"
                    ?is-active="${this.getShowResultsByGroup_()}"
                    .query="${this.queryState_.searchTerm}"
                    .timeRangeStart="${this.queryStateAfterDate_}"
                    path="grouped"
                    .scrollTarget="${this.scrollTarget_}"
                    .scrollOffset="${this.tabContentScrollOffset_}"
                  >
                  </history-clusters>`
                : ""}
            </cr-page-selector>
          </div>
        </div>
        ${this.syncedTabsSelected_()
          ? html` <div
              id="syncedDevicesScroll"
              class="cr-scrollable"
              path="syncedTabs"
            >
              <div class="cr-scrollable-top-shadow"></div>
              <history-synced-device-manager
                id="synced-devices"
                .sessionList="${this.queryResult_.sessionList}"
                .searchTerm="${this.queryState_.searchTerm}"
                .signInState="${this.signInState_}"
              >
              </history-synced-device-manager>
            </div>`
          : ""}
      </cr-page-selector>
    </div>

    <cr-lazy-render-lit
      id="drawer"
      .template="${() => html` <cr-drawer heading="HistÃ³rico" align="ltr">
        <history-side-bar
          id="drawer-side-bar"
          slot="body"
          .selectedPage="${this.selectedPage_}"
          @selected-page-changed="${this.onSelectedPageChanged_}"
          .selectedTab="${this.selectedTab_}"
          @selected-tab-changed="${this.onSelectedTabChanged_}"
          ?history-clusters-enabled="${this.historyClustersEnabled_}"
          ?history-clusters-visible="${this.historyClustersVisible_}"
          @history-clusters-visible-changed="${this
            .onHistoryClustersVisibleChanged_}"
          .footerInfo="${this.footerInfo}"
        >
        </history-side-bar>
      </cr-drawer>`}"
    >
    </cr-lazy-render-lit>
    <!--_html_template_end_-->`;
}
let lazyLoadPromise = null;
function ensureLazyLoaded() {
  if (!lazyLoadPromise) {
    const script = document.createElement("script");
    script.type = "module";
    script.src = getTrustedScriptURL`./lazy_load.js`;
    document.body.appendChild(script);
    lazyLoadPromise = Promise.all([
      customElements.whenDefined("history-synced-device-manager"),
      customElements.whenDefined("cr-action-menu"),
      customElements.whenDefined("cr-button"),
      customElements.whenDefined("cr-checkbox"),
      customElements.whenDefined("cr-dialog"),
      customElements.whenDefined("cr-drawer"),
      customElements.whenDefined("cr-icon-button"),
      customElements.whenDefined("cr-toolbar-selection-overlay"),
    ]);
  }
  return lazyLoadPromise;
}
function onDocumentClick(evt) {
  const e = evt;
  if (e.button > 1 || e.defaultPrevented) {
    return;
  }
  const eventPath = e.composedPath();
  let anchor = null;
  if (eventPath) {
    for (let i = 0; i < eventPath.length; i++) {
      const element = eventPath[i];
      if (element.tagName === "A" && element.href) {
        anchor = element;
        break;
      }
    }
  }
  let el = e.target;
  if (
    !anchor &&
    el.nodeType === Node.ELEMENT_NODE &&
    el.webkitMatchesSelector("A, A *")
  ) {
    while (el.tagName !== "A") {
      el = el.parentElement;
    }
    anchor = el;
  }
  if (!anchor) {
    return;
  }
  if (
    (anchor.protocol === "file:" || anchor.protocol === "about:") &&
    (e.button === 0 || e.button === 1)
  ) {
    BrowserServiceImpl.getInstance().navigateToUrl(
      anchor.href,
      anchor.target,
      e
    );
    e.preventDefault();
  }
}
const HistoryAppElementBase = HelpBubbleMixinLit(
  FindShortcutMixinLit(WebUiListenerMixinLit(CrLitElement))
);
class HistoryAppElement extends HistoryAppElementBase {
  static get is() {
    return "history-app";
  }
  static get styles() {
    return getCss();
  }
  render() {
    return getHtml.bind(this)();
  }
  static get properties() {
    return {
      enableHistoryEmbeddings_: { type: Boolean, reflect: true },
      contentPage_: { type: String },
      tabsContentPage_: { type: String },
      selectedPage_: { type: String },
      queryResult_: { type: Object },
      signInState_: {
        type: Number,
        value: () => loadTimeData.getInteger("signInState"),
      },
      pendingDelete_: { type: Boolean },
      queryState_: { type: Object },
      hasDrawer_: { type: Boolean },
      footerInfo: { type: Object },
      historyClustersEnabled_: { type: Boolean },
      historyClustersVisible_: { type: Boolean },
      lastSelectedTab_: { type: Number },
      showHistoryClusters_: { type: Boolean, reflect: true },
      showTabs_: { type: Boolean },
      selectedTab_: { type: Number },
      tabsIcons_: { type: Array },
      tabsNames_: { type: Array },
      scrollTarget_: { type: Object },
      queryStateAfterDate_: { type: Object },
      hasHistoryEmbeddingsResults_: { type: Boolean, reflect: true },
      tabContentScrollOffset_: { type: Number },
      nonEmbeddingsResultClicked_: { type: Boolean },
      numCharsTypedInSearch_: { type: Number },
      historyEmbeddingsDisclaimerLinkClicked_: { type: Boolean },
    };
  }
  #footerInfo_accessor_storage = {
    managed: loadTimeData.getBoolean("isManaged"),
    otherFormsOfHistory: false,
    geminiAppsActivity:
      loadTimeData.getBoolean("isGlicEnabled") &&
      loadTimeData.getBoolean("enableBrowsingHistoryActorIntegrationM1"),
  };
  get footerInfo() {
    return this.#footerInfo_accessor_storage;
  }
  set footerInfo(value) {
    this.#footerInfo_accessor_storage = value;
  }
  #enableHistoryEmbeddings__accessor_storage = loadTimeData.getBoolean(
    "enableHistoryEmbeddings"
  );
  get enableHistoryEmbeddings_() {
    return this.#enableHistoryEmbeddings__accessor_storage;
  }
  set enableHistoryEmbeddings_(value) {
    this.#enableHistoryEmbeddings__accessor_storage = value;
  }
  #hasDrawer__accessor_storage;
  get hasDrawer_() {
    return this.#hasDrawer__accessor_storage;
  }
  set hasDrawer_(value) {
    this.#hasDrawer__accessor_storage = value;
  }
  #historyClustersEnabled__accessor_storage = loadTimeData.getBoolean(
    "isHistoryClustersEnabled"
  );
  get historyClustersEnabled_() {
    return this.#historyClustersEnabled__accessor_storage;
  }
  set historyClustersEnabled_(value) {
    this.#historyClustersEnabled__accessor_storage = value;
  }
  #historyClustersVisible__accessor_storage = loadTimeData.getBoolean(
    "isHistoryClustersVisible"
  );
  get historyClustersVisible_() {
    return this.#historyClustersVisible__accessor_storage;
  }
  set historyClustersVisible_(value) {
    this.#historyClustersVisible__accessor_storage = value;
  }
  #signInState__accessor_storage;
  get signInState_() {
    return this.#signInState__accessor_storage;
  }
  set signInState_(value) {
    this.#signInState__accessor_storage = value;
  }
  #lastSelectedTab__accessor_storage =
    loadTimeData.getInteger("lastSelectedTab");
  get lastSelectedTab_() {
    return this.#lastSelectedTab__accessor_storage;
  }
  set lastSelectedTab_(value) {
    this.#lastSelectedTab__accessor_storage = value;
  }
  #contentPage__accessor_storage = Page.HISTORY;
  get contentPage_() {
    return this.#contentPage__accessor_storage;
  }
  set contentPage_(value) {
    this.#contentPage__accessor_storage = value;
  }
  #tabsContentPage__accessor_storage = Page.HISTORY;
  get tabsContentPage_() {
    return this.#tabsContentPage__accessor_storage;
  }
  set tabsContentPage_(value) {
    this.#tabsContentPage__accessor_storage = value;
  }
  #pendingDelete__accessor_storage = false;
  get pendingDelete_() {
    return this.#pendingDelete__accessor_storage;
  }
  set pendingDelete_(value) {
    this.#pendingDelete__accessor_storage = value;
  }
  #queryResult__accessor_storage = {
    info: undefined,
    value: [],
    sessionList: [],
  };
  get queryResult_() {
    return this.#queryResult__accessor_storage;
  }
  set queryResult_(value) {
    this.#queryResult__accessor_storage = value;
  }
  #queryState__accessor_storage = {
    incremental: false,
    querying: false,
    searchTerm: "",
    after: null,
  };
  get queryState_() {
    return this.#queryState__accessor_storage;
  }
  set queryState_(value) {
    this.#queryState__accessor_storage = value;
  }
  #selectedPage__accessor_storage = Page.HISTORY;
  get selectedPage_() {
    return this.#selectedPage__accessor_storage;
  }
  set selectedPage_(value) {
    this.#selectedPage__accessor_storage = value;
  }
  #selectedTab__accessor_storage =
    loadTimeData.getInteger("lastSelectedTab") || 0;
  get selectedTab_() {
    return this.#selectedTab__accessor_storage;
  }
  set selectedTab_(value) {
    this.#selectedTab__accessor_storage = value;
  }
  #showTabs__accessor_storage = false;
  get showTabs_() {
    return this.#showTabs__accessor_storage;
  }
  set showTabs_(value) {
    this.#showTabs__accessor_storage = value;
  }
  #showHistoryClusters__accessor_storage = false;
  get showHistoryClusters_() {
    return this.#showHistoryClusters__accessor_storage;
  }
  set showHistoryClusters_(value) {
    this.#showHistoryClusters__accessor_storage = value;
  }
  #tabsIcons__accessor_storage = [
    "images/list.svg",
    "chrome://resources/images/icon_journeys.svg",
  ];
  get tabsIcons_() {
    return this.#tabsIcons__accessor_storage;
  }
  set tabsIcons_(value) {
    this.#tabsIcons__accessor_storage = value;
  }
  #tabsNames__accessor_storage = [
    loadTimeData.getString("historyListTabLabel"),
    loadTimeData.getString("historyClustersTabLabel"),
  ];
  get tabsNames_() {
    return this.#tabsNames__accessor_storage;
  }
  set tabsNames_(value) {
    this.#tabsNames__accessor_storage = value;
  }
  #scrollTarget__accessor_storage = document.body;
  get scrollTarget_() {
    return this.#scrollTarget__accessor_storage;
  }
  set scrollTarget_(value) {
    this.#scrollTarget__accessor_storage = value;
  }
  #queryStateAfterDate__accessor_storage = null;
  get queryStateAfterDate_() {
    return this.#queryStateAfterDate__accessor_storage;
  }
  set queryStateAfterDate_(value) {
    this.#queryStateAfterDate__accessor_storage = value;
  }
  #hasHistoryEmbeddingsResults__accessor_storage = false;
  get hasHistoryEmbeddingsResults_() {
    return this.#hasHistoryEmbeddingsResults__accessor_storage;
  }
  set hasHistoryEmbeddingsResults_(value) {
    this.#hasHistoryEmbeddingsResults__accessor_storage = value;
  }
  #historyEmbeddingsDisclaimerLinkClicked__accessor_storage = false;
  get historyEmbeddingsDisclaimerLinkClicked_() {
    return this.#historyEmbeddingsDisclaimerLinkClicked__accessor_storage;
  }
  set historyEmbeddingsDisclaimerLinkClicked_(value) {
    this.#historyEmbeddingsDisclaimerLinkClicked__accessor_storage = value;
  }
  #tabContentScrollOffset__accessor_storage = 0;
  get tabContentScrollOffset_() {
    return this.#tabContentScrollOffset__accessor_storage;
  }
  set tabContentScrollOffset_(value) {
    this.#tabContentScrollOffset__accessor_storage = value;
  }
  #numCharsTypedInSearch__accessor_storage = 0;
  get numCharsTypedInSearch_() {
    return this.#numCharsTypedInSearch__accessor_storage;
  }
  set numCharsTypedInSearch_(value) {
    this.#numCharsTypedInSearch__accessor_storage = value;
  }
  #nonEmbeddingsResultClicked__accessor_storage = false;
  get nonEmbeddingsResultClicked_() {
    return this.#nonEmbeddingsResultClicked__accessor_storage;
  }
  set nonEmbeddingsResultClicked_(value) {
    this.#nonEmbeddingsResultClicked__accessor_storage = value;
  }
  browserService_ = BrowserServiceImpl.getInstance();
  callbackRouter_ = BrowserServiceImpl.getInstance().callbackRouter;
  dataFromNativeBeforeInput_ = null;
  eventTracker_ = new EventTracker();
  historyClustersViewStartTime_ = null;
  historyEmbeddingsResizeObserver_ = null;
  lastRecordedSelectedPageHistogramValue_ = HistoryPageViewHistogram.END;
  onHasOtherFormsChangedListenerId_ = null;
  pageHandler_ = BrowserServiceImpl.getInstance().handler;
  connectedCallback() {
    super.connectedCallback();
    this.eventTracker_.add(document, "click", onDocumentClick);
    this.eventTracker_.add(document, "auxclick", onDocumentClick);
    this.eventTracker_.add(document, "keydown", (e) => this.onKeyDown_(e));
    this.eventTracker_.add(
      document,
      "visibilitychange",
      this.onVisibilityChange_.bind(this)
    );
    this.eventTracker_.add(
      document,
      "record-history-link-click",
      this.onRecordHistoryLinkClick_.bind(this)
    );
    this.addWebUiListener("sign-in-state-changed", (signInState) =>
      this.onSignInStateChanged_(signInState)
    );
    this.addWebUiListener("foreign-sessions-changed", (sessionList) =>
      this.setForeignSessions_(sessionList)
    );
    this.shadowRoot.querySelector("history-query-manager").initialize();
    this.browserService_
      .getForeignSessions()
      .then((sessionList) => this.setForeignSessions_(sessionList));
    const mediaQuery = window.matchMedia("(max-width: 1023px)");
    this.hasDrawer_ = mediaQuery.matches;
    this.eventTracker_.add(
      mediaQuery,
      "change",
      (e) => (this.hasDrawer_ = e.matches)
    );
    this.onHasOtherFormsChangedListenerId_ =
      this.callbackRouter_.onHasOtherFormsChanged.addListener((hasOtherForms) =>
        this.onHasOtherFormsChanged_(hasOtherForms)
      );
  }
  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
    this.addEventListener("cr-toolbar-menu-click", this.onCrToolbarMenuClick_);
    this.addEventListener("delete-selected", this.deleteSelected);
    this.addEventListener("open-selected", this.openSelected);
    this.addEventListener("history-checkbox-select", this.checkboxSelected);
    this.addEventListener("history-close-drawer", this.closeDrawer_);
    this.addEventListener("history-view-changed", this.historyViewChanged_);
    this.addEventListener("unselect-all", this.unselectAll);
    if (loadTimeData.getBoolean("maybeShowEmbeddingsIph")) {
      this.registerHelpBubble(
        "kHistorySearchInputElementId",
        this.$.toolbar.searchField
      );
      setTimeout(() => {
        HistoryEmbeddingsBrowserProxyImpl.getInstance().maybeShowFeaturePromo();
      }, 1e3);
    }
  }
  willUpdate(changedProperties) {
    super.willUpdate(changedProperties);
    const changedPrivateProperties = changedProperties;
    if (
      changedPrivateProperties.has("historyClustersEnabled_") ||
      changedPrivateProperties.has("historyClustersVisible_")
    ) {
      this.showHistoryClusters_ =
        this.historyClustersEnabled_ && this.historyClustersVisible_;
    }
    if (
      changedPrivateProperties.has("showHistoryClusters_") ||
      changedPrivateProperties.has("enableHistoryEmbeddings_")
    ) {
      this.showTabs_ =
        this.showHistoryClusters_ && !this.enableHistoryEmbeddings_;
    }
    if (changedPrivateProperties.has("selectedTab_")) {
      this.lastSelectedTab_ = this.selectedTab_;
      if (!this.selectedPage_ || TABBED_PAGES.includes(this.selectedPage_)) {
        this.selectedPage_ = TABBED_PAGES[this.selectedTab_];
      }
    }
    if (changedPrivateProperties.has("queryState_")) {
      if (this.queryState_.after) {
        const afterDate = new Date(this.queryState_.after + "T00:00:00");
        if (this.queryStateAfterDate_?.getTime() !== afterDate.getTime()) {
          this.queryStateAfterDate_ = afterDate;
        }
      } else {
        this.queryStateAfterDate_ = null;
      }
    }
  }
  updated(changedProperties) {
    super.updated(changedProperties);
    const changedPrivateProperties = changedProperties;
    if (changedPrivateProperties.has("selectedTab_")) {
      this.pageHandler_.setLastSelectedTab(this.selectedTab_);
    }
    if (changedPrivateProperties.has("selectedPage_")) {
      this.selectedPageChanged_(changedPrivateProperties.get("selectedPage_"));
    }
    if (changedPrivateProperties.has("hasDrawer_")) {
      this.hasDrawerChanged_();
    }
    if (
      changedPrivateProperties.has("enableHistoryEmbeddings_") &&
      this.enableHistoryEmbeddings_
    ) {
      this.onHistoryEmbeddingsContainerShown_();
    }
  }
  getScrollTargetForTesting() {
    return this.scrollTarget_;
  }
  getShowResultsByGroup_() {
    return this.selectedPage_ === Page.HISTORY_CLUSTERS;
  }
  getShowHistoryList_() {
    return this.selectedPage_ === Page.HISTORY;
  }
  onShowResultsByGroupChanged_(e) {
    if (!this.selectedPage_) {
      return;
    }
    const showResultsByGroup = e.detail.value;
    if (showResultsByGroup) {
      this.selectedTab_ = TABBED_PAGES.indexOf(Page.HISTORY_CLUSTERS);
    } else {
      this.selectedTab_ = TABBED_PAGES.indexOf(Page.HISTORY);
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.eventTracker_.removeAll();
    if (this.historyEmbeddingsResizeObserver_) {
      this.historyEmbeddingsResizeObserver_.disconnect();
      this.historyEmbeddingsResizeObserver_ = null;
    }
    assert(this.onHasOtherFormsChangedListenerId_);
    this.callbackRouter_.removeListener(this.onHasOtherFormsChangedListenerId_);
    this.onHasOtherFormsChangedListenerId_ = null;
  }
  fire_(eventName, detail) {
    this.dispatchEvent(
      new CustomEvent(eventName, {
        bubbles: true,
        composed: true,
        detail: detail,
      })
    );
  }
  historyClustersSelected_() {
    return (
      this.selectedPage_ === Page.HISTORY_CLUSTERS && this.showHistoryClusters_
    );
  }
  onFirstRender_() {
    const searchField = this.$.toolbar.searchField;
    if (!searchField.narrow) {
      searchField.getSearchInput().focus();
    }
    ensureLazyLoaded().then(function () {
      requestIdleCallback(function () {
        document.fonts.load("bold 12px Roboto");
      });
    });
  }
  onCrToolbarMenuClick_() {
    this.$.drawer.get().toggle();
  }
  checkboxSelected() {
    this.$.toolbar.count = this.$.history.getSelectedItemCount();
  }
  selectOrUnselectAll() {
    this.$.history.selectOrUnselectAll();
    this.$.toolbar.count = this.$.history.getSelectedItemCount();
  }
  unselectAll() {
    this.$.history.unselectAllItems();
    this.$.toolbar.count = 0;
  }
  deleteSelected() {
    this.$.history.deleteSelectedWithPrompt();
  }
  openSelected() {
    this.$.history.openSelected();
  }
  onQueryFinished_(e) {
    this.queryResult_ = e.detail.result;
    this.$.history.historyResult(e.detail.result.info, e.detail.result.value);
    if (document.body.classList.contains("loading")) {
      document.body.classList.remove("loading");
      this.onFirstRender_();
    }
  }
  onKeyDown_(e) {
    if ((e.key === "Delete" || e.key === "Backspace") && !hasKeyModifiers(e)) {
      this.onDeleteCommand_();
      return;
    }
    if (e.key === "a" && !e.altKey && !e.shiftKey) {
      let hasTriggerModifier = e.ctrlKey && !e.metaKey;
      if (hasTriggerModifier && this.onSelectAllCommand_()) {
        e.preventDefault();
      }
    }
    if (e.key === "Escape") {
      this.unselectAll();
      getInstance().announce(loadTimeData.getString("itemsUnselected"));
      e.preventDefault();
    }
  }
  onVisibilityChange_() {
    if (this.selectedPage_ !== Page.HISTORY_CLUSTERS) {
      return;
    }
    if (document.visibilityState === "hidden") {
      this.recordHistoryClustersDuration_();
    } else if (
      document.visibilityState === "visible" &&
      this.historyClustersViewStartTime_ === null
    ) {
      this.historyClustersViewStartTime_ = new Date();
    }
  }
  onRecordHistoryLinkClick_(e) {
    if (!this.queryResult_.info || !this.queryResult_.info.term) {
      return;
    }
    if (e.detail.resultType !== HistoryResultType.EMBEDDINGS) {
      this.nonEmbeddingsResultClicked_ = true;
    }
    this.browserService_.recordHistogram(
      "History.SearchResultClicked.Type",
      e.detail.resultType,
      HistoryResultType.END
    );
    const maxIndex = 99;
    const clampedIndex = Math.min(e.detail.index, 99);
    this.browserService_.recordHistogram(
      "History.SearchResultClicked.Index",
      clampedIndex,
      maxIndex
    );
    switch (e.detail.resultType) {
      case HistoryResultType.TRADITIONAL: {
        this.browserService_.recordHistogram(
          "History.SearchResultClicked.Index.Traditional",
          clampedIndex,
          maxIndex
        );
        break;
      }
      case HistoryResultType.GROUPED: {
        this.browserService_.recordHistogram(
          "History.SearchResultClicked.Index.Grouped",
          clampedIndex,
          maxIndex
        );
        break;
      }
      case HistoryResultType.EMBEDDINGS: {
        this.browserService_.recordHistogram(
          "History.SearchResultClicked.Index.Embeddings",
          clampedIndex,
          maxIndex
        );
        break;
      }
    }
  }
  onDeleteCommand_() {
    if (this.$.toolbar.count === 0 || this.pendingDelete_) {
      return;
    }
    this.deleteSelected();
  }
  onSelectAllCommand_() {
    if (
      this.$.toolbar.searchField.isSearchFocused() ||
      this.syncedTabsSelected_() ||
      this.historyClustersSelected_()
    ) {
      return false;
    }
    this.selectOrUnselectAll();
    return true;
  }
  setForeignSessions_(sessionList) {
    this.queryResult_ = Object.assign({}, this.queryResult_, {
      sessionList: sessionList,
    });
  }
  onSignInStateChanged_(signInState) {
    this.signInState_ = signInState;
  }
  onHasOtherFormsChanged_(hasOtherForms) {
    this.footerInfo = Object.assign({}, this.footerInfo, {
      otherFormsOfHistory: hasOtherForms,
    });
  }
  syncedTabsSelected_() {
    return this.selectedPage_ === Page.SYNCED_TABS;
  }
  shouldShowSpinner_() {
    return (
      this.queryState_.querying &&
      !this.queryState_.incremental &&
      this.queryState_.searchTerm !== ""
    );
  }
  updateContentPage_() {
    switch (this.selectedPage_) {
      case Page.SYNCED_TABS:
        this.contentPage_ = Page.SYNCED_TABS;
        break;
      default:
        this.contentPage_ = Page.HISTORY;
    }
  }
  updateTabsContentPage_() {
    this.tabsContentPage_ =
      this.selectedPage_ === Page.HISTORY_CLUSTERS &&
      this.historyClustersEnabled_ &&
      this.historyClustersVisible_
        ? Page.HISTORY_CLUSTERS
        : Page.HISTORY;
  }
  selectedPageChanged_(oldPage) {
    this.updateContentPage_();
    this.updateTabsContentPage_();
    this.unselectAll();
    this.historyViewChanged_();
    this.maybeUpdateSelectedHistoryTab_();
    if (
      oldPage === Page.HISTORY_CLUSTERS &&
      this.selectedPage_ !== Page.HISTORY_CLUSTERS
    ) {
      this.recordHistoryClustersDuration_();
    }
    if (this.selectedPage_ === Page.HISTORY_CLUSTERS) {
      this.historyClustersViewStartTime_ = new Date();
    }
  }
  updateScrollTarget_() {
    const topLevelIronPages = this.$.content;
    const topLevelHistoryPage = this.$.tabsContainer;
    if (
      topLevelIronPages.selectedItem &&
      topLevelIronPages.selectedItem === topLevelHistoryPage
    ) {
      this.scrollTarget_ = this.$.tabsScrollContainer;
      this.$.history.fillCurrentViewport();
    } else {
      this.scrollTarget_ = topLevelIronPages.selectedItem;
    }
  }
  maybeUpdateSelectedHistoryTab_() {
    if (TABBED_PAGES.includes(this.selectedPage_)) {
      this.selectedTab_ = TABBED_PAGES.indexOf(this.selectedPage_);
    }
  }
  historyViewChanged_() {
    this.recordHistoryPageView_();
  }
  recordHistoryClustersDuration_() {
    assert(this.historyClustersViewStartTime_ !== null);
    const duration =
      new Date().getTime() - this.historyClustersViewStartTime_.getTime();
    this.browserService_.recordLongTime(
      "History.Clusters.WebUISessionDuration",
      duration
    );
    this.historyClustersViewStartTime_ = null;
  }
  hasDrawerChanged_() {
    const drawer = this.$.drawer.getIfExists();
    if (!this.hasDrawer_ && drawer && drawer.open) {
      drawer.cancel();
    }
  }
  closeDrawer_() {
    const drawer = this.$.drawer.get();
    if (drawer && drawer.open) {
      drawer.close();
    }
  }
  recordHistoryPageView_() {
    let histogramValue = HistoryPageViewHistogram.END;
    switch (this.selectedPage_) {
      case Page.HISTORY_CLUSTERS:
        histogramValue = HistoryPageViewHistogram.JOURNEYS;
        break;
      case Page.SYNCED_TABS:
        histogramValue =
          this.signInState_ === HistorySignInState.SIGNED_IN_SYNCING_TABS
            ? HistoryPageViewHistogram.SYNCED_TABS
            : HistoryPageViewHistogram.SIGNIN_PROMO;
        break;
      default:
        histogramValue = HistoryPageViewHistogram.HISTORY;
        break;
    }
    if (histogramValue === this.lastRecordedSelectedPageHistogramValue_) {
      return;
    }
    this.lastRecordedSelectedPageHistogramValue_ = histogramValue;
    this.browserService_.recordHistogram(
      "History.HistoryPageView",
      histogramValue,
      HistoryPageViewHistogram.END
    );
  }
  handleFindShortcut(modalContextOpen) {
    if (modalContextOpen) {
      return false;
    }
    this.$.toolbar.searchField.showAndFocus();
    return true;
  }
  searchInputHasFocus() {
    return this.$.toolbar.searchField.isSearchFocused();
  }
  setHasDrawerForTesting(enabled) {
    this.hasDrawer_ = enabled;
  }
  shouldShowHistoryEmbeddings_() {
    if (!loadTimeData.getBoolean("enableHistoryEmbeddings")) {
      return false;
    }
    if (!this.queryState_.searchTerm) {
      return false;
    }
    return (
      this.queryState_.searchTerm.split(" ").filter((part) => part.length > 0)
        .length >=
      loadTimeData.getInteger("historyEmbeddingsSearchMinimumWordCount")
    );
  }
  onSelectedSuggestionChanged_(e) {
    let afterString = undefined;
    if (e.detail.value?.timeRangeStart) {
      afterString = convertDateToQueryValue(e.detail.value.timeRangeStart);
    }
    this.fire_("change-query", {
      search: this.queryState_.searchTerm,
      after: afterString,
    });
  }
  onHistoryEmbeddingsDisclaimerLinkClick_() {
    this.historyEmbeddingsDisclaimerLinkClicked_ = true;
  }
  onHistoryEmbeddingsItemMoreFromSiteClick_(e) {
    const historyEmbeddingsItem = e.detail;
    this.fire_("change-query", {
      search: "host:" + new URL(historyEmbeddingsItem.url.url).hostname,
    });
  }
  onHistoryEmbeddingsItemRemoveClick_(e) {
    const historyEmbeddingsItem = e.detail;
    this.pageHandler_.removeVisits([
      {
        url: historyEmbeddingsItem.url.url,
        timestamps: [historyEmbeddingsItem.lastUrlVisitTimestamp],
      },
    ]);
  }
  onHistoryEmbeddingsIsEmptyChanged_(e) {
    this.hasHistoryEmbeddingsResults_ = !e.detail.value;
  }
  onHistoryEmbeddingsContainerShown_() {
    assert(this.enableHistoryEmbeddings_);
    const historyEmbeddingsContainer = this.shadowRoot.querySelector(
      "#historyEmbeddingsContainer"
    );
    assert(historyEmbeddingsContainer);
    this.historyEmbeddingsResizeObserver_ = new ResizeObserver((entries) => {
      assert(entries.length === 1);
      this.tabContentScrollOffset_ = entries[0].contentRect.height;
    });
    this.historyEmbeddingsResizeObserver_.observe(historyEmbeddingsContainer);
  }
  onQueryStateChanged_(e) {
    this.nonEmbeddingsResultClicked_ = false;
    this.queryState_ = e.detail.value;
  }
  onSelectedPageChanged_(e) {
    this.selectedPage_ = e.detail.value;
  }
  onToolbarSearchInputNativeBeforeInput_(e) {
    this.dataFromNativeBeforeInput_ = e.detail.e.data;
  }
  onToolbarSearchInputNativeInput_(e) {
    const insertedText = this.dataFromNativeBeforeInput_;
    this.dataFromNativeBeforeInput_ = null;
    if (e.detail.inputValue.length === 0) {
      this.numCharsTypedInSearch_ = 0;
    } else if (insertedText === e.detail.inputValue) {
      this.numCharsTypedInSearch_ = 1;
    } else {
      this.numCharsTypedInSearch_++;
    }
  }
  onToolbarSearchCleared_() {
    this.numCharsTypedInSearch_ = 0;
  }
  onListPendingDeleteChanged_(e) {
    this.pendingDelete_ = e.detail.value;
  }
  onSelectedTabChanged_(e) {
    this.selectedTab_ = e.detail.value;
  }
  onHistoryClustersVisibleChanged_(e) {
    this.historyClustersVisible_ = e.detail.value;
  }
}
customElements.define(HistoryAppElement.is, HistoryAppElement);
export {
  BrowserProxyImpl,
  BrowserServiceImpl,
  ClusterAction,
  CrRouter,
  HISTORY_EMBEDDINGS_ANSWERS_PROMO_SHOWN_KEY,
  HISTORY_EMBEDDINGS_PROMO_SHOWN_KEY,
  HistoryAppElement,
  HistoryEmbeddingsBrowserProxyImpl,
  PageHandlerRemote as HistoryEmbeddingsPageHandlerRemote,
  HistoryEmbeddingsPromoElement,
  HistoryItemElement,
  HistoryListElement,
  HistoryPageViewHistogram,
  HistorySideBarElement,
  HistorySignInState,
  HistoryToolbarElement,
  MetricsProxyImpl,
  PageCallbackRouter$1 as PageCallbackRouter,
  PageHandlerRemote$1 as PageHandlerRemote,
  RelatedSearchAction,
  VisitAction,
  VisitContextMenuAction,
  VisitType,
  ensureLazyLoaded,
  getTrustedHTML,
};

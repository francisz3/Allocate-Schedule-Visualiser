// uiHelpers.js
//  Helper functions for DOM manipulation

/**
 * Query single element
 */
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

/**
 * Query all matching elements
 */
export function qsa(selector, parent = document) {
  return [...parent.querySelectorAll(selector)];
}

/**
 * Create and return an element with optional class and text
 */
export function createEl(tag, className, textContent) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (textContent) el.textContent = textContent;
  return el;
}

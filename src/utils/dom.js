export function createElement(tagName, options = {}) {
  const element = document.createElement(tagName);
  const { classNames = [], text, attributes = {} } = options;

  if (classNames.length > 0) {
    element.classList.add(...classNames);
  }

  if (text !== undefined) {
    element.textContent = text;
  }

  Object.entries(attributes).forEach(([name, value]) => {
    element.setAttribute(name, value);
  });

  return element;
}

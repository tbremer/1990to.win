export function safelyDefine(
  elementName: string,
  customElement: CustomElementConstructor
): void {
  if (customElements.get(elementName)) {
    console.warn(`Trying to redefine elementName skipping`);
    return;
  }
  customElements.define(elementName, customElement);
  return;
}

export function injectStyles(elementName: string, css: string): void {
  const existingStyles = document.getElementById(elementName);
  if (!existingStyles) {
    const styleNode = document.createElement('style');
    styleNode.setAttribute('id', elementName);
    styleNode.type = 'text/css';
    styleNode.appendChild(document.createTextNode(css));
    document.head.appendChild(styleNode);
  }
}

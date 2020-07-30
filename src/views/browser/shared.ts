export const jenkinsUrl = 'jenkinsUrl';
export const user = 'user';
export const password = 'password';
export const click = 'click';
export const change = 'change';
export const SUCCESS = 'SUCCESS';
export const FAILED = 'FAILED';
export const FAILING = 'FAILING';

export function $(s: string): any {
  return document.querySelector.bind(document)(s);
}

export function $$(s: string): any[] {
  return document.querySelectorAll.bind(document)(s);
}

export function selectors(): [(string) => Element, (string) => Element[]] {
  return [
    document.querySelector.bind(document),
    document.querySelectorAll.bind(document),
  ];
}

export function strToNode(html: string): Node {
  const template = document.createElement('template');
  html = html.trim();
  template.innerHTML = html;
  return template.content.firstChild;
}

export function strToNodes(html: string): NodeList {
  const template = document.createElement('template');
  template.innerHTML = html;
  return template.content.childNodes;
}

export function appendAll(parentNode: Node, children: Node[]): void {
  children.forEach((c) => parentNode.appendChild(c));
}

export function createOptions(opts: HtmlOption[]): Node[] {
  return opts.map((opt) => {
    const [name, value] = opt;
    const option = document.createElement('option');
    option.setAttribute('value', value);
    option.innerText = name;
    return option;
  });
}

export function createButtons(menu: string[]): Node[] {
  return menu.map((menuItem) => {
    const button = document.createElement('button');
    button.innerHTML = menuItem;
    return button;
  });
}

export function createSelect(id: string, opts: HtmlOption[]): Node {
  const select = document.createElement('select');
  select.setAttribute('name', id);
  select.setAttribute('id', id);
  appendAll(select, createOptions(opts));
  return select;
}

export function dasher(str: string): string {
  return str === null || str === undefined || str === '' ? '--' : str;
}

export type HtmlOption = [string, string];

export function withEmpty(name: string, arr: HtmlOption[]): HtmlOption[] {
  return ([[name, '']] as HtmlOption[]).concat(arr);
}

export function set(selector: string, newValue: any, emit = true): void {
  $(selector).value = newValue;
  if (emit) $(selector).dispatchEvent(new Event('change'));
}

export type VoidFn = () => void;

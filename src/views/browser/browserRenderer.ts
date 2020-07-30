import { wipe } from '../../shared';
import { Action } from './action.interface';
import { BaseCmp } from './baseCmp.class';
import { Globals } from './globals.class';
import { NavView } from './nav/nav.view';
import { AppTitle, Body, Main, MainOutlet, NavOutlet } from './selectors';
import { $ } from './shared';

export class BrowserRenderer {
  public globals: any;

  constructor() {
    this.globals = new Globals();
  }

  public currentNav: {
    nav: NavView;
    actions: Action[];
  } = { nav: undefined, actions: [] };

  public startLoading(): void {
    $(Body).classList.add('fast');
    $(NavOutlet).classList.add('invisible');
    $(Main).classList.add('invisible');
    $(AppTitle).classList.add('loading');
  }

  public endLoading(): void {
    $(Body).classList.remove('fast');
    $(NavOutlet).classList.remove('invisible');
    $(Main).classList.remove('invisible');
    $(AppTitle).classList.remove('loading');
  }

  public createNewNav(nodes: Node[] = [], actions: Action[] = []): NavView {
    const nav = new NavView();
    wipe($(NavOutlet));
    if (this.currentNav.nav) {
      this.destroy(this.currentNav.nav.nodes, this.currentNav.actions);
    }
    nav.attachNodes(nodes);
    this.attachListeners(nodes, actions);
    this.currentNav.nav = nav;
    this.currentNav.actions = actions;
    return nav;
  }

  public attachListeners(nodes: Node[], actions: Action[]): void {
    nodes.forEach((n, idx) => {
      const [type, fn] = actions[idx];
      const fnWithLoading = async (e: Event) => {
        this.startLoading();
        await fn(e);
        this.endLoading();
      };
      n.addEventListener(type, fnWithLoading);
    });
  }

  public composer(cmps: BaseCmp[], outlet = $(MainOutlet)): void {
    wipe(outlet);
    outlet.innerHTML = cmps.map((c) => c.html).join('');
    cmps.forEach((c) => c.effects.forEach((e) => e()));
  }

  public destroy(nodes: Node[], actions: Action[]): void {
    nodes.forEach((n, idx) => {
      const [type, fn] = actions[idx];
      n.removeEventListener(type, fn);
    });
  }
}

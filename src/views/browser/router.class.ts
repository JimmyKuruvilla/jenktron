import { debugLog, VoidFn } from '../../shared';
import { Route } from '../route.class';
import { Globals } from './globals.class';

export class Router {
  private currentIndex: number;

  public routes: Route[] = [];
  public async back(): Promise<void> {
    const newIndex = this.currentIndex - 1;
    debugLog(`routes length: ${this.routes.length}, newIndex: ${newIndex}`);
    if (newIndex > -1) {
      const [route] = this.routes.slice(newIndex);
      this.currentIndex = newIndex;
      await route.activate();
    }
  }

  public async forward(): Promise<void> {
    const newIndex = this.currentIndex + 1;
    debugLog(`routes length: ${this.routes.length}, newIndex: ${newIndex}`);
    if (newIndex > -1 && newIndex < this.routes.length) {
      const route = this.routes[newIndex];
      this.currentIndex = newIndex;
      await route.activate();
    }
  }

  public register(name: string, activate: VoidFn): void {
    const route = new Route(name, activate);
    const exists = this.routes.find((_route) => _route.name === route.name);
    if (!exists) {
      this.routes.push(route);
      this.currentIndex = this.routes.length - 1;
    }
  }

  public async reload(): Promise<void> {
    setTimeout(async () => {
      new Globals().renderer.startLoading();
      await this.routes[this.currentIndex].activate();
    }, 0);
  }
}

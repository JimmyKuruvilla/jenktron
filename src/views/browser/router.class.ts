import { Route } from '../route.class';

export class Router {
  private currentIndex: number;

  public routes: Route[] = [];
  public back(): void {
    const newIndex = this.currentIndex - 1;
    if (newIndex > -1) {
      const [route] = this.routes.slice(newIndex);
      this.currentIndex = newIndex;
      route.activate();
    }
  }

  public forward(): void {
    const newIndex = this.currentIndex + 1;
    if (newIndex > -1) {
      const route = this.routes[newIndex];
      this.currentIndex = newIndex;
      route.activate();
    }
  }

  public register(route: Route): void {
    const exists = this.routes.find((_route) => _route.name === route.name);
    if (!exists) {
      this.routes.push(route);
      this.currentIndex = this.routes.length - 1;
    }
  }
}

import { VoidFn } from './browser/shared';

export class Route {
  public name: string;
  public activate: VoidFn;

  constructor(name: string, activate: VoidFn) {
    this.name = name;
    this.activate = activate;
  }
}

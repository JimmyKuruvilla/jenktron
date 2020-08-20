import { NavOutlet } from '../selectors';
import { $, appendAll } from '../shared';

export class NavView {
  public attachNodes(nodes: Node[]): void {
    appendAll($(NavOutlet), nodes);
  }

  public get nodes(): Node[] {
    return $(NavOutlet).childNodes;
  }
}

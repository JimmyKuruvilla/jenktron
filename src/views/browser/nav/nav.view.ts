import { $, appendAll } from '../shared';
import { NavOutlet } from '../selectors';

export class NavView {
  public attachNodes(nodes: Node[]): void {
    appendAll($(NavOutlet), nodes);
  }

  public get nodes(): Node[] {
    return $(NavOutlet).childNodes;
  }
}

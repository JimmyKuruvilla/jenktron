import { noop } from '../../shared';
import { Globals } from './globals.class';
import { HTML } from './html.class';

export class BaseCmp {
  public globals = new Globals();
  public renderer = new Globals().renderer;
  public router = new Globals().router;
  public pipelines = new Globals().pipelines;
  public pipelineService = new Globals().pipelineService;
  public html: HTML;
  public effects: Array<() => any> = [noop];

  constructor() {
    this.globals.resetScrollStop();
  }
}

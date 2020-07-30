import { PipelineService } from '../services/pipeline/pipeline.service';
import { CliView } from '../views/cli/cliView.interface';
import { CliRenderer } from '../views/cli/cliRenderer';

export class CliState {
  public views: { [index: string]: CliView };
  public pipelines: PipelineService;
  public r: CliRenderer;
  public ans: number;
  public lastView: CliView;
  private _current: CliView;

  constructor(
    views: { [index: string]: CliView },
    current: CliView,
    pipelines: PipelineService,
    renderer: CliRenderer
  ) {
    this.views = views;
    this.current = current;
    this.r = renderer;
    this.pipelines = pipelines;
    this.ans = undefined;
  }

  public set current(screen: CliView) {
    this.lastView = this._current;
    this._current = screen;
  }

  public get current(): CliView {
    return this._current;
  }

  public goBack(): void {
    this._current = this.lastView;
  }
}

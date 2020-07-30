import { PipelineService } from '../../services/pipeline/pipeline.service';
import { BrowserRenderer } from './browserRenderer';
import { Router } from './router.class';
import { $$ } from './shared';
const namespace = 'gg';
const ScrollStop = '.scroll-stop';

export class Globals {
  private store: GlobalStore;
  constructor() {
    window[namespace] = window[namespace] || {};
    this.store = window[namespace];
  }

  public resetScrollStop(): void {
    this.store.currentScrollStop = 0;
  }

  public scrollToNextAnchor(): void {
    const length = $$(ScrollStop).length;
    if (length > 0) {
      const lastStop = length - 1;
      const next = this.store.currentScrollStop + 1;
      this.store.currentScrollStop = next > lastStop ? lastStop : next;
      $$(ScrollStop)[this.store.currentScrollStop].scrollIntoView();
    }
  }

  public scrollToLastAnchor(): void {
    const length = $$(ScrollStop).length;
    if (length > 0) {
      const previous = this.store.currentScrollStop - 1;
      this.store.currentScrollStop = previous < 0 ? 0 : previous;
      $$(ScrollStop)[this.store.currentScrollStop].scrollIntoView();
    }
  }

  public get pipelineService(): PipelineService {
    return this.store.pipelineService;
  }

  public set pipelineService(r) {
    this.store['pipelineService'] = r;
  }

  public get pipelines(): string[] {
    return this.store.pipelines;
  }

  public set pipelines(r) {
    this.store['pipelines'] = r;
  }

  public get router(): Router {
    return this.store.router;
  }

  public set router(r) {
    this.store['router'] = r;
  }

  public get renderer(): BrowserRenderer {
    return this.store.renderer;
  }

  public set renderer(r) {
    this.store['renderer'] = r;
  }
}

export interface GlobalStore {
  pipelines: string[];
  pipelineService: PipelineService;
  renderer: BrowserRenderer;
  router: Router;
  currentScrollStop: number;
}

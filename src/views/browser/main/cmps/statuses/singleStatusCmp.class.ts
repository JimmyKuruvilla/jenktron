import { UIPipelineStatus } from '../../../../../services/pipeline/pipelineStatus.ui.interface';
import { dasher, toMin } from '../../../../../shared';
import { BaseCmp } from '../../../baseCmp.class';
import { HTML } from '../../../html.class';
import { $$, click, FAILING } from '../../../shared';
import { MainCmp } from '../../main.view';

export class SingleStatusCmp extends BaseCmp {
  constructor(data: UIPipelineStatus, mainView: MainCmp) {
    super();
    this.html = this.getSingleStatus(data);
    this.effects = [
      () => {
        $$('.single-status-cmp .status-container').forEach((el) => {
          el.addEventListener(click, (e) => {
            mainView.onSelectPipeline(e.currentTarget.dataset.pipeline);
          });
        });
      },
    ];
  }

  public getSingleStatus(status: UIPipelineStatus): HTML {
    return new HTML(`
      <div class="single-status-cmp boundary">
        ${this.getSingleStatusHelper(status)}
      </div>`);
  }

  public getSingleStatusHelper(s: UIPipelineStatus): HTML {
    const sus = (s: UIPipelineStatus) => {
      const duration = parseFloat(toMin(s.lastRunDuration));
      switch (s.buildType) {
        case 'code':
        case 'db':
          return duration < 10;
        case 'auto':
        case 'k8s':
        default:
          return duration < 2;
      }
    };

    return new HTML(
      `<div class="status-container" data-pipeline="${s.pipeline}">
      <div class="status ${s.status === FAILING ? FAILING : ''}">${
        s.status
      }</div>
      <div class="buildType">${dasher(s.buildType)}</div>
      <div class="duration ${sus(s) ? 'suspicious' : ''}">${toMin(
        s.lastRunDuration
      )} min</div>
        <div class="pipeline">${s.pipeline}</div>
        <div class="running ${s.running}">${s.running}</div>
      </div>`
    );
  }
}

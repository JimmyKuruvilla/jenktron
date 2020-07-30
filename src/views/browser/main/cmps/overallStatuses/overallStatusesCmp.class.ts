import { UIPipelineStatus } from '../../../../../services/pipeline/pipelineStatus.ui.interface';
import { BaseCmp } from '../../../baseCmp.class';
import { HTML } from '../../../html.class';
import { $$, click, FAILING } from '../../../shared';
import { MainCmp } from '../../main.view';

export class OverallStatusesCmp extends BaseCmp {
  constructor(data: UIPipelineStatus[], mainView: MainCmp) {
    super();
    this.html = this.getOverallStatuses(data);
    this.effects = [
      () => {
        $$('#statuses .status-container').forEach((el) => {
          el.addEventListener(click, (e) => {
            mainView.onSelectPipeline(e.currentTarget.dataset.pipeline);
          });
        });
      },
    ];
  }

  public getOverallStatuses(statusList: UIPipelineStatus[]): HTML {
    const failing = statusList.filter((a) => a.status === FAILING);
    const notFailing = statusList.filter((a) => a.status !== FAILING);

    const sorted = [
      ...failing.sort((a, b) =>
        a.pipeline.toLowerCase() > b.pipeline.toLowerCase() ? 1 : -1
      ),
      ...notFailing.sort((a, b) =>
        a.pipeline.toLowerCase() > b.pipeline.toLowerCase() ? 1 : -1
      ),
    ];
    return new HTML(`
      <div id="statuses" class="boundary">
        ${new HTML(sorted.map(this.getOverallStatus.bind(this)))}
      </div>`);
  }

  public getOverallStatus(s: UIPipelineStatus): HTML {
    return new HTML(
      `<div class="status-container" data-pipeline="${s.pipeline}">
        <div class="status ${s.status === FAILING ? FAILING : ''}">${
        s.status
      }</div>
        <div class="pipeline">${s.pipeline}</div>
        <div class="running ${s.running}">${s.running}</div>
      </div>`
    );
  }
}

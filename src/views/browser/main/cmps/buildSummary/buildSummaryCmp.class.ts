import { UIPipelineHealthMap } from '../../../../../services/pipeline/pipelineHealth.ui.interface';
import { dasher } from '../../../../../shared';
import { BaseCmp } from '../../../baseCmp.class';
import { HTML } from '../../../html.class';

export class BuildSummaryCmp extends BaseCmp {
  constructor(data: UIPipelineHealthMap) {
    super();
    this.html = this.getBuildSummary(data);
  }

  public getBuildSummary(p: UIPipelineHealthMap): HTML {
    let html = ``;

    for (const [k, v] of p.entries()) {
      html = `
      <div class="summary-block">
        <div class="build-num scroll-stop">${dasher(String(k))}</div>
        <div class="summary-detail">
          <span>Build Type</span><span>${dasher(v.buildType)}</span>
        </div>
        <div class="summary-detail">
          <span>Name</span><span>${dasher(v.displayName)}</span>
        </div>
        <div class="summary-detail">
          <span>Timestamp</span><span>${dasher(
            v.timestamp.toLocaleString()
          )}</span>
        </div>
        <div class="summary-detail">
          <span>Duration</span><span>${dasher(v.duration)}</span>
        </div>
        <div class="summary-detail">
          <span>Author</span><span>${dasher(v.git_author)}</span>
        </div>
        <div class="summary-detail">
          <span>Comment</span><span>${dasher(v.git_comment)}</span>
        </div>
        <div class="summary-detail">
          <span>One File</span>
          <span>${dasher(v.git_oneAffectedFile)}</span></div>
        <div class="summary-detail">
          <span>status</span><span>${dasher(v.status)}</span>
        </div>
        <div class="summary-detail">
          <span>Merged Branch</span><span>${dasher(v.mergedBranch)}</span>
        </div>
      </div>
      `;
    }

    return new HTML(`<div id="build-summary" class="boundary">${html}</div>`);
  }
}

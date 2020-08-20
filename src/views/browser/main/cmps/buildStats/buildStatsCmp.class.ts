import { UILastBuildStats } from '../../../../../services/pipeline/lastBuildStats.ui.interface';
import { BaseCmp } from '../../../baseCmp.class';
import { HTML } from '../../../html.class';

export class BuildStatsCmp extends BaseCmp {
  constructor(data: UILastBuildStats) {
    super();
    this.html = this.getBuildStats(data);
  }

  public getBuildStats(data: UILastBuildStats): HTML {
    return new HTML(`
    <div id="build-stats" class="scroll-stop boundary">
      <div class="stats-detail">
        <span>LAST SUCCESSFUL</span><span>${data.lastSuccessfulBuild}</span>
      </div>
      <div class="stats-detail">
        <span>LAST FAILED</span><span>${data.lastFailedBuild}</span>
      </div>
      <div class="stats-detail">
        <span>${data.healthReport}</span>
      </div>
    </div>
    `);
  }
}

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
  /* unecessary clutter
<div class="stats-detail">
  <span>LAST BUILD</span><span>${data.lastBuild}</span>
</div>
<div class="stats-detail">
  <span>Last Unstable Build</span><span>${data.lastUnstableBuild}</span>
</div>
<div class="stats-detail">
  <span>Last Unsuccessful Build</span><span>${data.lastUnsuccessfulBuild}</span>
</div>
<div class="stats-detail">
  <span>Last Stable Build</span><span>${data.lastStableBuild}</span>
</div>
<div class="stats-detail">
  <span>Last Completed Build</span><span>${data.lastCompletedBuild}</span>
</div>
*/
}

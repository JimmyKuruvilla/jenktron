import { UIPipelineHealthMap } from '../../../../../services/pipeline/pipelineHealth.ui.interface';
import {
  UIStage,
  UIStageDetailsMap,
} from '../../../../../services/pipeline/stageDetails.ui.interface';
import { BaseCmp } from '../../../baseCmp.class';
import { HTML } from '../../../html.class';
import { $, $$, click, dasher } from '../../../shared';
import { MainCmp } from '../../main.view';
const scrollButtonsHtml = `      
<div id="scroll-buttons">
  <button id="scroll-back"><</button>
  <button id="scroll-next">></button>
</div>
      `;
export class StageDetailsCmp extends BaseCmp {
  constructor(
    details: UIStageDetailsMap[],
    health: UIPipelineHealthMap,
    mainView: MainCmp
  ) {
    super();
    this.html = this.getStageDetailsList(details, health);
    this.effects = [
      () => {
        $$('#stages .build-num').forEach((el) => {
          el.addEventListener(click, (e) => {
            mainView.onSelectBuildNum(e.currentTarget.dataset.buildnum);
          });
        });
      },
      () => {
        $('#scroll-back').addEventListener(
          click,
          this.globals.scrollToLastAnchor.bind(this.globals)
        );
        $('#scroll-next').addEventListener(
          click,
          this.globals.scrollToNextAnchor.bind(this.globals)
        );
      },
    ];
  }

  public getStageDetailsList(
    dList: UIStageDetailsMap[],
    h: UIPipelineHealthMap
  ): HTML {
    return new HTML(
      `${scrollButtonsHtml}
      <div id="stages" class="boundary">
        ${new HTML(dList.map((d) => this.getStageDetailsHtml(d, h)).join(''))}
      </div>`
    );
  }

  public getStageDetailsHtml(
    d: UIStageDetailsMap,
    hMap: UIPipelineHealthMap
  ): HTML {
    const id = d.get('id');
    const h = hMap.get(Number(id));
    return new HTML(`
      <div class="stage-block">
        <div class="stage-heading">
          <div class="build-num ${d.get(
            'status'
          )} scroll-stop" data-buildnum="${id}">
            ${dasher(id)}
          </div>
          <div>${dasher(h.duration)}</div>
          <div>${dasher(h.buildType)}</div>
          <div>${dasher(h.timestamp.toLocaleString())}</div>
        </div>
        <div class="summary-block">
          <div class="summary-detail author">
            <div>Author</div><div>${dasher(h.git_author)}</div>
          </div>
          <div class="summary-detail commit">
            <div>Commit Message</div><div>${dasher(h.commitMessage)}</div>
          </div>
          <div class="summary-detail comment">
            <div>Comment</div><div>${dasher(h.git_comment)}</div>
          </div>
          <div class="summary-detail file">
            <div>One File</div>
            <div>${dasher(
              h.git_oneAffectedFile?.replace(/\/.*\//, '/.../')
            )}</div></div>
          <div class="summary-detail branch">
            <div>Merged Branch</div><div>${dasher(h.mergedBranch)}</div>
          </div>
        </div>
        <div class="stages">
          ${d
            .get('stages')
            .map((stage) => this.getStageHtml(stage))
            .join('')}
        </div>
      </div>
    `);
  }

  public getStageHtml(s: UIStage): HTML {
    return new HTML(`
        <div class="stage-detail ${s.status}">
          <span>
            ${dasher(s.heading)}
          </span>  
          <span>
            ${dasher(s.duration)}
          </span>
        </div>
      `);
  }
}

import { remote, shell } from 'electron';
import fs from 'fs';
import { detectFailures, wipe } from '../../../shared';
import { Route } from '../../route.class';
import { Action } from '../action.interface';
import { BaseCmp } from '../baseCmp.class';
import { ConfigCmp } from '../config/cmps/config/configCmp.class';
import { MainMenu } from '../menus/main.menu';
import { PipelineMenu, presetQuantity } from '../menus/pipeline.menu';
import { NavView } from '../nav/nav.view';
import { BuildNumSelect, PipelineSelect } from '../selectors';
import {
  $,
  appendAll,
  change,
  click,
  createButtons,
  createOptions,
  createSelect,
  set,
  VoidFn,
  withEmpty,
} from '../shared';
import { BuildSummaryCmp } from './cmps/buildSummary/buildSummaryCmp.class';
import { GeneralLogCmp } from './cmps/generalLog/generalLogCmp.class';
import { OverallStatusesCmp } from './cmps/overallStatuses/overallStatusesCmp.class';
import { StageDetailsCmp } from './cmps/stageDetails/stageDetailsCmp.class';

export class MainCmp extends BaseCmp {
  public nav: NavView = new NavView();
  public actions: Action[];

  constructor(initEffects: VoidFn[] = []) {
    super();

    this.actions = [
      [click, this.pipelineStatuses.bind(this)],
      [change, this.onPipelineChange.bind(this)],
      [change, this.onBuildNumberChange.bind(this)],
      [click, this.getBuildConsoleOut.bind(this)],
      [click, this.config.bind(this)],
      [click, this.router.back.bind(this.router)],
    ];

    this.nav = this.renderer.createNewNav(
      [
        ...createButtons(MainMenu),
        createSelect(
          PipelineSelect.slice(1),
          withEmpty(
            'Select Pipeline',
            this.pipelines.map((i) => [i, i])
          )
        ),
        createSelect(
          BuildNumSelect.slice(1),
          withEmpty('Select Build Number', [])
        ),
        ...createButtons(PipelineMenu),
        ...createButtons(['Settings', 'Back']),
      ],
      this.actions
    );

    this.pipelineStatuses().then(() => {
      this.renderer.endLoading();
      this.router.register(new Route('main', () => new MainCmp()));
      initEffects.forEach((e) => e());
    });

    return this;
  }

  public get pipeline(): string {
    return $(PipelineSelect).value;
  }

  public get buildNum(): number {
    return Number($(BuildNumSelect).value);
  }

  public config(): void {
    new ConfigCmp();
  }

  public async pipelineStatuses(): Promise<void> {
    const list = await this.pipelineService.listStatuses();
    this.renderer.composer([new OverallStatusesCmp(list, this)]);
  }

  public onSelectPipeline(newPipeline: string): void {
    set(PipelineSelect, newPipeline);
  }

  public onSelectBuildNum(newBuildNum: string): void {
    set(BuildNumSelect, newBuildNum);
  }

  public async getBuildConsoleOut(): Promise<void> {
    if (this.pipeline) {
      const log = await this.pipelineService.getBuildConsoleOut(
        this.pipeline,
        this.buildNum
      );

      this.renderer.composer([
        new GeneralLogCmp(log.slice(log.length - 20000, log.length)),
      ]);

      const DownloadsPath = remote.app.getPath('downloads');
      const PipelinePath = `${DownloadsPath}/${this.pipeline}`;
      if (!fs.existsSync(PipelinePath)) {
        fs.mkdirSync(PipelinePath);
      }
      const filePath = `${PipelinePath}/${this.buildNum}`;
      fs.writeFileSync(filePath, log);
      shell.showItemInFolder(filePath);
    }
  }

  public async onBuildNumberChange(): Promise<void> {
    if (this.pipeline) {
      const pipeline = this.pipeline;
      const buildNum = this.buildNum;
      const htmls = await this._getSummaryAndAccFails();
      this.router.register(
        new Route(`${buildNum}-${pipeline}Change`, () => {
          new MainCmp([
            () => {
              this.onSelectPipeline(pipeline);
              this.onSelectBuildNum(String(buildNum));
            },
          ]);
        })
      );
      this.renderer.composer(htmls);
    }
  }

  public async onPipelineChange(): Promise<void> {
    if (this.pipeline) {
      const pipeline = this.pipeline;
      this.router.register(
        new Route(`${pipeline}Change`, () => {
          new MainCmp([
            () => {
              this.onSelectPipeline(pipeline);
            },
          ]);
        })
      );
      await this._setBuildNumbers();
      const stageDetailsList = await this.pipelineService.lastFewStageDetails(
        pipeline
      );
      const lastFewBuilds = await this.pipelineService.pipelineHealth(
        pipeline,
        null,
        presetQuantity
      );

      this.renderer.composer([
        new StageDetailsCmp(stageDetailsList, lastFewBuilds, this),
      ]);
    } else {
      wipe($(BuildNumSelect));
    }
  }

  private async _setBuildNumbers(): Promise<void> {
    const buildNumbers = await this.pipelineService.getAvailableBuilds(
      this.pipeline
    );
    wipe($(BuildNumSelect));
    appendAll(
      $(BuildNumSelect),
      createOptions(
        withEmpty(
          'Select Build Number',
          buildNumbers.map((i) => [String(i), String(i)])
        )
      )
    );
  }

  private async _getSummaryAndAccFails(): Promise<BaseCmp[]> {
    const buildSummary = await this.pipelineService.pipelineHealth(
      this.pipeline,
      this.buildNum
    );

    const log = await this.pipelineService.getBuildConsoleOut(
      this.pipeline,
      this.buildNum
    );
    const fails = detectFailures(log);

    return [new BuildSummaryCmp(buildSummary), new GeneralLogCmp(fails)];
  }
}

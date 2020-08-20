import { remote, shell } from 'electron';
import settings from 'electron-settings';
import fs from 'fs';
import { UIPipelineStatus } from '../../../services/pipeline/pipelineStatus.ui.interface';
import {
  createSortFn,
  detectFailures,
  jenktronDebug,
  VoidFn,
  wipe,
} from '../../../shared';
import { Action } from '../action.interface';
import { BaseCmp } from '../baseCmp.class';
import { ConfigCmp } from '../config/cmps/config/configCmp.class';
import { MainMenu } from '../menus/main.menu';
import { PipelineMenu, presetQuantity } from '../menus/pipeline.menu';
import { NavView } from '../nav/nav.view';
import { BuildNumSelect, MainOutlet, PipelineSelect } from '../selectors';
import {
  $,
  appendAll,
  change,
  click,
  createButtons,
  createOptions,
  createSelect,
  FAILING,
  set,
  withEmpty,
} from '../shared';
import { BuildSummaryCmp } from './cmps/buildSummary/buildSummaryCmp.class';
import { GeneralLogCmp } from './cmps/generalLog/generalLogCmp.class';
import { StageDetailsCmp } from './cmps/stageDetails/stageDetailsCmp.class';
import { OverallStatusesCmp } from './cmps/statuses/overallStatusesCmp.class';
import { SingleStatusCmp } from './cmps/statuses/singleStatusCmp.class';

export class MainCmp extends BaseCmp {
  public nav: NavView = new NavView();
  public actions: Action[];

  constructor(initEffects: VoidFn[] = []) {
    super();

    this.actions = [
      [click, this.router.back.bind(this.router)],
      [click, this.router.forward.bind(this.router)],
      [click, this.pipelineStatuses.bind(this)],
      [change, this.onPipelineChange.bind(this)],
      [change, this.onBuildNumberChange.bind(this)],
      [click, this.getBuildConsoleOut.bind(this)],
      [click, this.config.bind(this)],
      [
        click,
        () => {
          this.pipelineService.cache.invalidate();
          this.router.reload.bind(this.router)();
        },
      ],
      [click, this.setDebug.bind(this)],
    ];

    this.nav = this.renderer.createNewNav(
      [
        ...createButtons(['<<<<', '>>>>']),
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
        ...createButtons(['Settings', '~Reload~', 'DEBUG']),
      ],
      this.actions
    );

    this.pipelineStatuses().then(() => {
      this.renderer.endLoading();
      this.router.register('main', () => new MainCmp());
      let delay = 0;
      initEffects.forEach((e) => {
        delay += 200;
        setTimeout(e, delay);
      });
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

  public setDebug(): void {
    window[jenktronDebug] = !window[jenktronDebug];
    console.log(`debug set to ${window[jenktronDebug]}`);
    settings.setSync(jenktronDebug, window[jenktronDebug]);
  }

  public async pipelineStatuses(): Promise<void> {
    const list = await this.pipelineService.listStatuses();
    const pipelineAlphaSort = createSortFn((i) => i.pipeline.toLowerCase());
    const fails = list
      .filter((l) => l.status === FAILING)
      .sort(pipelineAlphaSort);
    const everythingElse = list
      .filter((l) => l.status !== FAILING)
      .sort(pipelineAlphaSort);
    const sortedPipelines = [...fails, ...everythingElse];

    this.renderer.composer([new OverallStatusesCmp(sortedPipelines, this)]);
    this.prefetchOnPipelineChange(fails);
  }

  public async asyncPipelineStatuses(): Promise<void> {
    // WIP, only 1 second faster, but loses sorting so doesn't seem worth it.
    // event handlers need work.
    wipe($(MainOutlet));
    const names = await this.pipelineService.pipelineNames();
    const list = names.map((name) => this.pipelineService.listStatus(name));
    list.forEach((p) =>
      p.then((pipelineStatus: UIPipelineStatus) => {
        this.renderer.incrementalComposer(
          new SingleStatusCmp(pipelineStatus, this)
        );
      })
    );
  }

  public onSelectPipeline(newPipeline: string): void {
    set(PipelineSelect, newPipeline);
  }

  public onSelectBuildNum(newBuildNum: string): void {
    set(BuildNumSelect, newBuildNum);
  }

  public async getBuildConsoleOut(): Promise<void> {
    if (this.pipeline && this.buildNum) {
      const buildNum = this.buildNum;
      const pipeline = this.pipeline;
      this.router.register(`${pipeline}-${buildNum}-ConsoleOut`, async () => {
        new MainCmp([
          () => this.onSelectPipeline(pipeline),
          () => this.onSelectBuildNum(String(buildNum)),
          () => this.getBuildConsoleOut(),
        ]);
      });
      const log = await this.pipelineService.buildConsoleOut(
        this.pipeline,
        this.buildNum
      );

      this.renderer.composer([
        new GeneralLogCmp(log.slice(log.length - 40000, log.length)),
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
      this.router.register(`${buildNum}-${pipeline}Change`, async () => {
        new MainCmp([
          () => this.onSelectPipeline(pipeline),
          () => this.onSelectBuildNum(String(buildNum)),
        ]);
      });
      this.renderer.composer(htmls);
    }
  }

  public async onPipelineChange(): Promise<void> {
    if (this.pipeline) {
      const pipeline = this.pipeline;
      this.router.register(`${pipeline}Change`, async () => {
        new MainCmp([() => this.onSelectPipeline(pipeline)]);
      });

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

  private async prefetchOnPipelineChange(list: UIPipelineStatus[]) {
    list.forEach(async (p) => {
      await this.pipelineService.getAvailableBuilds(p.pipeline);
      await this.pipelineService.lastFewStageDetails(p.pipeline);
      await this.pipelineService.pipelineHealth(
        p.pipeline,
        null,
        presetQuantity
      );
    });
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

    const log = await this.pipelineService.buildConsoleOut(
      this.pipeline,
      this.buildNum
    );
    const fails = detectFailures(log);

    return [new BuildSummaryCmp(buildSummary), new GeneralLogCmp(fails)];
  }
}

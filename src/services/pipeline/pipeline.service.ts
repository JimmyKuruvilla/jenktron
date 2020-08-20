import { BuildDetailsResponse } from '../../jenkinsHttp/buildDetails.response.interface';
import { BuildsResponse } from '../../jenkinsHttp/builds.response.interface';
import { JenkinsHttp } from '../../jenkinsHttp/jenkinsHttp.class';
import { StageDetails } from '../../jenkinsHttp/stageDetails.response.interface';
import { match, toMin } from '../../shared';
import { presetQuantity } from '../../views/browser/menus/pipeline.menu';
import { NA } from '../../views/browser/shared';
import { WebCache } from '../../views/browser/webCache.class';
import { getLatestBuildNumber } from '../../views/cli/buildNumber.view';
import { UILastBuildStats } from './lastBuildStats.ui.interface';
import { UIPipelineHealthMap } from './pipelineHealth.ui.interface';
import { UIPipelineStatus } from './pipelineStatus.ui.interface';
import { UIStageDetailsMap } from './stageDetails.ui.interface';

export class PipelineService {
  private api: JenkinsHttp;
  public cache = new WebCache();
  constructor(api: JenkinsHttp) {
    this.api = api;
  }

  public async pipelineNames(): Promise<string[]> {
    const res = await this.cache.retrieve('pipelineNames', () =>
      this.api.pipelines()
    );
    return res.jobs.map((_) => _.name);
  }

  public async builds(pipelineName: string): Promise<BuildsResponse> {
    return this.cache.retrieve(`builds-${pipelineName}`, () =>
      this.api.builds(pipelineName)
    );
  }

  public async buildDetails(
    pipelineName: string,
    buildNum: number
  ): Promise<BuildDetailsResponse> {
    return this.cache.retrieve(`buildDetails-${pipelineName}-${buildNum}`, () =>
      this.api.buildDetails(pipelineName, buildNum)
    );
  }

  public async buildConsoleOut(
    pipelineName: string,
    buildNum: number
  ): Promise<string> {
    return this.cache.retrieve(`consoleOut-${pipelineName}-${buildNum}`, () =>
      this.api.consoleOut(pipelineName, buildNum)
    );
  }

  public async listStatus(pipelineName: string): Promise<UIPipelineStatus> {
    const buildsInfo = await this.cache.retrieve(`builds-${pipelineName}`, () =>
      this.api.builds(pipelineName)
    );
    const isFailing = this.didLastBuildFail(buildsInfo);
    const [isRunning, duration, buildType] = await this.getRunInfo(
      pipelineName,
      buildsInfo
    );
    return {
      pipeline: pipelineName,
      buildType,
      lastRunDuration: duration,
      running: isRunning ? 'RUNNING' : 'STOPPED',
      status: isFailing ? 'FAILING' : 'SUCCESS',
    };
  }

  public async listStatuses(): Promise<UIPipelineStatus[]> {
    const names = await this.pipelineNames();
    const pipelinePromises = names.map((name) => this.listStatus(name));
    return Promise.all(pipelinePromises);
  }

  public async lastBuildStats(pipeline: string): Promise<UILastBuildStats> {
    const buildInfo = await this.builds(pipeline);
    const healthReport = `${buildInfo.healthReport[0]?.description} -- score: ${buildInfo.healthReport[0]?.score}`;
    return {
      lastBuildFailed: this.didLastBuildFail(buildInfo),
      healthReport,
      lastBuild: String(buildInfo.lastBuild?.number) || 'N/A',
      lastFailedBuild: String(buildInfo.lastFailedBuild?.number) || 'N/A',
      lastUnstableBuild: String(buildInfo.lastUnstableBuild?.number) || 'N/A',
      lastUnsuccessfulBuild:
        String(buildInfo.lastUnsuccessfulBuild?.number) || 'N/A',
      lastSuccessfulBuild:
        String(buildInfo.lastSuccessfulBuild?.number) || 'N/A',
      lastStableBuild: String(buildInfo.lastStableBuild?.number) || 'N/A',
      lastCompletedBuild: String(buildInfo.lastCompletedBuild?.number) || 'N/A',
    };
  }

  public async pipelineHealth(
    pipeline: string,
    buildNum: number,
    maxBuilds = 1
  ): Promise<UIPipelineHealthMap> {
    return new Promise(async (resolve) => {
      const buildInfo = await this.builds(pipeline);
      const buildNums: number[] = buildNum
        ? [buildNum]
        : buildInfo.builds.slice(0, maxBuilds).map((_) => _.number);

      const buildStatusPromises = await buildNums.map(async (buildNum) => {
        let mergedBranch, failingFeatures;
        const log = await this.buildConsoleOut(pipeline, buildNum);
        if (log) {
          mergedBranch = match(/Merged branch: (.*)/, log);
          failingFeatures = (
            log.match(/Failing scenarios.*[\s\S]*features\/.*/gm) || []
          ).join('');
        } else {
          mergedBranch = NA;
          failingFeatures = NA;
        }

        const details = await this.buildDetails(pipeline, buildNum);
        const buildType =
          details?.actions
            .find((i) => i._class === 'hudson.model.ParametersAction')
            ?.parameters.find((i) => i.name == 'buildType')?.value || NA;
        const status = details?.result || NA;
        const displayName = details?.fullDisplayName || NA;
        const timestamp = new Date(details?.timestamp) || NA;
        const duration = `${toMin(details?.duration)} min` || NA;
        const git_author =
          details?.changeSets[0]?.items[0]?.author.fullName || NA;
        const git_oneAffectedFile =
          details?.changeSets[0]?.items[0]?.affectedPaths[0] || NA;
        const git_comment =
          details?.changeSets[0]?.items.map((_) => _.comment).join('') || NA;
        return [
          buildNum,
          {
            buildType: buildType,
            displayName: displayName,
            timestamp: timestamp,
            duration: duration,
            git_author: git_author,
            git_comment: git_comment,
            git_oneAffectedFile: git_oneAffectedFile,
            status: status,
            mergedBranch: mergedBranch,
            failingFeatures: failingFeatures,
          },
        ];
      });

      const statusTupleList = await Promise.all(buildStatusPromises);
      const healthMap = new Map();
      statusTupleList.forEach((i) => healthMap.set(i[0], i[1]));
      resolve(healthMap);
    });
  }

  public async getAvailableBuilds(pipeline: string): Promise<number[]> {
    const buildsInfo = await this.builds(pipeline);
    return buildsInfo.builds.map((_) => _.number);
  }

  public async lastFewStageDetails(
    pipeline: string
  ): Promise<UIStageDetailsMap[]> {
    const buildNumbers = await this.getAvailableBuilds(pipeline);
    const lastFew = buildNumbers.slice(0, presetQuantity);
    const stageDetails = await this.cache.retrieve(
      `lastFewStageDetails-${pipeline}`,
      () => this.api.stageDetails(pipeline)
    );

    return lastFew.map((buildNum) => {
      const details = stageDetails.filter(
        (_: StageDetails) => _.id === String(buildNum)
      );
      return this.constructStageDetails(pipeline, details);
    });
  }

  private async getRunInfo(
    pipeline: string,
    buildsInfo: BuildsResponse
  ): Promise<[boolean, number, string]> {
    const buildNumbers = buildsInfo.builds.map((_) => _.number);
    const latestBuildNum = getLatestBuildNumber(buildNumbers);
    const details = latestBuildNum
      ? await this.buildDetails(pipeline, latestBuildNum)
      : undefined;

    const buildType = details.actions
      .find((i) => i._class === 'hudson.model.ParametersAction')
      .parameters.find((i) => i.name === 'buildType')?.value;
    return [this.getIsRunning(details), details.duration, buildType];
  }

  private getIsRunning(details) {
    let isRunning;
    if (details) {
      isRunning = details.result === null;
    } else {
      isRunning = null;
    }
    return isRunning;
  }

  private didLastBuildFail(buildInfo: BuildsResponse): boolean {
    if (buildInfo.lastBuild && buildInfo.lastFailedBuild) {
      return buildInfo.lastFailedBuild.number === buildInfo.lastBuild.number;
    } else {
      return null;
    }
  }

  private constructStageDetails(
    pipeline: string,
    details: StageDetails[]
  ): UIStageDetailsMap {
    const detailsMap = new Map();
    details.forEach((d) => {
      detailsMap.set('name', pipeline);
      detailsMap.set('id', d.id);
      detailsMap.set('status', d.status);
      detailsMap.set(
        'stages',
        d?.stages.map((_) => ({
          status: _.status,
          duration: `${toMin(_.durationMillis)} min`,
          heading: _.name,
        }))
      );
    });
    return detailsMap;
  }
}

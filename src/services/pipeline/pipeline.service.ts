import { match, toMin } from '../../shared';
import { JenkinsHttp } from '../../jenkinsHttp/jenkinsHttp.class';
import { StageDetails } from '../../jenkinsHttp/stageDetails.response.interface';
import { UIStageDetailsMap } from './stageDetails.ui.interface';
import { BuildDetailsResponse } from '../../jenkinsHttp/buildDetails.response.interface';
import { UILastBuildStats } from './lastBuildStats.ui.interface';
import { UIPipelineHealthMap } from './pipelineHealth.ui.interface';
import { getLatestBuildNumber } from '../../views/cli/buildNumber.view';
import { presetQuantity } from '../../views/browser/menus/pipeline.menu';
import { UIPipelineStatus } from './pipelineStatus.ui.interface';

export class PipelineService {
  private api: JenkinsHttp;
  constructor(api: JenkinsHttp) {
    this.api = api;
  }

  public async pipelineHealth(
    pipeline: string,
    buildNum: number,
    maxBuilds = 0
  ): Promise<UIPipelineHealthMap> {
    return new Promise(async (resolve) => {
      const buildInfo = await this.api.builds(pipeline);
      const buildNums: number[] = buildNum
        ? [buildNum]
        : buildInfo.builds.slice(0, maxBuilds).map((_) => _.number);

      const buildStatusPromises = await buildNums.map(async (buildNum) => {
        const log = await this.api.consoleOut(pipeline, buildNum);
        const commitMessage = match(/Commit message\: (.*)/, log);
        const mergedBranch = match(/Merged branch: (.*)/, log);
        const failingFeatures = (
          log.match(/Failing scenarios.*[\s\S]*features\/.*/gm) || []
        ).join('');

        const details = await this.api.buildDetails(pipeline, buildNum);
        const buildType = details.actions
          .find((i) => i._class === 'hudson.model.ParametersAction')
          ?.parameters.find((i) => i.name == 'buildType')?.value;
        const status = details.result;
        const displayName = details.fullDisplayName;
        const timestamp = new Date(details.timestamp);
        const duration = `${toMin(details.duration)} min`;
        const git_author = details.changeSets[0]?.items[0]?.author.fullName;
        const git_oneAffectedFile =
          details.changeSets[0]?.items[0]?.affectedPaths[0];
        const git_comment = details.changeSets[0]?.items
          .map((_) => _.comment)
          .join('');
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
            commitMessage: commitMessage,
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

  public async lastBuildStats(pipeline: string): Promise<UILastBuildStats> {
    const buildInfo = await this.api.builds(pipeline);
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

  public async getBuildConsoleOut(
    pipeline: string,
    buildNum: number
  ): Promise<string> {
    return this.api.consoleOut(pipeline, buildNum);
  }

  public async getAvailableBuilds(pipeline: string): Promise<number[]> {
    const buildsInfo = await this.api.builds(pipeline);
    return buildsInfo.builds.map((_) => _.number);
  }

  public async lastBuildFailed(pipeline: string): Promise<boolean> {
    const buildInfo = await this.api.builds(pipeline);
    return this.didLastBuildFail(buildInfo);
  }

  public async getStatus(pipeline: string, buildNum: number): Promise<string> {
    const details = await this.api.buildDetails(pipeline, buildNum);
    return details.result;
  }

  public async stageDetails(
    pipeline: string,
    buildNum: number
  ): Promise<UIStageDetailsMap> {
    const stageDetails = await this.api.stageDetails(pipeline);
    const details = stageDetails.filter(
      (_: StageDetails) => _.id === String(buildNum)
    );

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

  public async pipelineNames(): Promise<string[]> {
    const res = await this.api.pipelines();
    return res.jobs.map((_) => _.name);
  }

  public async buildDetails(
    pipelineName: string,
    buildNum: number
  ): Promise<BuildDetailsResponse> {
    return this.api.buildDetails(pipelineName, buildNum);
  }

  public async listStatuses(): Promise<UIPipelineStatus[]> {
    const names = await this.pipelineNames();
    const pipelinePromises = names.map(async (pipeline: string) => {
      const isFailing = await this.lastBuildFailed(pipeline);
      const isRunning = await this.getRunningState(pipeline);
      return {
        pipeline: pipeline,
        running: isRunning ? 'RUNNING' : 'STOPPED',
        status: isFailing ? 'FAILING' : 'SUCCESS',
      };
    });
    return Promise.all(pipelinePromises);
  }

  public async lastFewStageDetails(
    pipeline: string
  ): Promise<UIStageDetailsMap[]> {
    const buildNumbers = await this.getAvailableBuilds(pipeline);
    const lastFew = buildNumbers.slice(0, presetQuantity);
    return Promise.all(
      lastFew.map(async (i) => await this.stageDetails(pipeline, i))
    );
  }

  private async getRunningState(pipeline: string) {
    const buildNumbers = await this.getAvailableBuilds(pipeline);
    const latestBuildNum = getLatestBuildNumber(buildNumbers);
    const details = latestBuildNum
      ? await this.buildDetails(pipeline, latestBuildNum)
      : undefined;
    return this.getIsRunning(details);
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

  private didLastBuildFail(buildInfo): boolean {
    if (buildInfo.lastBuild && buildInfo.lastFailedBuild) {
      return buildInfo.lastFailedBuild.number === buildInfo.lastBuild.number;
    } else {
      return null;
    }
  }
}

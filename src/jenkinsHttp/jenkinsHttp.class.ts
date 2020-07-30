import { BuildDetailsResponse } from './buildDetails.response.interface';
import { BuildsResponse } from './builds.response.interface';
import { Options } from './options.interface';
import { PipelinesResponse } from './pipelines.response.interface';
import { createFatch } from './request';
import { StageDetailsResponse } from './stageDetails.response.interface';

export class JenkinsHttp {
  public fatch: (url: string, options?: Options) => Promise<any>;
  private jenkinsUrl: string;

  constructor(
    user: string,
    password: string,
    jenkinsUrl = process.env.JENKINS_URL
  ) {
    this.jenkinsUrl = jenkinsUrl;
    this.fatch = createFatch(user, password);
  }

  public async pipelines(): Promise<PipelinesResponse> {
    const url = `${this.jenkinsUrl}/view/Pipelines/api/json`;
    return this.fatch(url);
  }

  public async builds(pipelineName: string): Promise<BuildsResponse> {
    const url = `${this.jenkinsUrl}/view/Pipelines/job/${pipelineName}/job/master/api/json`;
    return this.fatch(url);
  }

  // logText/progressiveText?start=0` -> polling endpoint
  // consoleFull -> html
  public async consoleOut(
    pipelineName: string,
    build: number
  ): Promise<string> {
    const url = `${this.jenkinsUrl}/view/Pipelines/job/${pipelineName}/job/master/${build}/consoleText`;
    return this.fatch(url, { responseType: 'text' });
  }

  public async buildDetails(
    pipelineName: string,
    build: number
  ): Promise<BuildDetailsResponse> {
    const url = `${this.jenkinsUrl}/view/Pipelines/job/${pipelineName}/job/master/${build}/api/json`;
    return this.fatch(url);
  }

  public async stageDetails(
    pipelineName: string
  ): Promise<StageDetailsResponse> {
    const url = `${this.jenkinsUrl}/view/Pipelines/job/${pipelineName}/job/master/wfapi/runs`;
    return this.fatch(url);
  }
}

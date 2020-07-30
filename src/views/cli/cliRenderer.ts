import chalk from 'chalk';
import * as readline from 'readline';
import { UIStageDetailsMap } from '../../services/pipeline/stageDetails.ui.interface';
import { detectFailures } from '../../shared';
export class CliRenderer {
  public log(...args: any[]): void {
    console.log(...args);
  }

  public colorOutput(str: string): void {
    const success = 'SUCCESS';
    const failing = 'FAILING';
    const running = 'RUNNING';
    const stopped = 'STOPPED';
    this.log(
      str
        .replace(new RegExp(running, 'gi'), chalk.yellow(running))
        .replace(new RegExp(failing, 'gi'), chalk.red(failing))
        .replace(new RegExp(success, 'gi'), chalk.green(success))
        .replace(new RegExp(stopped, 'gi'), chalk.green(stopped))
    );
  }

  public prompt(query: string): Promise<string> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) =>
      rl.question(query, (ans) => {
        rl.close();
        resolve(ans);
      })
    );
  }

  public padPrinter(arr: string[], columnWidth = 20, truncate = false): string {
    function padRight(str, width) {
      return `${str}${' '.repeat(width - str.length)}`;
    }

    const padded = arr.map((_) => {
      const s = String(_);
      return s.length <= columnWidth
        ? padRight(s, columnWidth)
        : truncate
        ? `${s.slice(0, columnWidth)} `
        : s;
    });
    return padded.join('');
  }

  public newLiner(arr: string[]): string {
    return `\n${arr.join('\n')}\n`;
  }

  public menuify(menuArr: string[]): [number, string] {
    return [
      menuArr.length,
      this.newLiner(
        menuArr.map((_, index) =>
          this.padPrinter([
            String(index),
            Array.isArray(_) ? this.padPrinter(_) : _,
          ])
        )
      ),
    ];
  }

  public printStages(detailsMap: UIStageDetailsMap, maxColumns: number): void {
    const stages = detailsMap.get('stages');
    const name = detailsMap.get('name').replace('_pipeline', '');
    if (stages) {
      const headings = stages.reduce(
        (acc, next) => acc.concat(next.heading),
        []
      );
      const durations = stages.reduce(
        (acc, next) => acc.concat(next.duration),
        []
      );
      const statuses = stages.reduce(
        (acc, next) => acc.concat(next.status),
        []
      );
      this.log(
        `Build number: ${detailsMap.get('id').yellow}, status: ${
          detailsMap.get('status') === 'SUCCESS'
            ? chalk.green('SUCCESS')
            : chalk.red(detailsMap.get('status'))
        }`
      );
      this.log(chalk.yellow(this.stagePadPrinter(name, headings, maxColumns)));
      this.log(this.stagePadPrinter(name, durations, maxColumns));
      this.log(this.stagePadPrinter(name, statuses, maxColumns));
      this.log('\n');
    } else {
      this.log('no stage data');
    }
  }

  public printLegend(): void {
    this.log('legend, "." is a connector', {
      pipelineName: '|',
      build: '@',
      push: '}}',
      promote: '^',
      deploy: '$',
      test: '%',
      to: '->',
      docker: '[-]',
      'staging/stage': '__',
      image: '#',
      slack: 'msg',
      config: '{}',
      spark: '`',
      backup: '<<',
      copy: '::',
      create: '++',
      delete: '!',
      'migrate/migration': '~',
      bucket: 'U',
    });
  }

  public stagePadPrinter(
    pipeline: string,
    arr: string[],
    columns: number
  ): string {
    function encode(str: string) {
      return str
        .replace(/ |:|stack|sbt|install/gi, '')
        .replace(new RegExp(pipeline, 'gi'), '.|.')
        .replace(/post-build/gi, '.@*.')
        .replace(/postdeployment/gi, '.$*.')
        .replace(/githubcheckout/gi, '.git.')
        .replace(/dependencies/gi, '.deps.')
        .replace(/helminit/gi, '.helm.')
        .replace(/slackconfirmation/gi, '.msg.')
        .replace(/prepare/gi, '.prep.')
        .replace(/upload/gi, '.upl.')
        .replace(/bucket/gi, '.U.')
        .replace(/copy/gi, '.::.')
        .replace(/create/gi, '.++.')
        .replace(/delete/gi, '.!.')
        .replace(/acceptance/gi, '.acc.')
        .replace(/snowflake/gi, '.SF.')
        .replace(/spark/gi, '.`.')
        .replace(/backup/gi, '.<<.')
        .replace(/config/gi, '.{}.')
        .replace(/dev/gi, '.D.')
        .replace(/preprod/gi, '.PP.')
        .replace(/prod/gi, '.P.')
        .replace(/promote/gi, '.^.')
        .replace(/deployment|deploy/gi, '.$.')
        .replace(/and/gi, '.&.')
        .replace(/build/gi, '.@.')
        .replace(/push/gi, '.+.')
        .replace(/to/gi, '.->.')
        .replace(/tests?/gi, '.%.')
        .replace(/docker/gi, '.[-].')
        .replace(/staging|stage/gi, '.__.')
        .replace(/image/gi, '.#.')
        .replace(/migration|migrate/gi, '.~.')
        .replace(/\.\./gi, '.')
        .replace(/^\.|\.$/gi, '');
    }

    const numCols = columns || arr.length;
    const columnWidth = Math.floor(200 / (numCols || 1));
    const encodedStr = arr.map(encode).map((_) => _.toUpperCase());
    return this.padPrinter(encodedStr, columnWidth);
  }

  public logStageDetailsList(stageDetailsList: UIStageDetailsMap[]): void {
    const maxColumns = Math.max(
      ...stageDetailsList.map((_) => _.get('stages').length)
    );
    stageDetailsList.forEach((detailsMap) =>
      this.printStages(detailsMap, maxColumns)
    );
    this.printLegend();
  }

  public logAccFailures(log: string): void {
    this.log(detectFailures(log));
  }
}

import { range } from '../../shared';
import { CliRenderer } from './cliRenderer';
import { CliState } from '../../state/CliState.class';
import { PipelineService } from '../../services/pipeline/pipeline.service';
import { PipelineMenu, presetQuantity } from './menus/pipeline.menu';
import { createBuildNumberView } from './buildNumber.view';
import { createAndSetPipelinesView } from './pipelines.view';
import { CliView } from './cliView.interface';

export function createPipelineView(pipeline: string): CliView {
  const r = new CliRenderer();
  const [menuLength, menu] = r.menuify(PipelineMenu);
  const menuActions = [
    async (state: CliState) => {
      await createAndSetPipelinesView(state);
    },
    async (state: CliState) => {
      r.log(await state.pipelines.lastBuildStats(pipeline));
    },
    async (state: CliState) => {
      const stageDetailsList = await state.pipelines.lastFewStageDetails(
        pipeline
      );
      r.logStageDetailsList(stageDetailsList);
    },
    async (state: CliState) => {
      const lastFewBuilds = await state.pipelines.pipelineHealth(
        pipeline,
        null,
        presetQuantity
      );
      r.log(pipeline, lastFewBuilds);
    },
    async (state: CliState) => {
      const buildNumbers = await listAvailableBuilds(state.pipelines, pipeline);
      state.current = createBuildNumberView(buildNumbers, async (state) => {
        const log = await state.pipelines.getBuildConsoleOut(
          pipeline,
          state.ans
        );
        r.logAccFailures(log);
      });
    },
    async (state: CliState) => {
      const buildNumbers = await listAvailableBuilds(state.pipelines, pipeline);
      state.current = createBuildNumberView(buildNumbers, async (state) => {
        const log = await state.pipelines.getBuildConsoleOut(
          pipeline,
          state.ans
        );
        r.log(log);
      });
    },
    async (state) => {
      const buildNumbers = await listAvailableBuilds(state.pipelines, pipeline);
      state.current = createBuildNumberView(buildNumbers, async (state) => {
        const log = await state.pipelines.pipelineHealth(pipeline, state.ans);
        r.log(log);
      });
    },
  ];
  return {
    prompt: () => r.prompt(`Select an option:${menu}`),
    validate: (ans) => range(menuLength).includes(ans),
    action: async (state) => {
      await menuActions[state.ans](state);
    },
  };
}

async function listAvailableBuilds(s: PipelineService, pipeline: string) {
  const buildNumbers = await s.getAvailableBuilds(pipeline);
  new CliRenderer().log('available build numbers', buildNumbers);
  return buildNumbers;
}

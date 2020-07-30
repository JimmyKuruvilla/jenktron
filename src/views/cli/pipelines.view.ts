import { range } from '../../shared';
import { createPipelineView } from './pipeline.view';
import { PipelineService } from '../../services/pipeline/pipeline.service';
import { CliState } from '../../state/CliState.class';
import { CliView } from './cliView.interface';
import { CliRenderer } from './cliRenderer';

export async function createPipelinesView(
  s: PipelineService
): Promise<CliView> {
  const r = new CliRenderer();
  const names = await s.pipelineNames();
  const prePipelineMenu = ['back'];
  const [menuLength, menu] = r.menuify([...prePipelineMenu, ...names]);
  return {
    prompt: () => r.prompt(`Select a pipeline:${menu}`),
    validate: (ans) => range(menuLength).includes(ans),
    action: async (state: CliState) => {
      if (state.ans === 0) {
        state.current = state.views.main;
      } else {
        const pipelineView = createPipelineView(
          names[state.ans - prePipelineMenu.length]
        );
        state.views.pipeline = pipelineView;
        state.current = pipelineView;
      }
    },
  };
}

export async function createAndSetPipelinesView(
  state: CliState
): Promise<void> {
  if (state.views.pipelines) {
    state.current = state.views.pipelines;
  } else {
    const pipelinesView = await createPipelinesView(state.pipelines);
    state.views.pipelines = pipelinesView;
    state.current = pipelinesView;
  }
}

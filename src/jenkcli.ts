import { PipelineService } from './services/pipeline/pipeline.service';
import { CliState } from './state/CliState.class';
import { CliRenderer } from './views/cli/cliRenderer';
import { createMain } from './views/cli/main.view';

export async function cliInit(pipelineService: PipelineService): Promise<void> {
  const main = await createMain();
  const state = new CliState(
    { main },
    main,
    pipelineService,
    new CliRenderer()
  );

  while (true) {
    const ans = (await state.current.prompt()) as string;
    if (state.current.validate(Number(ans)) && ans !== '') {
      state.ans = Number(ans);
      await state.current.action(state);
    }
  }
}

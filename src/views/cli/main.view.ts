import { range } from '../../shared';
import { createAndSetPipelinesView } from './pipelines.view';
import { CliView } from './cliView.interface';

import { CliState } from '../../state/CliState.class';
import { MainMenu } from './menus/main.menu';
import { CliRenderer } from './cliRenderer';

export async function createMain(): Promise<CliView> {
  const r = new CliRenderer();
  const [menuLength, menu] = r.menuify(MainMenu);
  const menuActions = [
    async (state: CliState) => {
      const list = await state.pipelines.listStatuses();
      const str = list.map((i) => `${i.status}, ${i.running}, ${i.pipeline}`);
      state.r.colorOutput(r.newLiner(str));
    },
    async (state: CliState) => {
      await createAndSetPipelinesView(state);
    },
  ];

  return {
    prompt: () => r.prompt(`Select an option:${menu}`),
    validate: (ans) => range(menuLength).includes(ans),
    action: async (state: CliState) => {
      await menuActions[state.ans](state);
    },
  };
}

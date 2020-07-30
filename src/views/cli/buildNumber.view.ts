import { CliView } from './cliView.interface';
import { CliState } from '../../state/CliState.class';
import { CliRenderer } from './cliRenderer';

export function createBuildNumberView(
  buildNumbers: number[],
  singleAction: (state: CliState) => void
): CliView {
  const r = new CliRenderer();
  return {
    prompt: () =>
      r.prompt('Enter build number, -1 for latest build, 0 to go back: '),
    validate: (ans) => ans === 0 || ans === -1 || buildNumbers.includes(ans),
    action: async (state: CliState) => {
      switch (state.ans) {
        case Number('0'):
          state.goBack();
          break;
        case Number('-1'):
          state.ans = getLatestBuildNumber(buildNumbers);
          await singleAction(state);
          break;
        default:
          await singleAction(state);
      }
    },
  };
}

export function getLatestBuildNumber(buildNumbers: number[]): number {
  const latest = buildNumbers.slice(0, 1);
  return latest.length === 0 ? undefined : latest[0];
}

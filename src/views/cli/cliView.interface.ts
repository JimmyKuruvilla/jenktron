import { CliState } from '../../state/CliState.class';

export interface CliView {
  prompt: () => Promise<string>;
  validate: (ans: number) => boolean;
  action: (state: CliState) => void;
}

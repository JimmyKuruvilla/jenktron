export type UIPipelineHealthMap = Map<number, UIPipeLineHealth>;
export interface UIPipeLineHealth {
  buildType: string;
  displayName: string;
  timestamp: Date;
  duration: string;
  git_author: string;
  git_comment: string;
  git_oneAffectedFile: string;
  status: string;
  mergedBranch: string;
  failingFeatures: string;
}

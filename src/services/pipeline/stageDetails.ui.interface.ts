export type UIStageDetailsMap = Map<keyof UIStageDetails, any>;
export interface UIStageDetails {
  name: string;
  id: string;
  status: string;
  stages: UIStage[];
}

export interface UIStage {
  status: string;
  duration: string;
  heading: string;
}

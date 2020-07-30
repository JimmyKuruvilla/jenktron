export type StageDetailsResponse = StageDetails[];

export interface StageDetails {
  id: string;
  name: string;
  status: string;
  startTimeMillis: number;
  endTimeMillis: number;
  durationMillis: number;
  queueDurationMillis: number;
  pauseDurationMillis: number;
  stages: Stage[];
}

interface Stage {
  id: string;
  name: string;
  execNode: string;
  status: string;
  startTimeMillis: number;
  durationMillis: number;
  pauseDurationMillis: number;
  error: Error;
}

interface Error {
  message: string;
  type: string;
}

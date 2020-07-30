export interface BuildsResponse {
  healthReport: {
    description: string;
    iconClassName: string;
    iconUrl: string;
    score: boolean;
  }[];
  builds: Build[];
  lastBuild: Build;
  lastFailedBuild: Build;
  lastUnstableBuild: Build;
  lastUnsuccessfulBuild: Build;
  lastSuccessfulBuild: Build;
  lastStableBuild: Build;
  lastCompletedBuild: Build;
  displayNameOrNull?: string;
  description?: string;
  buildable: boolean;
  displayName: string;
  fullDisplayName: string;
  fullName: string;
  name: string;
  url: string;
}

interface Build {
  _class: string;
  number: number;
  url: string;
}

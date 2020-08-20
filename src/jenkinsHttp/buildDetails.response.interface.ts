export interface BuildDetailsResponse {
  changeSets: BuildDetailsChangeSet[];
  actions: BuildDetailsAction[];
  timestamp: number;
  duration: number;
  result: string;
  fullDisplayName: string;
}

interface BuildDetailsAction {
  _class: string;
  parameters: Array<{ name: string; value: string }>;
}

interface BuildDetailsItem {
  paths: BuildDetailsPath[];
  author: BuildDetailsAuthor;
  timestamp: number;
  affectedPaths: string[];
  commitId: string;
  authorEmail: string;
  comment: string;
  date: string;
  id: string;
  msg: string;
  _class: string;
}

interface BuildDetailsChangeSet {
  items: BuildDetailsItem[];
  kind: string;
  _class: string;
}

interface BuildDetailsPath {
  editType: string;
  file: string;
}

interface BuildDetailsAuthor {
  absoluteUrl: string;
  fullName: string;
}

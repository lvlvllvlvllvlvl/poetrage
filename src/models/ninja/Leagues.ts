export interface Leagues {
  economyLeagues: League[];
  oldEconomyLeagues: League[];
  buildLeagues: League[];
  oldBuildLeagues: League[];
  snapshotVersions: {
    url: string;
    type: string;
    name: string;
    version: string;
    timeMachineLabels: string[];
  }[];
}

export interface League {
  name: string;
  url: string;
  displayName: string;
  hardcore: boolean;
  indexed: boolean;
}

export interface Leagues {
  economyLeagues: League[];
  oldEconomyLeagues: League[];
  buildLeagues: League[];
  oldBuildLeagues: League[];
}

export interface League {
  name: string;
  url: string;
  displayName: string;
  hardcore: boolean;
  indexed: boolean;
}

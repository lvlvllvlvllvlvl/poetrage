import React, { useMemo, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { PathOfExile, PoENinja } from "poe-api-ts";
import { useAsync } from './useAsync';
import axios from "axios";
import { filterOutliers } from './filterOutliers';
import { Builds } from './builds';

const query: any = {
  "query": {
    "status": {
      "option": "onlineleague"
    },
    "stats": [{ "type": "and", "filters": [{ "id": "pseudo.pseudo_temple_gem_room_3", "value": { "option": 1 }, "disabled": false }] }]
  }, "sort": { "price": "asc" }
};

//PathOfExile.Settings.userAgent = "testing, testing";
//document.cookie = 'POESESSID=9495397070d7edea6c144d9345b33d2f';

const poe = /https:\/\/(www.)?pathofexile.com/

axios.interceptors.request.use((config) => {
  if (config.data && Object.keys(config.data).length === 0) delete config.data;
  if (config.headers) delete config.headers["Content-Type"];
  config.url = config?.url?.replace("https://poe.ninja", "http://localhost:8080/ninja")?.replace(poe, "http://localhost:8080/poe");
  return config
});

const getBuilds = (league: string) => fetch(`http://localhost:8080/ninja/api/data/x/getbuildoverview?overview=${league.toLowerCase().replace(" ", "-")}&type=exp&language=en`).then(r => {
  if (r.status !== 200) {
    throw r.json();
  }
  return r.json() as Promise<Builds>;
});

function App() {

  const [league, setLeague] = useState("");
  const leagues = useAsync(PathOfExile.PublicAPI.Leagues.getAll);
  const gems = useAsync(league ? PoENinja.Items.SkillGems.getOverview : undefined, league);
  const currency = useAsync(league ? PoENinja.Currencies.getOverview : undefined, league, "Currency" as any);
  const temples = useAsync(league ? PathOfExile.PublicAPI.Trade.search : undefined, league, query);
  const builds = useAsync(league ? getBuilds : undefined, league);
  const fetchPage = useMemo(() => temples.done ? temples.value.getNextItems.bind(temples.value) : undefined, [temples.done]);
  const templePage = useAsync(fetchPage, 10);

  const skillMap: { [key: string]: number } = useMemo(() => {
    if (!builds.done) {
      return {};
    }
    const result: { [key: string]: number } = {};
    const total = builds.value.accounts.length / 1000;
    builds.value.allSkills.forEach(({ name }, i) => {
      result[name] = Math.round(builds.value.allSkillUse[i.toString()].length / total) / 10;
    })
    return result;
  }, [builds])

  const currencyMap: { [key: string]: number } = useMemo(() => {
    if (!currency.done) return { chaos: 1 };
    const result: { [key: string]: number } = { chaos: 1 };
    currency.value.entries.forEach(c => result[c.name] = c.chaosEquivalent);
    return result;
  }, [currency.done]);

  const averageTemple = useMemo(() => {
    if (!templePage.done || !currency.done) {
      return;
    }
    const prices = templePage.value?.map(({ listing: { price } }) => price) || [];
    const chaosValues = prices
      .filter(({ currency, amount }) => currency && amount && currencyMap[currency])
      .map(({ currency, amount }: any) => currencyMap[currency] * (amount));
    let filteredValues = filterOutliers(chaosValues);
    const sum = filteredValues.reduce((a, b) => a + b, 0);
    return sum / filteredValues.length;
  }, [currencyMap, templePage]);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        {leagues.pending && "Loading leagues..."}
        {leagues.done && <select value={league} onChange={({ currentTarget: { value } }) => setLeague(value)}>
          {!league && <option value="" disabled>Select a league</option>}
          {leagues.value.filter(({ id }) => !id.includes("SSF")).map(({ id }) => <option key={id} value={id}>{id}</option>)}
        </select>}
        {leagues.fail && String(leagues.error)}
        {temples.done && templePage.done ? <a href={`https://www.pathofexile.com/trade/search/${league}/${temples.value.id}`}>
          {templePage.value?.length ? `Doryani's Institute: ${averageTemple} chaos` : "No Doryani's Institute online"}
        </a> : "Checking temple prices..."}
        {gems.pending && "Loading gems..."}
        {gems.done && gems.value.entries.map(({ id, name }) => <p key={id}>{name}: {skillMap[name] || "n/a"}</p>)}
        {gems.fail && String(leagues.error)}
      </header>
    </div>
  );
}

export default App;

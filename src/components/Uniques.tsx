import { useAppSelector } from "state/store";

export function Uniques() {
  const weights = useAppSelector((state) => state.app.uniqueData);

  return (
    <pre
      onClick={(e) => navigator.clipboard.writeText(JSON.stringify(weights?.["Fugitive Boots"]))}>
      {JSON.stringify(weights, undefined, 2)}
    </pre>
  );
}

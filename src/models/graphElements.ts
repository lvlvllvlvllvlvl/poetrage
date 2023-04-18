import { GemDetails, GemId } from "./gems";

export type NodeMap = { [key: GemId]: GraphNode };

export type GraphNode = {
  gem: GemDetails;
  expectedValue: number;
  children?: GraphChild[];
  references?: "parent";
};

export type GraphChild = {
  name: string;
  expectedCost?: number;
  probability: number;
  node?: GraphNode;
};

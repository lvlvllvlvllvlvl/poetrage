import { GemDetails, GemId } from "./gems";

export type NodeMap = { [key: GemId]: GraphNode };

export type GraphNode = {
  gem: GemDetails;
  expectedValue: number;
  experience?: number;
  children?: GraphChild[];
};

export type GraphChild = {
  name: string;
  expectedCost?: number;
  probability: number;
  node?: GraphNode;
  references?: "parent" | "self";
};

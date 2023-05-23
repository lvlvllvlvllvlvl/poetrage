import { GemDetails, GemId } from "./gems";

export interface NodeMap {
  [key: GemId]: GraphNode;
}

export interface GraphNode {
  gem: GemDetails;
  expectedValue: number;
  expectedCost?: number;
  roi?: number;
  experience?: number;
  children?: GraphChild[];
}

export interface GraphChild {
  name: string;
  expectedCost?: number;
  probability: number;
  node?: GraphNode;
  references?: "parent" | "self";
}

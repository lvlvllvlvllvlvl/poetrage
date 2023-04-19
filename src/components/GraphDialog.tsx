import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import { graphlib, layout } from "dagre";
import { GemId, getId } from "models/gems";
import { GraphChild, GraphNode } from "models/graphElements";
import ReactFlow, { Background, Controls, Edge, Node } from "reactflow";
import "reactflow/dist/style.css";
import { setters } from "state/app";
import { useAppDispatch, useAppSelector } from "state/store";

export const GraphDialog = () => {
  const graph = useAppSelector((state) => state.app.currentGraph);
  const { setCurrentGraph } = setters(useAppDispatch());

  if (!graph) {
    return <></>;
  }

  const g = new graphlib.Graph();

  g.setGraph({});
  g.setDefaultEdgeLabel(() => ({}));
  const traverse = (parent: GemId) => (child: GraphChild) => {
    if (child.node) {
      const id = getId(child.node.gem);
      g.setNode(id, { label: id, width: 180, height: 100 });
      g.setEdge(parent, id, { label: child.name });
      child.node.children?.forEach(traverse(id));
    } else {
      g.setNode(`${parent}-${child.name}`, { label: child.name, width: 180, height: 100 });
      g.setEdge(parent, `${parent}-${child.name}`);
    }
  };
  g.setNode(getId(graph.gem), { label: getId(graph.gem), width: 180, height: 100 });
  graph.children?.forEach(traverse(getId(graph.gem)));

  layout(g);

  const nodes: Node[] = [];
  const edges: Edge[] = [];
  g.nodes().forEach((id) => {
    const { label, x, y } = g.node(id);
    nodes.push({
      id,
      position: { x, y },
      data: { label },
    });
  });
  g.edges().forEach((e) => {
    edges.push({ id: `${e.v}-${e.w}`, source: e.v, target: e.w });
  });

  return (
    <Dialog open={!!graph} onClose={() => setCurrentGraph(undefined)}>
      <div style={{ height: "80vh", width: "80vw" }}>
        <ReactFlow nodes={nodes} edges={edges}>
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </Dialog>
  );
};

export const GraphCell = ({ graph }: { graph?: GraphNode }) => {
  const { setCurrentGraph } = setters(useAppDispatch());
  return graph && graph.children?.length && graph.children[0].name !== "Sell" ? (
    <Button onClick={() => setCurrentGraph(graph)}>
      {Math.round(graph.expectedValue - graph.gem.Price)}
    </Button>
  ) : (
    <span>n/a</span>
  );
};

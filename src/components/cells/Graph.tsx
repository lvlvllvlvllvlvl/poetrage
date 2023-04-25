import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import Typography from "@mui/material/Typography";
import { GemIcons } from "components/GemIcons";
import { graphlib, layout } from "dagre";
import { getId } from "models/gems";
import { GraphChild, GraphNode } from "models/graphElements";
import ReactFlow, {
  Background,
  EdgeLabelRenderer,
  EdgeProps,
  Handle,
  MarkerType,
  Position,
  getBezierPath,
} from "reactflow";
import "reactflow/dist/style.css";
import { setters } from "state/app";
import { useAppDispatch, useAppSelector } from "state/store";
import { Price } from "./Price";
import numeral from "numeral";
import { Pinned } from "./Pinned";
import Box from "@mui/material/Box";

type GemNodeData = { label?: string; node?: GraphNode; isTarget: boolean; isSource: boolean };

const GemNode = ({ data: { node, isTarget, isSource } }: { data: GemNodeData }) => {
  return (
    <>
      {node?.gem && (
        <Box sx={{ maxWidth: 200, p: 1, border: 1, borderRadius: 1, backgroundColor: "white" }}>
          <Typography sx={{ textAlign: "center" }}>
            {node.gem.Level}/{node.gem.Quality} {node.gem.Name}
            {node.gem.Corrupted ? " (corrupted) " : " "}
            <GemIcons gem={node.gem} />
          </Typography>
          <Typography sx={{ textAlign: "center" }}>
            <Price inline gem={node.gem} /> <Pinned gem={node.gem} copy={node} />
          </Typography>
        </Box>
      )}
      {isTarget && <Handle type="target" position={Position.Top} />}
      {isSource && <Handle type="source" position={Position.Bottom} />}
      <Handle type="source" position={Position.Left} id="loop" />
      <Handle type="target" position={Position.Bottom} id="loop" />
    </>
  );
};

type GemEdgeData = { label?: string; child?: GraphChild };

const GemEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  markerEnd,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<GemEdgeData>) => {
  const invert = sourceX > targetX;
  const isLoop = !data?.child;
  const curvature = isLoop ? 0.4 : undefined;
  targetPosition = isLoop ? Position.Left : targetPosition;
  const usePath = sourceY < targetY && Math.abs(sourceX - targetX) < 30;
  const showChance = data?.child?.probability && data.child.probability !== 1;

  const [edgePath, labelX, labelY] = getBezierPath(
    invert
      ? {
          sourceX: targetX,
          sourceY: targetY,
          sourcePosition: targetPosition,
          targetX: sourceX,
          targetY: sourceY,
          targetPosition: sourcePosition,
          curvature,
        }
      : {
          sourceX,
          sourceY,
          sourcePosition,
          targetX,
          targetY,
          targetPosition,
          curvature,
        }
  );

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={invert ? undefined : markerEnd}
        markerStart={invert ? markerEnd : undefined}
      />
      {usePath ? (
        <EdgeLabelRenderer>
          <Box
            sx={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${
                showChance ? labelY + 25 : labelY
              }px)`,
              backgroundColor: "white",
            }}>
            <Typography fontSize="small" sx={{ textAlign: "center" }}>
              {data?.child?.name}
            </Typography>
            {showChance && (
              <Typography fontSize="small" sx={{ textAlign: "center" }}>
                ({numeral(data!.child!.probability * 100).format("0[.][00]")}%)
              </Typography>
            )}
          </Box>
        </EdgeLabelRenderer>
      ) : (
        <text dy={-4}>
          <textPath href={`#${id}`} style={{ fontSize: 12 }} startOffset="50%" textAnchor="middle">
            {data?.child?.name}
            {showChance ? ` (${numeral(data!.child!.probability * 100).format("0[.][00]")}%)` : ""}
          </textPath>
        </text>
      )}
    </>
  );
};

const nodeTypes = { gem: GemNode };
const edgeTypes = { gem: GemEdge };

export const GraphDialog = () => {
  const graph = useAppSelector((state) => state.app.currentGraph);
  const { setCurrentGraph } = setters(useAppDispatch());

  if (!graph) {
    return <></>;
  }

  const dagre = new graphlib.Graph();

  dagre.setGraph({ ranker: "network-simplex", ranksep: 200, nodesep: 100 });
  dagre.setDefaultEdgeLabel(() => ({}));
  const nodeMap = { [getId(graph.gem)]: graph };
  const childMap: { [id: string]: GraphChild } = {};
  const traverse = (node: GraphNode) => (child: GraphChild) => {
    const parent = getId(node.gem);
    if (child.node) {
      const id = getId(child.node.gem);
      nodeMap[id] = child.node;
      const loop = child.node.references === "parent";
      dagre.setNode(id, {
        label: id + ": " + (loop ? "repeat" : child.node.expectedValue || "fail"),
        weight: child.node.expectedValue,
        test: "test " + id,
        width: 180,
        height: 100,
      });
      dagre.setEdge(parent, id, { label: child.name });
      childMap[`${parent}-${id}`] = child;
      if (loop) {
        dagre.setEdge(id, parent);
      }
      child.node.children?.forEach(traverse(child.node));
    }
  };
  dagre.setNode(getId(graph.gem), { label: getId(graph.gem), width: 200, height: 100 });
  graph.children?.forEach(traverse(graph));

  layout(dagre);

  const nodes = dagre.nodes().map((id) => {
    const { label, x, y } = dagre.node(id);
    return {
      id,
      position: { x, y },
      data: {
        label,
        node: nodeMap[id],
        isTarget: !!dagre.inEdges(id)?.length,
        isSource: !!dagre.outEdges(id)?.length,
      },
      type: "gem",
      draggable: false,
      connectable: false,
    };
  });
  const edges = dagre.edges().map((e) => {
    const id = `${e.v}-${e.w}`;
    const child = childMap[id];
    return {
      id,
      type: "gem",
      source: e.v,
      target: e.w,
      label: dagre.edge(e.v, e.w).label,
      data: { child },
      sourceHandle: child ? undefined : "loop",
      targetHandle: child ? undefined : "loop",
      markerEnd: { type: MarkerType.ArrowClosed },
    };
  });

  return (
    <Dialog maxWidth={false} open={!!graph} onClose={() => setCurrentGraph(undefined)}>
      <div style={{ height: "80vh", width: "80vw" }}>
        <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes}>
          <Background />
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

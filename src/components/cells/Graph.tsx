import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import { useTheme } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { GemIcons } from "components/GemIcons";
import { graphlib, layout } from "dagre";
import { getId } from "models/gems";
import { GraphChild, GraphNode } from "models/graphElements";
import numeral from "numeral";
import ReactFlow, {
  Background,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  Handle,
  MarkerType,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import { setters } from "state/app";
import { useAppDispatch, useAppSelector } from "state/store";
import { Pinned } from "./Pinned";
import { Price } from "./Price";
import { Quality } from "./Quality";

interface GemNodeData {
  label?: string;
  node?: GraphNode;
  isTarget: boolean;
  isSource: boolean;
}

const GemNode = ({ data: { node, isTarget, isSource } }: { data: GemNodeData }) => {
  const theme = useTheme();

  return (
    <>
      {node?.gem ? (
        <Box
          sx={{
            maxWidth: 200,
            p: 1,
            border: 1,
            borderRadius: 1,
            backgroundColor: theme.palette.background.paper,
          }}>
          <Typography sx={{ textAlign: "center" }}>
            {node.gem.Level}/<Quality gem={node.gem} /> {node.gem.Name}
            {node.gem.Corrupted ? " (corrupted) " : " "}
            <GemIcons gem={node.gem} />
          </Typography>
          <Typography sx={{ textAlign: "center" }}>
            <Price inline gem={node.gem} /> <Pinned gem={node.gem} copy={node} />
          </Typography>
        </Box>
      ) : (
        <Typography sx={{ textAlign: "center" }}>Average value: {node?.expectedValue}</Typography>
      )}
      {isTarget && <Handle type="target" position={Position.Top} />}
      {isSource && <Handle type="source" position={Position.Bottom} />}
      <Handle type="source" position={Position.Left} id="parent" />
      <Handle type="target" position={Position.Bottom} id="parent" />
      <Handle type="source" position={Position.Bottom} id="self" />
      <Handle type="target" position={Position.Left} id="self" />
    </>
  );
};

interface GemEdgeData {
  label?: string;
  child?: GraphChild;
}

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
  const theme = useTheme();
  const invert = sourceX > targetX;
  const parentLoop = data?.child?.references === "parent";
  const selfLoop = data?.child?.references === "self";
  const isLoop = parentLoop || selfLoop;
  const curvature = parentLoop ? 0.4 : selfLoop ? 0.8 : undefined;
  targetPosition = parentLoop ? Position.Left : targetPosition;
  const textLabel = parentLoop || (sourceY < targetY && Math.abs(sourceX - targetX) < 30);
  const showChance = !isLoop && data?.child?.probability && data.child.probability !== 1;

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
        },
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
      {textLabel ? (
        <EdgeLabelRenderer>
          <Box
            sx={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${
                showChance ? labelY + 25 : labelY
              }px)`,
              backgroundColor: theme.palette.background.paper,
            }}>
            <Typography fontSize="small" sx={{ textAlign: "center" }}>
              {isLoop
                ? data?.child?.expectedCost
                  ? `Average cost: ${Math.round(data.child.expectedCost)}c`
                  : undefined
                : `${data?.child?.name || ""} (${numeral(data?.child?.expectedCost || 0).format(
                    "0[.][0]",
                  )}c)`}
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
            {isLoop
              ? data?.child?.expectedCost
                ? `Average cost: ${Math.round(data.child.expectedCost)}c`
                : undefined
              : data?.child?.name}
            {showChance
              ? ` (${numeral(data!.child!.probability * 100).format("0[.][00]")}%)`
              : (data?.child?.expectedCost || 0) + "c"}
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
      dagre.setNode(id, {
        weight: child.node.expectedValue,
        test: "test " + id,
        width: 180,
        height: 100,
      });
      dagre.setEdge(parent, id);
      childMap[`${parent}-${id}`] = { ...child, references: undefined };
      if (child.references === "parent") {
        childMap[`${id}-${parent}`] = child;
        dagre.setEdge(id, parent);
      }
      child.node.children?.forEach(traverse(child.node));
    }
    if (child.references === "self") {
      childMap[`${parent}-${parent}`] = child;
      dagre.setEdge(parent, parent);
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
      data: { child },
      sourceHandle: child?.references,
      targetHandle: child?.references,
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

export const GraphCell = ({ graph, xp }: { graph?: GraphNode; xp?: boolean }) => {
  const fiveWay = useAppSelector(({ app }) => app.fiveWay.debounced);
  const { setCurrentGraph } = setters(useAppDispatch());
  return graph && graph.children?.length && graph.children[0].name !== "Sell" ? (
    <Button sx={{ textTransform: "none" }} onClick={() => setCurrentGraph(graph)}>
      {xp ? (
        <Tooltip
          title={
            fiveWay
              ? `${Math.round(
                  ((graph.expectedValue - graph.gem.Price) * fiveWay) / (graph.experience || 0),
                )}c/5-way (${numeral((graph.experience || 0) / fiveWay).format("0[.][00]")} 5-ways)`
              : `${Math.round(
                  ((graph.expectedValue - graph.gem.Price) * 100) / (graph.experience || 0),
                )}c/100m XP (${numeral((graph.experience || 0) * 1000000).format("0[.][00]a")} XP)`
          }>
          <span>
            {Math.round(
              ((graph.expectedValue - graph.gem.Price) * (fiveWay || 100)) /
                (graph.experience || 0),
            )}
            c
          </span>
        </Tooltip>
      ) : (
        Math.round(graph.expectedValue - graph.gem.Price)
      )}
    </Button>
  ) : (
    <span>n/a</span>
  );
};

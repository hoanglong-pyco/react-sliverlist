import React, { useEffect, useMemo, useState } from "react";
import { ScrollView } from "./components";
import { SliverSelection } from "./components/Selection";
import { SliverSingle } from "./components/SliverSingle";
import { SliverTree } from "./components/SliverTree";
import { SliverTreeNode } from "./components/SliverTreeNode";

type Node = { name: string; id: string; path: number[] };

class TreeNode extends SliverTreeNode<Node> {
  constructor(node: Node) {
    super(node, []);
  }
}

const useTreeNodes = () => {
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  useEffect(() => {
    fetch("./data/tree.json").then(async (rs) => {
      const data = (await rs.json()) as Node[];

      const { nodes } = SliverTreeNode.fromFlat(
        data,
        (item) => new TreeNode(item),
        (item) => item.path
      );
      setNodes(nodes);
    });
  }, []);
  return nodes;
};
function App() {
  const treeNodes = useTreeNodes();
  const [verticle, setVerticle] = useState(false);

  const singles = useMemo(
    () => Array.from({ length: 30 }, (_, i) => new SliverSingle(50, () => i)),
    []
  );

  const slivers = useMemo(() => {
    const selection = new SliverSelection();
    return [
      ...singles,
      ...treeNodes.map((node) => {
        const tree = new SliverTree({
          itemSize: 20,
          node,
          renderNode: (node) => node.value.name,
          selection,
        });
        return tree;
      }),
    ];
  }, [singles, treeNodes]);
  return (
    <div
      className="App"
      // a
      // onClick={() => setVerticle(!verticle)}
    >
      {/* <div style={{ height: 1000 }} /> */}
      {
        <ScrollView
          // height={size.height}
          window={() => window}
          slivers={slivers}
          dir={verticle ? "verticle" : "horizontal"}
        />
      }
    </div>
  );
}

export default App;

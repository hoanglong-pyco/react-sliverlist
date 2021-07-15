import React, { useMemo, useState } from "react";
import { ScrollView, AutoSize } from "./components";
import { SliverTree, SliverTreeNode } from "./components/SliverTree";

function App() {
  const [verticle, setVerticle] = useState(false);

  const slivers = useMemo(() => {
    return [
      new SliverTree({
        itemSize: 40,
        renderLabel: (node) => node.value,
        node: new SliverTreeNode(
          "Root",
          Array.from(
            { length: 50 },
            (_, i) =>
              new SliverTreeNode(
                "Level 1 - " + i,
                Array.from(
                  { length: 10 },
                  (_, i) => new SliverTreeNode("Level 2 - " + i)
                )
              )
          )
        ),
      }),
    ];
  }, []);
  return (
    <div
      className="App"
      // a
      // onClick={() => setVerticle(!verticle)}
    >
      <AutoSize>
        {(size) => (
          <ScrollView
            height={size.height}
            slivers={slivers}
            dir={verticle ? "verticle" : "horizontal"}
          />
        )}
      </AutoSize>
    </div>
  );
}

export default App;

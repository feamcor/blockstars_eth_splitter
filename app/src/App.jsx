import React from "react";
import { DrizzleContext } from "drizzle-react";
import SplitterApp from "./SplitterApp";

export const App = () => (
  <DrizzleContext.Consumer>
    {drizzleContext => {
      const { drizzle, drizzleState, initialized } = drizzleContext;

      if (!initialized) {
        return "Loading... is MetaMask 🦊 enabled and set on correct network?";
      }

      return <SplitterApp drizzle={drizzle} drizzleState={drizzleState} />;
    }}
  </DrizzleContext.Consumer>
);

export default App;

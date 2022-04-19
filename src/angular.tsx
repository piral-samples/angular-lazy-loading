import "zone.js";
import "core-js/proposals/reflect-metadata";

import * as React from "react";
import { PageComponentProps } from "sample-piral";
import { defineNgModule, fromNg } from "piral-ng/convert";
import { AppComponent } from "./app/app.component";
import { AppModule } from "./app/app.module";

let fresh = true;

const AngularWrapper: React.FC<PageComponentProps> = ({ piral }) => {
  if (fresh) {
    defineNgModule(AppModule);
    piral.registerExtension("angular-page", fromNg(AppComponent));
    fresh = false;
  }

  const [state, setState] = React.useState(0);

  React.useEffect(() => {
    const tid = window.setInterval(() => setState((c) => c + 1), 1000);
    return () => window.clearInterval(tid);
  }, []);

  return <piral.Extension name="angular-page" params={{ count: state }} />;
};

export default AngularWrapper;

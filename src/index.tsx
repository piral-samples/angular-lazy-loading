import * as React from "react";
import { Link } from "react-router-dom";
import { PiletApi } from "sample-piral";

export function setup(app: PiletApi) {
  const AngularSample = React.lazy(() =>
    System.import("@angular/compiler@13.3.1").then(() =>
      System.import(`${app.meta.basePath}angular-page.js`)
    )
  );

  app.registerPage("/sample", AngularSample);

  app.registerMenu(() => <Link to="/sample">Sample</Link>);
}

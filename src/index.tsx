import * as React from "react";
import { Link } from "react-router-dom";
import { PiletApi } from "sample-piral";

const AngularSample = React.lazy(() => import("./angular"));

export function setup(app: PiletApi) {
  app.registerPage("/sample", AngularSample);

  app.registerMenu(() => <Link to="/sample">Sample</Link>);
}

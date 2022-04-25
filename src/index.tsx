import * as React from "react";
import { Link } from "react-router-dom";
import { PiletApi } from "sample-piral";

export function setup(app: PiletApi) {
  const AngularSample = React.lazy(() =>
    System.import("@angular/compiler@13.3.4").then(() =>
      System.import(`${app.meta.basePath}angular-page.js`)
    )
  );

  app.registerExtension("foo", {
    type: "html",
    component: {
      mount(el, props) {
        el.innerHTML = `<div><b>${props.params.title}</b></div>`;
      },
      unmount(el) {
        el.innerHTML = "";
      },
      update(el, props) {
        el.querySelector("b").textContent = props.params.title;
      },
    },
  });

  app.registerPage("/sample", AngularSample);

  app.registerMenu(() => <Link to="/sample">Sample</Link>);
}

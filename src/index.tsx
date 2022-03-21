import "zone.js";
import "@angular/compiler";
import "core-js/proposals/reflect-metadata";

import * as React from "react";
import { Link } from "react-router-dom";
import { defineNgModule, fromNg } from "piral-ng/convert";
import { PiletApi } from "sample-piral";
import { AppComponent } from "./app/app.component";
import { AppModule } from "./app/app.module";

export function setup(app: PiletApi) {
  defineNgModule(AppModule);

  app.registerPage("/sample", fromNg(AppComponent));

  app.registerMenu(() => <Link to="/sample">Sample</Link>);
}

import "zone.js";
import "@angular/compiler";
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

  return <piral.Extension name="angular-page" />;
};

export default AngularWrapper;

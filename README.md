[![Piral Logo](https://github.com/smapiot/piral/raw/develop/docs/assets/logo.png)](https://piral.io)

# [Piral Sample](https://piral.io) &middot; [![GitHub License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/smapiot/piral/blob/main/LICENSE) [![Gitter Chat](https://badges.gitter.im/gitterHQ/gitter.png)](https://gitter.im/piral-io/community)

> Sample project to illustrate lazy loading of an Angular application when rendering components.

:zap: Only load resources when they are required.

You can visit this demo at [angular-lazy-loading.samples.piral.cloud/](https://angular-lazy-loading.samples.piral.cloud/).

## Getting Started

Install the dependencies:

```sh
npm i
```

Now run the application:

```sh
npm start
```

It contains a single pilet hosting a page (`/sample`) which is rendered using Angular. All the necessary Angular resources are not embedded in the app shell, but come with the pilet. The resources are shared between other pilets and only loaded when needed.

## More Information

Implicitly shared dependencies are always lazy loaded. Unfortunately, due to Webpack's behavior with such resources they are referenced in the root module and therefore (by default) loaded (i.e., requested) already with the pilet itself. This is unfortunate, as other bundlers (e.g., esbuild) do a better job here.

### Embedded Loading

If you look at the [initial stage](https://github.com/piral-samples/angular-lazy-loading/tree/38812b073d227cdb21341fa242eb832071e7ecf7) you'll see that Angular is actually used without sharing and without lazy loading. The root module of the pilet already demands all resources:

```jsx
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
```

### Lazy Loading

In the [subsequent commit](https://github.com/piral-samples/angular-lazy-loading/tree/dd9bcf886230868949c2013948417fd74f82a9d8) we introduce lazy loading by placing everything related to Angular in a dedicated module *angular.tsx*:

```jsx
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
```

We export a wrapper component to perform the loading. Alternatively, you could use `piral-lazy` for lazy loading the Angular component (`fromNg(AppComponent)`) directly. The given way works with any Piral instance - which is great in this case as the used app shell (`sample-piral`) does not include `piral-lazy`.

The created module can now be referenced in the root module:

```jsx
import * as React from "react";
import { Link } from "react-router-dom";
import { PiletApi } from "sample-piral";

const AngularSample = React.lazy(() => import("./angular"));

export function setup(app: PiletApi) {
  app.registerPage("/sample", AngularSample);

  app.registerMenu(() => <Link to="/sample">Sample</Link>);
}
```

This works great, except that the additional `angular` chunk contains everything and does not allow sharing. Using this technique in multiple pilets will result in multiple (quite large) Angular chunks / versions (potentially duplicates) being loaded. Not great.

### Implicit Sharing

Going a step further we can actually tell Piral to share the angular resources. The *package.json* contains the necessary importmap definition:

```json
{
  "importmap": {
    "imports": {
      "@angular/common": "@angular/common",
      "@angular/compiler": "@angular/compiler",
      "@angular/core": "@angular/core",
      "@angular/platform-browser": "@angular/platform-browser",
      "@angular/platform-browser-dynamic": "@angular/platform-browser-dynamic",
      "@angular/forms": "@angular/forms",
      "@angular/router": "@angular/router"
    }
  },
  // ...
}
```

The problem with this is that now all the Angular resources are declared as externals. As mentioned, Webpack deals with these externals in an unfortunate way, which would lead to these chunks being loaded with the root module. This would now be quite destructive to our lazy loading efforts.

What we can do is to tell Webpack to create a dedicated entry for the side bundle of our choice. We modify the *webpack.config.js* for this:

```js
const extendWebpack = require('piral-ng/extend-webpack');

module.exports = (config) => {
  config.entry["angular-page"] = './src/angular.tsx';
  return extendWebpack({
    ngOptions: {
      jitMode: true,
    },
  })(config);
};
```

All lines except the `config.entry` one should have been there beforehand. Now, with the additional line we instruct Webpack to create another bundle from the `angular.tsx` file. The only thing left is to reference this output instead of the previously created chunk.

This can be achieved by modifying the root module:

```jsx
import * as React from "react";
import { Link } from "react-router-dom";
import { PiletApi } from "sample-piral";

export function setup(app: PiletApi) {
  const AngularSample = React.lazy(() => System.import(`${app.meta.basePath}angular-page.js`));

  app.registerPage("/sample", AngularSample);

  app.registerMenu(() => <Link to="/sample">Sample</Link>);
}
```

The important part here is that we don't just use `import()` but rather `System.import()`. This will therefore be ignored by Webpack (remember that Webpack should not process this, but instead we want to reference the bundle that we explicitly created).

## License

Piral and this sample code is released using the MIT license. For more information see the [license file](./LICENSE).

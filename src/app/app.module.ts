import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { SharedModule } from 'piral-ng/common';
import { AppComponent } from './app.component';

@NgModule({
  imports: [
    SharedModule,
  ],
  declarations: [AppComponent],
  exports: [AppComponent],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}

import { ChangeDetectorRef, Component } from "@angular/core";

@Component({
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  public counter: number;

  constructor(private readonly cd: ChangeDetectorRef) {
    this.counter = 0;
  }

  public increment(): void {
    this.counter++;
    this.cd.detectChanges();
  }

  public decrement(): void {
    this.counter--;
    this.cd.detectChanges();
  }
}

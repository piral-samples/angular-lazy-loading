import { ChangeDetectorRef, Component, Inject, Input, OnInit } from "@angular/core";

@Component({
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit {
  public counter: number;
  public time: number;

  @Input("Props") foo : any = {
    params: {
      count: -1,
    },
  };

  constructor(private readonly cd: ChangeDetectorRef) {
    this.counter = 0;
  }

  ngOnInit(): void {
    // this.props.subscribe(s => {
    //   this.time = s.params.count;
    //   this.cd.detectChanges();
    // });
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

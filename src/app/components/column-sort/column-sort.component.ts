import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-column-sort',
  templateUrl: './column-sort.component.html',
  styleUrls: ['./column-sort.component.scss'],
})
export class ColumnSortComponent implements OnInit {
  @Input()
  public total = 0;

  @Input()
  public column = '';

  @Input()
  public field? = '';

  @Input()
  public direction: 'asc' | 'desc' = 'asc';

  @Output()
  public sorted = new EventEmitter<string>();

  constructor() {}

  public ngOnInit(): void {}

  public sort(): void {
    this.sorted.emit(this.column);
  }
}

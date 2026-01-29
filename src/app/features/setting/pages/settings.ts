import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'settings',
  imports: [],
  template: `<p>settings works!</p>`,
  styleUrl: './settings.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Settings {}

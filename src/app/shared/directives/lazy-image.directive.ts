import { Directive, ElementRef, HostBinding, Input, OnInit } from '@angular/core';

@Directive({
  selector: 'img[appLazyImage]',
  standalone: true
})
export class LazyImageDirective implements OnInit {
  @Input() loadingMode: 'lazy' | 'eager' = 'lazy';
  @HostBinding('loading') loading = 'lazy';
  @HostBinding('decoding') decoding = 'async';

  constructor(private readonly el: ElementRef<HTMLImageElement>) {}

  ngOnInit(): void {
    this.loading = this.loadingMode;
  }
}

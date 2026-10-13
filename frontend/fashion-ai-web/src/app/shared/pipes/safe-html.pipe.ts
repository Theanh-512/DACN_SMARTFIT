import { Pipe, PipeTransform, inject, PLATFORM_ID } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';
import DOMPurify from 'dompurify';

@Pipe({
  name: 'safeHtml',
  standalone: true
})
export class SafeHtmlPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  transform(value: string | null | undefined): SafeHtml {
    if (!value) return '';

    // Sanitize with DOMPurify to prevent XSS attacks
    const sanitizedHtml = this.isBrowser
      ? DOMPurify.sanitize(value)
      : value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    return this.sanitizer.bypassSecurityTrustHtml(sanitizedHtml);
  }
}

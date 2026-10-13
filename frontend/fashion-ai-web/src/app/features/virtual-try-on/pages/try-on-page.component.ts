import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SeoService } from '../../../core/services/seo.service';
import { CartService } from '../../../core/services/cart.service';
import { MOCK_PRODUCTS, MOCK_TRYON_MODELS } from '../../../core/data/mock-products';
import { Product } from '../../catalog/models/product.model';

@Component({
  selector: 'app-try-on-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './try-on-page.component.html',
  styleUrls: ['./try-on-page.component.scss']
})
export class TryOnPageComponent implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly route = inject(ActivatedRoute);
  readonly cartService = inject(CartService);

  readonly availableProducts = signal<Product[]>(MOCK_PRODUCTS);
  readonly sampleModels = signal(MOCK_TRYON_MODELS);

  // Selections
  selectedModelUrl = signal<string>(MOCK_TRYON_MODELS[0].imageUrl);
  userUploadedUrl = signal<string | null>(null);
  selectedProduct = signal<Product>(MOCK_PRODUCTS[0]);
  selectedSize = signal<string>('M');

  // Processing & Results
  isProcessing = signal<boolean>(false);
  processingStep = signal<string>('');
  processingPercent = signal<number>(0);
  resultImageUrl = signal<string | null>(null);
  showComparison = signal<boolean>(false);

  // History
  tryOnHistory = signal<{ product: Product; resultUrl: string; time: string }[]>([
    {
      product: MOCK_PRODUCTS[0],
      resultUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      time: 'Vừa xong'
    }
  ]);

  addedMessage = signal<string | null>(null);

  get currentPersonImage(): string {
    return this.userUploadedUrl() || this.selectedModelUrl();
  }

  ngOnInit(): void {
    this.seo.updateSeo({
      title: 'Phòng Thử Đồ Ảo AI (IDM-VTON) | Fashion AI Studio',
      description: 'Mô phỏng ướm trang phục ảo lên cơ thể bạn trong 3-5 giây với công nghệ IDM-VTON Diffusion Model.',
      keywords: 'Virtual try on, IDM-VTON, thử đồ online, AI fashion, mô phỏng trang phục'
    });

    this.route.queryParams.subscribe(params => {
      if (params['productId']) {
        const found = MOCK_PRODUCTS.find(p => p.id === params['productId']);
        if (found) {
          this.selectedProduct.set(found);
          if (found.variants[0]?.size) {
            this.selectedSize.set(found.variants[0].size);
          }
        }
      }
    });
  }

  selectSampleModel(url: string): void {
    this.userUploadedUrl.set(null);
    this.selectedModelUrl.set(url);
    this.resultImageUrl.set(null);
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const objectUrl = URL.createObjectURL(file);
      this.userUploadedUrl.set(objectUrl);
      this.resultImageUrl.set(null);
    }
  }

  selectProduct(prod: Product): void {
    this.selectedProduct.set(prod);
    if (prod.variants[0]?.size) {
      this.selectedSize.set(prod.variants[0].size);
    }
    this.resultImageUrl.set(null);
  }

  startAiTryOn(): void {
    this.isProcessing.set(true);
    this.resultImageUrl.set(null);
    this.processingPercent.set(15);
    this.processingStep.set('Đang phân tích tư thế & vóc dáng cơ thể (Pose estimation)...');

    setTimeout(() => {
      this.processingPercent.set(45);
      this.processingStep.set('Đang bóc tách phom dáng và nếp gấp trang phục...');
    }, 900);

    setTimeout(() => {
      this.processingPercent.set(80);
      this.processingStep.set('IDM-VTON Diffusion Model đang tổng hợp ánh sáng và chất liệu vải...');
    }, 1800);

    setTimeout(() => {
      this.processingPercent.set(100);
      this.processingStep.set('Hoàn thiện hình ảnh thử đồ 3D!');
      this.isProcessing.set(false);

      // Set simulated result image
      const chosenProd = this.selectedProduct();
      const result = chosenProd.thumbnailUrl;
      this.resultImageUrl.set(result);

      // Add to session history
      this.tryOnHistory.update(hist => [
        {
          product: chosenProd,
          resultUrl: result,
          time: 'Vừa xong'
        },
        ...hist
      ]);
    }, 2800);
  }

  addToCartFromTryOn(): void {
    const prod = this.selectedProduct();
    this.cartService.addItem(prod);
    this.addedMessage.set(`Đã thêm "${prod.name}" vừa thử vào giỏ hàng!`);
    setTimeout(() => {
      this.addedMessage.set(null);
    }, 2500);
  }
}

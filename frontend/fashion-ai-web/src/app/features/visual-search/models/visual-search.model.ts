export interface VisualSearchMatch {
  productId: string;
  name: string;
  price: number;
  thumbnailUrl: string;
  similarityScore: number;
}

export interface VisualSearchResponse {
  queryTimeMs: number;
  totalFound: number;
  items: VisualSearchMatch[];
}

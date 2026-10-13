export type TryOnTaskStatus = 'Pending' | 'Processing' | 'Success' | 'Failed';

export interface TryOnTask {
  taskId: string;
  productId: string;
  productName?: string;
  garmentImageUrl?: string;
  status: TryOnTaskStatus;
  userImageUrl?: string;
  resultImageUrl?: string;
  inferenceTimeMs?: number;
  errorMessage?: string;
  createdAt: string;
}

export interface CreateTryOnTaskRequest {
  productId: string;
  variantId?: string;
  userImage: File;
}

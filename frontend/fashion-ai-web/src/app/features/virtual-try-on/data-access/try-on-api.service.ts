import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../core/http/api-client.service';
import { TryOnTask } from '../models/try-on.model';
import { ApiResponse } from '../../../core/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class TryOnApiService {
  private readonly api = inject(ApiClientService);

  getTaskStatus(taskId: string): Observable<ApiResponse<TryOnTask>> {
    return this.api.get<TryOnTask>(`try-on/tasks/${taskId}`);
  }

  getUserTryOnHistory(): Observable<ApiResponse<TryOnTask[]>> {
    return this.api.get<TryOnTask[]>('try-on/tasks/history');
  }
}

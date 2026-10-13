import { InjectionToken } from '@angular/core';
import { Environment } from '../../../environments/environment.model';

export const API_CONFIG = new InjectionToken<Environment>('API_CONFIG');

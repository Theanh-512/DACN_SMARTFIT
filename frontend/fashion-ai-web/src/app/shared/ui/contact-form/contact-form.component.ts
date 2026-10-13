import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../button/button.component';

export interface ContactFormData {
  fullName: string;
  email: string;
  phone: string;
  serviceInterest: string;
  message: string;
}

@Component({
  selector: 'app-ui-contact-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss']
})
export class ContactFormComponent {
  @Output() formSubmitted = new EventEmitter<ContactFormData>();

  formData: ContactFormData = {
    fullName: '',
    email: '',
    phone: '',
    serviceInterest: 'hybrid-studio',
    message: ''
  };

  isSubmitting = signal(false);
  isSuccess = signal(false);

  onSubmit(): void {
    if (!this.formData.fullName || !this.formData.email) return;

    this.isSubmitting.set(true);
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.isSuccess.set(true);
      this.formSubmitted.emit({ ...this.formData });
    }, 800);
  }
}

import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ComponentHelperService } from '../../shared/services/component-helper.service';

@Component({
  selector: 'app-account-forbidden',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CardModule,
    FloatLabelModule,
    InputTextModule,
    InputTextareaModule,
    ButtonModule,
  ],
  templateUrl: './forbidden.component.html',
  styleUrl: './forbidden.component.css',
})
export class ForbiddenComponent {
  constructor(private componentHelper: ComponentHelperService) {}
  clickLogin() {
    this.componentHelper.setLoginVisible(true);
  }
}

import { Component, OnInit, Renderer2, viewChild } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DropdownModule } from 'primeng/dropdown';
import { ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Stepper, StepperModule } from 'primeng/stepper';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { AccountService } from '../../shared/services/account.service';
import { CustomValidatorService } from '../../shared/services/custom-validator.service';
import { ComponentHelperService } from '../../shared/services/component-helper.service';
import { RegisterUserDto } from '../../shared/dtos/register-user.dto';
import { CalendarModule } from 'primeng/calendar';

@Component({
  selector: 'app-account-register-user',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CardModule,
    FloatLabelModule,
    InputTextModule,
    RadioButtonModule,
    PasswordModule,
    ButtonModule,
    DropdownModule,
    FormsModule,
    CommonModule,
    PasswordModule,
    CalendarModule,
    StepperModule,
    ToggleButtonModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
  ],
  templateUrl: './account-register-user.component.html',
  styleUrl: './account-register-user.component.css',
})
export class AccountRegisterUserComponent implements OnInit {
  @ViewChild(Stepper) stepper!: Stepper;
  active: number = 0;
  returnUrl = '';
  genders = new Array();
  prefixes = new Array();
  registerForm!: FormGroup;
  isProcessing = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private accountService: AccountService,
    private customValidator: CustomValidatorService,
    private messageService: MessageService,
    private componentHelper: ComponentHelperService
  ) {}
  ngOnInit(): void {
    this.genders = ['ชาย', 'หญิง', 'อื่นๆ'];
    this.prefixes = ['นาย', 'นางสาว', 'นาง', '-'];

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this;

    this.registerForm = new FormGroup({
      userName: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required]),
      prefix: new FormControl('', [Validators.required]),
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      birthDate: new FormControl('', [Validators.required]),
      gender: new FormControl('', [Validators.required]),
      phoneNumber: new FormControl('', [
        Validators.required,
        Validators.pattern('^[0-9]*$'),
      ]),
    });
    // prettier-ignore
    this.registerForm.get('confirmPassword')?.addValidators(this.customValidator.mismatched(this.registerForm.get('password')!));
    // prettier-ignore
  }
  validateControl(controlName: string) {
    const control = this.registerForm.get(controlName);
    return control?.invalid && control?.touched;
  }

  isError(controlName: string, errorName: string) {
    const control = this.registerForm.get(controlName);
    return control?.hasError(errorName);
  }
  registerUser() {
    const req: RegisterUserDto = {
      userName: this.registerForm.get('userName')?.value,
      password: this.registerForm.get('password')?.value,
      confirmPassword: this.registerForm.get('confirmPassword')?.value,
      email: this.registerForm.get('email')?.value,
      firstName:
        this.registerForm.get('prefix')?.value +
        this.registerForm.get('firstName')?.value,
      lastName: this.registerForm.get('lastName')?.value,
      birthDate: this.registerForm.get('birthDate')?.value,
      gender: this.registerForm.get('gender')?.value,
      phoneNumber: String(this.registerForm.get('phoneNumber')?.value),
    };
    /*     console.log(req); */

    this.registerForm.disable();
    this.messageService.clear();
    this.isProcessing = true;

    this.accountService.register(req).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Register Succeeded',
          detail: 'Your account is created.',
        });

        setTimeout(() => {
          this.stepper.activeStepChange.emit(2); //เปลี่ยนเสต็ปไปยังIndexที่กำหนด (พี่เขียน doc ให้มันดีๆหน่อยเถ้อะ กว่าจะหาวิธีเจอล่อไปเกือบ3ชม)
        }, 500);
      },
      error: (err: HttpErrorResponse) => {
        this.registerForm.enable();
        this.messageService.add({
          severity: 'error',
          summary: 'Register Failed',
          detail: err.message,
          sticky: true,
        });
        this.isProcessing = false;
      },
    });
  }

  clickLogin() {
    this.componentHelper.setLoginVisible(true);
  }
}

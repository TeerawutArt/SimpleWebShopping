import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RadioButtonModule } from 'primeng/radiobutton';
import { StepperModule } from 'primeng/stepper';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { AccountProfileDto } from '../../../shared/dtos/account-profile.dto';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FileRemoveEvent,
  FileSelectEvent,
  FileUpload,
  FileUploadModule,
} from 'primeng/fileupload';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ProfileService } from '../../../shared/services/profile.service';

@Component({
  selector: 'app-update-user-profile',
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
    FileUploadModule,
  ],
  templateUrl: './update-user-profile.component.html',
  styleUrl: './update-user-profile.component.css',
})
export class UpdateUserProfileComponent implements OnInit {
  @ViewChild(FileUpload) fileUploadComponent!: FileUpload;
  genders = new Array();
  prefixes = new Array();
  returnUrl = '';
  uploadImage: File | string = '';
  updateProfileForm!: FormGroup;
  isProcessing = false;
  storeProfileInfo!: AccountProfileDto;
  splitText: Array<string> = [];
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private profileService: ProfileService
  ) {}
  ngOnInit(): void {
    this.storeProfileInfo = window.history.state['saveProduct']; //ดึงข้อมูลจาก state(ที่ส่งมา) ใน history ของ browser (รีเฟชแล้วไม่หาย)
    console.log(this.storeProfileInfo);
    this.splitText = this.storeProfileInfo.firstName.split(' ');
    this.genders = ['ชาย', 'หญิง', 'อื่นๆ'];
    this.prefixes = ['นาย', 'นางสาว', 'นาง', '-'];
    this.updateProfileForm = new FormGroup({
      email: new FormControl(this.storeProfileInfo.email, [
        Validators.required,
        Validators.email,
      ]),
      prefix: new FormControl(this.splitText[0], [Validators.required]),
      firstName: new FormControl(this.splitText[1], [Validators.required]),
      lastName: new FormControl(this.storeProfileInfo.lastName, [
        Validators.required,
      ]),
      birthDate: new FormControl(new Date(this.storeProfileInfo.birthDate), [
        Validators.required,
      ]),
      gender: new FormControl(this.storeProfileInfo.gender, [
        Validators.required,
      ]),
      phoneNumber: new FormControl(this.storeProfileInfo.phoneNumber, [
        Validators.required,
        Validators.pattern('^[0-9]*$'),
      ]),
    });
  }
  validateControl(controlName: string) {
    const control = this.updateProfileForm.get(controlName);
    return control?.invalid && control?.touched;
  }

  isError(controlName: string, errorName: string) {
    const control = this.updateProfileForm.get(controlName);
    return control?.hasError(errorName);
  }
  onRemoveImage(event: FileRemoveEvent) {
    this.uploadImage = '';
  }
  onSelectImage(event: FileSelectEvent) {
    this.uploadImage = event.files[0];
  }
  onClearImage() {
    this.uploadImage = '';
  }
  cancel() {
    this.returnUrl =
      this.route.snapshot.queryParams['returnUrl'] || this.returnUrl;
    this.router.navigate([this.returnUrl]);
  }
  updateProfile() {
    this.confirmationService.confirm({
      header: 'ยืนยันการทำรายการ',
      message: `ยืนยันการแก้ไขข้อมูลส่วนตัว`,
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      acceptLabel: 'ยืนยัน',
      rejectLabel: 'ยกเลิก',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-warning',
      accept: () => {
        this.isProcessing = true;
        this.updateProfileForm.disable();
        this.profileService
          .updateUserProfile(
            {
              // prettier-ignore
              firstName:this.updateProfileForm.get('prefix')?.value +' '+this.updateProfileForm.get('firstName')?.value,
              lastName: this.updateProfileForm.get('lastName')?.value,
              birthDate: this.updateProfileForm.get('birthDate')?.value,
              gender: this.updateProfileForm.get('gender')?.value,
              email: this.updateProfileForm.get('email')?.value,
              phoneNumber: String(
                this.updateProfileForm.get('phoneNumber')?.value
              ),
            },
            this.uploadImage
          )
          .subscribe({
            next: (_) => {
              this.updateProfileForm.reset();
              this.messageService.clear();
              this.updateProfileForm.enable();
              this.fileUploadComponent.clear(); //ล้างไฟล์เมื่อดำเนินการแล้ว
              this.isProcessing = false;
              this.messageService.add({
                summary: 'ทำรายการเสร็จสิ้น',
                detail: `แก้ไขโปรไฟล์สำเร็จ`,
                severity: 'success',
                life: 1000,
              });
              this.router.navigate(['/account/profile']);
            },
            error: (err: HttpErrorResponse) => {
              this.messageService.add({
                summary: 'Something Error!',
                detail: 'Please try again.',
                severity: 'warn',
              });
              this.updateProfileForm.enable();
              this.isProcessing = false;
            },
          });
      },
      reject: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'ยกเลิก',
          detail: 'ยกเลิกการแก้ไขโปรไฟล์',
          life: 1000,
        });
      },
    });
  }
}

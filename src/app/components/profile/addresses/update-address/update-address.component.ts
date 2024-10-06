import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FileUploadModule } from 'primeng/fileupload';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MultiSelectModule } from 'primeng/multiselect';
import { TooltipModule } from 'primeng/tooltip';
import { AddressService } from '../../../../shared/services/address.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import {
  DropdownChangeEvent,
  DropdownFilterOptions,
  DropdownModule,
} from 'primeng/dropdown';
import { MenuItem, MessageService } from 'primeng/api';
import { AccountUpdateAddressDto } from '../../../../shared/dtos/account-update-address.dto';
import { AccountAddressDto } from '../../../../shared/dtos/account-address.dto';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-update-address',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    CardModule,
    FloatLabelModule,
    InputTextModule,
    InputTextareaModule,
    InputNumberModule,
    ButtonModule,
    CalendarModule,
    FileUploadModule,
    ConfirmDialogModule,
    InputGroupModule,
    InputGroupAddonModule,
    MultiSelectModule,
    FormsModule,
    CheckboxModule,
    TooltipModule,
    DropdownModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './update-address.component.html',
  styleUrl: './update-address.component.css',
})
export class UpdateAddressComponent implements OnInit {
  isProcessing = false;
  AddressForm!: FormGroup;
  thaiData!: MenuItem[];
  returnUrl = '';
  districtData: Array<any> = [];
  SubDistrictData: Array<any> = [];
  storeAddress!: AccountAddressDto;
  splitText: Array<string> = [];
  receiveProvince: any;
  receiveDistrict: any;
  receiveSubDistrict: any;
  houseInfoIndex = 0;
  roadAddressIndex = 0;
  alleyIndex = 0;
  zipCodeIndex = 0;
  constructor(
    private addressService: AddressService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService
  ) {}
  ngOnInit(): void {
    this.isProcessing = true;
    this.storeAddress = window.history.state['saveProduct']; //ทำไมต้องใช้ชื่อซ้ำกัน เพราะว่า อยากให้มันทับๆกันไป ไม่สร้างขึ้นมาเรื่อยๆ
    console.log(this.storeAddress);
    this.splitText = this.storeAddress.addressInfo.split(' '); //ใช้แบบนี้หละง่ายดี
    //หา index ของ ข้อความที่ split ออกมา
    this.houseInfoIndex = 0;
    this.roadAddressIndex = this.splitText.findIndex((t) => t == 'ถนน:') + 1;
    this.alleyIndex = this.splitText.findIndex((t) => t == 'ซอย:') + 1;
    this.zipCodeIndex =
      this.splitText.findIndex((t) => t == 'รหัสไปรษณีย์:') + 1;
    //////////////////
    this.AddressForm = new FormGroup({
      addressName: new FormControl(this.storeAddress.addressName),
      receiverName: new FormControl(this.storeAddress.receiverName),
      receiverPhoneNumber: new FormControl(
        this.storeAddress.receiverPhoneNumber,
        [Validators.required, Validators.pattern('^[0-9]*$')]
      ),
      houseInfo: new FormControl(this.splitText[this.houseInfoIndex]),
      roadAddress: new FormControl(this.splitText[this.roadAddressIndex]),
      alley: new FormControl(this.splitText[this.alleyIndex]),
      selectedProvince: new FormControl('', [Validators.required]),
      filterProvinceValue: new FormControl(''),
      selectedDistrict: new FormControl('', [Validators.required]),
      filterDistrict: new FormControl(''),
      selectedSubDistrict: new FormControl('', [Validators.required]),
      filterSubDistrict: new FormControl(''),
      // prettier-ignore
      zipCode: new FormControl(this.splitText[this.zipCodeIndex], [Validators.required,]),
    });
    this.getThaiProvinceData();
  }

  validateControl(controlName: string) {
    const control = this.AddressForm.get(controlName);
    return control?.invalid && control?.touched;
  }

  hasError(controlName: string, errorName: string) {
    const control = this.AddressForm.get(controlName);
    return control?.hasError(errorName);
  }
  cancel() {
    this.returnUrl =
      this.route.snapshot.queryParams['returnUrl'] || this.returnUrl;
    this.router.navigate([this.returnUrl]);
  }
  resetFunction(options: DropdownFilterOptions, filterValue: string) {
    options.reset!();
    this.AddressForm.get(filterValue)?.setValue('');
  }

  customFilterFunction(event: KeyboardEvent, options: DropdownFilterOptions) {
    options.filter!(event);
  }
  updateForm() {
    this.AddressForm.get('selectedProvince')?.setValue(this.receiveProvince[0]);
    this.AddressForm.get('selectedDistrict')?.setValue(this.receiveDistrict[0]);
    // prettier-ignore
    this.AddressForm.get('selectedSubDistrict')?.setValue(this.receiveSubDistrict[0]);
  }
  getThaiProvinceData() {
    this.addressService.getThaiProvinceData().subscribe({
      next: (res) => {
        this.thaiData = res;
        //อัปเดท dropdown
        const provinceIndex =
          this.splitText.findIndex((t) => t == 'จังหวัด:') + 1;
        const districtIndex =
          this.splitText.findIndex((t) => t == 'อำเภอ:') + 1;
        const subDistrictIndex =
          this.splitText.findIndex((t) => t == 'ตำบล:') + 1;
        this.receiveProvince = this.thaiData.filter(
          (v: any) => v.name_th == this.splitText[provinceIndex]
        );
        this.districtData = this.receiveProvince[0].amphure;
        this.receiveDistrict = this.receiveProvince[0].amphure.filter(
          (v: any) => v.name_th == this.splitText[districtIndex]
        );
        this.SubDistrictData = this.receiveDistrict[0].tambon;
        this.receiveSubDistrict = this.receiveDistrict[0].tambon.filter(
          (v: any) => v.name_th == this.splitText[subDistrictIndex]
        );
        this.updateForm();
        //โค้ดด้านบนนี้ คือเซ็ตตัวแปรเข้าไปในฟิล dropdown//

        this.isProcessing = false;
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
      },
    });
  }
  selectProvince(event: DropdownChangeEvent) {
    console.log(event.value);
    if (event.value) {
      this.districtData = event.value.amphure; //เก็บค่าอำเภอ จากจังหวัดที่เลือก
    } else {
      this.districtData = [];
    }
    this.clearDropdownField('Province');
    this.SubDistrictData = [];
  }
  selectDistrict(event: DropdownChangeEvent) {
    if (event.value) {
      this.SubDistrictData = event.value.tambon; //เก็บค่าตำบล จากอำเภอที่เลือก
    } else this.SubDistrictData = [];
    this.clearDropdownField('District');
  }
  selectSubDistrict(event: DropdownChangeEvent) {
    if (event.value) {
      this.AddressForm.get('zipCode')?.setValue(event.value.zip_code);
    }
  }
  onClearDropdownValue(event: Event, selectValue: string) {
    this.clearDropdownField(selectValue);
  }
  clearDropdownField(selectValue: string) {
    if (selectValue == 'Province') {
      this.AddressForm.get('selectedDistrict')?.setValue('');
      this.AddressForm.get('selectedSubDistrict')?.setValue('');
    }
    if (selectValue == 'District') {
      this.AddressForm.get('selectedSubDistrict')?.setValue('');
    }
    this.AddressForm.get('zipCode')?.setValue('');
  }
  updateAddress() {
    this.AddressForm.disable();
    this.messageService.clear();
    this.isProcessing = true;
    /* จริงๆไม่ต้องใช้ Ternary ก็ได้เพราะบังคับกรอกอยู่แล้ว แต่กันไว้ */
    const province = this.AddressForm.get('selectedProvince')?.value.name_th
      ? this.AddressForm.get('selectedProvince')?.value.name_th
      : ' ';
    const district = this.AddressForm.get('selectedDistrict')?.value.name_th
      ? this.AddressForm.get('selectedDistrict')?.value.name_th
      : ' ';
    // prettier-ignore
    const subDistrict = this.AddressForm.get('selectedSubDistrict')?.value.name_th
      ? this.AddressForm.get('selectedSubDistrict')?.value.name_th
      : ' ';
    const req: AccountUpdateAddressDto = {
      addressName: this.AddressForm.get('addressName')?.value,
      receiverName: this.AddressForm.get('receiverName')?.value,
      receiverPhoneNumber: this.AddressForm.get('receiverPhoneNumber')?.value,
      addressInfo: `${this.AddressForm.get('houseInfo')?.value} ถนน: ${
        this.AddressForm.get('roadAddress')?.value
      } ซอย: ${
        this.AddressForm.get('alley')?.value
      } จังหวัด: ${province} อำเภอ: ${district} ตำบล: ${subDistrict} รหัสไปรษณีย์: ${
        this.AddressForm.get('zipCode')?.value
      }`,
    };
    this.addressService
      .updateAddress(this.storeAddress.addressId, req)
      .subscribe({
        next: (res) => {
          this.messageService.add({
            severity: 'success',
            summary: 'ทำรายการสำเร็จ',
            detail: 'แก้ไขที่อยู่เรียบร้อยแล้ว',
          });
          setTimeout(() => {
            this.isProcessing = false;
            this.AddressForm.enable();
            this.router.navigate(['/account/profile']);
          }, 500);
        },
        error: (err: HttpErrorResponse) => {
          this.AddressForm.enable();
          this.messageService.add({
            severity: 'error',
            summary: 'ทำรายการไม่สำเร็จ',
            detail: err.message,
            sticky: true,
          });
          this.isProcessing = false;
        },
      });
  }
}

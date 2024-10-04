import { Component, OnInit } from '@angular/core';
import { ImageModule } from 'primeng/image';
import { ProfileService } from '../../../shared/services/profile.service';
import { HttpErrorResponse } from '@angular/common/http';

import { AccordionModule } from 'primeng/accordion';
import { environment } from '../../../../environments/environment.development';
import { CommonModule } from '@angular/common';
import { AccountProfileDto } from '../../../shared/dtos/account-profile.dto';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AccountAddressDto } from '../../../shared/dtos/account-address.dto';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { SplitButtonModule } from 'primeng/splitbutton';
import { AddressService } from '../../../shared/services/address.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    ImageModule,
    AccordionModule,
    CommonModule,
    ButtonModule,
    SplitButtonModule,
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css',
})
export class UserProfileComponent implements OnInit {
  loading = false;
  profile!: AccountProfileDto;
  rootImgUrl = environment.imageUrl;
  returnUrl = '';
  activeIndex: Array<number> = [];
  menuItems!: MenuItem[];
  curAddress!: AccountAddressDto;
  constructor(
    private addressService: AddressService,
    private profileService: ProfileService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.menuItems = this.settingAddressMenu();
    this.returnUrl = this.router.url;
    this.loading = true;
    this.getProfile();
  }
  settingAddressMenu() {
    const settingItem: MenuItem[] = [
      {
        label: 'แก้ไข',
        icon: 'pi pi-pen-to-square',
        command: () => this.updateUserAddress(this.curAddress),
      },
      {
        label: 'ลบ',
        icon: 'pi pi-trash',
        command: () => this.deleteUserAddress(this.curAddress),
      },
    ];
    return settingItem;
  }
  getProfile() {
    this.profileService.getUserInfo().subscribe({
      next: (res) => {
        this.profile = res;

        console.log(this.profile);
        this.activeIndex.push(
          this.profile.addresses.findIndex((a) => a.isDefault === true)
        );
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
      },
    });
  }

  updateDefaultAddress(address: AccountAddressDto) {
    this.messageService.clear();
    this.addressService
      .updateDefaultAddress(address.addressId, {
        isDefault: !address.isDefault,
      })
      .subscribe({
        next: (_) => {
          this.messageService.add({
            summary: 'เปลี่ยนที่อยู่เริ่มต้นเรียบร้อยแล้ว',
            severity: 'success',
            detail: `${address.addressName} เป็นที่อยู่เริ่มต้นแล้ว"`,
          });
          this.getProfile();
        },
        error: (err: HttpErrorResponse) => {
          console.log(err);
        },
      });
  }
  updateUserAddress(curAddress: AccountAddressDto) {
    this.returnUrl = this.router.url;
    this.router.navigate(
      ['account/profile/address/' + curAddress.addressId + '/update'],
      {
        state: { saveProduct: curAddress },
        queryParams: { returnUrl: this.returnUrl },
      }
    );
  }
  deleteUserAddress(curAddress: AccountAddressDto) {
    this.confirmationService.confirm({
      message: `คุณกำลังจะลบที่อยู่ "${curAddress.addressName}"`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      acceptLabel: 'ยืนยัน',
      rejectLabel: 'ยกเลิก',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.addressService.deleteAddress(curAddress.addressId).subscribe({
          next: (_) => {
            this.messageService.add({
              summary: 'ลบที่อยู่เรียบร้อย',
              severity: 'success',
              detail: `ที่อยู่ "${curAddress.addressName}" ถูกลบแล้ว`,
            });
            this.getProfile();
          },
          error: (error: HttpErrorResponse) => {
            this.messageService.add({
              summary: 'Something Error',
              severity: 'danger',
              detail: 'something error',
            });
          },
        });
      },
      reject: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'ยกเลิก',
          detail: 'ยกเลิกการลบสินค้า',
          life: 3000,
        });
      },
    });
  }
}

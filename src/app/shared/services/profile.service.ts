import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { AccountAddressDto } from '../dtos/account-address.dto';
import { AccountProfileDto } from '../dtos/account-profile.dto';
import { AccountDefaultAddress } from '../dtos/account-default-address.dto';
import { AccountUpdateProfileDto } from '../dtos/account-update-profile.dto';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  constructor(private http: HttpClient) {}

  getUserInfo() {
    const url = environment.apiBaseUrl + '/Accounts/Profiles';
    return this.http.get<AccountProfileDto>(url);
  }
  getUserAddress() {
    const url = environment.apiBaseUrl + '/Accounts/Profiles/Address';
    return this.http.get<AccountAddressDto[]>(url);
  }
  updateUserProfile(req: AccountUpdateProfileDto, file: File | string) {
    const url = environment.apiBaseUrl + '/Accounts/Profiles/Update';
    //ตรงนี้จะส่งข้อมูลไปแบบ multipart/form-data
    const formData = new FormData();
    if (file !== '') formData.append('userImage', file);
    formData.append('firstName', req.firstName);
    formData.append('lastName', req.lastName);
    formData.append('birthDate', req.birthDate.toDateString());
    formData.append('email', req.email);
    formData.append('phoneNumber', req.phoneNumber);
    formData.append('gender', req.gender);
    return this.http.put<unknown>(url, formData);
  }
}

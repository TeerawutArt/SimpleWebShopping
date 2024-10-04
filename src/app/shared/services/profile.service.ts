import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { AccountAddressDto } from '../dtos/account-address.dto';
import { AccountProfileDto } from '../dtos/account-profile.dto';
import { AccountDefaultAddress } from '../dtos/account-default-address.dto';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  constructor(private http: HttpClient) {}

  getUserInfo() {
    const req = environment.apiBaseUrl + '/Accounts/Profiles';
    return this.http.get<AccountProfileDto>(req);
  }
  getUserAddress() {
    const req = environment.apiBaseUrl + '/Accounts/Profiles/Address';
    return this.http.get<AccountAddressDto[]>(req);
  }
}

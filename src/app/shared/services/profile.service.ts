import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { AccountAddressDto } from '../dtos/account-address.dto';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  constructor(private http: HttpClient) {}

  getUserAddress() {
    const req = environment.apiBaseUrl + '/Accounts/Profiles/Address';
    return this.http.get<AccountAddressDto[]>(req);
  }
}

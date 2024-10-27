import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { AccountCreateAddressDto } from '../dtos/account-create-address.dto';
import { AccountDefaultAddress } from '../dtos/account-default-address.dto';
import { AccountUpdateAddressDto } from '../dtos/account-update-address.dto';

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  constructor(private http: HttpClient) {}

  // prettier-ignore
  getThaiProvinceData() {  //api ข้อมูลจังหวัดประเทศไทย
    const req ='https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_province_with_amphure_tambon.json';
    return this.http.get<any>(req);
  }
  createAddress(req: AccountCreateAddressDto) {
    let url = environment.apiBaseUrl + '/Accounts/Profiles/Address';
    return this.http.post<unknown>(url, req);
  }
  updateAddress(id: string, req: AccountUpdateAddressDto) {
    let url = environment.apiBaseUrl + '/Accounts/Profiles/Address/' + id;
    return this.http.put<unknown>(url, req);
  }
  deleteAddress(id: string) {
    let url = environment.apiBaseUrl + '/Accounts/Profiles/Address/' + id;
    return this.http.delete<unknown>(url);
  }
  updateDefaultAddress(id: string, req: AccountDefaultAddress) {
    let url =
      environment.apiBaseUrl + '/Accounts/Profiles/Address/Default/' + id;
    return this.http.put<unknown>(url, req);
  }
}

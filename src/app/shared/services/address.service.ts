import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { AccountCreateAddressDto } from '../dtos/account-create-address.dto';

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  constructor(private http: HttpClient) {}
  getThaiProvinceData() {
    //api ข้อมูลจังหวัดประเทศไทย
    const req =
      'https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_province_with_amphure_tambon.json';
    return this.http.get<any>(req);
  }
  createAddress(req: AccountCreateAddressDto) {
    let url = environment.apiBaseUrl + '/Accounts/Profiles/Address';
    return this.http.post<unknown>(url, req);
  }
}

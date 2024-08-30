import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ProductListDto } from '../dtos/product-list.dto';

@Injectable({
  providedIn: 'root',
})
export class ComponentHelperService {
  private loginModal = new Subject<boolean>();
  loginVisibleModal = this.loginModal.asObservable();

  setLoginVisible(visible: boolean) {
    this.loginModal.next(visible);
  }
}

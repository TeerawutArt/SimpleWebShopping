import { Component, LOCALE_ID, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { RippleModule } from 'primeng/ripple';

import {
  ConfirmationService,
  MessageService,
  PrimeNGConfig,
} from 'primeng/api';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AccountService } from './shared/services/account.service';
import { DatePipe, registerLocaleData } from '@angular/common';
//โหลด locale data ของ Thai
import localeTH from '@angular/common/locales/th';

//เพิ่ม locale data Thai ลงไปใน angular core
registerLocaleData(localeTH);
//
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RippleModule,
    ToastModule,
    FooterComponent,
    HeaderComponent,
    ConfirmDialogModule,
  ],
  providers: [
    MessageService,
    ConfirmationService,
    DatePipe,
    //Inject Token Locale_ID แทนที่ ด้วย th-TH
    { provide: LOCALE_ID, useValue: 'th-TH' },
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  constructor(
    private primengConfig: PrimeNGConfig,
    private accountService: AccountService
  ) {}
  async ngOnInit() {
    this.primengConfig.ripple = true;

    const res = await this.accountService.isUserAuthenticated();
    this.accountService.notifyAuthChange(res);
  }
}

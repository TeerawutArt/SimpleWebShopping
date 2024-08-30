import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MenuModule } from 'primeng/menu';
import { PanelModule } from 'primeng/panel';

import { CommonModule } from '@angular/common';
import { TabViewModule } from 'primeng/tabview';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { AccountService } from '../../shared/services/account.service';
import { CustomValidatorService } from '../../shared/services/custom-validator.service';
import { ComponentHelperService } from '../../shared/services/component-helper.service';
@Component({
  selector: 'app-notify-news',
  standalone: true,
  imports: [
    CardModule,
    PanelModule,
    AvatarModule,
    ButtonModule,
    MenuModule,
    TabViewModule,
    CommonModule,
    ScrollPanelModule,
  ],
  templateUrl: './notify-news.component.html',
  styleUrl: './notify-news.component.css',
})
export class NotifyNewsComponent implements OnInit {
  productForm!: FormGroup;
  isProcessing = false;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private accountService: AccountService,
    private customValidator: CustomValidatorService,
    private messageService: MessageService,
    private componentHelper: ComponentHelperService
  ) {}
  items: { label?: string; icon?: string; separator?: boolean }[] = [];
  tabs: { title: string; content: string }[] = [];
  ngOnInit() {
    this.tabs = [
      { title: 'Tab 1', content: 'Tab 1 Content' },
      { title: 'Tab 2', content: 'Tab 2 Content' },
      { title: 'Tab 3', content: 'Tab 3 Content' },
    ];
    this.items = [
      {
        label: 'Refresh',
        icon: 'pi pi-refresh',
      },
      {
        label: 'Search',
        icon: 'pi pi-search',
      },
      {
        separator: true,
      },
      {
        label: 'Delete',
        icon: 'pi pi-times',
      },
    ];
  }
}

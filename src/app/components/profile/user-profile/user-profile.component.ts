import { Component, OnInit } from '@angular/core';
import { ImageModule } from 'primeng/image';
import { ProfileService } from '../../../shared/services/profile.service';
import { HttpErrorResponse } from '@angular/common/http';

import { AccordionModule } from 'primeng/accordion';
import { environment } from '../../../../environments/environment.development';
import { CommonModule } from '@angular/common';
import { AccountProfileDto } from '../../../shared/dtos/account-profile.dto';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [ImageModule, AccordionModule, CommonModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css',
})
export class UserProfileComponent implements OnInit {
  loading = false;
  profile!: AccountProfileDto;
  rootImgUrl = environment.imageUrl;
  returnUrl = '';
  constructor(
    private profileService: ProfileService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.returnUrl = this.router.url;
    this.loading = true;
    this.getProfile();
  }
  getProfile() {
    this.profileService.getUserInfo().subscribe({
      next: (res) => {
        this.profile = res;

        console.log(this.profile);
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
      },
    });
  }
}

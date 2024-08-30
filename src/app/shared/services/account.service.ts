import { Injectable } from '@angular/core';
import { RegisterUserDto } from '../dtos/register-user.dto';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { LoginUserDto } from '../dtos/login-user.dto';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { TokenResultDto } from '../dtos/token-result.dto';
import { BehaviorSubject, firstValueFrom, Subject } from 'rxjs';

export const authKey = {
  accessToken: 'auth.jwt:' + location.origin,
  refreshToken: 'auth.rt:' + location.origin,
};
@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private authChangeSub = new BehaviorSubject<boolean>(false);
  authChanged = this.authChangeSub.asObservable();

  notifyAuthChange(isAuthenticated: boolean) {
    this.authChangeSub.next(isAuthenticated);
  }
  //install packet auth0 for jwt
  constructor(private http: HttpClient, private jwtHelper: JwtHelperService) {}
  register(req: RegisterUserDto) {
    let reqUrl = environment.apiBaseUrl + '/accounts/register';
    return this.http.post<unknown>(reqUrl, req);
  }
  login(req: LoginUserDto) {
    let reqUrl = environment.apiBaseUrl + '/accounts/login';
    return this.http.post<TokenResultDto>(reqUrl, req);
  }
  logout() {
    let reqUrl = environment.apiBaseUrl + '/accounts/token/revoke';
    return this.http.post<unknown>(reqUrl, {});
  }
  refresh() {
    let reqUrl = environment.apiBaseUrl + '/accounts/token/refresh';
    const req: RefreshTokenDto = {
      accessToken: localStorage.getItem(authKey.accessToken)!,
      refreshToken: localStorage.getItem(authKey.refreshToken)!,
    };
    return this.http.post<TokenResultDto>(reqUrl, req);
  }

  async isUserAuthenticated() {
    const accessToken = localStorage.getItem(authKey.accessToken);

    if (!accessToken) {
      return false;
    }

    if (!this.jwtHelper.isTokenExpired(accessToken)) {
      return true;
    }

    // try to refresh token
    try {
      const res = await firstValueFrom<TokenResultDto>(this.refresh());

      localStorage.setItem(authKey.accessToken, res.accessToken!);
      localStorage.setItem(authKey.refreshToken, res.refreshToken!);

      return true;
    } catch (err) {
      if (!environment.production) {
        console.log(err);
      }
    }

    localStorage.removeItem(authKey.accessToken);
    localStorage.removeItem(authKey.refreshToken);

    return false;
  }
  getUserInfo() {
    const token = localStorage.getItem(authKey.accessToken);
    if (token) {
      const decodeToken = this.jwtHelper.decodeToken(token);
      const userName = decodeToken['preferred_username'];
      const fullName = decodeToken['name'];
      const role = decodeToken['role'];
      const imgUrl = decodeToken['img'];
      const userInfo = {
        userName: userName,
        fullName: fullName,
        role: role,
        imgUrl: imgUrl,
      };
      return userInfo;
    }
    return null;
  }
  //check role
  isUserInRole(role: string) {
    const token = localStorage.getItem(authKey.accessToken);
    if (token) {
      const decodeToken = this.jwtHelper.decodeToken(token);
      const currentRole = decodeToken['role'];
      if (currentRole && currentRole instanceof Array) {
        return currentRole.findIndex((r) => r === role) >= 0;
      }
      return currentRole === role;
    }
    return false;
  }
}

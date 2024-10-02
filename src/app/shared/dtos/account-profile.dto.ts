import { AccountAddressDto } from './account-address.dto';

export interface AccountProfileDto {
  userImageURL: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  gender: string;
  birthDate: Date;
  email: string;
  addresses: Array<AccountAddressDto>;
}

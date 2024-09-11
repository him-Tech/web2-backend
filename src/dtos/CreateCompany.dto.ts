import { CompanyAddressId, ThirdPartyUserId, UserId } from "../model";

export interface CreateCompanyDto {
  taxId: string | null;
  name: string | null;
  contactPersonId: UserId | ThirdPartyUserId | null;
  addressId: CompanyAddressId | null;
}

import { AddressId } from "../model";

export interface CreateCompanyDto {
  taxId: string | null;
  name: string | null;
  addressId: AddressId | null;
}

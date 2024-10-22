import { CompanyId, UserId } from "../model";

export interface CreateManualInvoiceDto {
  number: number;
  companyId?: CompanyId;
  userId?: UserId;
  paid: boolean;
  dowAmount: number;
}

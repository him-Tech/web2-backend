import { CompanyId, CompanyUserRole } from "../model";

// TODO: to put in an other place?
export interface CreateCompanyUserPermissionTokenBodyParams {
  userName?: string;
  userEmail: string;
  token: string;
  companyId: CompanyId;
  companyUserRole: CompanyUserRole;
  expiresAt: Date;
}

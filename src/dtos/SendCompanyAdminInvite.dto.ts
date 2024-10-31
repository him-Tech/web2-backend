import { CompanyId, CompanyUserRole } from "../model";

export interface SendCompanyAdminInviteBodyParams {
  userName: string | null;
  userEmail: string;
  companyId: CompanyId;
  companyUserRole: CompanyUserRole;
}

export interface SendCompanyAdminInviteQueryParams {}

export interface SendCompanyAdminInviteResponse {}

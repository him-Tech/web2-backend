import { CompanyId, CompanyUserRole } from "../model";

export interface SendCompanyAdminInviteDto {
  userEmail: string;
  companyId: CompanyId;
  companyUserRole: CompanyUserRole;
}

export interface SendCompanyAdminInviteQueryParams {}

export interface SendCompanyAdminInviteResponse {}

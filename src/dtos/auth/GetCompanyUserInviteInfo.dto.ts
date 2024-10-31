export interface GetCompanyUserInviteInfoBodyParams {}

export interface GetCompanyUserInviteInfoQueryParams {
  token: string;
}

export interface GetCompanyUserInviteInfoResponse {
  userName: string | null;
  userEmail: string;
}

export interface RegisterDto {
  email: string;
  password: string;
}

export interface RegisterQueryParams {
  companyToken?: string;
}

export interface RegisterResponse {}

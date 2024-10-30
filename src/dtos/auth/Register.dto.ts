import { User } from "../../model";

export interface RegisterBodyParams {
  name: string | null;
  email: string;
  password: string;
}

export interface RegisterQueryParams {
  companyToken?: string;
}

export interface RegisterResponse {
  user: User;
}

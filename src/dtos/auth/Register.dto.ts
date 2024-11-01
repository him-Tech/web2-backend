import { User } from "../../model";

export interface RegisterBody {
  name: string | null;
  email: string;
  password: string;
}

export interface RegisterQuery {
  companyToken?: string;
}

export interface RegisterResponse {
  user: User;
}

import { User } from "../../model";

export interface LoginBody {
  email: string;
  password: string;
}

export interface LoginQuery {}

export interface LoginResponse {
  user: User;
}

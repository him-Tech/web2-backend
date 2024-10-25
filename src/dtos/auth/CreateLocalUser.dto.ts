import { UserRole } from "../../model";

export interface CreateLocalUserDto {
  name?: string;
  email: string;
  password: string;
  role: UserRole;
}

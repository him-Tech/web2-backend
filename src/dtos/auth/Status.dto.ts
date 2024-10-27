import { User } from "../../model";

export interface StatusDto {}

export interface StatusQueryParams {}

export interface StatusResponse {
  user: User | null;
}

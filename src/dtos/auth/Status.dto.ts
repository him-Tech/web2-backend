import { User } from "../../model";

export interface StatusBody {}

export interface StatusQuery {}

export interface StatusResponse {
  user: User | null;
}

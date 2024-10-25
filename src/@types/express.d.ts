import { CompanyUserPermissionToken } from "../model";

declare global {
  namespace Express {
    interface Request {
      companyUserPermissionToken?: CompanyUserPermissionToken; // Replace TokenData with the actual type you want to use
    }
  }
}

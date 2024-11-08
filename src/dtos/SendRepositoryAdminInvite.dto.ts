import { DowCurrency, RepositoryId, RepositoryUserRole } from "../model";
import Decimal from "decimal.js";

// TODO: should be renamed to SendRepositoryRoleInviteBody
export interface SendRepositoryAdminInviteBody {
  userName: string | null;
  userEmail: string;
  userGithubOwnerLogin: string;
  repositoryId: RepositoryId;
  repositoryUserRole: RepositoryUserRole;
  dowRate: Decimal;
  dowCurrency: DowCurrency;
}

export interface SendRepositoryAdminInviteQuery {}

export interface SendRepositoryAdminInviteResponse {}

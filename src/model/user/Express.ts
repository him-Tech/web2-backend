import { UserId } from "./User";
import { ThirdPartyUserId } from "./ThirdPartyUser";

declare global {
  namespace Express {
    interface User {
      id: UserId | ThirdPartyUserId;
    }
  }
}

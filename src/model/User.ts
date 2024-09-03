import { CompanyId } from "./Company";

export class UserId {
  id: number;

  constructor(id: number) {
    this.id = id;
  }
}

enum UserRole {
  user = 'user'
}

export class User implements Express.User {
  id: UserId;
  name: string | null;
  email: string;
  hashedPassword: string;
  role: UserRole

  // githubAccount: string | null; // GitHub login TODO: define type
  // company: CompanyId | null; // TODO: in the future there could have several companies
  // ossProject: string | null; // TODO: define type
  //
  //
  // email: string; // GitHub login
  // name: string | null;

 constructor(id: UserId, name: string | null, email: string, hashedPassword: string, role: UserRole) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.hashedPassword = hashedPassword;
    this.role = role;
 }
}

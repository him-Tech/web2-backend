export class UserId {
  id: number;

  constructor(id: number) {
    this.id = id;
  }
}

enum UserRole {
  user = "user",
}

export class User implements Express.User {
  id: UserId;
  name: string | null;
  email: string;
  hashedPassword: string;
  role: UserRole;

  constructor(
    id: UserId,
    name: string | null,
    email: string,
    hashedPassword: string,
    role: UserRole,
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.hashedPassword = hashedPassword;
    this.role = role;
  }

  // githubAccount: string | null; // GitHub login TODO: define type
  // company: CompanyId | null; // TODO: in the future there could have several companies
  // ossProject: string | null; // TODO: define type
  //
  //
  // email: string; // GitHub login
  // name: string | null;

  static fromRaw(row: any): User | Error {
    if (!row.id || typeof row.id !== "number") {
      return new Error("Invalid raw: id is missing or not a string");
    }
    if (!row.email || typeof row.email !== "string") {
      return new Error("Invalid raw: email is missing or not a string");
    }
    if (!row.hashed_password || typeof row.hashed_password !== "string") {
      return new Error(
        "Invalid raw: hashed_password is missing or not a string",
      );
    }
    if (!row.role || typeof row.role !== "string") {
      return new Error("Invalid raw: role is missing or not a string");
    }
    return new User(
      new UserId(row.id),
      row.name ? row.name : null,
      row.email,
      row.hashed_password,
      row.role,
    );
  }
}

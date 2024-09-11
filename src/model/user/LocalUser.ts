export class LocalUser {
  name: string | null;
  email: string;
  hashedPassword: string;

  constructor(name: string | null, email: string, hashedPassword: string) {
    this.name = name;
    this.email = email;
    this.hashedPassword = hashedPassword;
  }

  static fromRaw(row: any): LocalUser | Error {
    if (!row.email || typeof row.email !== "string") {
      return new Error("Invalid raw: email is missing or not a string");
    }
    if (!row.hashed_password || typeof row.hashed_password !== "string") {
      return new Error(
        "Invalid raw: hashed_password is missing or not a string",
      );
    }
    return new LocalUser(
      row.name ? row.name : null,
      row.email,
      row.hashed_password,
    );
  }
}

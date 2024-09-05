export interface CreateUserDto {
  name: string | null;
  email: string;
  hashedPassword: string;
}

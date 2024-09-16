export class ValidationError extends Error {
  constructor(message: string, data: any) {
    super(`${message}. Received: ${JSON.stringify(data, null, 2)}`);
  }
}

class FieldValidationError extends ValidationError {
  constructor(field: string, data: any, type: string) {
    super(`Invalid type: ${field} is not a ${type}`, data);
  }
}

class StringValidationError extends FieldValidationError {
  constructor(field: string, data: any) {
    super(field, data, "string");
  }
}

class NumberValidationError extends FieldValidationError {
  constructor(field: string, data: any) {
    super(field, data, "number");
  }
}

class BooleanValidationError extends FieldValidationError {
  constructor(field: string, data: any) {
    super(field, data, "boolean");
  }
}

class ArrayValidationError extends FieldValidationError {
  constructor(field: string, data: any) {
    super(field, data, "array");
  }
}

class ObjectValidationError extends FieldValidationError {
  constructor(field: string, data: any) {
    super(field, data, "object");
  }
}

class EnumValidationError extends ValidationError {
  constructor(field: string, data: any, enumType: string) {
    super(`${field}" is not contained in the ${enumType} enum.`, data);
  }
}

export class Validator {
  private data: any;
  private errors: FieldValidationError[] = [];

  constructor(data: any) {
    this.data = data;
  }

  getFirstError(): FieldValidationError | null {
    return this.errors[0] || null;
  }

  optionalString(field: string): void {
    const value = this.data[field];
    if (value === undefined || value === null) {
    } else if (typeof value !== "string") {
      this.errors.push(new StringValidationError(this.data, field));
    }
  }

  requiredString(field: string): void {
    const value = this.data[field];
    if (typeof value !== "string") {
      this.errors.push(new StringValidationError(this.data, field));
    }
  }

  optionalNumber(field: string): void {
    const value = this.data[field];
    if (value === undefined || value === null) {
    } else if (typeof value !== "number") {
      this.errors.push(new NumberValidationError(this.data, field));
      return;
    }
  }

  requiredNumber(field: string): void {
    const value = this.data[field];
    if (typeof value !== "number") {
      this.errors.push(new NumberValidationError(this.data, field));
    }
  }

  requiredBoolean(field: string): void {
    const value = this.data[field];
    if (typeof value !== "boolean") {
      this.errors.push(new BooleanValidationError(field, this.data));
    }
  }

  optionalObject(field: string): void {
    const value = this.data[field];
    if (value === undefined || value === null) {
    } else if (typeof value !== "object") {
      this.errors.push(new ObjectValidationError(field, this.data));
    }
  }

  requiredObject(field: string): void {
    const value = this.data[field];
    if (typeof value !== "object") {
      this.errors.push(new ObjectValidationError(field, this.data));
    }
  }

  optionalArray(field: string): void {
    const value = this.data[field];
    if (value === undefined || value === null) {
    } else if (!Array.isArray(value)) {
      this.errors.push(new ArrayValidationError(field, this.data));
    }
  }

  requiredEnum(field: string, enumType: any): void {
    const value = this.data[field];
    const enumValues = Object.values(enumType);
    if (!enumValues.includes(value)) {
      this.errors.push(new EnumValidationError(field, value, enumType.name));
    }
  }
}

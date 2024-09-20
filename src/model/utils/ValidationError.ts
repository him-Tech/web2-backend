import e from "express";
import { OwnerType } from "../Owner";

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
  constructor(field: string, data: any, enumType: string[]) {
    super(`${field}" is not contained in enum type ${enumType}`, data);
  }
}

export class Validator {
  private data: any;
  private errors: FieldValidationError[] = [];

  constructor(data: any) {
    this.data = data;
  }

  private getValue(path: string | string[]): any {
    if (typeof path === "string") {
      return this.data[path];
    } else if (Array.isArray(path)) {
      return this.getValueFromPath(path);
    }
  }

  private getValueFromPath(path: string[]): any {
    let value = this.data;
    for (const key of path) {
      value = value[key];
      if (value === undefined) {
        return undefined;
      }
    }
    return value;
  }

  getFirstError(): FieldValidationError | null {
    return this.errors[0] || null;
  }

  optionalString(path: string | string[]): string | undefined {
    const value = this.getValue(path);
    if (value === undefined || value === null) {
    } else if (typeof value !== "string") {
      this.errors.push(new StringValidationError(value, this.data));
    } else {
      return value;
    }
  }

  // @ts-ignore
  requiredString(path: string | string[]): string {
    const value = this.getValue(path);
    if (typeof value !== "string") {
      this.errors.push(new StringValidationError(value, this.data));
    } else {
      return value;
    }
  }

  optionalNumber(path: string | string[]): void {
    let value = this.getValue(path);

    if (typeof value === "string") {
      value = parseFloat(value);
    }

    if (value === undefined || value === null) {
    } else if (typeof value !== "number") {
      this.errors.push(new NumberValidationError(this.data, value));
      return;
    }
  }

  // @ts-ignore
  requiredNumber(path: string | string[]): number {
    let value = this.getValue(path);

    if (typeof value === "string") {
      value = parseFloat(value);
    }

    if (typeof value !== "number" || isNaN(value)) {
      this.errors.push(new NumberValidationError(value, this.data));
    } else {
      return value;
    }
  }

  requiredBoolean(path: string | string[]): void {
    const value = this.getValue(path);
    if (typeof value !== "boolean") {
      this.errors.push(new BooleanValidationError(value, this.data));
    }
  }

  optionalObject(path: string | string[]): void {
    const value = this.getValue(path);
    if (value === undefined || value === null) {
    } else if (typeof value !== "object") {
      this.errors.push(new ObjectValidationError(value, this.data));
    }
  }

  // @ts-ignore
  requiredObject(path: string | string[]): any {
    const value = this.getValue(path);
    if (typeof value !== "object") {
      this.errors.push(new ObjectValidationError(value, this.data));
    } else {
      return value;
    }
  }

  optionalArray(path: string | string[]): void {
    const value = this.getValue(path);
    if (value === undefined || value === null) {
    } else if (!Array.isArray(value)) {
      this.errors.push(new ArrayValidationError(value, this.data));
    }
  }

  requiredArray(path: string | string[]): void {
    const value = this.getValue(path);

    if (!Array.isArray(value)) {
      const p = typeof path === "string" ? path : path.join(".");
      this.errors.push(new ArrayValidationError(p, this.data));
    }
  }

  requiredEnum<EnumType extends string>(
    path: string | string[],
    enumType: EnumType[],
    // @ts-ignore
  ): EnumType {
    const value = this.getValue(path) as EnumType;
    const enumValues = Object.values(enumType) as EnumType[];
    if (!enumValues.includes(value)) {
      this.errors.push(new EnumValidationError(value, value, enumType));
    } else {
      return value;
    }
  }
}

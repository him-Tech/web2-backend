export class ThirdPartyUserId {
  id: string;

  constructor(id: string) {
    this.id = id;
  }
}

export enum Provider {
  GitHub = "github",
}

export class Email {
  value: string;
  type: string | null;

  constructor(value: string, type: string) {
    this.value = value;
    this.type = type;
  }

  static fromJson(json: any): Email | Error {
    if (!json.value || typeof json.value !== "string") {
      return new Error("Invalid JSON: value is missing or not a string");
    }
    if (json.type && typeof json.type !== "string") {
      return new Error("Invalid JSON: type is not a string");
    }

    return new Email(json.value, json.type);
  }
}

export class Photo {
  value: string;

  constructor(value: string) {
    this.value = value;
  }

  static fromJson(json: any): Photo | Error {
    if (!json.value || typeof json.value !== "string") {
      return new Error("Invalid JSON: value is missing or not a string");
    }

    return new Photo(json.value);
  }
}

export class ThirdPartyUser implements Express.User {
  provider: Provider;
  id: ThirdPartyUserId;
  displayName: string | null;
  username: string | null;
  name: {
    familyName: string | null;
    givenName: string | null;
    middleName: string | null;
  };
  emails: Email[];
  photos: Photo[];

  constructor(
    provider: Provider,
    id: ThirdPartyUserId,
    displayName: string | null,
    username: string | null,
    name: {
      familyName: string | null;
      givenName: string | null;
      middleName: string | null;
    },
    emails: Email[],
    photos: Photo[],
  ) {
    this.provider = provider;
    this.id = id;
    this.displayName = displayName;
    this.username = username;
    this.name = name;
    this.emails = emails;
    this.photos = photos;
  }

  static fromJson(json: any): ThirdPartyUser | Error {
    if (!json.provider || typeof json.provider !== "string") {
      return new Error("Invalid raw: provider is missing or not a string");
    }
    if (!json.id || typeof json.id !== "string") {
      return new Error("Invalid raw: id is missing or not a string");
    }
    if (json.displayName && typeof json.displayName !== "string") {
      return new Error(
        `Invalid raw: displayName is not a string. Received: ${JSON.stringify(json, null, 2)}`,
      );
    }
    if (json.username && typeof json.username !== "string") {
      return new Error("Invalid raw: username is missing or not a string");
    }
    if (json.name && typeof json.name !== "object") {
      return new Error("Invalid raw: name is not an object");
    }
    if (json.emails && !Array.isArray(json.emails)) {
      return new Error("Invalid raw: emails is not an array");
    }
    if (json.photos && !Array.isArray(json.photos)) {
      return new Error("Invalid raw: photos is not an array");
    }

    const emails: Email[] = [];
    if (json.emails) {
      json.emails.forEach((email: any) => {
        const e = Email.fromJson(email);
        if (e instanceof Error) {
          throw e;
        }
        emails.push(e);
      });
    }

    const photos: Photo[] = [];
    if (json.photos) {
      json.photos.forEach((photo: any) => {
        const p = Photo.fromJson(photo);
        if (p instanceof Error) {
          throw p;
        }
        photos.push(p);
      });
    }

    if (!json.name) {
      json.name = {};
    }

    return new ThirdPartyUser(
      json.provider as Provider,
      new ThirdPartyUserId(json.id),
      json.displayName ? json.displayName : null,
      json.username ? json.username : null,
      {
        familyName: json.name.familyName || null,
        givenName: json.name.givenName || null,
        middleName: json.name.middleName || null,
      },
      emails,
      photos,
    );
  }

  static fromRaw(row: any): ThirdPartyUser | Error {
    if (!row.provider || typeof row.provider !== "string") {
      return new Error("Invalid raw: provider is missing or not a string");
    }
    if (!row.id || typeof row.id !== "string") {
      return new Error("Invalid raw: id is missing or not a string");
    }
    if (row.display_name && typeof row.display_name !== "string") {
      return new Error(
        `Invalid raw: display_name is not a string. Received: ${JSON.stringify(row, null, 2)}`,
      );
    }
    if (row.username && typeof row.username !== "string") {
      return new Error("Invalid raw: username is missing or not a string");
    }
    if (!row.name || typeof row.name !== "object") {
      return new Error("Invalid raw: name is missing or not an object");
    }
    if (row.emails && !Array.isArray(row.emails)) {
      return new Error("Invalid raw: emails is not an array");
    }
    if (row.photos && !Array.isArray(row.photos)) {
      return new Error("Invalid raw: photos is not an array");
    }

    const emails: Email[] = [];
    if (row.emails) {
      row.emails.forEach((email: any) => {
        const e = Email.fromJson(email);
        if (e instanceof Error) {
          throw e;
        }
        emails.push(e);
      });
    }

    const photos: Photo[] = [];
    if (row.photos) {
      row.photos.forEach((photo: any) => {
        const p = Photo.fromJson(photo);
        if (p instanceof Error) {
          throw p;
        }
        photos.push(p);
      });
    }

    if (!row.name) {
      row.name = {};
    }

    return new ThirdPartyUser(
      row.provider as Provider,
      new ThirdPartyUserId(row.id),
      row.display_name ? row.display_name : null,
      row.username ? row.username : null,
      {
        familyName: row.name.familyName || null,
        givenName: row.name.givenName || null,
        middleName: row.name.middleName || null,
      },
      emails,
      photos,
    );
  }
}

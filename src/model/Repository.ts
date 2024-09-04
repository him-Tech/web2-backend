import { Owner, OwnerId } from "./Owner";
import deepEqual from "deep-equal";

export class RepositoryId {
  id: number;

  constructor(id: number) {
    this.id = id;
  }

  static fromGitHubApi(json: any): RepositoryId | Error {
    if (!json.id || typeof json.id !== "number") {
      return new Error("Invalid JSON: id is missing or not a string");
    }

    return new RepositoryId(json.id);
  }

  static fromBackend(json: any): RepositoryId | Error {
    if (!json.github_id || typeof json.github_id !== "number") {
      return new Error("Invalid JSON: github_id is missing or not a string");
    }

    return new RepositoryId(json.github_id);
  }
}

export class Repository {
  id: RepositoryId;
  ownerId: OwnerId;
  name: string;
  htmlUrl: string;
  description: string;

  constructor(
    id: RepositoryId,
    ownerId: OwnerId,
    name: string,
    htmlUrl: string,
    description: string,
  ) {
    this.id = id;
    this.ownerId = ownerId;
    this.name = name;
    this.htmlUrl = htmlUrl;
    this.description = description;
  }

  // GitHub API: https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#get-a-repository
  // Example:
  // Repo owned by an organization: https://api.github.com/repos/open-source-economy/frontend
  // Repo owned by a user: https://api.github.com/repos/laurianemollier/strongVerbes
  //
  // NOTE: Repo can be queried by owner id and repository id.
  // This does not work: https://api.github.com/repos/141809657/701996033
  // But that works: https://api.github.com/repositories/701996033
  // See discussion: https://github.com/octokit/octokit.rb/issues/483
  static fromGitHubApi(json: any): Repository | Error {
    const repositoryId = RepositoryId.fromGitHubApi(json);
    if (repositoryId instanceof Error) {
      return repositoryId;
    }

    if (!json.owner) {
      return new Error("Invalid JSON: owner");
    }
    const ownerId: OwnerId | Error = OwnerId.fromGitHubApi(json.owner);
    if (ownerId instanceof Error) {
      return ownerId;
    }

    if (!json.name || typeof json.name !== "string") {
      return new Error("Invalid JSON: name is missing or not a string");
    }
    if (!json.html_url || typeof json.html_url !== "string") {
      return new Error("Invalid JSON: html_url is missing or not a string");
    }
    if (!json.description || typeof json.description !== "string") {
      return new Error("Invalid JSON: description is missing or not a string");
    }

    return new Repository(
      repositoryId,
      ownerId,
      json.name,
      json.html_url,
      json.description,
    );
  }

  static fromBackend(json: any): Repository | Error {
    const repositoryId = RepositoryId.fromBackend(json);
    if (repositoryId instanceof Error) {
      return repositoryId;
    }
    if (!json.github_owner_id || typeof json.github_owner_id !== "number") {
      return new Error(
        "Invalid JSON: github_owner_id is missing or not a string",
      );
    }
    if (!json.github_name || typeof json.github_name !== "string") {
      return new Error("Invalid JSON: github_name is missing or not a string");
    }
    if (!json.github_html_url || typeof json.github_html_url !== "string") {
      return new Error(
        "Invalid JSON: github_html_url is missing or not a string",
      );
    }
    if (
      !json.github_description ||
      typeof json.github_description !== "string"
    ) {
      return new Error(
        "Invalid JSON: github_description is missing or not a string",
      );
    }

    return new Repository(
      repositoryId,
      new OwnerId(json.github_owner_id),
      json.github_name,
      json.github_html_url,
      json.github_description,
    );
  }

  // Please note
  // If a nested child document is included and no child document ID is provided, the child document will be given a unique ID.
  // If a nested child document is included and no conflicting child document ID exists, the child document will be created.
  // If a nested child document is included and the child document ID already exists, the child document will be updated.
  // ref: https://appwrite.io/docs/products/databases/relationships#create-documents
  toBackend(owner: Owner | null = null) {
    const object = {
      github_id: this.id.id,
      github_owner_id: this.ownerId.id,
      github_name: this.name,
      github_html_url: this.htmlUrl,
      github_description: this.description,
    };

    if (owner && !deepEqual(owner.id, this.ownerId)) {
      return Error("The owner ids does not match");
    } else if (owner && deepEqual(owner.id, this.ownerId)) {
      return {
        ...object,
        github_owner_relationship: {
          $id: this.ownerId.id.toString(),
          ...owner.toBackend(),
        },
      };
    } else {
      return {
        ...object,
        github_owner_relationship: this.ownerId.id.toString(),
      };
    }
  }
}

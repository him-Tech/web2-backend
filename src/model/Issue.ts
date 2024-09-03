import { Owner, OwnerId, UserOwner } from "./Owner";
import { Repository, RepositoryId } from "./Repository";
import deepEqual from "deep-equal";

// impossible to query GitHub api by issue id
// only by repository id and issue number
export class IssueId {
  id: number;
  number: number;

  // TODO: for the DB we need to store the repository id as well
  constructor(id: number, number: number) {
    this.id = id;
    this.number = number;
  }

  static fromJson(json: any): IssueId | Error {
    if (!json.id || typeof json.id !== "number") {
      return new Error("Invalid JSON: id is missing or not a string");
    }
    if (!json.number || typeof json.number !== "number") {
      return new Error("Invalid JSON: number is missing or not a string");
    }

    return new IssueId(json.id, json.number);
  }
}

export class Issue {
  id: IssueId;
  repositoryId: RepositoryId;
  title: string;
  htmlUrl: string;
  createdAt: Date;
  closedAt: Date | null;
  openBy: OwnerId;
  body: string;

  constructor(id: IssueId, repositoryId: RepositoryId, title: string, htmlUrl: string, createdAt: Date, closedAt: Date | null, openBy: OwnerId, body: string) {
    this.id = id;
    this.title = title;
    this.repositoryId = repositoryId;
    this.htmlUrl = htmlUrl;
    this.createdAt = createdAt;
    this.closedAt = closedAt;
    this.openBy = openBy;
    this.body = body;
  }

  // GitHub API: https://docs.github.com/en/rest/issues/issues?apiVersion=2022-11-28#get-an-issue
  // Example: https://api.github.com/repos/scala/scala/issues/1
  //
  // NOTE: Issue can be queried by owner id and repository id.
  // This does not work: https://api.github.com/repos/795990/2888818/issues/1
  // But that works: https://api.github.com/repositories/2888818/issues/1
  // See discussion: https://github.com/octokit/octokit.rb/issues/483
  //
  // github api does not return the repository id
  static fromGitHubApi(repositoryId: RepositoryId, json: any): Issue | Error {
    const issueId = IssueId.fromJson(json);
    if (issueId instanceof Error) {
      return issueId;
    }
    if (!json.title || typeof json.title !== "string") {
      return new Error("Invalid JSON: title is missing or not a string");
    }
    if (!json.html_url || typeof json.html_url !== "string") {
      return new Error("Invalid JSON: html_url is missing or not a string");
    }
    if (!json.created_at || typeof json.created_at !== "string") {
      return new Error("Invalid JSON: created_at is missing or not a string");
    }
    if (json.closed_at && typeof json.closed_at !== "string") {
      // optional
      return new Error("Invalid JSON: closed_at is not a string");
    }
    if (!json.user || typeof json.user !== "object") {
      return new Error("Invalid JSON: user is missing or not an object");
    }
    const ownerId: OwnerId | Error = OwnerId.fromGitHubApi(json.user);
    if (ownerId instanceof Error) {
      return ownerId;
    }
    if (!json.body || typeof json.body !== "string") {
      return new Error("Invalid JSON: body is missing or not a string");
    }

    return new Issue(
      issueId,
      repositoryId,
      json.title,
      json.html_url,
      new Date(json.created_at), // TODO: can throw an error?
      json.closed_at ? new Date(json.closed_at) : null, // TODO: can throw an error?
      ownerId,
      json.body,
    );
  }

  static fromBackend(json: any): Issue | Error {
    if (!json.github_id || typeof json.github_id !== "number") {
      return new Error("Invalid JSON: github_id is missing or not a string");
    }
    if (!json.github_number || typeof json.github_number !== "number") {
      return new Error("Invalid JSON: github_number is missing or not a string");
    }
    if (!json.github_repository_id || typeof json.github_repository_id !== "number") {
      return new Error("Invalid JSON: github_repository_id is missing or not a string");
    }
    if (!json.github_title || typeof json.github_title !== "string") {
      return new Error("Invalid JSON: github_title is missing or not a string");
    }
    if (!json.github_html_url || typeof json.github_html_url !== "string") {
      return new Error("Invalid JSON: github_html_url is missing or not a string");
    }
    if (!json.github_created_at || typeof json.github_created_at !== "string") {
      return new Error("Invalid JSON: github_created_at is missing or not a string");
    }
    if (json.github_closed_at && typeof json.github_closed_at !== "string") {
      // optional
      return new Error("Invalid JSON: github_closed_at is not a string");
    }
    if (!json.github_open_by_owner_id || typeof json.github_open_by_owner_id !== "number") {
      return new Error("Invalid JSON: github_open_by_owner_id is missing or not a number");
    }
    if (!json.github_body || typeof json.github_body !== "string") {
      return new Error("Invalid JSON: github_body is missing or not a string");
    }
    const issueId = new IssueId(json.github_id, json.github_number);
    const repositoryId = new RepositoryId(json.github_repository_id);
    const githubOpenByOwnerId = new OwnerId(json.github_open_by_owner_id);
    return new Issue(
      issueId,
      repositoryId,
      json.github_title,
      json.github_html_url,
      new Date(json.github_created_at),
      json.github_closed_at ? new Date(json.github_closed_at) : null,
      githubOpenByOwnerId,
      json.github_body,
    );
  }

  toBackend(owner: Owner | null = null, repository: Repository | null = null) {
    const object = {
      github_id: this.id.id,
      github_number: this.id.number,
      github_repository_id: this.repositoryId.id,
      github_title: this.title,
      github_html_url: this.htmlUrl,
      github_created_at: this.createdAt.toISOString(),
      github_closed_at: this.closedAt ? this.closedAt.toISOString() : null,
      github_open_by_owner_id: this.openBy.id,
      github_body: this.body,
    };

    if (repository && !deepEqual(repository.id, this.repositoryId)) {
      return Error("The repository ids does not match");
    } else if (repository && deepEqual(repository.id, this.repositoryId)) {
      return {
        ...object,
        github_repository_relationship: {
          $id: this.repositoryId.id.toString(),
          ...repository.toBackend(owner),
        },
      };
    } else {
      return {
        ...object,
        github_repository_relationship: this.repositoryId.id.toString(),
      };
    }
  }
}

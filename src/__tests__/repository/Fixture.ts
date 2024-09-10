import {
  Issue,
  IssueId,
  Owner,
  OwnerId,
  OwnerType,
  Repository,
  RepositoryId,
} from "../../model";

export const Fixture = {
  id(): number {
    return Math.floor(Math.random() * 1000000);
  },
  owner(ownerId: number, payload: string = "payload"): Owner {
    return new Owner(
      new OwnerId(ownerId),
      OwnerType.Organization,
      "Open Source Economy",
      "url",
      payload,
    );
  },
  repository(
    repositoryId: number,
    ownerId: number,
    payload: string = "payload",
  ): Repository {
    return new Repository(
      new RepositoryId(repositoryId),
      new OwnerId(ownerId),
      "Repository Name",
      "https://example.com",
      payload,
    );
  },
  issue(
    issueId: number,
    numberId: number,
    repositoryId: number,
    openByOwnerId: number,
  ): Issue {
    return new Issue(
      new IssueId(issueId, numberId),
      new RepositoryId(repositoryId),
      "issue title",
      "url",
      new Date("2022-01-01T00:00:00.000Z"),
      null,
      new OwnerId(openByOwnerId),
      "body",
    );
  },
};

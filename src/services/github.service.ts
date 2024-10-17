import { Issue, IssueId, Owner, Repository, RepositoryId } from "../model";
import { config } from "../config";

export function getGitHubAPI(): GitHubApi {
  return new GitHubApiImpl();
}

export interface GitHubApi {
  // returns the issue and the owner that opened the issue
  getIssue(issueId: IssueId): Promise<[Issue, Owner]>;

  getOwnerAndRepository(
    repositoryId: RepositoryId,
  ): Promise<[Owner, Repository]>;
}

class GitHubApiImpl implements GitHubApi {
  async getIssue(issueId: IssueId): Promise<[Issue, Owner]> {
    try {
      const response: Response = await fetch(
        `https://api.github.com/repos/${issueId.repositoryId.ownerId.login.trim()}/${issueId.repositoryId.name.trim()}/issues/${issueId.number}`,
        {
          method: "GET",
          headers: {
            Authorization: "Token " + config.github.requestToken,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );
      if (response.ok) {
        const json = await response.json();
        const issue: Issue | Error = Issue.fromGithubApi(
          issueId.repositoryId,
          json,
        );
        const openBy: Owner | Error = Owner.fromGithubApi(json.user);
        if (issue instanceof Error) {
          return Promise.reject(issue);
        } else if (openBy instanceof Error) {
          return Promise.reject(openBy);
        } else {
          return [issue, openBy];
        }
      } else {
        return Promise.reject(
          new Error(
            "No project exist on GitHub.com with this owner and repository ",
          ),
        ); // TODO: improve error handling
      }
    } catch (error) {
      return Promise.reject(new Error("Call failed")); // TODO: improve error handling
    }
  }

  async getOwnerAndRepository(
    repositoryId: RepositoryId,
  ): Promise<[Owner, Repository]> {
    try {
      const response: Response = await fetch(
        `https://api.github.com/repos/${repositoryId.ownerId.login.trim()}/${repositoryId.name.trim()}`,
        {
          method: "GET",
          headers: {
            Authorization: "Token " + process.env.REACT_APP_GITHUB_TOKEN,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );
      if (response.ok) {
        const json = await response.json();
        if (!json.owner) {
          return Promise.reject(new Error("Invalid JSON: owner"));
        }

        const owner: Owner | Error = Owner.fromGithubApi(json.owner);
        const repo: Repository | Error = Repository.fromGithubApi(json);
        if (repo instanceof Error) {
          return Promise.reject(repo);
        } else if (owner instanceof Error) {
          return Promise.reject(owner);
        } else {
          return [owner, repo];
        }
      } else {
        return Promise.reject(
          new Error(
            "No project exist on GitHub.com with this owner and repository ",
          ),
        ); // TODO: improve error handling
      }
    } catch (error) {
      return Promise.reject(new Error("Call failed")); // TODO: improve error handling
    }
  }
}

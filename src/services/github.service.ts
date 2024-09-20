import { Issue, Owner, OwnerId, Repository, RepositoryId } from "../model";

if (!process.env.GITHUB_TOKEN) {
  throw new Error("GITHUB_TOKEN is not set");
}

export function getGitHubAPI(): GitHubApi {
  return new GitHubApiImpl();
}

export interface GitHubApi {
  // returns the issue and the owner that opened the issue
  getIssue(
    owner: string,
    repo: string,
    number: number,
  ): Promise<[Issue, Owner]>;
  getOwnerAndRepository(
    owner: string,
    repo: string,
  ): Promise<[Owner, Repository]>;
}

class GitHubApiImpl implements GitHubApi {
  async getIssue(
    owner: string,
    repo: string,
    number: number,
  ): Promise<[Issue, Owner]> {
    try {
      const response: Response = await fetch(
        `https://api.github.com/repos/${owner.trim()}/${repo.trim()}/issues/${number}`,
        {
          method: "GET",
          headers: {
            Authorization: "Token " + process.env.GITHUB_TOKEN,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );
      if (response.ok) {
        const json = await response.json();
        const repositoryId: RepositoryId = new RepositoryId(
          new OwnerId(owner),
          repo,
        );
        const issue: Issue | Error = Issue.fromGithubApi(repositoryId, json);
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
    owner: string,
    repo: string,
  ): Promise<[Owner, Repository]> {
    try {
      const response: Response = await fetch(
        `https://api.github.com/repos/${owner.trim()}/${repo.trim()}`,
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

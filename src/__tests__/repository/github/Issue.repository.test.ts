import { type Express } from "express";
import { createApp } from "../../../createApp";
import { setupTestDB } from "../../__helpers__/jest.setup";
import { Fixture } from "../../__helpers__/Fixture";
import {
  getIssueRepository,
  getOwnerRepository,
  getRepositoryRepository,
} from "../../../db";
import { IssueId, OwnerId, RepositoryId } from "../../../model";

describe("IssueRepository", () => {
  let app: Express = createApp();

  setupTestDB();

  const ownerRepo = getOwnerRepository();
  const repoRepo = getRepositoryRepository();
  const issueRepo = getIssueRepository();

  describe("insertOrUpdate", () => {
    describe("insert", () => {
      it("should work", async () => {
        const ownerId = Fixture.ownerId();
        await ownerRepo.insertOrUpdate(Fixture.owner(ownerId));

        const repositoryId = Fixture.repositoryId(ownerId);
        await repoRepo.insertOrUpdate(Fixture.repository(repositoryId));

        const issueId = Fixture.issueId(repositoryId);
        const issue = Fixture.issue(issueId, ownerId);
        const created = await issueRepo.insert(issue);
        expect(created).toEqual(issue);

        const found = await issueRepo.getById(issue.id);
        expect(found).toEqual(issue);
      });

      it("should fail with foreign key constraint error if repository or owner is not inserted", async () => {
        const ownerId = Fixture.ownerId();
        const repositoryId = Fixture.repositoryId(ownerId);

        const issueId = Fixture.issueId(repositoryId);
        const issue = Fixture.issue(issueId, ownerId);

        try {
          await issueRepo.insert(issue);
          // If the insertion doesn't throw, fail the test
          fail(
            "Expected foreign key constraint violation, but no error was thrown.",
          );
        } catch (error: any) {
          // Check if the error is related to foreign key constraint
          expect(error.message).toMatch(/violates foreign key constraint/);
        }
      });
    });

    describe("update", () => {
      it("should work", async () => {
        const ownerId = Fixture.ownerId();
        await ownerRepo.insertOrUpdate(Fixture.owner(ownerId));

        const repositoryId = Fixture.repositoryId(ownerId);
        await repoRepo.insertOrUpdate(Fixture.repository(repositoryId));

        const issueId = Fixture.issueId(repositoryId);
        const issue = Fixture.issue(issueId, ownerId);
        await issueRepo.insert(issue);

        const updatedIssue = Fixture.issue(issueId, ownerId, "updated-payload");
        const updated = await issueRepo.insert(updatedIssue);
        expect(updated).toEqual(updatedIssue);

        const found = await issueRepo.getById(issue.id);
        expect(found).toEqual(updatedIssue);
      });
    });
  });

  describe("getById", () => {
    it("should return null if issue not found", async () => {
      const ownerId = Fixture.ownerId();
      const repositoryId = Fixture.repositoryId(ownerId);

      const nonExistentIssueId = Fixture.issueId(repositoryId);
      const found = await issueRepo.getById(nonExistentIssueId);

      expect(found).toBeNull();
    });

    it("succeed when github ids are not given", async () => {
      const ownerId = Fixture.ownerId();
      await ownerRepo.insertOrUpdate(Fixture.owner(ownerId));

      const repositoryId = Fixture.repositoryId(ownerId);
      await repoRepo.insertOrUpdate(Fixture.repository(repositoryId));

      const issueId = Fixture.issueId(repositoryId);
      const issue = Fixture.issue(issueId, ownerId);
      await issueRepo.insert(issue);

      const undefinedOwnerId = new OwnerId(ownerId.login, undefined);
      const undefinedRepositoryId = new RepositoryId(
        undefinedOwnerId,
        repositoryId.name,
        undefined,
      );
      const undefinedIssueId = new IssueId(
        undefinedRepositoryId,
        issueId.number,
        undefined,
      );

      const found = await issueRepo.getById(undefinedIssueId);
      expect(found).toEqual(issue);
    });
  });

  describe("getAll", () => {
    it("should return all issues", async () => {
      const ownerId = Fixture.ownerId();
      await ownerRepo.insertOrUpdate(Fixture.owner(ownerId));

      const repositoryId = Fixture.repositoryId(ownerId);
      await repoRepo.insertOrUpdate(Fixture.repository(repositoryId));

      const issueId1 = Fixture.issueId(repositoryId);
      const issueId2 = Fixture.issueId(repositoryId);
      const issue1 = Fixture.issue(issueId1, ownerId);
      const issue2 = Fixture.issue(issueId2, ownerId);

      await issueRepo.insert(issue1);
      await issueRepo.insert(issue2);

      const allIssues = await issueRepo.getAll();

      expect(allIssues).toHaveLength(2);
      expect(allIssues).toContainEqual(issue1);
      expect(allIssues).toContainEqual(issue2);
    });

    it("should return an empty array if no issues exist", async () => {
      const allIssues = await issueRepo.getAll();
      expect(allIssues).toEqual([]);
    });
  });
});

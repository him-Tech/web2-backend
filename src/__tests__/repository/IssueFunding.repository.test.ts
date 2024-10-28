import { setupTestDB } from "../__helpers__/jest.setup";
import { UserId } from "../../model";

import {
  getIssueFundingRepository,
  getIssueRepository,
  getOwnerRepository,
  getRepositoryRepository,
  getUserRepository,
} from "../../db/";
import { CreateIssueFundingBodyParams } from "../../dtos";
import { Fixture } from "../__helpers__/Fixture";

describe("IssueFundingRepository", () => {
  const userRepo = getUserRepository();
  const ownerRepo = getOwnerRepository();
  const repoRepo = getRepositoryRepository();
  const issueRepo = getIssueRepository();
  const issueFundingRepo = getIssueFundingRepository();

  setupTestDB();
  let validUserId: UserId;

  beforeEach(async () => {
    const validUser = await userRepo.insertLocal(
      Fixture.createUserBodyParams(),
    );
    validUserId = validUser.id;
  });

  describe("create", () => {
    it("should create a new issue funding record", async () => {
      const ownerId = Fixture.ownerId();
      await ownerRepo.insertOrUpdate(Fixture.owner(ownerId));

      const repositoryId = Fixture.repositoryId(ownerId);
      await repoRepo.insertOrUpdate(Fixture.repository(repositoryId));

      const issueId = Fixture.issueId(repositoryId);
      const issue = Fixture.issue(issueId, ownerId);
      await issueRepo.createOrUpdate(issue);

      const issueFundingBodyParams: CreateIssueFundingBodyParams = {
        githubIssueId: issueId,
        userId: validUserId,
        downAmount: 5000,
      };

      expect(true).toEqual(true);
      const created = await issueFundingRepo.create(issueFundingBodyParams);

      expect(created).toEqual(
        Fixture.issueFundingFromBodyParams(created.id, issueFundingBodyParams),
      );

      const found = await issueFundingRepo.getById(created.id);
      expect(found).toEqual(created);
    });

    // Add more test cases for `create`:
    // - Test with invalid data (e.g., negative amount)
    // - Verify error handling and database constraints
  });

  describe("getById", () => {
    it("should return null if issue funding not found", async () => {
      const nonExistentIssueFundingId = Fixture.issueFundingId();
      const found = await issueFundingRepo.getById(nonExistentIssueFundingId);

      expect(found).toBeNull();
    });
  });

  describe("getAll", () => {
    it("should return an empty array if no issue fundings exist", async () => {
      const allIssueFundings = await issueFundingRepo.getAll();

      expect(allIssueFundings).toEqual([]);
    });

    it("should return all issue fundings", async () => {
      const ownerId = Fixture.ownerId();
      await ownerRepo.insertOrUpdate(Fixture.owner(ownerId));

      const repositoryId = Fixture.repositoryId(ownerId);
      await repoRepo.insertOrUpdate(Fixture.repository(repositoryId));

      const issueId = Fixture.issueId(repositoryId);
      const issue = Fixture.issue(issueId, ownerId);
      await issueRepo.createOrUpdate(issue);

      const issueFundingBodyParams1: CreateIssueFundingBodyParams = {
        githubIssueId: issueId,
        userId: validUserId,
        downAmount: 5000,
      };

      const issueFundingBodyParams2: CreateIssueFundingBodyParams = {
        githubIssueId: issueId,
        userId: validUserId,
        downAmount: 10000,
      };

      const issueFunding1 = await issueFundingRepo.create(
        issueFundingBodyParams1,
      );
      const issueFunding2 = await issueFundingRepo.create(
        issueFundingBodyParams2,
      );

      const allIssueFundings = await issueFundingRepo.getAll();

      expect(allIssueFundings).toHaveLength(2);
      expect(allIssueFundings).toContainEqual(
        Fixture.issueFundingFromBodyParams(
          issueFunding1.id,
          issueFundingBodyParams1,
        ),
      );
      expect(allIssueFundings).toContainEqual(
        Fixture.issueFundingFromBodyParams(
          issueFunding2.id,
          issueFundingBodyParams2,
        ),
      );
    });
  });
});

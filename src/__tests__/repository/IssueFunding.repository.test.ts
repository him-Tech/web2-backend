import { setupTestDB } from "../__helpers__/jest.setup";
import { UserId } from "../../model";

import {
  getIssueFundingRepository,
  getIssueRepository,
  getOwnerRepository,
  getRepositoryRepository,
  getUserRepository,
} from "../../db/";
import { CreateIssueFundingDto } from "../../dtos";
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
    const validUser = await userRepo.insertLocal(Fixture.createUserDto());
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

      const issueFundingDto: CreateIssueFundingDto = {
        githubIssueId: issueId,
        userId: validUserId,
        downAmount: 5000,
      };

      expect(true).toEqual(true);
      const created = await issueFundingRepo.create(issueFundingDto);

      expect(created).toEqual(
        Fixture.issueFundingFromDto(created.id, issueFundingDto),
      );

      const found = await issueFundingRepo.getById(created.id);
      expect(found).toEqual(created);
    });

    // Add more test cases for `create`:
    // - Test with invalid data (e.g., negative amount,)
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

      const issueFundingDto1: CreateIssueFundingDto = {
        githubIssueId: issueId,
        userId: validUserId,
        downAmount: 5000,
      };

      const issueFundingDto2: CreateIssueFundingDto = {
        githubIssueId: issueId,
        userId: validUserId,
        downAmount: 10000,
      };

      const issueFunding1 = await issueFundingRepo.create(issueFundingDto1);
      const issueFunding2 = await issueFundingRepo.create(issueFundingDto2);

      const allIssueFundings = await issueFundingRepo.getAll();

      expect(allIssueFundings).toHaveLength(2);
      expect(allIssueFundings).toContainEqual(
        Fixture.issueFundingFromDto(issueFunding1.id, issueFundingDto1),
      );
      expect(allIssueFundings).toContainEqual(
        Fixture.issueFundingFromDto(issueFunding2.id, issueFundingDto2),
      );
    });
  });
});

import { setupTestDB } from "../__helpers__/jest.setup";
import { ManagedIssueId, ManagedIssueState, UserId } from "../../model";
import {
  getIssueRepository,
  getManagedIssueRepository,
  getOwnerRepository,
  getRepositoryRepository,
  getStripeProductRepository,
  getUserRepository,
} from "../../db/";
import { CreateManagedIssueDto } from "../../dtos";
import { Fixture } from "../__helpers__/Fixture";

describe("ManagedIssueRepository", () => {
  const userRepo = getUserRepository();
  const ownerRepo = getOwnerRepository();
  const repoRepo = getRepositoryRepository();
  const issueRepo = getIssueRepository();
  const productRepo = getStripeProductRepository();
  const managedIssueRepo = getManagedIssueRepository();

  setupTestDB();
  let validUserId: UserId;

  beforeEach(async () => {
    const validUser = await userRepo.insertLocal(Fixture.createUserDto());
    validUserId = validUser.id;
  });

  describe("create", () => {
    it("should create a new managed issue record", async () => {
      const ownerId = Fixture.ownerId();
      await ownerRepo.insertOrUpdate(Fixture.owner(ownerId));

      const repositoryId = Fixture.repositoryId(ownerId);
      await repoRepo.insertOrUpdate(Fixture.repository(repositoryId));

      const issueId = Fixture.issueId(repositoryId);
      const issue = Fixture.issue(issueId, ownerId);
      await issueRepo.insert(issue);

      const productId = Fixture.stripeProductId();
      await productRepo.insert(Fixture.stripeProduct(productId));

      const managedIssueDto = Fixture.createManagedIssueDto(
        issueId.githubId!,
        productId,
        validUserId,
      );

      const created = await managedIssueRepo.create(managedIssueDto);

      expect(created).toEqual(
        Fixture.managedIssueFromDto(created.id, managedIssueDto),
      );

      const found = await managedIssueRepo.getById(
        new ManagedIssueId(created.id.id),
      );
      expect(found).toEqual(created);
    });

    // Add more test cases for `create`:
    // - Test with invalid data (e.g., negative amount, invalid product ID, invalid enum values)
    // - Verify error handling and database constraints
  });

  describe("update", () => {
    it("should update an existing managed issue record", async () => {
      const ownerId = Fixture.ownerId();
      await ownerRepo.insertOrUpdate(Fixture.owner(ownerId));

      const repositoryId = Fixture.repositoryId(ownerId);
      await repoRepo.insertOrUpdate(Fixture.repository(repositoryId));

      const issueId = Fixture.issueId(repositoryId);
      const issue = Fixture.issue(issueId, ownerId);
      await issueRepo.insert(issue);

      const productId = Fixture.stripeProductId();
      await productRepo.insert(Fixture.stripeProduct(productId));

      const managedIssueDto = Fixture.createManagedIssueDto(
        issueId.githubId!,
        productId,
        validUserId,
      );

      const created = await managedIssueRepo.create(managedIssueDto);

      expect(created).toEqual(
        Fixture.managedIssueFromDto(created.id, managedIssueDto),
      );

      const updatedManagedIssueDto: CreateManagedIssueDto = {
        ...managedIssueDto,
        state: ManagedIssueState.SOLVED, // Update the state
      };

      const updated = await managedIssueRepo.update(
        Fixture.managedIssueFromDto(created.id, updatedManagedIssueDto),
      );

      expect(created.id).toEqual(updated.id);
      expect(updated).toEqual(
        Fixture.managedIssueFromDto(created.id, updatedManagedIssueDto),
      );

      const found = await managedIssueRepo.getById(updated.id);
      expect(found).toEqual(updated);
    });

    // Add more test cases for `update`:
    // - Test updating different fields
    // - Test updating a non-existent record
    // - Verify error handling and database constraints
  });

  describe("getById", () => {
    it("should return null if managed issue not found", async () => {
      const nonExistentManagedIssueId = new ManagedIssueId(999999);
      const found = await managedIssueRepo.getById(nonExistentManagedIssueId);

      expect(found).toBeNull();
    });

    // Add more test cases for `getById`:
    // - Test retrieving an existing record
  });
});

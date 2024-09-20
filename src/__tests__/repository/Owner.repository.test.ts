import { setupTestDB } from "../jest.setup";
import { getOwnerRepository } from "../../db/";
import { Fixture } from "./Fixture";
import { OwnerId } from "../../model";

describe("OwnerRepository", () => {
  setupTestDB();

  const repo = getOwnerRepository();

  describe("create", () => {
    it("should work", async () => {
      const ownerId = Fixture.ownerId();
      const owner = Fixture.owner(ownerId);
      const created = await repo.insert(owner);

      expect(created).toEqual(owner);

      const found = await repo.getById(owner.id);
      expect(found).toEqual(owner);
    });
  });

  describe("getById", () => {
    it("should return null if owner not found", async () => {
      const nonExistentOwnerId = Fixture.ownerId();
      const found = await repo.getById(nonExistentOwnerId);

      expect(found).toBeNull();
    });

    it("succeed when github ids are not given", async () => {
      const ownerId = Fixture.ownerId();
      const owner = Fixture.owner(ownerId);
      await repo.insert(owner);

      const undefinedOwnerId = new OwnerId(ownerId.login, undefined);

      const found = await repo.getById(undefinedOwnerId);
      expect(found).toEqual(owner);
    });
  });

  describe("getAll", () => {
    it("should return all owners", async () => {
      const ownerId1 = Fixture.ownerId();
      const ownerId2 = Fixture.ownerId();

      const owner1 = Fixture.owner(ownerId1, "payload1");
      const owner2 = Fixture.owner(ownerId2, "payload2");

      await repo.insert(owner1);
      await repo.insert(owner2);

      const allOwners = await repo.getAll();

      expect(allOwners).toHaveLength(2);
      expect(allOwners).toContainEqual(owner1);
      expect(allOwners).toContainEqual(owner2);
    });

    it("should return an empty array if no owners exist", async () => {
      const allOwners = await repo.getAll();

      expect(allOwners).toEqual([]);
    });
  });
});

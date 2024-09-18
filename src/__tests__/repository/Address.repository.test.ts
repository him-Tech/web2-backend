import { setupTestDB } from "../jest.setup";
import { AddressId } from "../../model";
import { Fixture } from "./Fixture";
import { getAddressRepository } from "../../db/";
import { CreateAddressDto } from "../../dtos";

describe("AddressRepository", () => {
  const addressRepo = getAddressRepository();

  setupTestDB();

  describe("create", () => {
    it("should create a new company address", async () => {
      const addressDto = {
        name: "Company Name",
      } as CreateAddressDto;

      const created = await addressRepo.create(addressDto);

      expect(created).toEqual(
        Fixture.addressFromDto(created.id.id, addressDto),
      );

      const found = await addressRepo.getById(new AddressId(created.id.id));
      expect(found).toEqual(created);
    });
  });

  describe("update", () => {
    it("should update an existing company address", async () => {
      const addressDto = {
        name: "Company Name",
      } as CreateAddressDto;

      // First create the address
      const created = await addressRepo.create(addressDto);

      // Update the address
      const updatedAddressDto = {
        name: null,
      } as CreateAddressDto;

      const updated = await addressRepo.update(
        Fixture.addressFromDto(created.id.id, updatedAddressDto),
      );

      expect(created.id).toEqual(updated.id);
      expect(updated).toEqual(
        Fixture.addressFromDto(created.id.id, updatedAddressDto),
      );

      const found = await addressRepo.getById(new AddressId(updated.id.id));
      expect(found).toEqual(updated);
    });
  });

  describe("getById", () => {
    it("should return null if address not found", async () => {
      const nonExistentAddressId = new AddressId(999999);
      const found = await addressRepo.getById(nonExistentAddressId);

      expect(found).toBeNull();
    });
  });

  describe("getAll", () => {
    it("should return an empty array if no address exist", async () => {
      const alladdress = await addressRepo.getAll();

      expect(alladdress).toEqual([]);
    });

    it("should return all company address", async () => {
      const addressId1 = Fixture.id();
      const addressId2 = Fixture.id();

      const address = {
        name: "Company Name",
      } as CreateAddressDto;

      await addressRepo.create(address);
      await addressRepo.create(address);

      const alladdress = await addressRepo.getAll();

      expect(alladdress).toHaveLength(2);
      expect(alladdress).toContainEqual(Fixture.addressFromDto(1, address));
      expect(alladdress).toContainEqual(Fixture.addressFromDto(2, address));
    });
  });
});

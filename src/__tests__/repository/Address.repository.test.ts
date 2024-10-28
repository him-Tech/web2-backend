import { setupTestDB } from "../__helpers__/jest.setup";
import { CompanyUserRole, UserId } from "../../model";
import { Fixture } from "../__helpers__/Fixture";
import {
  getAddressRepository,
  getCompanyRepository,
  getUserCompanyRepository,
  getUserRepository,
} from "../../db/";
import { CreateAddressBodyParams, CreateCompanyBodyParams } from "../../dtos";

describe("AddressRepository", () => {
  const userRepo = getUserRepository();
  const companyRepo = getCompanyRepository();
  const userCompanyRepo = getUserCompanyRepository();
  const addressRepo = getAddressRepository();

  setupTestDB();
  let validUserId: UserId;

  beforeEach(async () => {
    const validUser = await userRepo.insertLocal(
      Fixture.createUserBodyParams(),
    );
    validUserId = validUser.id;
  });

  describe("create", () => {
    it("should create a new company address", async () => {
      const addressBodyParams = {
        name: "Company Name",
      } as CreateAddressBodyParams;

      const created = await addressRepo.create(addressBodyParams);

      expect(created).toEqual(
        Fixture.addressFromBodyParams(created.id, addressBodyParams),
      );

      const found = await addressRepo.getById(created.id);
      expect(found).toEqual(created);
    });
  });

  describe("update", () => {
    it("should update an existing company address", async () => {
      const addressBodyParams = {
        name: "Company Name",
      } as CreateAddressBodyParams;

      // First create the address
      const created = await addressRepo.create(addressBodyParams);

      // Update the address
      const updatedAddressBodyParams = {
        name: "Updated Company Name",
      } as CreateAddressBodyParams;

      const updated = await addressRepo.update(
        Fixture.addressFromBodyParams(created.id, updatedAddressBodyParams),
      );

      expect(created.id).toEqual(updated.id);
      expect(updated).toEqual(
        Fixture.addressFromBodyParams(created.id, updatedAddressBodyParams),
      );

      const found = await addressRepo.getById(updated.id);
      expect(found).toEqual(updated);
    });
  });

  describe("getById", () => {
    it("should return null if address not found", async () => {
      const nonExistentAddressId = Fixture.addressId();
      const found = await addressRepo.getById(nonExistentAddressId);

      expect(found).toBeNull();
    });
  });

  describe("getByCompanyId", () => {
    it("should return the address for a given company ID", async () => {
      const addressBodyParams = {
        name: "Company Name",
      } as CreateAddressBodyParams;

      // First create the address
      const created = await addressRepo.create(addressBodyParams);

      // Create a company with an associated address
      const companyBodyParams = {
        name: "Test Company",
        taxId: "1234",
        addressId: created.id,
      } as CreateCompanyBodyParams;

      const company = await companyRepo.create(companyBodyParams);

      // Fetch the address using getByCompanyId
      const address = await addressRepo.getByCompanyId(company.id);

      expect(address).toEqual(created);
    });

    it("should return null if the company has no associated address", async () => {
      // Create a company without an associated address
      const companyBodyParams = {
        name: "Test Company",
        taxId: "1234",
      } as CreateCompanyBodyParams;

      const company = await companyRepo.create(companyBodyParams);

      // Fetch the address
      const address = await addressRepo.getByCompanyId(company.id);

      expect(address).toBeNull();
    });
  });

  describe("getCompanyUserAddress", () => {
    it("should return the address associated with the user's company", async () => {
      const addressBodyParams = {
        name: "Company Name",
      } as CreateAddressBodyParams;

      // First create the address
      const created = await addressRepo.create(addressBodyParams);

      const companyBodyParams = {
        name: "Test Company",
        taxId: "12345",
        contactPersonId: validUserId,
        addressId: created.id,
      } as CreateCompanyBodyParams;

      const company = await companyRepo.create(companyBodyParams);
      await userCompanyRepo.insert(
        validUserId,
        company.id,
        CompanyUserRole.ADMIN,
      );

      // Fetch the address using the user ID
      const address = await addressRepo.getCompanyUserAddress(validUserId);

      expect(address).toEqual(created);
    });

    it("should return null if the user is not linked to any company", async () => {
      // Fetch the address
      const address = await addressRepo.getCompanyUserAddress(validUserId);

      expect(address).toBeNull();
    });
  });

  describe("getAll", () => {
    it("should return an empty array if no address exist", async () => {
      const alladdress = await addressRepo.getAll();

      expect(alladdress).toEqual([]);
    });

    it("should return all company address", async () => {
      const addressId1 = Fixture.uuid();
      const addressId2 = Fixture.uuid();

      const address = {
        name: "Company Name",
      } as CreateAddressBodyParams;

      const address1 = await addressRepo.create(address);
      const address2 = await addressRepo.create(address);

      const alladdress = await addressRepo.getAll();

      expect(alladdress).toHaveLength(2);
      expect(alladdress).toContainEqual(
        Fixture.addressFromBodyParams(address1.id, address),
      );
      expect(alladdress).toContainEqual(
        Fixture.addressFromBodyParams(address2.id, address),
      );
    });
  });
});

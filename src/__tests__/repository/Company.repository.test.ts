import { setupTestDB } from "../__helpers__/jest.setup";
import { Company, AddressId, CompanyId, UserId } from "../../model";
import { Fixture } from "../__helpers__/Fixture";
import {
  getAddressRepository,
  getCompanyRepository,
  getUserRepository,
} from "../../db/";
import { CreateAddressDto, CreateCompanyDto } from "../../dtos";

describe("CompanyRepository", () => {
  const addressRepo = getAddressRepository();
  const userRepo = getUserRepository();
  const companyRepo = getCompanyRepository();

  setupTestDB();

  let validAddressId: AddressId;
  let validUserId: UserId;
  let validUserId2: UserId;

  beforeEach(async () => {
    const addressDto = {
      name: "Valid Address",
      line1: "123 Test St",
      city: "Test City",
      state: "Test State",
      postalCode: "12345",
      country: "Test Country",
    } as CreateAddressDto;
    const address = await addressRepo.create(addressDto);
    validAddressId = address.id;

    const validUser = await userRepo.insertLocal(Fixture.createUserDto());
    validUserId = validUser.id;

    const validUser2 = await userRepo.insertGithub(Fixture.thirdPartyUser("2"));
    validUserId2 = validUser2.id;
  });

  describe("insert", () => {
    it("should insert a new company", async () => {
      const company = {} as CreateCompanyDto;

      const created = await companyRepo.insert(company);

      expect(created).toEqual(Fixture.companyFromDto(created.id.id, company));

      const found = await companyRepo.getById(created.id);
      expect(found).toEqual(created);
    });
  });

  describe("update", () => {
    it("should handle updating contact_person_id and address_id to NULL", async () => {
      // Insert a company with a non-null contact person ID
      const initialCompany = {
        taxId: "12345",
        name: "Initial Company",
        contactPersonId: validUserId,
        addressId: validAddressId,
      } as CreateCompanyDto;

      const created = await companyRepo.insert(initialCompany);

      const updatedCompany = new Company(
        created.id,
        created.taxId,
        created.name,
        null,
        null,
      );

      const updated = await companyRepo.update(updatedCompany);

      expect(updated.contactPersonId).toBeNull();

      const found = await companyRepo.getById(created.id);
      expect(found).toEqual(updated);
    });

    it("should update an existing company", async () => {
      // Insert a company first
      const created = await companyRepo.insert({
        taxId: "123456",
        name: "Company A",
        contactPersonId: validUserId,
        addressId: validAddressId,
      } as CreateCompanyDto);

      const updatedCompany = new Company(
        created.id,
        "00000",
        "Company B",
        validUserId,
        validAddressId,
      );

      const updated = await companyRepo.update(updatedCompany);

      expect(updated).toEqual(updatedCompany);

      const found = await companyRepo.getById(created.id);
      expect(found).toEqual(updated);
    });

    it("should update to an other contact person", async () => {
      // Insert a company first with the initial contact person
      const created = await companyRepo.insert({
        taxId: "123456",
        name: "Company A",
        contactPersonId: validUserId, // Initial contact person
        addressId: validAddressId,
      } as CreateCompanyDto);

      // Create a new Company object with a different contact person ID
      const updatedCompany = new Company(
        created.id,
        created.taxId,
        created.name,
        validUserId2, // New contact person
        created.addressId,
      );

      const updated = await companyRepo.update(updatedCompany);

      // Assert that the contact person ID has been updated
      expect(updated.contactPersonId?.id).toEqual(validUserId2.id);

      const found = await companyRepo.getById(created.id);
      expect(found).toEqual(updated);
    });
  });

  describe("getById", () => {
    it("should return null if company not found", async () => {
      const nonExistentCompanyId = new CompanyId(999999);
      const found = await companyRepo.getById(nonExistentCompanyId);

      expect(found).toBeNull();
    });
  });

  describe("getAll", () => {
    it("should return all companies", async () => {
      const company = {} as CreateCompanyDto;

      await companyRepo.insert(company);
      await companyRepo.insert(company);

      const allCompanies = await companyRepo.getAll();

      expect(allCompanies).toHaveLength(2);
      expect(allCompanies).toContainEqual(Fixture.company(1));
      expect(allCompanies).toContainEqual(Fixture.company(2));
    });

    it("should return an empty array if no companies exist", async () => {
      const allCompanies = await companyRepo.getAll();

      expect(allCompanies).toEqual([]);
    });
  });
});

import { setupTestDB } from "../__helpers__/jest.setup";
import { AddressId, Company, UserId } from "../../model";
import { Fixture } from "../__helpers__/Fixture";
import {
  getAddressRepository,
  getCompanyRepository,
  getUserCompanyRepository,
  getUserRepository,
} from "../../db/";
import { CreateAddressDto, CreateCompanyDto } from "../../dtos";

describe("CompanyRepository", () => {
  const addressRepo = getAddressRepository();
  const userRepo = getUserRepository();
  const userCompanyRepo = getUserCompanyRepository();
  const companyRepo = getCompanyRepository();

  setupTestDB();

  let validAddressId: AddressId;
  let validUserId: UserId;
  let validUserId2: UserId;

  beforeEach(async () => {
    const address = await addressRepo.create(Fixture.createAddressDto());
    validAddressId = address.id;

    const validUser = await userRepo.insertLocal(Fixture.createUserDto());
    validUserId = validUser.id;

    const validUser2 = await userRepo.insertGithub(Fixture.thirdPartyUser("2"));
    validUserId2 = validUser2.id;
  });

  describe("insert", () => {
    it("when addressId and contactPersonId are null", async () => {
      const company = Fixture.createCompanyDto();

      const created = await companyRepo.insert(company);

      expect(created).toEqual(Fixture.companyFromDto(created.id, company));

      const found = await companyRepo.getById(created.id);
      expect(found).toEqual(created);
    });

    it("when addressId is NOT null", async () => {
      const company = Fixture.createCompanyDto(undefined, validAddressId);

      const created = await companyRepo.insert(company);

      expect(created).toEqual(Fixture.companyFromDto(created.id, company));

      const found = await companyRepo.getById(created.id);
      expect(found).toEqual(created);
    });

    it("when contactPersonId is NOT null - should update user_company table", async () => {
      const company = Fixture.createCompanyDto(validUserId);

      const created = await companyRepo.insert(company);

      expect(created).toEqual(Fixture.companyFromDto(created.id, company));

      const found = await companyRepo.getById(created.id);
      expect(found).toEqual(created);

      const userCompany = await userCompanyRepo.getByCompanyId(created.id);
      expect(userCompany).toHaveLength(1);
      expect(userCompany[0]).toEqual(validUserId);
    });
  });

  describe("update", () => {
    it("should handle updating with no data changes", async () => {
      const initialCompany = Fixture.createCompanyDto(
        validUserId,
        validAddressId,
      );

      const created = await companyRepo.insert(initialCompany);

      const updated = await companyRepo.update(created);

      const found = await companyRepo.getById(created.id);
      expect(found).toEqual(updated);
    });

    it("should handle updating and address_id to NULL", async () => {
      // Insert a company with a non-null contact person ID
      const initialCompany = Fixture.createCompanyDto(
        validUserId,
        validAddressId,
      );

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
        addressId: validAddressId,
      } as CreateCompanyDto);

      const updatedCompany = new Company(
        created.id,
        "00000",
        "Company B",
        null,
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
      expect(updated.contactPersonId?.uuid).toEqual(validUserId2.uuid);

      const found = await companyRepo.getById(created.id);
      expect(found).toEqual(updated);
    });
  });

  describe("getById", () => {
    it("should return null if company not found", async () => {
      const nonExistentCompanyId = Fixture.companyId();
      const found = await companyRepo.getById(nonExistentCompanyId);

      expect(found).toBeNull();
    });
  });

  describe("getAll", () => {
    it("should return all companies", async () => {
      const company = {} as CreateCompanyDto;

      const company1 = await companyRepo.insert(company);
      const company2 = await companyRepo.insert(company);

      const allCompanies = await companyRepo.getAll();

      expect(allCompanies).toHaveLength(2);
      expect(allCompanies).toContainEqual(Fixture.company(company1.id));
      expect(allCompanies).toContainEqual(Fixture.company(company2.id));
    });

    it("should return an empty array if no companies exist", async () => {
      const allCompanies = await companyRepo.getAll();

      expect(allCompanies).toEqual([]);
    });
  });
});

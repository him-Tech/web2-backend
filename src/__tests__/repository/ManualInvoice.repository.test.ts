import { setupTestDB } from "../__helpers__/jest.setup";
import { CompanyId, ManualInvoiceId, UserId } from "../../model";
import {
  getCompanyRepository,
  getManualInvoiceRepository,
  getUserRepository,
} from "../../db/";
import { CreateManualInvoiceBodyParams } from "../../dtos";
import { Fixture } from "../__helpers__/Fixture";
import { v4 as uuidv } from "uuid";

describe("ManualInvoiceRepository", () => {
  const userRepo = getUserRepository();
  const companyRepo = getCompanyRepository();
  const manualInvoiceRepo = getManualInvoiceRepository();

  setupTestDB();
  let userId: UserId;
  let companyId: CompanyId;

  beforeEach(async () => {
    const companyUser = await userRepo.insertLocal(
      Fixture.createUserBodyParams(),
    );
    userId = companyUser.id;

    const company = await companyRepo.create(Fixture.createCompanyBodyParams());
    companyId = company.id;
  });

  describe("create", () => {
    it("should create a new manual invoice record", async () => {
      const manualInvoiceBodyParams: CreateManualInvoiceBodyParams =
        Fixture.createManualInvoiceBodyParams(companyId);

      const created = await manualInvoiceRepo.create(manualInvoiceBodyParams);

      expect(created).toEqual(
        Fixture.manualInvoiceFromBodyParams(
          created.id,
          manualInvoiceBodyParams,
        ),
      );

      const found = await manualInvoiceRepo.getById(created.id);
      expect(found).toEqual(created);
    });

    it("can not have companyId and userId defined", async () => {
      // TODO: improve type to not have to make this test
      const manualInvoiceBodyParams: CreateManualInvoiceBodyParams =
        Fixture.createManualInvoiceBodyParams(companyId, userId);

      try {
        await manualInvoiceRepo.create(manualInvoiceBodyParams);
        // If the insertion doesn't throw, fail the test
        fail(
          "Expected foreign key constraint violation, but no error was thrown.",
        );
      } catch (error: any) {
        expect(error.message).toMatch(
          /new row for relation \"manual_invoice\" violates check constraint \"chk_company_nor_user/,
        );
      }
    });

    // Add more test cases for `create`:
    // - Test with invalid data (e.g., missing companyId and userId)
    // - Verify error handling and database constraints
  });

  describe("update", () => {
    it("should update an existing manual invoice record", async () => {
      const manualInvoiceBodyParams: CreateManualInvoiceBodyParams =
        Fixture.createManualInvoiceBodyParams(companyId);

      const created = await manualInvoiceRepo.create(manualInvoiceBodyParams);

      expect(created).toEqual(
        Fixture.manualInvoiceFromBodyParams(
          created.id,
          manualInvoiceBodyParams,
        ),
      );

      const updatedManualInvoiceBodyParams: CreateManualInvoiceBodyParams = {
        ...manualInvoiceBodyParams,
        paid: false, // Update the paid status
      };

      const updated = await manualInvoiceRepo.update(
        Fixture.manualInvoiceFromBodyParams(
          created.id,
          updatedManualInvoiceBodyParams,
        ),
      );

      expect(created.id).toEqual(updated.id);
      expect(updated).toEqual(
        Fixture.manualInvoiceFromBodyParams(
          created.id,
          updatedManualInvoiceBodyParams,
        ),
      );

      const found = await manualInvoiceRepo.getById(updated.id);
      expect(found).toEqual(updated);
    });

    // Add more test cases for `update`:
    // - Test updating different fields
    // - Test updating a non-existent record
    // - Verify error handling and database constraints
  });

  describe("getById", () => {
    it("should return null if manual invoice not found", async () => {
      const nonExistentManualInvoiceId = new ManualInvoiceId(uuidv());
      const found = await manualInvoiceRepo.getById(nonExistentManualInvoiceId);

      expect(found).toBeNull();
    });

    // Add more test cases for `getById`:
    // - Test retrieving an existing record
  });

  describe("getAll", () => {
    it("should return all manual invoices", async () => {
      const manualInvoiceBodyParams1: CreateManualInvoiceBodyParams =
        Fixture.createManualInvoiceBodyParams(companyId);
      const manualInvoiceBodyParams2: CreateManualInvoiceBodyParams =
        Fixture.createManualInvoiceBodyParams(undefined, userId);

      await manualInvoiceRepo.create(manualInvoiceBodyParams1);
      await manualInvoiceRepo.create(manualInvoiceBodyParams2);

      const allInvoices = await manualInvoiceRepo.getAll();

      expect(allInvoices.length).toBeGreaterThanOrEqual(2);
    });

    // Add more test cases for `getAll`:
    // - Test empty database returns an empty array
  });

  describe("getAllInvoicePaidBy", () => {
    it("should return all paid invoices for a given company", async () => {
      const paidInvoiceBodyParams: CreateManualInvoiceBodyParams = {
        ...Fixture.createManualInvoiceBodyParams(companyId),
        paid: true,
      };
      const unpaidInvoiceBodyParams: CreateManualInvoiceBodyParams = {
        ...Fixture.createManualInvoiceBodyParams(companyId),
        paid: false,
      };

      await manualInvoiceRepo.create(paidInvoiceBodyParams);
      await manualInvoiceRepo.create(unpaidInvoiceBodyParams);

      const paidInvoices =
        await manualInvoiceRepo.getAllInvoicePaidBy(companyId);

      expect(paidInvoices.length).toBe(1);
      expect(paidInvoices[0].paid).toBe(true);
      expect(paidInvoices[0].companyId).toEqual(companyId);
    });

    it("should return all paid invoices for a given user", async () => {
      const paidInvoiceBodyParams: CreateManualInvoiceBodyParams = {
        ...Fixture.createManualInvoiceBodyParams(undefined, userId),
        paid: true,
      };
      const unpaidInvoiceBodyParams: CreateManualInvoiceBodyParams = {
        ...Fixture.createManualInvoiceBodyParams(undefined, userId),
        paid: false,
      };

      await manualInvoiceRepo.create(paidInvoiceBodyParams);
      await manualInvoiceRepo.create(unpaidInvoiceBodyParams);

      const paidInvoices = await manualInvoiceRepo.getAllInvoicePaidBy(userId);

      expect(paidInvoices.length).toBe(1);
      expect(paidInvoices[0].paid).toBe(true);
      expect(paidInvoices[0].userId).toEqual(userId);
    });

    // Add more test cases for `getAllInvoicePaidBy`:
    // - Test with no paid invoices
    // - Test with multiple paid invoices
  });
});

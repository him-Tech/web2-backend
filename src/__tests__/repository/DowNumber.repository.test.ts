import { setupTestDB } from "../__helpers__/jest.setup";
import { CompanyId, UserId } from "../../model";
import {
  getCompanyRepository,
  getDowNumberRepository,
  getUserRepository,
} from "../../db/";
import { Fixture } from "../__helpers__/Fixture";

describe("DowNumberRepository", () => {
  const userRepo = getUserRepository();
  const companyRepo = getCompanyRepository();
  const dowNumberRepo = getDowNumberRepository();

  setupTestDB();
  let lonelyUserId: UserId;
  let companyUserId: UserId;
  let validCompanyId: CompanyId;

  beforeEach(async () => {
    const lonelyUser = await userRepo.insertLocal(Fixture.createUserDto());
    lonelyUserId = lonelyUser.id;

    const companyUser = await userRepo.insertLocal(Fixture.createUserDto());
    companyUserId = companyUser.id;

    const validCompany = await companyRepo.insert(Fixture.createCompanyDto());
    validCompanyId = validCompany.id;
  });

  describe("getAvailableDoWs", () => {
    describe("should return 0", () => {
      it("for a user with no invoices nor issue funding", async () => {
        const totalDoWs = await dowNumberRepo.getAvailableDoWs(lonelyUserId);
        expect(totalDoWs).toBe(0);
      });

      it("for a company with no invoices nor issue funding", async () => {
        const totalDoWs = await dowNumberRepo.getAvailableDoWs(
          companyUserId,
          validCompanyId,
        );

        expect(totalDoWs).toBe(0);
      });
    });

    // TODO: Add more test cases for `getAvailableDoWs`:
  });
});

import {
  Address,
  AddressId,
  Company,
  CompanyId,
  CompanyUserPermissionToken,
  CompanyUserPermissionTokenId,
  CompanyUserRole,
  ContributorVisibility,
  Email,
  GithubData,
  Issue,
  IssueFunding,
  IssueFundingId,
  IssueId,
  ManagedIssue,
  ManagedIssueId,
  ManagedIssueState,
  ManualInvoice,
  ManualInvoiceId,
  Owner,
  OwnerId,
  OwnerType,
  Provider,
  Repository,
  RepositoryId,
  StripeCustomerId,
  StripeInvoice,
  StripeInvoiceId,
  StripeInvoiceLine,
  StripeInvoiceLineId,
  StripeProduct,
  StripeProductId,
  ThirdPartyUser,
  ThirdPartyUserId,
  UserId,
  UserRole,
} from "../../model";
import {
  CreateAddressBodyParams,
  CreateCompanyBodyParams,
  CreateCompanyUserPermissionTokenBodyParams,
  CreateIssueFundingBodyParams,
  CreateLocalUserBodyParams,
  CreateManagedIssueBodyParams,
  CreateManualInvoiceBodyParams,
} from "../../dtos";
import { StripePriceId } from "../../model/stripe/StripePrice";
import { v4 as uuid } from "uuid";

export const Fixture = {
  id(): number {
    return Math.floor(Math.random() * 1000000);
  },
  uuid(): string {
    return uuid();
  },

  userId(): UserId {
    const id = this.uuid();
    return new UserId(id);
  },

  thirdPartyUser(
    id: string,
    provider: Provider = Provider.Github,
    email: string = "lauriane@gmail.com",
  ): ThirdPartyUser {
    return new ThirdPartyUser(
      provider,
      new ThirdPartyUserId(id),
      [new Email(email, null)],
      new GithubData(Fixture.owner(Fixture.ownerId())),
    );
  },
  createUserBodyParams(): CreateLocalUserBodyParams {
    return {
      email: "d@gmail.com" + this.uuid(),
      password: "password",
      role: UserRole.USER,
    };
  },

  ownerId(): OwnerId {
    const id = this.id();
    return new OwnerId(`owner-${id.toString()}`, id);
  },

  owner(ownerId: OwnerId, payload: string = "payload"): Owner {
    return new Owner(ownerId, OwnerType.Organization, "url", payload);
  },

  repositoryId(ownerId: OwnerId): RepositoryId {
    const id = this.id();
    return new RepositoryId(ownerId, `repo-${id}`, id);
  },

  repository(
    repositoryId: RepositoryId,
    payload: string = "payload",
  ): Repository {
    return new Repository(repositoryId, "https://example.com", payload);
  },

  issueId(repositoryId: RepositoryId): IssueId {
    const number = this.id();
    return new IssueId(repositoryId, number, number);
  },

  issue(issueId: IssueId, openByOwnerId: OwnerId, payload = "payload"): Issue {
    return new Issue(
      issueId,
      "issue title",
      "url",
      new Date("2022-01-01T00:00:00.000Z"),
      null,
      openByOwnerId,
      payload,
    );
  },
  addressId(): AddressId {
    const uuid = this.uuid();
    return new AddressId(uuid);
  },
  createAddressBodyParams(): CreateAddressBodyParams {
    return {
      name: "Valid Address",
      line1: "123 Test St",
      city: "Test City",
      state: "Test State",
      postalCode: "12345",
      country: "Test Country",
    } as CreateAddressBodyParams;
  },
  address(addressId: AddressId): Address {
    return new Address(addressId);
  },
  addressFromBodyParams(
    addressId: AddressId,
    dto: CreateAddressBodyParams,
  ): Address {
    return new Address(
      addressId,
      dto.name,
      dto.line1,
      dto.line2,
      dto.city,
      dto.state,
      dto.postalCode,
      dto.country,
    );
  },

  companyId(): CompanyId {
    const uuid = this.uuid();
    return new CompanyId(uuid);
  },

  createCompanyBodyParams(addressId?: AddressId): CreateCompanyBodyParams {
    return {
      name: "company",
      taxId: "taxId" + this.uuid(),
      addressId: addressId ?? null,
    };
  },
  company(companyId: CompanyId, addressId: AddressId | null = null): Company {
    return new Company(
      companyId,
      null,
      "Company",
      addressId !== null ? addressId : null,
    );
  },
  companyFromBodyParams(
    companyId: CompanyId,
    dto: CreateCompanyBodyParams,
  ): Company {
    return new Company(
      companyId,
      dto.taxId ?? null,
      dto.name ?? null,
      dto.addressId ?? null,
    );
  },

  stripeProductId(): StripeProductId {
    const uuid = this.uuid();
    return new StripeProductId(uuid);
  },

  stripeProduct(productId: StripeProductId): StripeProduct {
    return new StripeProduct(productId, "DoW", 1, false);
  },

  stripeCustomerId(): StripeCustomerId {
    const uuid = this.uuid();
    return new StripeCustomerId(uuid);
  },
  stripePriceId(): StripePriceId {
    const uuid = this.uuid();
    return new StripePriceId(uuid);
  },

  stripeInvoiceId(): StripeInvoiceId {
    const uuid = this.uuid();
    return new StripeInvoiceId(uuid);
  },

  stripeInvoice(
    invoiceId: StripeInvoiceId,
    customerId: StripeCustomerId,
    lines: StripeInvoiceLine[],
  ): StripeInvoice {
    return new StripeInvoice(
      invoiceId,
      customerId,
      true,
      "US",
      lines,
      "USD",
      1000,
      900,
      800,
      700,
      "https://hosted_invoice_url.com",
      "https://invoice_pdf.com",
    );
  },

  stripeInvoiceLineId(): StripeInvoiceLineId {
    const uuid = this.uuid();
    return new StripeInvoiceLineId(uuid);
  },
  stripeInvoiceLine(
    stripeId: StripeInvoiceLineId,
    invoiceId: StripeInvoiceId,
    customerId: StripeCustomerId,
    productId: StripeProductId,
  ): StripeInvoiceLine {
    return new StripeInvoiceLine(
      stripeId,
      invoiceId,
      customerId,
      productId,
      new StripePriceId("100"),
      100,
    );
  },

  manualInvoiceId(): ManualInvoiceId {
    const uuid = this.uuid();
    return new ManualInvoiceId(uuid);
  },

  createManualInvoiceBodyParams(
    companyId?: CompanyId,
    userId?: UserId,
    paid: boolean = true,
    dowAmount: number = 100.0,
  ): CreateManualInvoiceBodyParams {
    return {
      number: 1,
      companyId,
      userId,
      paid,
      dowAmount,
    } as CreateManualInvoiceBodyParams;
  },
  manualInvoiceFromBodyParams(
    id: ManualInvoiceId,
    dto: CreateManualInvoiceBodyParams,
  ): ManualInvoice {
    return new ManualInvoice(
      id,
      dto.number,
      dto.companyId,
      dto.userId,
      dto.paid,
      dto.dowAmount,
    );
  },

  issueFundingId(): IssueFundingId {
    const uuid = this.uuid();
    return new IssueFundingId(uuid);
  },

  issueFundingFromBodyParams(
    issueFundingId: IssueFundingId,
    dto: CreateIssueFundingBodyParams,
  ): IssueFunding {
    return new IssueFunding(
      issueFundingId,
      dto.githubIssueId,
      dto.userId,
      dto.downAmount,
    );
  },
  managedIssueId(): ManagedIssueId {
    const uuid = this.uuid();
    return new ManagedIssueId(uuid);
  },
  createManagedIssueBodyParams(
    githubIssueId: IssueId,
    managerId: UserId,
    payload: number = 5000,
  ): CreateManagedIssueBodyParams {
    return {
      githubIssueId,
      requestedDowAmount: payload,
      managerId,
      contributorVisibility: ContributorVisibility.PUBLIC,
      state: ManagedIssueState.OPEN,
    };
  },
  managedIssueFromBodyParams(
    managedIssueId: ManagedIssueId,
    dto: CreateManagedIssueBodyParams,
  ): ManagedIssue {
    return new ManagedIssue(
      managedIssueId,
      dto.githubIssueId,
      dto.requestedDowAmount,
      dto.managerId,
      dto.contributorVisibility,
      dto.state,
    );
  },

  createUserCompanyPermissionTokenBodyParams(
    userEmail: string,
    companyId: CompanyId,
    expiresAt: Date = new Date(Date.now() + 1000 * 60 * 60 * 24), // Default to 1 day in the future
  ): CreateCompanyUserPermissionTokenBodyParams {
    return {
      userName: "lauriane",
      userEmail,
      token: `token-${Math.floor(Math.random() * 1000000)}`,
      companyId,
      companyUserRole: CompanyUserRole.READ,
      expiresAt,
    };
  },

  userCompanyPermissionTokenFromBodyParams(
    tokenId: CompanyUserPermissionTokenId,
    dto: CreateCompanyUserPermissionTokenBodyParams,
  ): CompanyUserPermissionToken {
    return new CompanyUserPermissionToken(
      tokenId,
      dto.userName,
      dto.userEmail,
      dto.token,
      dto.companyId,
      dto.companyUserRole,
      dto.expiresAt,
    );
  },
};

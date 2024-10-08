import {
  Address,
  AddressId,
  Company,
  CompanyId,
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
} from "../../model";
import {
  CreateAddressDto,
  CreateCompanyDto,
  CreateIssueFundingDto,
  CreateLocalUserDto,
  CreateManagedIssueDto,
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
  createUserDto(): CreateLocalUserDto {
    return {
      email: "d@gmail.com" + this.uuid(),
      password: "password",
    } as CreateLocalUserDto;
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
  address(addressId: AddressId): Address {
    return new Address(addressId);
  },
  addressFromDto(addressId: AddressId, dto: CreateAddressDto): Address {
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
  company(
    companyId: CompanyId,
    contactPersonId: UserId | null = null,
    addressId: AddressId | null = null,
  ): Company {
    return new Company(
      companyId,
      null,
      null,
      contactPersonId,
      addressId !== null ? addressId : null,
    );
  },
  companyFromDto(companyId: CompanyId, dto: CreateCompanyDto): Company {
    return new Company(
      companyId,
      dto.taxId ?? null,
      dto.name ?? null,
      dto.contactPersonId ?? null,
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

  issueFundingId(): IssueFundingId {
    const uuid = this.uuid();
    return new IssueFundingId(uuid);
  },

  issueFundingFromDto(
    issueFundingId: IssueFundingId,
    dto: CreateIssueFundingDto,
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
  createManagedIssueDto(
    githubIssueId: IssueId,
    managerId: UserId,
    payload: number = 5000,
  ): CreateManagedIssueDto {
    return {
      githubIssueId,
      requestedDowAmount: payload,
      managerId,
      contributorVisibility: ContributorVisibility.PUBLIC,
      state: ManagedIssueState.OPEN,
    };
  },
  managedIssueFromDto(
    managedIssueId: ManagedIssueId,
    dto: CreateManagedIssueDto,
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
};

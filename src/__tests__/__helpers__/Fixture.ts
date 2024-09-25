import {
  Address,
  AddressId,
  Company,
  CompanyId,
  Email,
  GithubData,
  Issue,
  IssueId,
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
  CreateLocalUserDto,
} from "../../dtos";
import { StripePriceId } from "../../model/stripe/StripePrice";
import { RepositoryRepository } from "../../db";

export const Fixture = {
  id(): number {
    return Math.floor(Math.random() * 1000000);
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
      email: "d@gmail.com" + this.id(),
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
    return new RepositoryId(ownerId, `repo-${id.toString()}`, id);
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
  address(addressId: number): Address {
    return new Address(new AddressId(addressId));
  },
  addressFromDto(addressId: number, dto: CreateAddressDto): Address {
    return new Address(
      new AddressId(addressId),
      dto.name,
      dto.line1,
      dto.line2,
      dto.city,
      dto.state,
      dto.postalCode,
      dto.country,
    );
  },
  company(
    companyId: number,
    contactPersonId: number | null = null,
    addressId: number | null = null,
  ): Company {
    return new Company(
      new CompanyId(companyId),
      null,
      null,
      contactPersonId !== null ? new UserId(contactPersonId) : null,
      addressId !== null ? new AddressId(addressId) : null,
    );
  },
  companyFromDto(companyId: number, dto: CreateCompanyDto): Company {
    return new Company(
      new CompanyId(companyId),
      dto.taxId ?? null,
      dto.name ?? null,
      dto.contactPersonId ?? null,
      dto.addressId ?? null,
    );
  },

  stripeProduct(productId: string): StripeProduct {
    return new StripeProduct(new StripeProductId(productId), "DoW", 1, false);
  },

  stripeInvoice(
    invoiceId: string,
    customerId: string,
    lines: StripeInvoiceLine[],
  ): StripeInvoice {
    return new StripeInvoice(
      new StripeInvoiceId(invoiceId),
      new StripeCustomerId(customerId),
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
  stripeInvoiceLine(
    stripeId: string,
    invoiceId: string,
    customerId: string,
    productId: string,
  ): StripeInvoiceLine {
    return new StripeInvoiceLine(
      new StripeInvoiceLineId(stripeId),
      new StripeInvoiceId(invoiceId),
      new StripeCustomerId(customerId),
      new StripeProductId(productId),
      new StripePriceId("100"),
      100,
    );
  },
};

import { Pool } from "pg";
import { CompanyId, UserId } from "../model";
import { getPool } from "../dbPool";
import { getManualInvoiceRepository } from "./ManualInvoice.repository";
import { logger } from "../config";

export function getDowNumberRepository(): DowNumberRepository {
  return new DowNumberRepositoryImpl(getPool());
}

// TODO: optimize this implementation
export interface DowNumberRepository {
  getAvailableDoWs(userId: UserId, companyId?: CompanyId): Promise<number>;
}

class DowNumberRepositoryImpl implements DowNumberRepository {
  pool: Pool;

  manualInvoiceRepo = getManualInvoiceRepository();

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async getAvailableDoWs(
    userId: UserId,
    companyId?: CompanyId,
  ): Promise<number> {
    let totalDoWsPaid = 0;

    // Calculate total DoW from manual invoices
    const manualInvoices = await this.manualInvoiceRepo.getAllInvoicePaidBy(
      companyId ?? userId,
    );
    totalDoWsPaid += manualInvoices.reduce(
      (acc, invoice) => acc + invoice.dowAmount,
      0,
    );

    // Calculate total DoW from Stripe invoices
    const amountPaidWithStripe = await this.getAllStripeInvoicePaidBy(
      companyId ?? userId,
    );
    totalDoWsPaid += amountPaidWithStripe;

    const totalFunding = await this.getTotalFundingFrom(companyId ?? userId);

    if (totalFunding < 0) {
      logger.error(
        `The amount dow amount (${totalFunding}) is negative for userId ${userId.toString()}, companyId ${companyId ? companyId.toString() : ""}`,
      );
    }

    return totalDoWsPaid - totalFunding;
  }

  private async getAllStripeInvoicePaidBy(
    id: CompanyId | UserId,
  ): Promise<number> {
    let result;

    if (id instanceof CompanyId) {
      const query = `
                SELECT SUM(sl.quantity * sp.unit_amount) AS total_dow_paid
                FROM stripe_invoice_line sl
                         JOIN
                     stripe_product sp ON sl.product_id = sp.stripe_id
                         JOIN
                     stripe_invoice si ON sl.invoice_id = si.stripe_id
                WHERE sl.customer_id IN
                      (SELECT sc.stripe_id
                       FROM user_company uc
                                JOIN stripe_customer sc ON uc.company_id = $1 AND uc.user_id = sc.user_id)
                  AND sp.unit = 'DoW'
                  AND si.paid = TRUE
            `;
      result = await this.pool.query(query, [id.toString()]);
    } else {
      const query = `
                SELECT SUM(sl.quantity * sp.unit_amount) AS total_dow_paid
                FROM stripe_invoice_line sl
                         JOIN
                     stripe_product sp ON sl.product_id = sp.stripe_id
                         JOIN
                     stripe_invoice si ON sl.invoice_id = si.stripe_id
                         JOIN
                     stripe_customer sc ON sl.customer_id = sc.stripe_id
                WHERE sc.user_id = $1
                  AND sp.unit = 'DoW'
                  AND si.paid = true
            `;
      result = await this.pool.query(query, [id.toString()]);
    }

    try {
      return result.rows[0]?.total_dow_paid ?? 0;
    } catch (error) {
      console.error("Error executing query", error);
      throw new Error("Failed to retrieve paid invoice total");
    }
  }

  private async getTotalFundingFrom(id: CompanyId | UserId): Promise<number> {
    let result;

    if (id instanceof CompanyId) {
      const query = `
                SELECT SUM(if.dow_amount) AS total_funding
                FROM issue_funding if
                         JOIN user_company uc ON if.user_id = uc.user_id
                         JOIN managed_issue mi ON if.github_issue_id = mi.github_issue_id
                WHERE uc.company_id = $1
                  AND mi.state != 'rejected'
            `;
      result = await this.pool.query(query, [id.toString()]);
    } else {
      const query = `
                SELECT SUM(if.dow_amount) AS total_funding
                FROM issue_funding if
                         JOIN managed_issue mi ON if.github_issue_id = mi.github_issue_id
                WHERE if.user_id = $1
                  AND mi.state != 'rejected'
            `;
      result = await this.pool.query(query, [id.toString()]);
    }

    try {
      return result.rows[0]?.total_funding ?? 0;
    } catch (error) {
      console.error("Error executing query", error);
      throw new Error("Failed to retrieve total funding amount");
    }
  }
}

/**
 * Input used to format and advance an invoice number sequence.
 *
 * `nextNumber` is both the initial sequence number and the value that should
 * be persisted after the previous invoice is created.
 */
export interface InvoiceNumberGeneratorConfig {
  prefix: string;
  nextNumber: number;
  paddingLength: number;
}

/**
 * Result of generating an invoice number.
 *
 * Persist `nextNumber` only after the caller has successfully committed the
 * corresponding invoice record.
 */
export interface InvoiceNumberGeneration {
  invoiceNumber: string;
  nextNumber: number;
}

/**
 * Pure invoice-number sequence formatter.
 *
 * The generator owns no state and has no dependency on UI, storage, network,
 * or invoice persistence. A caller supplies the current sequence configuration
 * and receives the generated number plus the counter for the next call.
 */
export class InvoiceNumberGenerator {
  /**
   * Formats a counter value using a configurable prefix and zero-padding.
   *
   * @example
   * generator.format({ prefix: 'INV-', nextNumber: 101, paddingLength: 6 })
   * // 'INV-000101'
   */
  public format(config: InvoiceNumberGeneratorConfig): string {
    this.assertValidConfig(config);

    return `${config.prefix}${String(config.nextNumber).padStart(config.paddingLength, '0')}`;
  }

  /**
   * Generates the current invoice number and returns the incremented counter.
   *
   * @example
   * generator.generateNext({ prefix: 'INV-', nextNumber: 1, paddingLength: 6 })
   * // { invoiceNumber: 'INV-000001', nextNumber: 2 }
   */
  public generateNext(config: InvoiceNumberGeneratorConfig): InvoiceNumberGeneration {
    const invoiceNumber = this.format(config);

    return {
      invoiceNumber,
      nextNumber: config.nextNumber + 1,
    };
  }

  private assertValidConfig(config: InvoiceNumberGeneratorConfig): void {
    if (!Number.isSafeInteger(config.nextNumber) || config.nextNumber < 0) {
      throw new RangeError('Invoice number must be a non-negative safe integer.');
    }

    if (!Number.isSafeInteger(config.paddingLength) || config.paddingLength < 0) {
      throw new RangeError('Padding length must be a non-negative safe integer.');
    }

    if (config.nextNumber === Number.MAX_SAFE_INTEGER) {
      throw new RangeError('Invoice number cannot exceed Number.MAX_SAFE_INTEGER.');
    }
  }
}

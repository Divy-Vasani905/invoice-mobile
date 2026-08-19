/**
 * Input used to format and advance an invoice number sequence.
 *
 * `nextNumber` is both the candidate sequence number and, after a successful
 * invoice persist, the value that should be stored for the following invoice.
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
  sequenceNumber: number;
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
   * Values longer than `paddingLength` are never truncated.
   *
   * @example
   * generator.format({ prefix: 'INV-', nextNumber: 1001, paddingLength: 4 })
   * // 'INV-1001'
   */
  public format(config: InvoiceNumberGeneratorConfig): string {
    this.assertValidFormatConfig(config);

    return `${config.prefix}${String(config.nextNumber).padStart(config.paddingLength, '0')}`;
  }

  /**
   * Generates the current invoice number and returns the incremented counter.
   * Does not consult existing invoices — use `findNextAvailable` for uniqueness.
   */
  public generateNext(config: InvoiceNumberGeneratorConfig): InvoiceNumberGeneration {
    this.assertValidAdvanceConfig(config);
    const invoiceNumber = this.format(config);

    return {
      invoiceNumber,
      sequenceNumber: config.nextNumber,
      nextNumber: config.nextNumber + 1,
    };
  }

  /**
   * Finds the first formatted invoice number at or above `config.nextNumber`
   * that is not present in `existingNumbers`. Comparison uses the final string.
   */
  public findNextAvailable(
    config: InvoiceNumberGeneratorConfig,
    existingNumbers: ReadonlySet<string>,
    maxAttempts = 1_000_000,
  ): InvoiceNumberGeneration {
    this.assertValidAdvanceConfig(config);

    let sequence = config.nextNumber;
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      if (sequence > Number.MAX_SAFE_INTEGER) {
        break;
      }

      const invoiceNumber = this.format({
        prefix: config.prefix,
        nextNumber: sequence,
        paddingLength: config.paddingLength,
      });

      if (!existingNumbers.has(invoiceNumber)) {
        if (sequence === Number.MAX_SAFE_INTEGER) {
          throw new RangeError('Invoice number cannot exceed Number.MAX_SAFE_INTEGER.');
        }

        return {
          invoiceNumber,
          sequenceNumber: sequence,
          nextNumber: sequence + 1,
        };
      }

      sequence += 1;
    }

    throw new RangeError('Could not find a unique invoice number.');
  }

  private assertValidFormatConfig(config: InvoiceNumberGeneratorConfig): void {
    if (!Number.isSafeInteger(config.nextNumber) || config.nextNumber < 1) {
      throw new RangeError('Invoice number must be a positive safe integer.');
    }

    if (!Number.isSafeInteger(config.paddingLength) || config.paddingLength < 0) {
      throw new RangeError('Padding length must be a non-negative safe integer.');
    }
  }

  private assertValidAdvanceConfig(config: InvoiceNumberGeneratorConfig): void {
    this.assertValidFormatConfig(config);
    if (config.nextNumber >= Number.MAX_SAFE_INTEGER) {
      throw new RangeError('Invoice number cannot exceed Number.MAX_SAFE_INTEGER.');
    }
  }
}

import {
  DiscountType,
  RoundingMode,
  type InvoiceCalculationInput,
  type InvoiceCalculationOptions,
  type InvoiceCalculationResult,
  type InvoiceLineItemCalculation,
  type InvoiceLineItemInput,
  type InvoiceRounding,
  type TaxAmount,
} from '@/services/invoice/calculation/types/invoice-calculation.types';
import {
  assertCurrencyPrecision,
  calculateBasisPoints,
  multiplyMinorAmountByQuantity,
  roundToIncrement,
  sumMinorAmounts,
} from '@/services/invoice/calculation/utils/fixed-point';

const DEFAULT_ROUNDING: InvoiceRounding = {
  mode: RoundingMode.HalfUp,
  roundingIncrementMinor: 1,
};

/**
 * Dependency-free invoice arithmetic engine.
 *
 * All money enters and leaves the engine as integer minor units. Taxes are
 * additive and calculated after discounts; supply multiple tax definitions to
 * model any combination, such as regional and federal taxes.
 */
export class InvoiceCalculationEngine {
  /**
   * Calculates subtotal, discount, additive taxes, and total for one line.
   *
   * The item subtotal is unit price × quantity before discount. Fixed and
   * percentage discounts are capped at the item subtotal. Each tax is applied
   * to the discounted subtotal and individually rounded to a minor unit.
   */
  public calculateLineItem(
    item: InvoiceLineItemInput,
    options: InvoiceCalculationOptions,
  ): InvoiceLineItemCalculation {
    const rounding = this.resolveRounding(options);
    const subtotalMinor = multiplyMinorAmountByQuantity(
      item.unitPriceMinor,
      item.quantity,
      rounding.mode,
    );
    const discountMinor = this.calculateDiscount(item, subtotalMinor, rounding.mode);
    const taxableAmountMinor = subtotalMinor - discountMinor;
    const taxes = (item.taxes ?? []).map((tax) => ({
      tax,
      amountMinor: calculateBasisPoints(taxableAmountMinor, tax.rateBasisPoints, rounding.mode),
    }));
    const taxMinor = sumMinorAmounts(taxes.map((tax) => tax.amountMinor));

    return {
      itemId: item.id,
      subtotalMinor,
      discountMinor,
      taxMinor,
      totalMinor: taxableAmountMinor + taxMinor,
      taxes,
    };
  }

  /**
   * Calculates every line, aggregates invoice totals, applies final round-off,
   * and returns a complete immutable calculation result.
   */
  public calculateInvoice(input: InvoiceCalculationInput): InvoiceCalculationResult {
    const rounding = this.resolveRounding(input);
    const itemTotals = input.items.map((item) => this.calculateLineItem(item, input));
    const subtotalMinor = sumMinorAmounts(itemTotals.map((item) => item.subtotalMinor));
    const discountTotalMinor = sumMinorAmounts(itemTotals.map((item) => item.discountMinor));
    const lineTaxTotalMinor = sumMinorAmounts(itemTotals.map((item) => item.taxMinor));
    const taxableAmountMinor = subtotalMinor - discountTotalMinor;
    const invoiceTaxTotals = (input.invoiceTaxes ?? []).map((tax) => ({
      tax,
      amountMinor: calculateBasisPoints(taxableAmountMinor, tax.rateBasisPoints, rounding.mode),
    }));
    const invoiceTaxTotalMinor = sumMinorAmounts(
      invoiceTaxTotals.map((taxAmount) => taxAmount.amountMinor),
    );
    const taxTotalMinor = lineTaxTotalMinor + invoiceTaxTotalMinor;
    const preRoundingTotalMinor =
      sumMinorAmounts(itemTotals.map((item) => item.totalMinor)) + invoiceTaxTotalMinor;
    const grandTotalMinor = roundToIncrement(
      preRoundingTotalMinor,
      rounding.roundingIncrementMinor,
      rounding.mode,
    );

    return {
      currencyPrecision: input.currencyPrecision,
      subtotalMinor,
      discountTotalMinor,
      taxTotalMinor,
      preRoundingTotalMinor,
      roundOffMinor: grandTotalMinor - preRoundingTotalMinor,
      grandTotalMinor,
      itemTotals,
      taxTotals: this.aggregateTaxes(itemTotals, invoiceTaxTotals),
    };
  }

  private calculateDiscount(
    item: InvoiceLineItemInput,
    subtotalMinor: number,
    roundingMode: RoundingMode,
  ): number {
    const discount = item.discount ?? { type: DiscountType.None };

    switch (discount.type) {
      case DiscountType.None:
        return 0;
      case DiscountType.FixedAmount:
        if (!Number.isSafeInteger(discount.amountMinor) || discount.amountMinor < 0) {
          throw new RangeError('Fixed discount must be a non-negative safe integer.');
        }

        return Math.min(discount.amountMinor, subtotalMinor);
      case DiscountType.Percentage:
        if (
          !Number.isSafeInteger(discount.rateBasisPoints) ||
          discount.rateBasisPoints < 0 ||
          discount.rateBasisPoints > 10_000
        ) {
          throw new RangeError('Percentage discount must be between 0 and 10,000 basis points.');
        }

        return calculateBasisPoints(subtotalMinor, discount.rateBasisPoints, roundingMode);
    }
  }

  private aggregateTaxes(
    items: readonly InvoiceLineItemCalculation[],
    invoiceTaxes: readonly TaxAmount[] = [],
  ): readonly TaxAmount[] {
    const totals = new Map<string, TaxAmount>();

    for (const item of items) {
      for (const taxAmount of item.taxes) {
        const existing = totals.get(taxAmount.tax.id);

        totals.set(taxAmount.tax.id, {
          tax: taxAmount.tax,
          amountMinor: (existing?.amountMinor ?? 0) + taxAmount.amountMinor,
        });
      }
    }

    for (const taxAmount of invoiceTaxes) {
      const existing = totals.get(taxAmount.tax.id);
      totals.set(taxAmount.tax.id, {
        tax: taxAmount.tax,
        amountMinor: (existing?.amountMinor ?? 0) + taxAmount.amountMinor,
      });
    }

    return [...totals.values()];
  }

  private resolveRounding(options: InvoiceCalculationOptions): InvoiceRounding {
    assertCurrencyPrecision(options.currencyPrecision);

    const rounding = options.rounding ?? DEFAULT_ROUNDING;
    roundToIncrement(0, rounding.roundingIncrementMinor, rounding.mode);

    return rounding;
  }
}

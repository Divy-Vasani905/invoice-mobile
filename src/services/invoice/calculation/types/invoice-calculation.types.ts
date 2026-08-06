/**
 * An amount represented in integer minor currency units.
 *
 * The value is interpreted using `currencyPrecision`; for example, `1250`
 * means 12.50 when the precision is 2.
 */
export type MinorAmount = number;

/**
 * Quantity accepts a decimal string to preserve exact fractional quantities.
 * Numeric values are also supported for convenience.
 */
export type Quantity = number | string;

export enum DiscountType {
  None = 'none',
  FixedAmount = 'fixed_amount',
  Percentage = 'percentage',
}

export interface NoDiscount {
  type: DiscountType.None;
}

export interface FixedAmountDiscount {
  type: DiscountType.FixedAmount;
  amountMinor: MinorAmount;
}

export interface PercentageDiscount {
  type: DiscountType.Percentage;
  rateBasisPoints: number;
}

export type LineItemDiscount = NoDiscount | FixedAmountDiscount | PercentageDiscount;

/**
 * Country-neutral tax definition. Multiple definitions can be attached to a
 * line item and are applied additively after its discount.
 */
export interface TaxDefinition {
  id: string;
  name: string;
  rateBasisPoints: number;
}

export enum RoundingMode {
  HalfUp = 'half_up',
  Down = 'down',
  Up = 'up',
}

/**
 * Governs rounding for calculated fractions and the final invoice total.
 *
 * `roundingIncrementMinor` is the smallest final-total increment. For
 * example, 1 preserves the currency's minor unit and 100 rounds a 2-decimal
 * currency to its whole major unit.
 */
export interface InvoiceRounding {
  mode: RoundingMode;
  roundingIncrementMinor: MinorAmount;
}

export interface InvoiceCalculationOptions {
  /**
   * Number of decimal places used by the invoice currency, such as 0, 2, or 3.
   * All monetary inputs and outputs use this precision's minor units.
   */
  currencyPrecision: number;
  rounding?: InvoiceRounding;
}

export interface InvoiceLineItemInput {
  id: string;
  unitPriceMinor: MinorAmount;
  quantity: Quantity;
  discount?: LineItemDiscount;
  taxes?: readonly TaxDefinition[];
}

export interface InvoiceCalculationInput extends InvoiceCalculationOptions {
  items: readonly InvoiceLineItemInput[];
}

export interface TaxAmount {
  tax: TaxDefinition;
  amountMinor: MinorAmount;
}

export interface InvoiceLineItemCalculation {
  itemId: string;
  subtotalMinor: MinorAmount;
  discountMinor: MinorAmount;
  taxMinor: MinorAmount;
  totalMinor: MinorAmount;
  taxes: readonly TaxAmount[];
}

export interface InvoiceCalculationResult {
  currencyPrecision: number;
  subtotalMinor: MinorAmount;
  discountTotalMinor: MinorAmount;
  taxTotalMinor: MinorAmount;
  preRoundingTotalMinor: MinorAmount;
  roundOffMinor: MinorAmount;
  grandTotalMinor: MinorAmount;
  itemTotals: readonly InvoiceLineItemCalculation[];
  taxTotals: readonly TaxAmount[];
}

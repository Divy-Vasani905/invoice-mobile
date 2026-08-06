import {
  RoundingMode,
  type Quantity,
} from '@/services/invoice/calculation/types/invoice-calculation.types';

type Rational = {
  numerator: bigint;
  denominator: bigint;
};

/**
 * Converts a decimal quantity into an exact rational value without performing
 * currency arithmetic with JavaScript floating-point numbers.
 */
export function quantityToRational(quantity: Quantity): Rational {
  const value = typeof quantity === 'number' ? numberToDecimalString(quantity) : quantity;

  if (!/^\d+(?:\.\d+)?$/.test(value)) {
    throw new RangeError('Quantity must be a non-negative decimal value.');
  }

  const [whole, fractional = ''] = value.split('.');
  const digits = `${whole}${fractional}`;
  const denominator = 10n ** BigInt(fractional.length);

  return {
    numerator: BigInt(digits),
    denominator,
  };
}

/**
 * Multiplies an integer minor-unit amount by a decimal quantity and rounds it
 * to a minor-unit integer using the supplied deterministic rounding mode.
 */
export function multiplyMinorAmountByQuantity(
  amountMinor: number,
  quantity: Quantity,
  roundingMode: RoundingMode,
): number {
  assertNonNegativeSafeInteger(amountMinor, 'Amount');

  const rational = quantityToRational(quantity);
  return bigintToSafeNumber(
    divideAndRound(BigInt(amountMinor) * rational.numerator, rational.denominator, roundingMode),
  );
}

/** Calculates a basis-point percentage of an integer minor-unit amount. */
export function calculateBasisPoints(
  amountMinor: number,
  rateBasisPoints: number,
  roundingMode: RoundingMode,
): number {
  assertNonNegativeSafeInteger(amountMinor, 'Amount');
  assertNonNegativeSafeInteger(rateBasisPoints, 'Rate');

  return bigintToSafeNumber(
    divideAndRound(BigInt(amountMinor) * BigInt(rateBasisPoints), 10_000n, roundingMode),
  );
}

/** Rounds a non-negative minor-unit amount to a configurable final increment. */
export function roundToIncrement(
  amountMinor: number,
  incrementMinor: number,
  roundingMode: RoundingMode,
): number {
  assertNonNegativeSafeInteger(amountMinor, 'Amount');
  assertPositiveSafeInteger(incrementMinor, 'Rounding increment');

  const increment = BigInt(incrementMinor);
  const roundedSteps = divideAndRound(BigInt(amountMinor), increment, roundingMode);

  return bigintToSafeNumber(roundedSteps * increment);
}

/** Ensures a configured currency precision is a valid decimal-place count. */
export function assertCurrencyPrecision(currencyPrecision: number): void {
  assertNonNegativeSafeInteger(currencyPrecision, 'Currency precision');
}

/** Returns an exact integer total or fails before JavaScript precision is lost. */
export function sumMinorAmounts(amounts: readonly number[]): number {
  const total = amounts.reduce((sum, amount) => {
    assertNonNegativeSafeInteger(amount, 'Amount');
    return sum + BigInt(amount);
  }, 0n);

  return bigintToSafeNumber(total);
}

function divideAndRound(
  numerator: bigint,
  denominator: bigint,
  roundingMode: RoundingMode,
): bigint {
  const quotient = numerator / denominator;
  const remainder = numerator % denominator;

  if (remainder === 0n || roundingMode === RoundingMode.Down) {
    return quotient;
  }

  if (roundingMode === RoundingMode.Up) {
    return quotient + 1n;
  }

  return remainder * 2n >= denominator ? quotient + 1n : quotient;
}

function numberToDecimalString(value: number): string {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError('Quantity must be a non-negative finite number.');
  }

  const stringValue = String(value);
  if (!/[eE]/.test(stringValue)) {
    return stringValue;
  }

  const exponentParts = stringValue.toLowerCase().split('e');
  const coefficient = exponentParts[0];
  const exponentText = exponentParts[1];

  if (coefficient == null || exponentText == null) {
    throw new RangeError('Quantity must be a valid decimal number.');
  }

  const exponent = Number(exponentText);
  const unsignedCoefficient = coefficient.startsWith('-') ? coefficient.slice(1) : coefficient;
  const coefficientParts = unsignedCoefficient.split('.');
  const whole = coefficientParts[0];
  const fractional = coefficientParts[1] ?? '';

  if (whole == null) {
    throw new RangeError('Quantity must be a valid decimal number.');
  }

  const digits = `${whole}${fractional}`;
  const decimalIndex = whole.length + exponent;

  if (decimalIndex <= 0) {
    return `0.${'0'.repeat(-decimalIndex)}${digits}`;
  }

  if (decimalIndex >= digits.length) {
    return `${digits}${'0'.repeat(decimalIndex - digits.length)}`;
  }

  return `${digits.slice(0, decimalIndex)}.${digits.slice(decimalIndex)}`;
}

function assertNonNegativeSafeInteger(value: number, label: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${label} must be a non-negative safe integer.`);
  }
}

function assertPositiveSafeInteger(value: number, label: string): void {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new RangeError(`${label} must be a positive safe integer.`);
  }
}

function bigintToSafeNumber(value: bigint): number {
  if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new RangeError('Calculated amount exceeds Number.MAX_SAFE_INTEGER.');
  }

  return Number(value);
}

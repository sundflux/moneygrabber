import { BadGatewayException, Injectable } from '@nestjs/common';
import { CommissionRequestTdo } from './dto/commissionRequest.tdo';
import { CommissionResponseTdo } from './dto/commissionResponse.dto';
import { CurrencyRatesResponseTdo } from './dto/currencyRatesResponse.tdo';
import { Transaction } from './entities/transaction.entity';

@Injectable()
export class CommissionService {
  // Our temporary in-memory "fake db" for keeping up transactions.
  private transactions: any = [];

  // Commissions in euros.
  BASE_COMMISSION = 0.05;
  BASE_COMMISSION_DISCOUNTED = 0.03;

  // Commission modifier, when not using absolute values.
  BASE_COMMISSION_MODIFIER = 0.5;

  // After this € amount, commission drops to BASE_COMMISSION value.
  BASE_TURNOVER_DISCOUNT_LIMIT = 1000.0;

  /**
   * Gets cached list of currency rates.
   * 
   * "npm update:rates" to update.
   * 
   * @returns 
   */
  fetchCurrencyExchangeRate(): CurrencyRatesResponseTdo {
    const fs = require('fs');
    const cached = fs.readFileSync('./dist/currency-rates-cached.json');
    const json: CurrencyRatesResponseTdo = JSON.parse(cached);
    return json;
  }

  /**
   * Gets exchange rate for given currency.
   * 
   * @param currencyCode 
   * @returns 
   */
  getCurrencyExchangeRate(currencyCode): number {
    let exchangeRate = 1;
    try {
      const currencyRatesResponse = this.fetchCurrencyExchangeRate();
      if (currencyRatesResponse.rates[currencyCode]) {
          return currencyRatesResponse.rates[currencyCode];
      }
      return exchangeRate;
    } catch (err) {
      throw new BadGatewayException('Currency rate API did not respond');
    }
  }

  /**
   * Calculate commission.
   *
   * @param commissionRequest
   * @returns
   */
  calculateCommission(
    commissionRequest: CommissionRequestTdo,
  ): CommissionResponseTdo {
    let calculatedFinalCommission = 0;

    // Currency rate conversion, amount always to EUR:
    const currencyExchangeRate = this.getCurrencyExchangeRate(
      commissionRequest.currency,
    );
    console.log('Exchange rate for ' + commissionRequest.currency + ': ' + currencyExchangeRate);

    let baseAmountEUR =
      Number(commissionRequest.amount) * (1 / currencyExchangeRate);
    baseAmountEUR = Number(baseAmountEUR.toFixed(2));

    // Discount rules:
    const calculatedBaseCommission =
      Number(baseAmountEUR) * this.BASE_COMMISSION_MODIFIER;
    calculatedFinalCommission = calculatedBaseCommission / 100;

    // Additional discount rules modify commission only if rules match:
    calculatedFinalCommission = this.discountRuleDiscountedClient(
      calculatedFinalCommission,
      commissionRequest,
    );
    calculatedFinalCommission = this.discountRuleHighVolumeClient(
      calculatedFinalCommission,
      commissionRequest,
    );

    // Keep track of transaction history.
    this.addTransaction({
      client_id: commissionRequest.client_id,
      date: commissionRequest.date,
      amount: baseAmountEUR.toString(),
      currency: 'EUR',
    });

    calculatedFinalCommission = Number(calculatedFinalCommission.toFixed(2));
    console.log('Final calculated commission:');
    console.log(calculatedFinalCommission);

    return {
      amount: calculatedFinalCommission.toString(),
      currency: 'EUR',
    };
  }

  discountRuleDiscountedClient(
    calculatedFinalCommission: number,
    commissionRequest: CommissionRequestTdo,
  ): number {
    // Discounted clients by cap to BASE_COMMISSION.
    if (this.isDiscountedClient(commissionRequest)) {
      calculatedFinalCommission = this.BASE_COMMISSION;
    } else {
      // Others should pay at least BASE_COMMISSION.
      if (calculatedFinalCommission < this.BASE_COMMISSION) {
        calculatedFinalCommission = this.BASE_COMMISSION;
      }
    }
    return calculatedFinalCommission;
  }

  discountRuleHighVolumeClient(
    calculatedFinalCommission: number,
    commissionRequest: CommissionRequestTdo,
  ): number {
    if (this.hasHighTurnoverDiscount(commissionRequest)) {
      calculatedFinalCommission = this.BASE_COMMISSION_DISCOUNTED;
      console.log(
        'High turnover limit ' +
          this.BASE_TURNOVER_DISCOUNT_LIMIT +
          ' exceeded, commission ' +
          this.BASE_COMMISSION_DISCOUNTED,
      );
    }
    return calculatedFinalCommission;
  }

  /**
   * Keep track of transactions.
   * In real life, this would be a database or an API :)
   *
   * @param transaction
   */
  addTransaction(transaction: Transaction): void {
    this.transactions.push(transaction);
  }

  /**
   * Calculate if client has transactions equel or exceeding
   * the BASE_TURNOVER_DISCOUNT_LIMIT limit. Returns true if so.
   *
   * @param commissionRequest
   * @returns boolean
   */
  hasHighTurnoverDiscount(commissionRequest: CommissionRequestTdo): boolean {
    // No transactions yet.
    if (!this.transactions) {
      return false;
    }

    let currentMonthTransactionsInEur = 0;
    const requestDate = new Date(commissionRequest.date);

    // Client transactions:
    const clientTransactions: Array<Transaction> = this.transactions.filter(
      (transaction: { client_id: number }) =>
        transaction.client_id === commissionRequest.client_id,
    );
    if (!clientTransactions) {
      return false;
    }

    for (const i in clientTransactions) {
      // Only loop as long as we have to.
      if (currentMonthTransactionsInEur >= this.BASE_TURNOVER_DISCOUNT_LIMIT)
        break;

      const transaction = clientTransactions[i];
      const transactionDate = new Date(transaction.date);
      if (
        transactionDate.getMonth() == requestDate.getMonth() &&
        transactionDate.getFullYear() == requestDate.getFullYear()
      ) {
        currentMonthTransactionsInEur += Number(transaction.amount);
      }
    }

    return currentMonthTransactionsInEur >= this.BASE_TURNOVER_DISCOUNT_LIMIT
      ? true
      : false;
  }

  /**
   * Discounted client rules.
   *
   * @param commissionRequest
   * @returns
   */
  isDiscountedClient(commissionRequest: CommissionRequestTdo): boolean {
    return Number(commissionRequest.client_id) === 42 ? true : false;
  }
}

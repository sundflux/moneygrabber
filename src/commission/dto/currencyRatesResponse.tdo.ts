export class CurrencyRatesResponseTdo {
    motd?: string;
    success: boolean;
    historical: boolean;
    base: string;
    date: string;
    rates: Record<string, number>;
}
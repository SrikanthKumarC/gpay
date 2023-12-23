export const calculateCashback = (amount: number): number => {
    // if amount is multiple of 500 then no cashback
    // if not, then calculate cashback as 5% of amount until 1000 and 2% of amount above 1000
    // generate a random number between 0 and 1 and if it is less than 0.5 then return 0
    // only 70% of transactions are eligible for cashback apparently
    const randomNumber = Math.random();
    if (amount % 500 === 0) {
        return 0;
    }
    if (randomNumber <= 0.3) {
        return 0;
    }
    if (amount <= 1000) {
        return 0.05 * amount;
    }
    return 0.02 * amount;
}


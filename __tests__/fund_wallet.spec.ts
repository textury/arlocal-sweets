import Sweets from '../src';
import { blockweave, wallet } from '../test-setup';

describe('sweets.fundWallet()', () => {
  it('should fund wallet with 1 AR', async () => {
    const sweets = new Sweets(blockweave, wallet);
    await expect(sweets.fundWallet(1e12)).resolves.toEqual(1e12);

    const address = await blockweave.wallets.jwkToAddress(wallet);
    const balance = await blockweave.wallets.getBalance(address);
    expect(balance).toEqual(`${1e12}`);
    expect(parseInt(blockweave.ar.winstonToAr(balance), 10)).toEqual(1);
  });
});

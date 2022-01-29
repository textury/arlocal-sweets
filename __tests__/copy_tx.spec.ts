import Blockweave from 'blockweave';
import Sweets from '../src';
import { blockweave, wallet } from '../test-setup';

describe('sweets.copyTransaction()', () => {
  it('should copy tx from mainnet', async () => {
    const id = 'CKRSJ1s8MKk5dPl5V-bEI3FTGxK9CieI-d3c7HHbvLI';
    const mainnet = new Blockweave();
    const sweets = new Sweets(blockweave, wallet);

    await sweets.fundWallet(1e12);
    const txid = await sweets.copyTransaction(id);

    const tx = await blockweave.transactions.get(txid);
    const netTx = await mainnet.transactions.get(id);

    expect(tx.tags).toEqual(netTx.tags);
    expect(tx.data).toEqual(netTx.data);
    expect(tx.data_root).toEqual(netTx.data_root);
    expect(parseInt(tx.data_size, 10)).toEqual(parseInt(netTx.data_size, 10));
    expect(tx.target).toEqual(netTx.target);
  });
});

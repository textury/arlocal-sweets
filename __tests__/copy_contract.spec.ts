import Sweets from '../src';
import { searchForTag } from '../src/utils/tags';
import { blockweave, wallet } from '../test-setup';

describe('sweets.copyContract()', () => {
  it('should copy a contract from mainnet', async () => {
    const id = 'usjm4PCxUd5mtaon7zc97-dt-3qf67yPyqgzLnLqk5A'; // verto community contract
    const sweets = new Sweets(blockweave, wallet);

    await sweets.fundWallet(1e12);
    const initStateId = await sweets.copyContract(id);
    const tx = await blockweave.transactions.get(initStateId);

    expect(searchForTag(tx, 'Content-Type')).toEqual('application/json');
    expect(searchForTag(tx, 'App-Name')).toEqual('SmartWeaveContract');
    const srcId = searchForTag(tx, 'Contract-Src');
    expect(srcId).toMatch(/[a-z0-9_-]{43}/i);

    // validate src contract
    const srcTx = await blockweave.transactions.get(srcId);
    expect(searchForTag(srcTx, 'Content-Type')).toEqual('application/javascript');
    expect(searchForTag(srcTx, 'App-Name')).toEqual('SmartWeaveContractSource');
  });

  it('should throw invalid contract transaction error', async () => {
    const id = 'CKRSJ1s8MKk5dPl5V-bEI3FTGxK9CieI-d3c7HHbvLI';
    const sweets = new Sweets(blockweave, wallet);

    await sweets.fundWallet(1e12);
    await expect(sweets.copyContract(id)).rejects.toEqual(
      new Error('Transaction is not a SmartWeave contract')
    );
  });
});

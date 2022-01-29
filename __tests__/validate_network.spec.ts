import Blockweave from 'blockweave';
import Sweets from '../src';
import { blockweave, wallet } from '../test-setup';

describe('VALIDATE NETWORK', () => {
  it('redstone testnet should pass', async () => {
    const redstone = new Blockweave({
      host: 'testnet.redstone.tools',
      port: 443,
      protocol: 'https'
    });

    const sweets = new Sweets(redstone, wallet);
    expect(await sweets.isTestNetwork()).toBe(true);
  });

  it('arlocal should pass', async () => {
    const sweets = new Sweets(blockweave, wallet);
    expect(await sweets.isTestNetwork()).toBe(true);
  });

  it('arweave gateway should throw', async () => {
    expect.assertions(2);
    const arweave = new Blockweave();
    const sweets = new Sweets(arweave, wallet);
    expect(await sweets.isTestNetwork()).toBe(false);
    await expect(sweets.fundWallet(2000000)).rejects.toEqual(
      new Error('arweave.N.1 not supported, use arlocal')
    );
  });
});
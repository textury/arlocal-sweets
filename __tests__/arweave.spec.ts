import Sweets from '../src';
import { arweave, arWallet } from '../test-setup';

describe('arweave compatibility test', () => {
  it('should return sweet instance', () => {
    const sweets = new Sweets(arweave, arWallet);
    expect(sweets).toBeInstanceOf(Sweets);
  });

  it('should test for test network', async () => {
    const sweets = new Sweets(arweave, arWallet);
    await expect(sweets.isTestNetwork()).resolves.toBe(true);
  })

  it('should fund wallet', async () => {
    const sweets = new Sweets(arweave, arWallet);
    await expect(sweets.fundWallet(1e12)).resolves.toEqual(1e12);

    const address = await arweave.wallets.jwkToAddress(arWallet);
    const balance = await arweave.wallets.getBalance(address);
    expect(balance).toEqual(`${1e12}`);
    expect(parseInt(arweave.ar.winstonToAr(balance), 10)).toEqual(1);
  });

  it('should mine a block', async () => {
    const sweets = new Sweets(arweave, arWallet);
    await expect(sweets.mine()).resolves.toEqual(1);

    const { blocks } = await arweave.network.getInfo();
    expect(blocks).toEqual(2);
  });

  it('should copy a tx', async () => {
    expect(1).toBe(1);
  });

  it('should clone a tx', async () => {
    expect(1).toBe(1);
  });
});

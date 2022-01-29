import Arweave from 'arweave';
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
    const id = 'CKRSJ1s8MKk5dPl5V-bEI3FTGxK9CieI-d3c7HHbvLI';
    const mainnet = new Arweave({
      host: 'arweave.net',
      port: 443,
      protocol: 'https'
    });

    const sweets = new Sweets(arweave, arWallet);

    await sweets.fundWallet(1e12);
    const txid = await sweets.copyTransaction(id);

    const tx = await arweave.transactions.get(txid);
    const netTx = await mainnet.transactions.get(id);

    expect(tx.tags).toEqual(netTx.tags);
    expect(tx.data_root).toEqual(netTx.data_root);
    expect(parseInt(tx.data_size, 10)).toEqual(parseInt(netTx.data_size, 10));
    expect(tx.target).toEqual(netTx.target);
  });

  it('should clone a tx', async () => {
    const id = 'CKRSJ1s8MKk5dPl5V-bEI3FTGxK9CieI-d3c7HHbvLI';
    const mainnet = new Arweave({
      host: 'arweave.net',
      port: 443,
      protocol: 'https'
    });

    const sweets = new Sweets(arweave, arWallet);

    await sweets.fundWallet(1e12);
    const txid = await sweets.cloneTransaction(id);

    const tx = await arweave.transactions.get(txid);
    const netTx = await mainnet.transactions.get(id);

    expect(tx.tags).toEqual(netTx.tags);
    expect(tx.data_root).toEqual(netTx.data_root);
    expect(parseInt(tx.data_size, 10)).toEqual(parseInt(netTx.data_size, 10));
    expect(tx.target).toEqual(netTx.target);
    // compare id and signature also
    expect(tx.id).toEqual(netTx.id);
    expect(tx.signature).toEqual(netTx.signature);
  });
});

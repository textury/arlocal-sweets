import Arlocal from 'arlocal';
import Blockweave from 'blockweave';
import Arweave from 'arweave';
import { JWKInterface } from "blockweave/dist/faces/lib/wallet";

export let port: number;
export let wallet: JWKInterface;
export let arWallet: JWKInterface;
export let blockweave: Blockweave;
export let arweave: Arweave;
export let arlocal: Arlocal;
let fn: any;

jest.setTimeout(30000);
beforeEach(async () => {
  // start arlocal
  port = Math.floor(Math.random() * (9000 - 5000 + 1) + 5000);
  arlocal = new Arlocal(port, true);
  await arlocal.start();
  
  blockweave = new Blockweave({
    host: 'localhost',
    port,
    protocol: 'http',
    timeout: 20000,
    logging: true,
  });

  arweave = new Arweave({
    host: 'localhost',
    port,
    protocol: 'http',
    timeout: 20000,
    logging: true,
  });

  // generate wallet
  wallet = await blockweave.wallets.generate();

  // generate ar wallet
  arWallet = await arweave.wallets.generate();

  fn = jest.spyOn(console, 'error').mockImplementation(() => null);
});

afterEach(async () => {
  // stop arlocal
  await arlocal.stop();

  port = null;
  arlocal = null;
  blockweave = null;
  arweave = null;
  wallet = null;

  fn.mockRestore();
});

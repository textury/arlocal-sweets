import Arlocal from 'arlocal';
import Blockweave from 'blockweave';
import { JWKInterface } from "blockweave/dist/faces/lib/wallet";

export let port: number;
export let wallet: JWKInterface;
export let blockweave: Blockweave;
export let arlocal: Arlocal;
let fn: any;

jest.setTimeout(30000);
beforeAll(async () => {
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

  // generate wallet
  wallet = await blockweave.wallets.generate();

  fn = jest.spyOn(console, 'error').mockImplementation(() => null);
});

afterAll(async () => {
  // stop arlocal
  await arlocal.stop();

  port = null;
  arlocal = null;
  blockweave = null;
  wallet = null;

  fn.mockRestore();
});

import Blockweave from 'blockweave';
import { JWKInterface } from 'blockweave/dist/faces/lib/wallet';

export default class ArlocalSweets {
  public _blockweave: Blockweave;
  private _wallet: JWKInterface;

  constructor (blockweave: Blockweave, wallet: JWKInterface) {
    this._blockweave = blockweave;
    this._wallet = wallet;

    // Validate blockweave
    this._validateNetwork();
    // Support chaining of methods
    return this;
  }
   
  private async _validateNetwork(): Promise<void> {
    const { network } = await this._blockweave.network.getInfo();
    if (!network.toLowerCase().includes('arlocal')) {
      throw new Error(`${network} not supported, use arlocal`);
    }
  }
}

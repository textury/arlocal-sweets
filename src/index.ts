import Blockweave from "blockweave";
import { JWKInterface } from "blockweave/dist/faces/lib/wallet";

export default class ArlocalSweets {
  public _blockweave: Blockweave;
  private _wallet: JWKInterface;

  constructor(blockweave: Blockweave, wallet: JWKInterface) {
    this._blockweave = blockweave;
    this._wallet = wallet;

    // Validate blockweave
    this._validateNetwork();
    // Support chaining of methods
    return this;
  }

  private async _validateNetwork(): Promise<void> {
    const { network } = await this._blockweave.network.getInfo();
    if (!network.toLowerCase().includes("arlocal")) {
      throw new Error(`${network} not supported, use arlocal`);
    }
  }

  /**
   *
   * @param amount Amount in winston
   * @returns Amount funded in winston
   */
  public async fundWallet(amount: number): Promise<number> {
    const address = await this._blockweave.wallets.jwkToAddress(this._wallet);
    const { data } = await this._blockweave.api.get(
      `/mint/${address}/${amount}`
    );
    return data;
  }

  /**
   *
   * @param blocks Amount of blocks to mine
   * @returns Amount of blocks mined
   */
  public async mine(blocks?: number): Promise<number> {
    blocks = blocks || 1;
    await this._blockweave.api.get(`/mine/${blocks}`);

    return blocks;
  }
}

import Blockweave from "blockweave";
import { JWKInterface } from "blockweave/dist/faces/lib/wallet";
import { Tag } from "blockweave/dist/lib/tag";
import Transaction from "blockweave/dist/lib/transaction";
import { cloneTx, copyTx } from "./utils/transaction";

export default class ArlocalSweets {
  public _blockweave: Blockweave;
  private _wallet: JWKInterface;
  private _mainnet: Blockweave = new Blockweave();

  constructor(blockweave: Blockweave, wallet: JWKInterface) {
    this._blockweave = blockweave;
    this._wallet = wallet;
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
   * @returns True if network is valid, and vice versa
   */
  public async isTestNetwork() {
    try {
      await this._validateNetwork();
    } catch (e) {
      return false;
    }

    return true;
  }

  /**
   *
   * @param amount Amount in winston
   * @returns Amount funded in winston
   */
  public async fundWallet(amount: number): Promise<number> {
    // Validate blockweave
    await this._validateNetwork();
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
    // Validate blockweave
    await this._validateNetwork();
    blocks = blocks || 1;
    await this._blockweave.api.get(`/mine/${blocks}`);

    return blocks;
  }

  /**
   *
   * @param txid Mainnet transaction id
   * @returns Arlocal transaction id
   */
  public async copyTransaction(txid: string): Promise<string> {
    // Validate blockweave
    await this._validateNetwork();
    let data = "";
    const { data: resp } = await this._mainnet.api.get(`/tx/${txid}/status`);
    if (typeof resp === "string") {
      throw new Error(`Transaction returned status of: ${resp}`);
    }

    try {
      ({ data } = await this._mainnet.api.get(`/${txid}`));
    } catch (e) {}

    const tx: Transaction = await this._mainnet.transactions.get(txid);
    const id = await copyTx(tx, this._blockweave, this._wallet, data);

    await this.mine();
    return id;
  }

  public async cloneTransaction(txid: string) {
    let data = "";
    const { data: resp } = await this._mainnet.api.get(`/tx/${txid}/status`);
    if (typeof resp === "string") {
      throw new Error(`Transaction returned status of: ${resp}`);
    }

    try {
      ({ data } = await this._mainnet.api.get(`/${txid}`));
    } catch (e) {}

    const tx: Transaction = await this._mainnet.transactions.get(txid);
    const id = await cloneTx(tx, this._blockweave, this._wallet, data);

    await this.mine();
    return id;
  }
}

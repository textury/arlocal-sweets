import Blockweave from "blockweave";
import { JWKInterface } from "blockweave/dist/faces/lib/wallet";
import { Tag } from "blockweave/dist/lib/tag";
import Transaction from "blockweave/dist/lib/transaction";

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
    const localTx = await this._blockweave.createTransaction(
      {
        data,
      },
      this._wallet
    );

    // map tags
    const tags: Tag[] = tx.get("tags") as string & Tag[];
    tags.forEach((tag) => {
      localTx.addTag(
        tag.get("name", { decode: true, string: true }),
        tag.get("value", { decode: true, string: true })
      );
    });

    await this._blockweave.transactions.sign(localTx, this._wallet);

    const uploader = await this._blockweave.transactions.getUploader(localTx);

    while (!uploader.isComplete) {
      try {
        await uploader.uploadChunk();
      } catch (e) {
        const { msg } = uploader.lastResponseError as string & {
          code: number;
          msg: string;
        };
        if (msg) {
          console.log(uploader.lastResponseError);
          return msg;
        }

        console.error(uploader.lastResponseError);
      }
    }

    await this.mine();

    return localTx.id;
  }
}

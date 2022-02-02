import Blockweave from "blockweave";
import Arweave from "arweave";
import { JWKInterface } from "blockweave/dist/faces/lib/wallet";
import Transaction from "blockweave/dist/lib/transaction";
import { Tag } from "blockweave/dist/lib/tag";
import { PromisePool } from "@supercharge/promise-pool";
import { cloneTx, copyTx } from "./utils/transaction";
import { searchForTag } from "./utils/tags";
import { PTag } from "./faces/tags";
import { atob } from "./utils/utils";

export default class ArlocalSweets {
  public _blockweave: Blockweave | Arweave;
  private _wallet: JWKInterface;
  private _mainnet: Blockweave = new Blockweave();

  constructor(blockweave: Blockweave | Arweave, wallet: JWKInterface) {
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

  /**
   *
   * @param txid Mainnet transaction id
   * @returns Arlocal transaction id
   */
  public async cloneTransaction(txid: string): Promise<string> {
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
    const id = await cloneTx(tx, this._blockweave, this._wallet, data);

    await this.mine();
    return id;
  }

  /**
   *
   * @param txid Mainnet contract initial state transaction ID
   * @returns Arlocal contract initial state transaction ID
   */
  public async copyContract(txid: string): Promise<string> {
    // Validate blockweave
    await this._validateNetwork();
    let data = "";
    // validate tx
    const { data: resp } = await this._mainnet.api.get(`/tx/${txid}/status`);
    if (typeof resp === "string") {
      throw new Error(`Transaction returned status of: ${resp}`);
    }

    // get state tx meta_data
    const tx: Transaction = await this._mainnet.transactions.get(txid);

    // validate tx type
    const value = searchForTag(tx, "App-Name");
    if (value !== "SmartWeaveContract") {
      throw new Error("Transaction is not a SmartWeave contract");
    }

    // get contract src
    const src = searchForTag(tx, "Contract-Src");
    if (!src) {
      throw new Error("Contract-Src not found in contract state tags");
    }

    // copy the contract src
    const nsrc = await this.copyTransaction(src);

    // get the state tx data
    try {
      ({ data } = await this._mainnet.api.get(`/${txid}`));
      // fix json parsing by axios
      if (typeof data !== "string") {
        data = JSON.stringify(data);
      }
    } catch (e) {}

    // copy the state tx
    const eTags: PTag[] = [
      {
        name: "Contract-Src",
        value: nsrc,
      },
    ];

    const id = await copyTx(tx, this._blockweave, this._wallet, data, eTags);

    await this.mine();

    return id;
  }

  /**
   * 
   * @param txid mainnet manifest ID
   * @returns Testnet manifest ID
   */
  public async copyArkbTransaction(txid: string): Promise<string> {
    // Validate blockweave
    await this._validateNetwork();
    // validate tx
    const { data: resp } = await this._mainnet.api.get(`/tx/${txid}/status`);
    if (typeof resp === "string") {
      throw new Error(`Transaction returned status of: ${resp}`);
    }

    // get state tx meta_data
    const tx: Transaction = await this._mainnet.transactions.get(txid);

    // validate tx type
    const value = searchForTag(tx, "Content-Type");
    if (value !== "application/x.arweave-manifest+json") {
      throw new Error("Transaction is not an arweave manifest");
    }

    // get mainfest
    const { data: b64manifest } = await this._mainnet.api.get(
      `/tx/${txid}/data`
    );
    // parse manifest
    const manifest = JSON.parse(atob(b64manifest));

    // get the manifest paths and deploy each paths
    const { results, errors } = await PromisePool.for(
      Object.keys(manifest.paths)
    )
      .withConcurrency(5)
      .process(async (path) => {
        const oldPathId = manifest.paths[path].id;

        const newPathId = await this.copyTransaction(oldPathId);

        return { path, id: newPathId };
      });

    // rebuild manifest
    if (errors.length) {
      console.error(errors);
    }

    const $paths = {};
    results.forEach(({ path, id }) => ($paths[path] = { id }));

    const $manifest = {
      ...manifest,
      paths: $paths,
    };

    // deploy manifest
    const ntx = await this._blockweave.createTransaction(
      {
        data: JSON.stringify($manifest),
      },
      this._wallet
    );

    const tags: Tag[] = tx.get("tags") as string & Tag[];
    tags.forEach((tag) => {
      ntx.addTag(
        tag.get("name", { decode: true, string: true }),
        tag.get("value", { decode: true, string: true })
      );
    });

    await this._blockweave.transactions.sign(ntx as any, this._wallet);
    await this._blockweave.transactions.post(ntx);
    await this.mine();

    // return manifest txid
    return ntx.id;
  }
}

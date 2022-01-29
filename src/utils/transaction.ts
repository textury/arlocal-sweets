import Transaction from "blockweave/dist/lib/transaction";
import Blockweave from "blockweave";
import { JWKInterface } from "blockweave/dist/faces/lib/wallet";
import { Tag } from "blockweave/dist/lib/tag";

export const cloneTx = async (
  tx: Transaction,
  blockweave: Blockweave,
  wallet: JWKInterface,
  data: string = ""
): Promise<string | null> => {
  const ntx = await Transaction.create(
    blockweave,
    {
      format: tx.format,
      owner: tx.owner,
      target: tx.target,
      quantity: tx.quantity,
      last_tx: tx.last_tx,
      data,
      reward: tx.reward,
    },
    wallet
  );

  // map tags
  const tags: Tag[] = tx.get("tags") as string & Tag[];
  tags.forEach((tag) => {
    ntx.addTag(
      tag.get("name", { decode: true, string: true }),
      tag.get("value", { decode: true, string: true })
    );
  });

  ntx.setSignature({
    id: tx.id,
    signature: tx.signature,
    owner: wallet.n,
  });

  const uploader = await blockweave.transactions.getUploader(ntx);

  while (!uploader.isComplete) {
    try {
      await uploader.uploadChunk();
    } catch (e) {
      const { msg } = uploader.lastResponseError as string & {
        code: number;
        msg: string;
      };
      if (msg) {
        console.error(uploader.lastResponseError);
        return null;
      }

      console.error(uploader.lastResponseError);
    }
  }

  return ntx.id;
};

export const copyTx = async (
  tx: Transaction,
  blockweave: Blockweave,
  wallet: JWKInterface,
  data: string = ""
): Promise<string | null> => {
  const localTx = await blockweave.createTransaction(
    {
      data,
    },
    wallet
  );

  // map tags
  const tags: Tag[] = tx.get("tags") as string & Tag[];
  tags.forEach((tag) => {
    localTx.addTag(
      tag.get("name", { decode: true, string: true }),
      tag.get("value", { decode: true, string: true })
    );
  });

  await blockweave.transactions.sign(localTx, wallet);

  const uploader = await blockweave.transactions.getUploader(localTx);

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
        return null;
      }

      console.error(uploader.lastResponseError);
    }
  }

  return localTx.id;
};

import Sweets from '../src';
import { searchForTag } from '../src/utils/tags';
import { atob } from '../src/utils/utils';
import { blockweave, wallet } from '../test-setup';

describe('sweets.copyArkbTransaction()', () => {
  it('should copy a full manifest transaction and its subpath from mainnet', async () => {
    const id = 'FqcTfQHqgXhUG1CWoarkE2hN-rHRpbiCXxT_OGOSlJ8';
    const sweets = new Sweets(blockweave, wallet);

    await sweets.fundWallet(1e12);
    const manifestId = await sweets.copyArkbTransaction(id);
    const tx = await blockweave.transactions.get(manifestId);

    expect(searchForTag(tx, 'Content-Type')).toEqual('application/x.arweave-manifest+json');
    const { data: rawManifest } = await blockweave.api.get(`/tx/${manifestId}/data`);

    const manifest = JSON.parse(atob(rawManifest))

    // only compare one path, if one path is valid the rest is
    const idx = Math.floor(Math.random() * Object.keys(manifest.paths).length);

    const txid = manifest.paths[Object.keys(manifest.paths)[idx]].id
    expect(txid).toMatch(/[a-z0-9_-]{43}/i);

    const pathTx = await blockweave.transactions.get(txid);
    expect(searchForTag(pathTx, 'User-Agent')).toEqual('arkb');
  });

  it('should throw invalid arkb transaction error', async () => {
    const id = 'CKRSJ1s8MKk5dPl5V-bEI3FTGxK9CieI-d3c7HHbvLI';
    const sweets = new Sweets(blockweave, wallet);

    await sweets.fundWallet(1e12);
    await expect(sweets.copyArkbTransaction(id)).rejects.toEqual(
      new Error('Transaction is not an arweave manifest')
    );
  });
});

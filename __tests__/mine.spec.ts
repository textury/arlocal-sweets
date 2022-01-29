import Sweets from '../src';
import { blockweave, wallet } from '../test-setup';

describe('sweets.mine()', () => {
  it('should mine a block', async () => {
    const sweets = new Sweets(blockweave, wallet);
    await expect(sweets.mine()).resolves.toEqual(1);

    const { data: { blocks } } = await blockweave.api.get('/info');
    expect(blocks).toEqual(2);
  });

  it('should mine 10 blocks', async () => {
    const sweets = new Sweets(blockweave, wallet);
    await expect(sweets.mine(10)).resolves.toEqual(10);

    const { data: { blocks } } = await blockweave.api.get('/info');
    expect(blocks).toEqual(11);
  });
});

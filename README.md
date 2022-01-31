# Arlocal Sweets
> `arlocal-sweets` is a small utility package that helps creating tests for SmartWeave contracts with ArLocal. The library enables developers to easily copy transactions and contracts from any Arweave gateway to an ArLocal testing gateway.

- [Arlocal Sweets](#arlocal-sweets)
  - [Installation](#installation)
  - [Initialization](#initialization)
  - [Usage](#usage)
    - [Check for test network](#check-for-test-network)
    - [Fund Wallet](#fund-wallet)
    - [Mine Block](#mine-block)
    - [Copy Transaction](#copy-transaction)
    - [Clone Transaction (Experimental)](#clone-transaction)

## Installation

```bash
# using npm
npm install arlocal-sweets

# using yarn legacy
yarn add arlocal-sweets
```

## Initialization
To initialize the package, you need to have a [blockweave](https://github.com/textury/blockweave) or [arweave-js](https://github.com/arweaveteam/arweave-js) instance connected with arlocal and a wallet.

### Using Blockweave
```ts
  import Sweets from 'arlocal-sweets';
  import Blockweave from 'blockweave';

  const blockweave = new Blockweave({
    host: 'localhost',
    port: 1984,
    protocol: 'http'
  });

  const wallet = await blockweave.wallets.generate();

  const sweets = new Sweets(blockweave, wallet);
```
### Using Arweave
```ts
  import Sweets from 'arlocal-sweets';
  import Arweave from 'arweave';

  const arweave = new Arweave({
    host: 'localhost',
    port: 1984,
    protocol: 'http'
  });

  const wallet = await arweave.wallets.generate();

  const sweets = new Sweets(arweave, wallet);
```

## Usage
### Check for test network
Here you can check if a network is an arlocal test network, so you don't interact with the mainnet. Interaction with the mainnet would result in an error.

```ts
await sweets.isTestNetwork(); // returns true or false
```


Check the [unit tests](/__tests__/validate_network.spec.ts) to see the two present valid test networks.

### Fund Wallet
To communicate with the gateway, you need to have some AR in your testnet wallet. You can easily fund your wallet with test tokens using this method.

```ts
await sweets.fundWallet(1e12); // This would fund my wallet with 1 AR
```

> _NB: The argument to the function is an integer value in winstons._ <br/> Read about winston and AR [here](https://docs.arweave.org/developers/server/http-api#ar-and-winston).

### Mine Block
After every transaction, your transaction has to be mined. You can mine one or many block with this method.

```ts
await sweets.mine(2); // This would mine 2 blocks

await sweets.mine(); // This would mine 1 block
```

### Copy Transaction
Here you can copy transaction from the mainnet to arlocal testnet.

```ts
await sweets.copyTransaction('CKRSJ1s8MKk5dPl5V-bEI3FTGxK9CieI-d3c7HHbvLI'); // returns the testnet transaction ID
```
> _NB: `sweets.copyTransaction` takes your mainnet transaction ID as an argument._

### Clone Transaction (Experimental)
This is a method which allows you copy transaction from the mainnet and retains the mainnet transaction ID, but this is an experimental feature and may cause issues. It is more advisable to use `sweets.copyTransaction` in place of this.

```ts
sweets.cloneTransaction('CKRSJ1s8MKk5dPl5V-bEI3FTGxK9CieI-d3c7HHbvLI'); // returns the same mainnet transaction ID
```

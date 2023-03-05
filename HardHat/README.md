# BettingContract-deployment

## Initial setup

1. Copy the `.env.example` (in the HardHat folder of the project `/HardHat/.env.example` to `.env`
```shell
# Inside /HardHat folder run command below:
cp .env.example .env
```

2. Set your `API_KEY` and `PRIVATE_KEY` inside the `.env` file.

The `PRIVATE_KEY` is the Fantom wallet owner address private key. This is the account that will become the owner of the smart contract after it's deployed to the Fantom blockchain.

The `API_KEY` is available via [FTMScan](https://ftmscan.com/myapikey). You can create a free account and generate an API key. This will provide automatic contract verification after contract deployment.

```
PRIVATE_KEY = XXXXXXXXXX
API_KEY = XXXXXXX
```

2. Install package dependencies

```
npm i
```

3. Update the contract arguments (if you don't want to use the defaults) found inside the file: **/HardHat/scripts/arguments.js**

The contract has two arguments when deploying:

- `maxPlayers` (Total amount of players that can submit 1 bet each).
- `requiredBetAmount` (Total amount in Wei for required player bet). 

> Required bet amount value of `1000000000000000000` denotes e.g: `1 FTM`.

4. Run the following command to deploy the contract

## Deploy Contract to Testnet
```
npm run deploy-contract:testnet
```

5. You should see the deployed contract address in the console output. Take note of this contract address. You will need to use it inside both the **/WebQuakeServer/.env** and **/dApp/.env** configuration files. This smart contract will be used specifically for this dedicated WebQuake server.

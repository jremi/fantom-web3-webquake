# WebQuake Server (Fantom Web3 Edition)
<br>
This is a modified version of the original [**WebQuake**](https://github.com/Triang3l/WebQuake).

This custom version of WebQuake, dubbed "Fantom Web3 Edition" has various modifications to support Quake deathmatch players adding cryptocurrency game bets via smart contracts deployed to the Fantom blockchain. To interface with this custom version of WebQuake, you will need to use code found within the **/dApp** folder of this repository. The folder **/dApp/public/WebQuake** also has some minor modifications to the original client version of WebQuake to facilitate linking the connected MetaMask wallet details to the active WebQuake websocket connection.

## **Setup**

On a private or public server perform the following steps:

1. Install package dependencies
```shell
npm i
```

2. Setup / configure environment file
```shell
cp .env.example .env
```

> You will need to update the the **.env** with all of the required environment variables. The most important variables are `FANTOM_WALLET_OWNER_PRIVATE_KEY` & `FANTOM_SMART_CONTRACT_ADDRESS`, and `FANTOM_WSS_PROVIDER`. You will want to make sure your also using a reliable websocket provider to connect to the Fantom blockchain. For the testnet, I recommend using [**blastapi**.io](https://blastapi.io). They provide reliable websocket testnet endpoint for RPC node access to various blockchains.

3. Run the server
```shell
npm run start
```

## **Notes**

- To change the server fraglimit edit **WebQuakeServer/WebQDS/Host.js**. Change the line related to the variable 'fraglimit':

```javascript
	Host.fraglimit = Cvar.RegisterVariable('fraglimit', '5', false, true); // Set game frag limit (e.g: 5 frags)
```

- To change the server map, you can edit **WebQuakeServer/WebQDS/Host.js** and look for the line inside the function `Host.Startdemos_f` that says, `map e1m7`. The maps supported are all of the Quake shareware version maps. I believe `e1m1 to e1m9`. You can play with them. The map that I love for small number of players is `e1m7`.

- In addition a player account tamper protection has been implemented by requiring that each player who connects via MetaMask sign a message. This message is passed to the backend server to perform an account verification to make sure nobody connecting to the server is attempting to spoof their wallet address.

Happy fragging!

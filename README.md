# **Fantom Web3 WebQuake**

<img src="https://i.imgur.com/RyLO605.png" width="100" />
<img src="https://i.imgur.com/OePHVR5.png" width="100" />

<br>

**⚠️ WARNING**: THE AUTHOR OF THIS PROJECT WILL NOT BE HELD RESPONSIBLE FOR ANYTHING YOU DECIDE TO DO WITH THIS CODE. THIS CODE HAS ONLY BEEN TESTED ON THE [FANTOM](https://fantom.foundation) BLOCKCHAIN [TESTNET](https://testnet.ftmscan.com) & NEVER WITHIN A PRODUCTION ENVIRONMENT FOR REAL-WORLD USAGE USING ACTUAL [FTM](https://coinmarketcap.com/currencies/fantom) CRYPTOCURRENCY ON THE LIVE MAINNET. THIS PROJECT IS A FUNCTIONAL PROOF OF CONCEPT (POC) DEVELOPED AS A FUN & CREATIVE EXPLORATION. USE AT YOUR OWN RISK!

## **Why should I care?**

If you love multiplayer online games, especially first-person shooter deathmatches, betting on your skills, and winning jackpots against other players... then you might be interested to learn more. If that is you, read on: 👇

## **What is this?**

- **Quake** is a first-person shooter game developed by id Software and published by GT Interactive. The first game in the Quake series, it was originally released for MS-DOS, Microsoft Windows and Linux in 1996, followed by Mac OS and Sega Saturn in 1997 and Nintendo 64 in 1998. [Source: Wikipedia.org](https://en.wikipedia.org/wiki/Quake_(video_game))

- **Fantom** is a layer-1 blockchain aiming to provide an alternative to the high costs and low speeds about which users of Ethereum often complain. [Source: Decrypt.co](https://decrypt.co/resources/what-is-fantom-the-fast-blockchain-taking-on-ethereum)

## **What does this have to do with anything?**

In 2013, an incredible developer created [**WebQuake**](https://github.com/Triang3l/WebQuake) an HTML5 WebGL port of **Quake**. This awesome software enables players to directly play **Quake** inside the web-browser.

**WebQuake** provides multiplayer capabilities by exposing a JavaScript client/server using [websockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) & JSON [Web API](https://en.wikipedia.org/wiki/Web_API) endpoints for obtaining sever/player information in real-time. 

With the advent of Blockchain technology over the past few years, an incredible new world of financial services are emerging. One of these new types of services is known as ["GameFi"](https://academy.binance.com/en/articles/what-is-gamefi-and-how-does-it-work). GameFi can refer to several different aspects of decentralized game finance. However, for the purpose of this project we are focusing on the incentive of players earning cryptocurrency by battling other players in **WebQuake** deathmatches.

This project has modified the original **WebQuake** source code to include a new **Fantom** module enabling the ability to interface web3 connected wallets directly into the real-time game. This enables players to compete against each other for cryptocurrency "FTM", native currency of the Fantom blockchain. Each player deposits the required bet amount (dictated by the smart contract). Once the required minimum number of players have joined the game server, the deathmatch starts. The first player to reach the "frag limit" (total kills) automatically wins the game and all of the cryptocurrency deposited within the smart contract from all of the players is instantly paid out to the winning address. The entire process is facilitated on the frontend with a web application "game lobby" providing in-game overlay components (all built with [**Vue.js**](https://vuejs.org)) ontop of the **WebQuake** browser client which gets injected in a `<canvas>` element.

## **Core Subsystems**

**WebQuake** provides an incredible foundation to hack on since it provides the underlying multiplayer networking support and the ability to run an entire game client directly from within the browser. If the player has a compatible modern browser e.g Chrome, they are ready to play.

**Fantom** blockchain provides ultra-fast transaction confirmations coupled with super-cheap fees. More importantly, the Fantom blockchain is EVM [(Ethereum Virtual Machine)](https://ethereum.org/en/developers/docs/evm/) compatible meaning developers can write [smart contracts](https://www.ibm.com/topics/smart-contracts) using the popular [Solidity](https://en.wikipedia.org/wiki/Solidity) programming language.

Since Solidity was inspired by other popular programming languages like JavaScript, it has grown to become one of the pre-dominant smart contract programming languages for decentralized application development ["dApps"](https://www.investopedia.com/terms/d/decentralized-applications-dapps.asp).

For users to interact with EVM compatible blockchains (e.g: Fantom) they need a software cryptocurrency wallet. One of the most popular wallets is **MetaMask**. It allows users to access their wallet through a browser extension or mobile app, which can then be used to interact with decentralized applications [Source: Wikipedia.org](https://en.wikipedia.org/wiki/MetaMask).

To interact with MetaMask wallet, different JavaScript libraries have been developed. This enables interfacing with the connected users wallet and ultimately with decentralized application (dApp) smart contract code running on the associated blockchain network. For this project, the frontend application code interfaces with the popular [**web3.js**](https://github.com/web3/web3.js) JavaScript library.

With all of that said, we can distill the core building blocks of the project into three separate subsystems:

- WebQuake client / server
- MetaMask wallet
- Fantom blockchain

## **How does it work**

1. Each player visits the dApp frontend client inside a desktop browser.

2. Each user connects to the site with MetaMask. The MetaMask should be configured to the same blockchain network as the `/dApp` and `/WebQuakeServer`. In other words, if you deployed the smart contract to the Fantom testnet, and the dApp and WebQuakeServer are also using the Fantom testnet, then all of the players using MetaMask would also need to be configured to connect to the Fantom testnet RPC. Here are steps from Fantom on [adding a custom RPC to MetaMask](https://docs.fantom.foundation/wallet/set-up-metamask-testnet).

3. For each player to access the game you will need funds to deposit into the smart contract. Without this you cannot join the game. If you are using the Fantom testnet you can get fake FTM testnet coins. These are great since they look and behave like real FTM but only work on the testnet. You can get free testnet FTM coins using the [Fantom testnet faucet](https://faucet.fantom.network/).

4. Once the player has entered the game, if they have not yet placed a bet on the smart contract they will be prompted by the game lobby client to do so. Once the transaction has a blockchain confirmation they will either be dropped directly into live deathmatch or will see a message indicating the server is waiting for other players to place bets/join.

5. Once in-game the game lobby client will show a small toolbar with the players wallet address indicating the account address is connected with MetaMask. In addition a small money bag jackpot icon will appear in the top right corner of the game with the total FTM locked in the smart contract. This is the total amount that players are trying to win. In addition the players abbreviated wallet address will be automatically prefixed next to the player name directly within in-game players list.

6. The server is configured for a `fraglimit`. In traditional **Quake** terms, "frag" means "kill". If the server `fraglimit` is set for a value of `10` then the player who first gets `10` "frags" will win the game and the funds will be instantly released from smart contract and sent to the players address. When the game ends each player will get a final game result in-game notification message. The notification message will indicate to the player if they won. The message will also provide the on-chain Fantom transaction id of the funds released to the winning players wallet address.

7. When the user has closed this message, they will automatically be sent back to the main game lobby. Here they can join a new game. As of now whenever the game ends the server will automatically close its process with an exit code of `100`. The usage of a process exit code of `100` is non-standard to traditional exit code statuses. However, for this project, `100` denotes "GAME OVER RESTART WEBQUAKE SERVER". The exit code auto respawns a fresh WebQuake server process. 

This is currently done to wipe all server-side state after the game is completed. This was the easiest way to keep things clean after each game is concluded. In addition, it provides a similar behavior to old style arcade games that restart after the game is over. This restart functionality was easily implemented inside the `/WebQuakeServer/server.js`. You will notice the usage of the native `spawn` method part of the node.js runtime library `chid_process`. 

## **High Level Setup**

1. Configure/deploy the smart contract to the blockchain **/HardHat**. The contract is designed to be linked to only 1 dedicated game server that communicates with it. The contract provides the ability for players to place bets, get total players, and release funds to the winner.

2. Configure/deploy (e.g: DigitalOcean, AWS, etc) the **/WebQuakeServer** with the deployed smart contract address and the smart contract owners private key. This will enable the server software to call the smart contract to release funds when the game has ended and we have a winner. The winner will receive all of the FTM bets deposited from each player at the start of the game. 

3. Configure/deploy (e.g: DigitalOcean, AWS, etc...) the **/dApp** client (Vue.js "Game Lobby" + WebQuakeClient) to a web host. The client.

## **Setup Instructions**

1. Setup instructions for smart contract [(/HardHat/README.md)](/HardHat/README.md)
2. Setup instructions for server [(/WebQuakeServer/README.md)](/WebQuakeServer/README.md)
3. Setup instructions for client [(/dApp/README.md)](/dApp/README.md)

## **Why did you make this?**

I love playing around with different technologies and building. This project was hacked together for the [Fantom Hackathon Q1 2023](https://fantomq12023.devpost.com/).

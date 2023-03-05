const dotenv = require("dotenv");
const Web3 = require("web3");

Fantom = {};

Fantom.gameSettings = {
  minPlayers: 2,
  maxPlayers: null,
  requiredBetAmount: null,
  requiredBetAmountFtm: null,
  players: [],
};

Fantom.InitSmartContract = async function () {
  dotenv.config();
  Fantom.CreateWeb3SmartContractInstance();
  try {
    const [maxPlayers, requiredBetAmount, players] = await Promise.allSettled([
      Fantom.maxPlayers(),
      Fantom.requiredBetAmount(),
      Fantom.getPlayers(),
    ]);
    SV.svs.maxclients = +maxPlayers.value;
    Fantom.gameSettings.maxPlayers = +maxPlayers.value;
    Fantom.gameSettings.requiredBetAmount = +requiredBetAmount.value;
    Fantom.gameSettings.requiredBetAmountFtm = +Web3.utils.fromWei(
      requiredBetAmount.value,
      "ether"
    );
    Fantom.gameSettings.players = [...players?.value] || [];
    console.log(
      `\nGame server settings updated via smart contract:\n` +
        `- maxPlayers: ${maxPlayers.value}\n` +
        `- requiredBetAmount: ${requiredBetAmount.value}\n` +
        `- requiredBetAmountFtm: ${Fantom.gameSettings.requiredBetAmountFtm}\n` +
        `- players: ${Fantom.gameSettings.players}\n`
    );
  } catch (err) {
    console.error(
      "Unable to fetch initial values from smart contract!\n", err
    );
    process.exit(1);
  }
  console.log("========Fantom Blockchain Initialized=========");
  console.log("Fantom Contract Address:", Fantom.smartContract._address);
  console.log("Fantom Contract Owner Address:", Fantom.ownerAccount.address);
  console.log("\n");
};

Fantom.CreateWeb3SmartContractInstance = function () {
  const provider = new Web3.providers.WebsocketProvider(
    process.env.FANTOM_WSS_PROVIDER
  );
  const web3 = new Web3(provider);
  const {
    abi: contractABI,
  } = require("../../Hardhat/artifacts/contracts/BettingContract.sol/BettingContract.json");
  const contractAddress = process.env.FANTOM_SMART_CONTRACT_ADDRESS;
  const contract = new web3.eth.Contract(contractABI, contractAddress);
  const account = web3.eth.accounts.wallet.add(
    process.env.FANTOM_WALLET_OWNER_PRIVATE_KEY
  );
  Fantom.web3 = web3;
  Fantom.smartContract = contract;
  Fantom.ownerAccount = account;
  Fantom.InstallContractEventListeners();
  Fantom.GameStartPoller();
  Fantom.GameEndPoller();
};

Fantom.InstallContractEventListeners = function () {
  const lastEmittedEventBlockNumber = {
    onMaxPlayersUpdated: null,
    onRequiredBetAmountUpdated: null,
    onPlaceBet: null,
    onReleaseFunds: null,
    onResetGame: null,
  };

  const isAlreadyEmitted = (eventName, blockNumber) => {
    const exist = lastEmittedEventBlockNumber[eventName] === blockNumber;
    if (!exist) lastEmittedEventBlockNumber[eventName] = blockNumber;
    return exist;
  };

  // onMaxPlayersUpdated
  Fantom.smartContract.events.onMaxPlayersUpdated((error, event) => {
    if (error) {
      console.error(error);
      return;
    }
    if (!isAlreadyEmitted("onMaxPlayersUpdated", event.blockNumber)) {
      console.log("onMaxPlayersUpdated", event);
      SV.svs.maxclients = +event.returnValues.maxPlayers;
      Fantom.gameSettings.maxPlayers = event.returnValues.maxPlayers;
    }
  });

  // onRequiredBetAmountUpdated
  Fantom.smartContract.events.onRequiredBetAmountUpdated((error, event) => {
    if (error) {
      console.error(error);
      return;
    }
    if (!isAlreadyEmitted("onRequiredBetAmountUpdated", event.blockNumber)) {
      console.log("onRequiredBetAmountUpdated", event);
      Fantom.gameSettings.requiredBetAmount =
        event.returnValues.requiredBetAmount;
    }
  });

  // onPlaceBet
  Fantom.smartContract.events.onPlaceBet((error, event) => {
    if (error) {
      console.error(error);
      return;
    }
    if (!isAlreadyEmitted("onPlaceBet", event.blockNumber)) {
      console.log("onPlaceBet", event);
      if (!Fantom.gameSettings.players.includes(event.returnValues.playerAddress)) {
        Fantom.gameSettings.players.push(event.returnValues.playerAddress);
      }
    }
  });

  // onResetGame
  Fantom.smartContract.events.onResetGame((error, event) => {
    if (error) {
      console.error(error);
      return;
    }
    if (!isAlreadyEmitted("onResetGame", event.blockNumber)) {
      console.log("onResetGame", event);
      Fantom.gameSettings.players = [];
    }
  });
};

Fantom.AuthIncomingPlayerSocket = function (request) {
  try {
    const fantomData = JSON.parse(request.resourceURL.query.fantom);
    const isPlayerAddressValid = Fantom.VerifyAddressSignature(fantomData);
    console.log(
      "Fantom account player tamper check passed:",
      isPlayerAddressValid
    );
    if (isPlayerAddressValid) {
      WEBS.acceptsockets.push(Fantom.AttachAccountInfo(request, fantomData));
    } else {
      request.reject();
    }
  } catch (err) {
    console.error(
      "Failed to obtain fantomAddress/fantomNetwork from incoming client socket request!",
      err
    );
  }
};

Fantom.VerifyAddressSignature = function (fantomData) {
  const { fantomAddress, fantomAddressMessage, fantomAddressSignature } = fantomData;
  if (!fantomAddress || !fantomAddressMessage || !fantomAddressSignature) return false;
  const addressVerify = Fantom.web3.eth.accounts.recover(fantomAddressMessage, fantomAddressSignature);
  return addressVerify.toLowerCase() === fantomAddress.toLowerCase();
}

Fantom.AttachAccountInfo = function (request, fantomData) {
  const { fantomAddress, fantomNetwork } = fantomData
  const acceptedRequest = request.accept("quake", request.origin);
  acceptedRequest.fantomAddress = fantomAddress;
  acceptedRequest.fantomNetwork = fantomNetwork;
  return acceptedRequest;
};

Fantom.VerifyGameStart = function () {
  const newTotalConnections = NET.activeconnections + 1;
  SV.server.paused = newTotalConnections < Fantom.gameSettings.minPlayers;
};

Fantom.GameStartPoller = function () {
  setInterval(() => {
    let isPaused = true;
    if (Fantom.gameSettings.players.length >= Fantom.gameSettings.minPlayers) {
      for (const playerAddress of Fantom.gameSettings.players) {
        const player = SV.svs.clients.find(
          (client) =>
            client.active &&
            client.fantomAddress.toLowerCase() === playerAddress.toLowerCase()
        );
        if (!player) {
          isPaused = true;
          break;
        }
        isPaused = false;
      }
    }
    SV.server.paused = isPaused;
  }, 3000);
};

Fantom.GameEndPoller = function () {
  const poller = setInterval(() => {
    const fragsToWinJackpot = Host.fraglimit.value;
    for (i = 0; i < SV.svs.maxclients; ++i) {
      client = SV.svs.clients[i];
      if (client.active !== true) continue;
      const frags = client.edict.v_float[PR.entvars.frags] >> 0;
      // TODO: check this condition on subsequent map respawns / initial winner.
      if (frags === fragsToWinJackpot) {
        Fantom.releaseFunds(client.fantomAddress)
          .then((r) => {
            console.log("Game ended, fantom payment complete, funds released", {
              transactionHash: r.transactionHash,
              winningPlayer: {
                fantomAddress: client.fantomAddress,
              },
            });
            clearInterval(poller);
            process.exit(100);
          })
          .catch((err) => {
            console.log("Error attempting game end payment release!", err);
          });
        break;
      }
    }
  }, 3000);
};

Fantom.FormatFantomAddress = function (client) {
  const val = client.fantomAddress;
  const truncatedWalletAddress = () => {
    const truncateRegex = /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/;
    const match = val.match(truncateRegex);
    return match ? `${match[1]}...${match[2]}` : null;
  };
  return val === "undefined" || !val ? "" : `(${truncatedWalletAddress()})`;
};

Fantom.getPlayers = function () {
  return Fantom.smartContract.methods.getPlayers().call();
};

Fantom.maxPlayers = function () {
  return Fantom.smartContract.methods.maxPlayers().call();
};

Fantom.requiredBetAmount = function () {
  return Fantom.smartContract.methods.requiredBetAmount().call();
};

Fantom.releaseFunds = function (winningPlayerAddress) {
  return Fantom.smartContract.methods
    .releaseFunds(winningPlayerAddress)
    .send({ from: Fantom.ownerAccount.address, gasLimit: 100000 });
};

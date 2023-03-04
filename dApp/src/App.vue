<template>
  <div v-if="hasJoinedWebQuakeServer" class="overlay-backdrop" />
  <div v-if="isInGame" class="money-bag-indicator">
    <img width="40" src="@/assets/money-bag.svg" />
    <div v-if="webquake.server_info?.ftmCurrentJackpot" class="current-jackpot-value">
      {{ webquake.server_info?.ftmCurrentJackpot }} FTM
    </div>
  </div>
  <div
    class="waiting-for-players"
    v-if="hasJoinedWebQuakeServer && !isPlaceBetModalVisible && isGameWaitingForPlayers && !isGameOverModalVisible"
  >
    <img width="50" src="@/assets/three-dots.svg" />
    <div v-if="isGameEnded">
      Waiting for final game result.
      <br>
      <br>
      Please wait. This may take a moment.
    </div>
    <div v-else>Waiting for all players to place bets</div>
  </div>
  <HeaderBar
    :chain-info="currentChain"
    :truncated-wallet-address="truncatedWalletAddress"
    :has-joined-web-quake-server="hasJoinedWebQuakeServer"
  />
  <main :class="{ splash: !connected }">
    <button v-if="!connected" @click="connectWallet" class="connect-with-metamask-btn">
      <img src="@/assets/metamask-logo.svg" width="36" />
      Connect with Metamask
    </button>
    <!-- Web3 connected features -->
    <div v-if="connected" style="padding: 1rem">
      <div class="contract-controls">
        <button v-if="!hasJoinedWebQuakeServer && !isInGame" @click="joinGame" class="join-game-btn fantom-btn">
          Join Game
          <img src="@/assets/chevron-right.svg" width="10" />
        </button>
      </div>
      <div class="player-info">
        <h3>Player Info</h3>
        <hr />
        <div class="content">
          <table v-if="webquake.player_info.length">
            <thead>
              <th>Name</th>
              <th>Frags</th>
              <th>Fantom Address</th>
            </thead>
            <tbody>
              <tr v-for="(player, index) in webquake.player_info" :key="index">
                <td>{{ player.name }}</td>
                <td>{{ player.frags }}</td>
                <td>
                  <a
                    :href="fantomAddressUrl(player)"
                    target="_blank"
                    style="color: var(--color-fantom-blue)"
                  >
                    {{ player.fantomAddress }}
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else class="player-info-empty">Currently no players yet.</div>
        </div>
      </div>
      <div class="server-info">
        <h3>Server Info</h3>
        <hr />
        <div class="content">
          <ul v-if="webquake.server_info">
            <li v-for="(info, key) of webquake.server_info" :key="key">
              <b>{{ key }}</b> - {{ info }}
            </li>
          </ul>
          <div v-else class="server-info-empty">Currently no server yet.</div>
        </div>
      </div>
    </div>
  </main>
  <PlaceBetModal
    :show="isPlaceBetModalVisible"
    :is-place-bet-in-progress="isPlaceBetInProgress"
    :server-info="webquake.server_info"
    @onApprove="placeBet"
  />
  <GameOverModal
    :show="isGameOverModalVisible"
    :game-result="gameResult" />
  <FooterBar :chain-info="currentChain" />
</template>

<script>
import Web3 from 'web3'
import { abi } from '../../Hardhat/artifacts/contracts/BettingContract.sol/BettingContract.json'
import chains from './blockchain/chainlist/chains.json'
import HeaderBar from './components/HeaderBar.vue'
import PlaceBetModal from './components/PlaceBetModal.vue'
import GameOverModal from './components/GameOverModal.vue'
import FooterBar from './components/FooterBar.vue'
import animateCSS from './helpers/animateCSS';

export default {
  name: 'App',
  components: {
    HeaderBar,
    PlaceBetModal,
    GameOverModal,
    FooterBar
  },
  data() {
    return {
      walletAddress: null,
      connected: false,
      contract: null,
      contractResult: '',
      lastEmittedEventBlockNumber: {
        onMaxPlayersUpdated: null,
        onRequiredBetAmountUpdated: null,
        onPlaceBet: null,
        onReleaseFunds: null,
        onResetGame: null
      },
      webquake: {
        player_info: [],
        server_info: null
      },
      hasJoinedWebQuakeServer: false,
      isGameEnded: false,
      isGameWaitingForPlayers: true,
      isGameOverModalVisible: false,
      isPlaceBetModalVisible: false,
      isPlaceBetInProgress: false,
      gameResult: {
        isWinner: false,
        playerAddressWinner: null,
        winningPayoutTx: null,
      }
    }
  },
  computed: {
    currentChain() {
      return this.connected
        ? chains.find((chain) => chain.networkId == window.ethereum.networkVersion)
        : null
    },
    truncatedWalletAddress() {
      if (!this.walletAddress) return null
      return this.addressTruncate(this.walletAddress)
    },
    isInGame() {
      if (!this.walletAddress) return false;
      const player = this.webquake.player_info?.find(
        player => player.fantomAddress.toLowerCase() === this.walletAddress.toLowerCase()
      );
      return !!player;
    }
  },
  mounted() {
    if (window.ethereum.selectedAddress) {
      this.connected = true
      this.walletAddress = window.ethereum.selectedAddress
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          this.connected = false
          this.walletAddress = null
          localStorage.removeItem('addressMessage');
          localStorage.removeItem('addressSignature');
        }
      })
    }
    const web3 = new Web3(window.ethereum)
    const contractAddress = import.meta.env.VITE_FANTOM_SMART_CONTRACT_ADDRESS
    this.contract = new web3.eth.Contract(abi, contractAddress)
    this.installGlobalErrorHandler()
    this.installContractEventListeners()
    this.installWebQuakeRestPollers()
    this.installGameStartPoller()
    this.installGameEndPoller()
    this.startMoneyBagIconAnimation()
  },
  methods: {
    installGlobalErrorHandler() {
      window.addEventListener('error', async (error) => {
        /**
         *  [For example]: Socket abort can occur if the Fantom 
         *  account message signature was detected as tampered
         *  and the server aborted the connection.
         */
        if (error.error?.message === 'Host.abortserver') {
          alert("Server disconnected!");
          window.location.reload();
        }
      });
    },
    installContractEventListeners() {
      const isAlreadyEmitted = (eventName, blockNumber) => {
        const exist = this.lastEmittedEventBlockNumber[eventName] === blockNumber
        if (!exist) this.lastEmittedEventBlockNumber[eventName] = blockNumber
        return exist
      }

      // onPlaceBet
      this.contract.events.onPlaceBet((error, event) => {
        if (error) {
          console.error(error)
          return
        }
        if (!isAlreadyEmitted('onPlaceBet', event.blockNumber)) {
          console.log('onPlaceBet', event)
          /**
           *  This could be a cool place to put in-game toast notifications
           *  when players are placing bets. Let everyone connected know 
           *  in real-time.
           */
        }
      })

      // onReleaseFunds
      this.contract.events.onReleaseFunds((error, event) => {
        if (error) {
          console.error(error)
          return
        }
        if (!isAlreadyEmitted('onReleaseFunds', event.blockNumber)) {
          console.log('onReleaseFunds', event)
          this.gameResult.isWinner = this.walletAddress.toLowerCase() === event.returnValues.playerAddressWinner.toLowerCase();
          this.gameResult.winningPayoutTx = `${this.currentChain.explorers[0].url}/tx/${event.transactionHash}`;
          this.gameResult.playerAddressWinner = event.returnValues.playerAddressWinner;
          this.isGameWaitingForPlayers = false;
          this.isGameOverModalVisible = true;
        }
      })
    },
    installWebQuakeRestPollers() {
      setInterval(async () => {
        try {
          this.webquake.player_info = await fetch(
            `${import.meta.env.VITE_WEB_QUAKE_SERVER}/player_info`
          ).then((r) => r.json())
          this.webquake.server_info = await fetch(
            `${import.meta.env.VITE_WEB_QUAKE_SERVER}/server_info`
          ).then((r) => r.json())
        } catch (err) {
          /* empty */
        }
      }, 3000)
    },
    installGameStartPoller() {
      setInterval(() => {
        const betPaidPlayers = this.webquake.player_info?.filter((player) => player.fantomBetPaid)
        this.isGameWaitingForPlayers =
          this.webquake.server_info?.minPlayers !== betPaidPlayers.length
      }, 3000)
    },
    installGameEndPoller() {
      setInterval(() => {
        const allPlayerFrags = this.webquake.player_info?.map((player) => player.frags)
        if (allPlayerFrags.includes(this.webquake.server_info?.fragsToWinJackpot)) {
          this.isGameEnded = true;
        }
      }, 3000)
    },
    async connectWallet() {
      const ethereum = window.ethereum
      if (ethereum) {
        try {
          const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
          this.walletAddress = accounts[0]; 
          const message = "👋 Welcome to Fantom Game Lobby!\n\nTo protect all players please verify your account by signing this message.";
          window.addressMessage = Web3.utils.stringToHex(message);
          window.addressSignature = await ethereum.request({
            method: 'personal_sign',
            params: [
              window.addressMessage,
              this.walletAddress, 
              (Math.floor(Math.random() * 1000000000000000000)).toString()
            ],
          })
          this.connected = true;
          localStorage.setItem('addressMessage', window.addressMessage);
          localStorage.setItem('addressSignature', window.addressSignature);
        } catch (err) {
          console.error("Problem connecting wallet!", err);
        }
      }
    },
    joinGame() {
      window.joinWebQuakeServer()
      this.hasJoinedWebQuakeServer = true
      this.verifyPlayerHasPlacedBet()
    },
    fantomAddressUrl(_player) {
      return _player.fantomAddress
        ? `${this.currentChain.explorers[0].url}/address/${_player.fantomAddress}`
        : null
    },
    async verifyPlayerHasPlacedBet() {
      try {
        const playerAddresses = await this.contract.methods.getPlayers().call()
        const player = playerAddresses
          .map((p) => p.toLowerCase())
          .includes(this.walletAddress.toLowerCase())
        if (!player) {
          this.isPlaceBetModalVisible = true
        }
      } catch (err) {
        /* empty */
      }
    },
    placeBet() {
      this.isPlaceBetInProgress = true;
      this.contract.methods
        .placeBet()
        .send({
          from: this.walletAddress,
          value: Web3.utils.toWei('1', 'ether') // Note: On Fantom chain 'ether' is 'ftm'
        })
        .then((result) => {
          this.isPlaceBetInProgress = false;
          if (result.transactionHash) {
            this.isPlaceBetModalVisible = false;
          } else {
            console.error('Problem getting placeBet result!')
          }
        })
        .catch((err) => {
          console.error('err', err);
          this.isPlaceBetInProgress = false;
        });
    },
    addressTruncate(address) {
      const truncateRegex = /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/
      const match = address.match(truncateRegex)
      return match ? `${match[1]}…${match[2]}` : null
    },
    startMoneyBagIconAnimation() {
      setInterval(() => animateCSS('.money-bag-indicator', 'rubberBand'), 10000);
    }
  },
  watch: {
    connected(value) {
      document.body.classList[value ? 'remove' : 'add']('has-background-image')
    }
  }
}
</script>

<style lang="scss" scoped>
.overlay-backdrop {
  height: 100vh;
  width: 100vw;
  z-index: 1;
  background-color: black;
}
.money-bag-indicator {
  position: fixed;
  top: 40px;
  right: 20px;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  img {
    filter: invert(1);
  }
  .current-jackpot-value {
    margin-top: 0.4rem;
    font-weight: 700;
    color: var(--color-fantom-white);
  }
}
.waiting-for-players {
  height: 100%;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  color: white;
  position: fixed;
  z-index: 3;
  top: 0;
  left: 0;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.25rem;
  display: flex;
  flex-direction: column;
  img {
    margin-bottom: 1rem;
  }
}

main.splash {
  flex-direction: initial;
  align-items: center;
  justify-content: center;
}

main {
  flex-direction: column;
  display: flex;
  // padding: 1rem;
  height: calc(100% - 140px - 23px);
  top: 23px;
  overflow-y: auto;
}
.connect-with-metamask-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #001f68a1;
  color: var(--color-fantom-white);
  border: 0;
  padding: 1rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1.25rem;
  margin-top: 1rem;
  max-width: 340px;
  cursor: pointer;
  img {
    margin-right: 0.5rem;
  }
}

.connect-with-metamask-btn:hover {
  background-color: #001f687c;
}

.player-info,
.server-info {
  text-align: initial;
  margin: 4rem 0;
  font-size: 0.8rem;
  margin-bottom: 24px;
  font-style: normal;
  font-weight: 700;
  h3 {
    font-weight: bold;
  }
}
.player-info table {
  border-collapse: collapse;
  width: 100%;
}

.player-info table th,
.player-info table td {
  text-align: left;
  padding: 16px;
  font-weight: normal;
}

.player-info table thead th {
  font-weight: 700;
}

.player-info-empty,
.server-info-empty {
  font-weight: normal;
  font-size: 14px;
}

.content {
  color: black;
  ul {
    list-style: none;
    padding: 0;
  }
  li b {
    font-weight: 700;
  }
}
.join-game-btn {
  width: 140px;
  img {
    filter: invert(1);
    margin-left: 6px;
  }
}
</style>

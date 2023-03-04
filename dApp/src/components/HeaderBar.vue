<template>
  <div v-if="chainInfo" class="header">
    <div
      class="network"
      :class="isTestnet"
      :style="{ 'background-color': hasJoinedWebQuakeServer ? '#32325d9c' : '#32325d' }"
    >
      <div class="chain-info">
        <img src="@/assets/fantom-logo.svg" width="16" />
        <div class="label">{{ chainInfo.name }} ({{ chainInfo.chain }})</div>
      </div>
      <div class="wallet-address">
        <span style="font-weight: bold">
          <img src="@/assets/metamask-logo.svg" width="20" />
        </span>
        <div class="connected-green-dot"></div>
        {{ truncatedWalletAddress }}
      </div>
    </div>
  </div>
</template>

<script lang="js">
export default {
    props: {
        chainInfo: {
            type: Object,
            default: null,
            required: false,
        },
        truncatedWalletAddress: {
          type: String,
          default: '',
          required: false,
        },
        hasJoinedWebQuakeServer: {
          type: Boolean,
          default: false,
          required: false
        }
    },
    computed: {
        isTestnet() {
            return {
                'testnet': this.chainInfo?.name?.toLowerCase().includes('testnet')
            }
        }
    },
}
</script>

<style lang="scss" scoped>
.header {
  position: fixed;
  z-index: 20;
  top: 0px;
  display: flex;
  width: 100%;
  flex-direction: column;
  .network {
    display: flex;
    height: 23px;
    justify-content: space-between;
    align-items: center;
    .chain-info {
      display: flex;
      img {
        filter: invert(1);
        margin-left: 1rem;
      }
      .label {
        margin-left: 5px;
        font-size: 12px;
        line-height: 23px;
        text-transform: capitalize;
        font-weight: 700;
      }
    }
  }
  & .testnet {
    color: white;
  }
  .wallet-address {
    font-weight: 700;
    font-size: 12px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    margin-right: 1rem;
    .connected-green-dot {
      border-radius: 50%;
      background-color: green;
      width: 14px;
      height: 14px;
      margin-right: 0.4rem;
    }
    img {
      margin-right: 0.25rem;
      padding-top: 5px;
    }
  }
}
</style>

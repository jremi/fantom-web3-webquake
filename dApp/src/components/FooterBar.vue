<template>
  <div class="footer">
    <div class="logo">
      <img src="@/assets/fantom-logo.svg" width="38" />
      <span class="text"
        >Fantom Game Lobby
        <span class="version"> v{{ version }}</span>
      </span>
    </div>
    <div v-if="chainInfo" class="verified">
      <a :href="contractAddressUrl" target="_blank">
        <span class="address">{{ contractAddress }}</span>
      </a>
    </div>
  </div>
</template>

<script>
import { version } from '../../package.json';

export default {
  data() {
    return {
      version
    }
  },
  props: {
    chainInfo: {
      type: Object,
      default: null,
      required: false
    }
  },
  computed: {
    contractAddressUrl() {
      return `${this.chainInfo?.explorers[0].url}/address/${this.contractAddress}`
    },
    contractAddress() {
      return import.meta.env.VITE_FANTOM_SMART_CONTRACT_ADDRESS
    }
  },
}
</script>

<style lang="scss" scoped>
.footer {
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 140px;
  text-align: center;
  background-color: var(--color-fantom-blue);
  color: var(--color-fantom-white);
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  // border-top: 1px solid var(--color-fantom-white);
  .text {
    font-weight: 700;
    margin-left: 0.5rem;
  }
  .logo {
    display: flex;
    align-items: center;
  }
  .verified {
    background-color: var(--color-fantom-white);
    color: var(--color-fantom-blue);
    margin-top: 1rem;
    font-size: 0.8rem;
    border-radius: 4rem;
    border: 2px solid white;
    padding: 0.25rem;
    .address {
      font-weight: 700;
      font-family: 'Courier New', Courier, monospace;
      color: var(--color-fantom-blue);
    }
  }
  img {
    filter: invert(1);
  }
}
</style>

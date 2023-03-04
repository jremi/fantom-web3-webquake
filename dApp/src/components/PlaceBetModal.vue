<template>
    <Transition>
        <div v-if="show" class="place-bet-modal-overlay">
            <div v-if="serverInfo" class="inner-container">
                <h1 class="place-bet-title">Place Bet</h1>
                <h1>
                    <span class="bet-amount">
                        {{ serverInfo.ftmBetAmount }} FTM
                        <img src="@/assets/fantom-logo.svg" width="24" />
                    </span> to play</h1>
                <br>
                <h3><b>Frags to Win:</b> {{ serverInfo.fragsToWinJackpot }}</h3>
                <h3><b>Current Jackpot:</b> {{ serverInfo.ftmCurrentJackpot }} FTM</h3>
                <h3><b>Max Jackpot:</b> {{ serverInfo.ftmMaxJackpot }} FTM</h3>
                <br>
                <button @click="$emit('onApprove')" class="approve-btn" :disabled="isPlaceBetInProgress">
                    <img src="@/assets/metamask-logo.svg" width="36" />
                    {{ isPlaceBetInProgress ? "Confirming" : "Approve" }}
                    <img class="processing-loader" v-if="isPlaceBetInProgress" width="30" src="@/assets/tail-spin.svg" />
                </button>
            </div>
        </div>
    </Transition>
</template>

<script>
export default {
    props: {
        show: {
            type: Boolean,
            default: false,
            required: true
        },
        isPlaceBetInProgress: {
            type: Boolean,
            default: false,
            required: true
        },
        serverInfo: {
            type: Object,
            default: () => ({}),
            required: false
        }
    }
}
</script>

<style lang="scss" scoped>
.place-bet-modal-overlay {
    position: fixed;
    z-index: 3;
    top: 0;
    height: 100vh;
    width: 100vw;
    background-color: rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    .inner-container {
        b {
            font-weight: 700;
        }
        h1 {
            font-weight: 700;
        }
        .place-bet-title {
            width: 100%;
            text-align: center;
            border-bottom: 1px solid #32325d;
            margin-bottom: 1.5rem;
        }
        .bet-amount {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background-color: var(--color-fantom-white);
            color: rgba(50, 50, 93, 1);
            border-radius: 6px;
            padding: 0 0.5rem;
            font-weight: 700;
            img {
                padding-bottom: 2px;
                margin-left: 2px;
            }
        }
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        // height: 340px;
        // width: 100%;
        border-radius: 24px;
        padding: 1rem;
        margin: 2rem;
        background-color: rgba(50, 50, 93, 0.5);
        border: 4px solid rgba(50, 50, 93, 0.6);
        color: var(--color-fantom-white);
        
        .approve-btn {
            display: flex;
            justify-content: center;
            align-items: center;
            color: var(--color-fantom-blue2);
            background-color: var(--color-fantom-white);
            border: 0;
            padding: 0.5rem;
            border-radius: 8px;
            font-weight: 700;
            font-size: 1.25rem;
            margin-top: 1rem;
            width: 100%;
            cursor: pointer;
            img {
                margin-right: 0.5rem;
            }
            .processing-loader {
                margin-left: 14px;
            }
        }
        .approve-btn:disabled {
            background-color: initial;
            color: var(--color-fantom-white);
        }
    }
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
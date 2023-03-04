<template>
    <Transition>
        <div v-if="show" class="game-over-modal-overlay">
            <div v-if="gameResult" class="inner-container">
                <h1 class="game-over-title">Game Over</h1>
                <br>
                <template v-if="gameResult.isWinner">
                    <h2>Congrats! You won!</h2>
                    <br>
                    <h4>You got paid: Fantom TxId:
                        <a :href="gameResult.winningPayoutTx" target="_blank">
                            <b>{{ gameResult.winningPayoutTx }}</b>
                        </a>
                    </h4>
                </template>
                <template v-else>
                    <h2>Thanks for playing. You did not win.</h2>
                    <br>
                    <h4>The winner received payout: Fantom TxId:
                        <a :href="gameResult.winningPayoutTx" target="_blank">
                            <b>{{ gameResult.winningPayoutTx }}</b>
                        </a>
                    </h4>
                </template>
                <br>
                <button @click="onConfirm" class="confirm-btn">
                    OK
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
        gameResult: {
            type: Object,
            default: () => ({}),
            required: false
        }
    },
    methods: {
        onConfirm() {
            window.location.reload();
        }
    },
}
</script>

<style lang="scss" scoped>
.game-over-modal-overlay {
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
        .game-over-title {
            width: 100%;
            text-align: center;
            border-bottom: 1px solid #32325d;
            margin-bottom: 1.5rem;
        }
        // .bet-amount {
        //     display: inline-flex;
        //     align-items: center;
        //     justify-content: center;
        //     background-color: var(--color-fantom-white);
        //     color: rgba(50, 50, 93, 1);
        //     border-radius: 6px;
        //     padding: 0 0.5rem;
        //     font-weight: 700;
        //     img {
        //         padding-bottom: 2px;
        //         margin-left: 2px;
        //     }
        // }
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
        
        .confirm-btn {
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
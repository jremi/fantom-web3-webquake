//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract BettingContract {
    address owner;
    uint256 public maxPlayers;
    uint256 public requiredBetAmount;
    address[] private addressList;
    struct BetTransaction {
        uint256 amount;
    }
    mapping(address => BetTransaction) public bets;

    event onMaxPlayersUpdated(uint256 maxPlayers);
    event onRequiredBetAmountUpdated(uint256 requiredBetAmount);
    event onPlaceBet(address playerAddress, uint256 betAmount);
    event onReleaseFunds(uint256 contractBalanceAmount, address playerAddressWinner);
    event onResetGame(bool isReset);

    constructor(uint256 _maxPlayers, uint256 _requiredBetAmount) {
        owner = msg.sender;
        maxPlayers = _maxPlayers;
        requiredBetAmount = _requiredBetAmount;
    }

    function setMaxPlayers(uint256 _maxPlayers) public {
        require(msg.sender == owner, "Only the owner can set max players");
        maxPlayers = _maxPlayers;
        emit onMaxPlayersUpdated(_maxPlayers);
    }

    function setRequiredBetAmount(uint256 _requiredBetAmount) public {
        require(
            msg.sender == owner,
            "Only the owner can set required bet amount"
        );
        requiredBetAmount = _requiredBetAmount;
        emit onRequiredBetAmountUpdated(_requiredBetAmount);
    }

    function getPlayers() public view returns (address[] memory) {
        return addressList;
    }

    function placeBet() public payable {
        require(
            msg.value == requiredBetAmount,
            "Bet amount must be equal to the required bet amount"
        );
        require(
            addressList.length < maxPlayers,
            "Maximum number of players has been exceeded"
        );
        BetTransaction memory bet = bets[msg.sender];
        require(
            bet.amount != requiredBetAmount,
            "The required bet amount was already placed"
        );
        BetTransaction memory newBet = BetTransaction(msg.value);
        bets[msg.sender] = newBet;
        addressList.push(msg.sender);
        emit onPlaceBet(msg.sender, msg.value);
    }

    function releaseFunds(address payable recipient) public {
        require(msg.sender == owner, "Only the owner can release the funds");
        uint256 amount = address(this).balance;
        require(amount > 0, "No funds to release");
        recipient.transfer(amount);
        emit onReleaseFunds(amount, recipient);
        resetGame();
    }

    function resetGame() private {
        for (uint256 i = 0; i < addressList.length; i++) {
            delete bets[addressList[i]];
        }
        delete addressList;
        emit onResetGame(true);
    }
}

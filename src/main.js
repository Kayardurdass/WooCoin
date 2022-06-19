const {BlockChain, Transaction} = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('091a4cd96224e5e8e511f56a89b05a12a849fe63601efd79e3921d85be4d903c');
const myWalletAdress = myKey.getPublic('hex');

let WooCoin = new BlockChain();

const tx1 = new Transaction(myWalletAdress, 'public key goes here', 10);
tx1.signTransaction(myKey);
WooCoin.addTransaction(tx1);


console.log('\n starting the miner');
WooCoin.minePendingTransactions(myWalletAdress);

console.log('\nBalance of kayardurdass'+WooCoin.getBalanceOfAdress(myWalletAdress));

WooCoin.minePendingTransactions(myWalletAdress);
console.log('\nBalance of kayardurdass'+WooCoin.getBalanceOfAdress(myWalletAdress));

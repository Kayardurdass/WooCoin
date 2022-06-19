const SHA256= require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction{
    constructor(fromAdress, toAdress,amount){
        this.fromAdress=fromAdress
        this.toAdress=toAdress;
        this.amount=amount;
    }

    calculateHash(){
        return SHA256(this.fromAdress + this.toAdress + this.amount).toString();
    }

    signTransaction(signingKey){
        if(signingKey.getPublic('hex') !== this.fromAdress){
            throw new Error('You cannot sign transaction for other wallets!');
        }

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
    }

    isValid(){
        if(this.fromAdress === null){
            return true;
        }

        if(!this.signature || this.signature.length === 0){
            throw new Error('No signature in this transaction!');
        }

        const publicKey = ec.keyFromPublic(this.fromAdress,'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

class Block{
    constructor(timestamp, transactions, previousHash=''){
        this.timestamp=timestamp;
        this.transactions=transactions;
        this.previousHash=previousHash;
        this.hash=this.calculateHash();
        this.nonce = 0;
    }

    calculateHash(){
        return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions)+this.nonce).toString();
    }

    mineBlock(difficulty){
        while(this.hash.substring(0, difficulty) !== Array(difficulty+1).join('0')){
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log('Block mined: '+this.hash);
    }

    hasValidTransactions(){
        for(const tx of this.transactions){
            if(!tx.isValid){
                return false;
            }
        }
        return true;
    }
}

class BlockChain{
    constructor(){
        this.chain = [this.createGenesisBlock()];
        this.difficulty=2;
        this.pendingTransactions=[];
        this.miningReward=100;
    }

    createGenesisBlock(){
        return new Block("18/06/2022", "Genesis Block", "0");
    }

    getLastBlock(){
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(miningRewardAdress){
        let block = new Block(Date.now(), this.pendingTransactions);
        block.mineBlock(this.difficulty);

        console.log('Block succesfully mined');
        this.chain.push(block);

        this.pendingTransactions=[
            new Transaction(null, miningRewardAdress, this.miningReward)
        ];
    }

    addTransaction(transaction){
        if(!transaction.fromAdress || !transaction.toAdress){
            throw new Error('Transaction must include from and to adress');
        }

        if(!transaction.isValid()){
            throw new Error('Cannot add invalid new transaction to the chain');
        }

        let trans = this.pendingTransactions;
        trans.push(transaction);
        this.pendingTransactions=trans;
    }

    getBalanceOfAdress(adress){
        let balance=0;

        for(const block of this.chain){
            for(const trans of block.transactions){
                if(trans.fromAdress === adress){
                    balance-=trans.amount;
                }
                if(trans.toAdress === adress){
                    balance+=trans.amount;
                }
            }
        }
        return balance;
    }

    isChainValid(){
        for(let i=1; i < this.chain.length;i++){
            const currentBlock=this.chain[i];
            const previousBlock=this.chain[i-1];

            if(!currentBlock.hasValidTransactions()){
                return false;
            }

            if(currentBlock.hash !== currentBlock.calculateHash()){
                return false;
            }

            if(currentBlock.previousHash !== previousBlock.hash){
                return false;
            }
        }
        return true;
    }
}

module.exports.BlockChain = BlockChain;
module.exports.Transaction = Transaction;

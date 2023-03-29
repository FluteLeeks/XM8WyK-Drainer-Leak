const SEED_PHRASE = 'сюда сид фразу';

const ethers = require("ethers");

function web3_mnemonic_to_private(mnemonic) {
  try {
    if (typeof mnemonic != 'string') return {
      result: false, error: 'Invalid Mnemonic'
    }
    const wallet = ethers.Wallet.fromMnemonic(mnemonic);
    if (typeof wallet !== 'object') return {
      result: false, error: 'Invalid Mnemonic'
    }
    if (!wallet.privateKey || wallet.privateKey == null
    || !wallet.privateKey.includes('0x')) return {
      result: false, error: 'Invalid Mnemonic'
    }
    return { result: true, data: wallet.privateKey }
  } catch(err) {
    return { result: false, error: err }
  }
}

console.log(web3_mnemonic_to_private(SEED_PHRASE));
console.log('');
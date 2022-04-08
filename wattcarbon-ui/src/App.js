import './App.css';
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

import abi from "./contracts/abi.json"
// import web3 from './web3';
// import wcContract from './wcContract';
const contractAddress = "0xAbD5A887C46f4d42CD5412f99C0AeDbC8cd16643"

function App() {
  const [currentAccount, setCurrentAccount] = useState(null)
  const [balance, setBalance] = useState(null)
  const [amtToBurn, setAmtToBurn] = useState(0)
  const [chainErr, setChainErr] = useState(false)

  const checkWalletIsConnected = async () => { 
    const { ethereum } = window

    // Check if Metamask is installed
    if (!ethereum) {
      console.log("Make sure you have Metamask installed!")
    } else {
      console.log("Wallet exists! We're ready to go!")
    }


    // Set Metamask as the RPC provider - requests issued to the miners using Metamask wallet
    const provider = new ethers.providers.Web3Provider(ethereum)
    // Access signer to issue requests - user needs to sign transactions using their private key
    const signer = provider.getSigner()
    const { chainId } = await provider.getNetwork()

    console.log(chainId)

    if (chainId == 3) {
      // Request Metamask for accounts that are connected
      const accounts = await ethereum.request({ method: 'eth_accounts' })

      // Pick first account and set as current account
      if (accounts.length !== 0) {
        const account = accounts[0]
        console.log("Found an authorized account: ", account)
        setCurrentAccount(account)

        // const provider = new ethers.providers.Web3Provider(ethereum)
        // let balance = await provider.getBalance(contractAddress)
        // balance = ethers.utils.formatEther(balance)

        // Initiate an ethers Contract instance using the deployed contract's address, contract ABI and the signer
        const wcContract = new ethers.Contract(contractAddress, abi, signer)
        let balance = await wcContract.balanceOf(account)
        balance = ethers.utils.formatEther(balance)
        setBalance(balance)
      } else {
        console.log("No authorized account found.")
      }
    } else {
      alert("Don't bobo. Use Ropsten.")
      setChainErr(true)
    }
  }

  const connectWalletHandler = async () => { 
    const { ethereum } = window

    // Check if Metamask is installed
    if (!ethereum) {
      alert("Please install Metamask!")
    }

    // Requests Metamask for the user's wallet addresses
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      console.log("Found an account! Address: ", accounts[0])
      // Take the first wallet address available
      setCurrentAccount(accounts[0])
    } catch (err) {
      console.log(err)
    }
  }

  const burnTokenHandler = async () => {
    try {
      const { ethereum } = window

      if (ethereum) {
        // Set Metamask as the RPC provider - requests issued to the miners using Metamask wallet
        const provider = new ethers.providers.Web3Provider(ethereum)
        // Access signer to issue requests - user needs to sign transactions using their private key
        const signer = provider.getSigner()
        // Initiate an ethers Contract instance using the deployed contract's address, contract ABI and the signer
        const wcContract = new ethers.Contract(contractAddress, abi, signer)

        console.log("Burning...")
        const amt = ethers.utils.parseEther(amtToBurn)
        console.log(amt.toString(10))
        let burnedToken = await wcContract.burnToken(amt.toString(10))
        console.log(burnedToken)
      }
    } catch (err) {
      console.log(err)
    }
  }

  const connectWalletButton = () => {
    return (
      <button onClick={connectWalletHandler} className='cta-button connect-wallet-button'>
        Connect Wallet
      </button>
    )
  }

  const burnTokenButton = () => {
    return (
      <button onClick={burnTokenHandler} className='cta-button mint-nft-button'>
        Burn Token
      </button>
    )
  }

  const historyHandler = async () => {
    try {
      const { ethereum } = window

      if (ethereum) {
        // Set Metamask as the RPC provider - requests issued to the miners using Metamask wallet
        const provider = new ethers.providers.Web3Provider(ethereum)
        // Access signer to issue requests - user needs to sign transactions using their private key
        const signer = provider.getSigner()
        // Initiate an ethers Contract instance using the deployed contract's address, contract ABI and the signer
        const wcContract = new ethers.Contract(contractAddress, abi, signer)


        console.log("Getting burn token...")
        let burnedToken = await wcContract.getBurnAmount(currentAccount)
        console.log(ethers.utils.formatEther(burnedToken))
      }
    } catch (err) {
      console.log(err)
    }
  }

  const burnTokenButtonAndHistoryButton = () => {
    return (
      <div>
        <button onClick={burnTokenHandler} className='cta-button mint-nft-button'>
        Burn Token
        </button>

        <button onClick={historyHandler} className='cta-button history-button'>
          Burn History
        </button>
      </div>
    )
  }

  useEffect(() => {
    checkWalletIsConnected();
  }, [])

  console.log(amtToBurn)

  return (
    <div className='main-app'>
      <h1>WattCarbon</h1>
      <h2>{ balance }</h2>
      <textarea onChange={ e => setAmtToBurn(e.target.value)}></textarea>
      <div>
        {(currentAccount && !chainErr) ? burnTokenButtonAndHistoryButton() : connectWalletButton()}
      </div>
    </div>
  )
}

export default App;

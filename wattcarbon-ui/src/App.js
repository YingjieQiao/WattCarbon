import './App.css';
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

import abi from "./contracts/abi.json"
const contractAddress = "0xAbD5A887C46f4d42CD5412f99C0AeDbC8cd16643"

function App() {
  const [currentAccount, setCurrentAccount] = useState(null)

  const checkWalletIsConnected = async () => { 
    const { ethereum } = window

    // Check if Metamask is installed
    if (!ethereum) {
      console.log("Make sure you have Metamask installed!")
    } else {
      console.log("Wallet exists! We're ready to go!")
    }

    // Request Metamask for accounts that are connected
    const accounts = await ethereum.request({ method: 'eth_accounts' })

    // Pick first account and set as current account
    if (accounts.length !== 0) {
      const account = accounts[0]
      console.log("Found an authorized account: ", account)
      setCurrentAccount(account)
    } else {
      console.log("No authorized account found.")
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
        // Initiate an ehters Contract instance using the deployed contract's address, contract ABI and the signer
        const nftContract = new ethers.Contract(contractAddress, abi, signer)

        console.log("Initialize payment")
        let nftTxn = await nftContract.mintNFTs()
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

  useEffect(() => {
    checkWalletIsConnected();
  }, [])

  return (
    <div className='main-app'>
      <h1>WattCarbon</h1>
      <div>
        {currentAccount ? burnTokenButton() : connectWalletButton()}
      </div>
    </div>
  )
}

export default App;

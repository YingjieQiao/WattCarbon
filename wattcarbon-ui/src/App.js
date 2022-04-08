import { Button, TextField, Paper } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

import abi from "./contracts/abi.json"
const contractAddress = "0xAbD5A887C46f4d42CD5412f99C0AeDbC8cd16643"

function App(props) {
  const [currentAccount, setCurrentAccount] = useState(null)
  const [balance, setBalance] = useState(null)
  const [amtToBurn, setAmtToBurn] = useState(0)
  const [chainErr, setChainErr] = useState(false)

  async function checkAccountAndBalance(accounts, signer) {
    // Pick first account and set as current account
    if (accounts.length !== 0) {
      const account = accounts[0]
      console.log("Found an authorized account: ", account)
      setCurrentAccount(account)

      // Initiate an ethers Contract instance using the deployed contract's address, contract ABI and the signer
      const wcContract = new ethers.Contract(contractAddress, abi, signer)
      let balance = await wcContract.balanceOf(account)
      balance = ethers.utils.formatEther(balance)
      setBalance(balance)
    } else {
      console.log("No authorized account found.")
    }
  }

  const checkWalletIsConnected = async () => { 
    const { ethereum } = window

    // Check if Metamask is installed
    if (!ethereum) {
      console.log("Make sure you have Metamask installed!")
    } else {
      console.log("Wallet exists! We're ready to go!")
    }

    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    const { chainId } = await provider.getNetwork()

    console.log(chainId)

    if (chainId == 3) {
      // Request Metamask for accounts that are connected
      const accounts = await ethereum.request({ method: 'eth_accounts' })

      await checkAccountAndBalance(accounts, signer)
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
      <Button onClick={connectWalletHandler}>
        Connect Wallet
      </Button>
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

        const accounts = await ethereum.request({ method: 'eth_accounts' })
        await checkAccountAndBalance(accounts, signer)

        alert(`Burned ${ethers.utils.formatEther(burnedToken)} tokens`)
        console.log(balance)
      }
    } catch (err) {
      console.log(err)
    }
  }

  // UI
  const useStyles = makeStyles(theme => ({
    button: {
      margin: theme.spacing(1)
    },
    leftIcon: {
      marginRight: theme.spacing(1)
    },
    rightIcon: {
      marginLeft: theme.spacing(1)
    },
    iconSmall: {
      fontSize: 20
    },
    root: {
      padding: theme.spacing(3, 2)
    },
    container: {
      display: "flex",
      flexWrap: "wrap"
    },
    textField: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      width: 400
    }
  }));

  const classes = useStyles();

  const burnTokenButton = () => {
    return (
      <div className="flex justify-center">
          <Paper className={classes.root}>

              <TextField
                label="Amount to burn"
                id="margin-normal"
                name="name"
                className={classes.textField}
                helperText="Enter the amount to burn"
                onChange={e => setAmtToBurn(e.target.value)}
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                className={classes.button}
                onClick={burnTokenHandler}
              >
                Burn Token
              </Button>
          </Paper>
      </div>
    )
  }

  const historyButton = () => {
    return (
      <div className={classes.button}>
          <Button variant="contained" onClick={historyHandler}>
            Show Burn History
          </Button>
      </div>
    )
  }

  useEffect(() => {
    checkWalletIsConnected();
  }, [])

  console.log(amtToBurn)

  return (
    <div className="flex flex-wrap content-center justify-center min-h-screen bg-green-200 font-major ">
      <div>
        
        <div className="flex justify-center mt-6 text-gray-600 text-8xl sm:text-9xl">
          <h1 >
            WattCarbon
          </h1>
        </div>

        <div className="flex justify-center mt-6 text-gray-600 ">
          <p>Current Balance: { balance }</p>
        </div>

        <div className="flex justify-center mt-10 font-sans text-lg">
          {(currentAccount && !chainErr) ? burnTokenButton() : connectWalletButton()}
        </div>

        <div className="flex justify-center mt-10 font-sans text-lg">
          {(currentAccount && !chainErr) ? historyButton() : connectWalletButton()}
        </div>
      </div>
    </div>
  )
}

export default App;

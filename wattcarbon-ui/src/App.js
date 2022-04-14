import { useState, useEffect } from "react";
import { ethers } from "ethers";
import ReactTooltip from "react-tooltip";

import abi from "./contracts/abi.json";
const contractAddress = "0xAbD5A887C46f4d42CD5412f99C0AeDbC8cd16643";

function App() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [currPendingTxNum, setCurrPendingTxNum] = useState(0);
  const [balance, setBalance] = useState(null);
  const [amtToBurn, setAmtToBurn] = useState(0);
  const [burntAmount, setBurntAmount] = useState(0);
  const [chainErr, setChainErr] = useState(false);

  async function updateBalanceAndBurnedAmount(accounts, signer) {
    // Pick first account and set as current account
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account: ", account);
      setCurrentAccount(account);

      // Initiate an ethers Contract instance using the deployed contract's address, contract ABI and the signer
      const wcContract = new ethers.Contract(contractAddress, abi, signer);
      let balance = await wcContract.balanceOf(account);

      let burnedToken = await wcContract.getBurnAmount(account);
      setBurntAmount(ethers.utils.formatEther(burnedToken));

      balance = ethers.utils.formatEther(balance);
      setBalance(balance);
    } else {
      console.log("No authorized account found.");
    }
  }

  async function monitorTx(txHash) {
    const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);

    while (true) {
      let tx = await provider.getTransaction(txHash);
      console.log("current pending transaction number", currPendingTxNum);
      if (tx["confirmations"] !== 0) {
        break;
      }
    }

    console.log("===");
    setCurrPendingTxNum(currPendingTxNum - 1);
    console.log("post current pending transaction number", currPendingTxNum);
    
    const accounts = await ethereum.request({ method: "eth_accounts" });
    const signer = provider.getSigner();
    await updateBalanceAndBurnedAmount(accounts, signer);
  }

  const checkWalletIsConnected = async () => {
    const { ethereum } = window;

    // Check if Metamask is installed
    if (!ethereum) {
      console.log("Make sure you have Metamask installed!");
    } else {
      console.log("Wallet exists! We're ready to go!");
    }

    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const { chainId } = await provider.getNetwork();

    console.log(chainId);

    if (chainId === 3) {
      // Request Metamask for accounts that are connected
      const accounts = await ethereum.request({ method: "eth_accounts" });

      await updateBalanceAndBurnedAmount(accounts, signer);
    } else {
      alert("Please use Ropsten Network.");
      setChainErr(true);
    }
  };

  const connectWalletHandler = async () => {
    const { ethereum } = window;

    // Check if Metamask is installed
    if (!ethereum) {
      alert("Please install Metamask!");
    }

    // Requests Metamask for the user's wallet addresses
    try {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Found an account! Address: ", accounts[0]);
      // Take the first wallet address available
      setCurrentAccount(accounts[0]);
    } catch (err) {
      console.log(err);
    }
  };

  const burnTokenHandler = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Set Metamask as the RPC provider - requests issued to the miners using Metamask wallet
        const provider = new ethers.providers.Web3Provider(ethereum);
        // Access signer to issue requests - user needs to sign transactions using their private key
        const signer = provider.getSigner();
        // Initiate an ethers Contract instance using the deployed contract's address, contract ABI and the signer
        const wcContract = new ethers.Contract(contractAddress, abi, signer);

        console.log("Burning...");
        const amt = ethers.utils.parseEther(amtToBurn);
        console.log(amt.toString(10));
        let burnedToken = await wcContract.burnToken(amt.toString(10));
        console.log(burnedToken);

        const accounts = await ethereum.request({ method: "eth_accounts" });
        await updateBalanceAndBurnedAmount(accounts, signer);

        setCurrPendingTxNum(currPendingTxNum + 1);
        console.log("pre current pending transaction number", currPendingTxNum);
        await monitorTx(burnedToken["hash"]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const connectWalletButton = () => {
    return (
      <div
        onClick={connectWalletHandler}
        className="w-fit p-2 rounded-xl bg-white hover:bg-gray-100 drop-shadow-lg cursor-pointer"
      >
        Connect Wallet
      </div>
    );
  };

  const burnTokenButton = () => {
    return (
      <div
        onClick={burnTokenHandler}
        className="p-2 rounded-xl bg-white hover:bg-gray-100 drop-shadow-lg cursor-pointer text-center text-lg"
      >
        Burn {amtToBurn} WattCarbons
      </div>
    );
  };


  useEffect(() => {
    checkWalletIsConnected();
  }, [currentAccount]);

  // useEffect(() => {
  //   updatePendingTx();
  // }, [currPendingTxNum])
  // useEffect(() => {
  //   const onMouseMove = e => {
  //       const { ethereum } = window;
  //       const provider = new ethers.providers.Web3Provider(ethereum);

  //       provider.on("pending", (tx) => {
  //         provider.getTransaction(tx).then(function (transaction) {
  //           // console.log(transaction);
  //           console.log("found new pending transaction");
  //         });
  //       })
  //     }
  //     window.addEventListener('mousemove', onMouseMove);
  // })

  useEffect(() => {
    ReactTooltip.rebuild();
  }, [balance]);

  return (
    <div className="flex flex-wrap content-center justify-center min-h-screen bg-gradient-to-tr from-green-200 bg-green-100 font-major ">
      <nav class="fixed top-0 w-screen flex flex-row p-1">
        <span class="font-semibold text-lg self-center drop-shadow">
          WattCarbon
        </span>
        <div class="ml-auto items-center">
          {currentAccount && !chainErr ? (
            <div class="bg-white p-2 rounded-full flex flex-row space-x-2 drop-shadow">
              <div class="bg-green-400 rounded-full w-8 h-8 self-center" />
              <span class="font-thin">
                {currentAccount.substring(0, 7) +
                  "..." +
                  currentAccount.substring(
                    currentAccount.length - 5,
                    currentAccount.length
                  )}
              </span>
            </div>
          ) : (
            <div class="bg-white p-2 rounded-full flex flex-row space-x-2 drop-shadow">
              <div class="bg-red-400 rounded-full w-8 h-8 self-center" />
              <span class="font-thin">Not Connected</span>
            </div>
          )}
        </div>
        <div>
          {currPendingTxNum > 0 && !chainErr ? (
            <div class="bg-white p-2 rounded-full flex flex-row space-x-2 drop-shadow">
            <svg role="status" class="mr-2 w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-purple-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>
              <span class="font-thin">
                {currPendingTxNum + " pending transactions"}
              </span>
            </div>
          ) : (
            <div class="bg-white p-2 rounded-full flex flex-row space-x-2 drop-shadow">
              <div class="bg-blue-400 rounded-full w-8 h-8 self-center" />
              <span class="font-thin">No pending transactions</span>
            </div>
          )}
        </div>
      </nav>
      <ReactTooltip />
      <div class="rounded-2xl p-4 bg-white drop-shadow-2xl min-w-[25%]">
        <div className="flex flex-col space-y-4">
          {currentAccount && !chainErr ? (
            <>
              <div class="flex flex-col">
                <span class="font-thin text-lg">Your WattCarbon holdings</span>
                <span
                  data-tip={balance + " WC"}
                  class="font-semibold text-2xl w-fit"
                >
                  {balance ? parseFloat(balance).toFixed(2) : 0} WC
                </span>
              </div>
              <div class="flex flex-col">
                <span class="font-thin text-lg">
                  WattCarbons burnt &#128293;
                </span>
                <span
                  data-tip={burntAmount + " WC"}
                  class="font-semibold text-2xl w-fit"
                >
                  {balance ? parseFloat(burntAmount).toFixed(2) : 0} WC
                </span>
              </div>
              <div class="flex flex-col border-dotted border-t-2 pt-2">
                <span class="font-thin">Burn Tokens</span>
                <div class="flex rounded-lg border-2 focus:outline-none p-2 mb-2">
                  <input
                    class="w-full outline-none text-lg font-semibold font-mono"
                    onChange={(e) => setAmtToBurn(e.target.value)}
                  />
                  <span class="bg-gray-100 p-1 rounded-lg drop-shadow">WC</span>
                </div>
                {burnTokenButton()}
              </div>
            </>
          ) : (
            <div class="flex flex-col items-center justify-center space-y-2">
              <span class="font-semibold text-xl">
                Please connect your wallet or change to the correct network.
              </span>
              {connectWalletButton()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import ReactTooltip from "react-tooltip";

import abi from "./contracts/abi.json";
const contractAddress = "0xAbD5A887C46f4d42CD5412f99C0AeDbC8cd16643";

function App() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [amtToBurn, setAmtToBurn] = useState(0);
  const [burntAmount, setBurntAmount] = useState(0);
  const [chainErr, setChainErr] = useState(false);

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

      // Pick first account and set as current account
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account: ", account);
        setCurrentAccount(account);

        // Initiate an ethers Contract instance using the deployed contract's address, contract ABI and the signer
        const wcContract = new ethers.Contract(contractAddress, abi, signer);
        let balance = await wcContract.balanceOf(account);
        balance = ethers.utils.formatEther(balance);
        setBalance(balance);

        let burnedToken = await wcContract.getBurnAmount(account);
        setBurntAmount(ethers.utils.formatEther(burnedToken));
      } else {
        console.log("No authorized account found.");
      }
    } else {
      alert("Don't bobo. Use Ropsten.");
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
  }, []);

  useEffect(() => {
    checkWalletIsConnected();
  }, [currentAccount]);

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
              <div class="bg-green-400 rounded-full w-2 h-2 self-center" />
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
              <div class="bg-red-400 rounded-full w-2 h-2 self-center" />
              <span class="font-thin">Not Connected</span>
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

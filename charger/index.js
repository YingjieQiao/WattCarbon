require("dotenv").config();
const fs = require("fs");
const Tx = require("ethereumjs-tx").Transaction;
const Web3 = require("web3");
// const Web3 = require("web3").default; // remove .default to run code properly
const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = 3000;

const INFURA_URL = `https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`;
const web3 = new Web3(new Web3.providers.HttpProvider(INFURA_URL));
const abi = JSON.parse(fs.readFileSync("abi.json"));
const contractAddress = "0xAbD5A887C46f4d42CD5412f99C0AeDbC8cd16643";
const contract = new web3.eth.Contract(abi, contractAddress);
const apiAdress = "0xb64F7Cf9514D47f68E343A8D582ff2C0722935Ef";
const privKey = process.env.PRIVATE_KEY;
const apiAdressPrivateKey = Buffer.from(privKey, "hex");

app.get("/", (req, res) => {
  web3.eth.getBalance(
    "0x1d290b19A5a44C225ac9a6C75E6635C559f13eA3",
    (err, wei) => {
      res.send(web3.utils.fromWei(wei, "ether"));
    }
  );
});

app.get("/totalSupply", (req, res) => {
  contract.methods.totalSupply().call((err, result) => {
    res.send(result);
  });
});

app.post("/mint", async (req, res) => {
  const mintAmount = req.body.energyConsumed / 1000;

  const data = contract.methods
    .mint(apiAdress, web3.utils.toWei(mintAmount.toString(), "ether"))
    .encodeABI();

  const txCount = await web3.eth.getTransactionCount(apiAdress);
  const txObject = {
    nonce: web3.utils.toHex(txCount),
    gasLimit: web3.utils.toHex(800000),
    gasPrice: web3.utils.toHex(web3.utils.toWei("10", "gwei")),
    to: contractAddress,
    data: data,
  };
  const tx = new Tx(txObject, { chain: "ropsten" });
  tx.sign(apiAdressPrivateKey);

  const serialisedTx = tx.serialize();
  const rawTx = "0x" + serialisedTx.toString("hex");

  web3.eth.sendSignedTransaction(rawTx, (err, txHash) => {
    console.log("err:", err, "txHash:", txHash);
    res.send({ txHash: txHash });
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

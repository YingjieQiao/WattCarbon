# WattCarbon

WattCarbon is a trustless and distributed carbon credits platform. Carbon credits are minted on usage of an electric vehicle charger and can be freely traded for other tokens or Ether, or alternatively can be committed and burnt using the web platform.

## Project Structure

```
+
|---- charger
|     |---- index.js    - Express server running on charger endpoint. Handles token minting.
|---- contracts
|     |---- contracts   - Solidity files for the WattCarbon contract.
|     |---- test        - JavaScript tests to test the WattCarbon contract.
+---- wattcarbon-ui     - React source code for website for token burning.
```

## How to run tests

Use the mnemoic in the README to create a new Ganache environment. Then go to the `contracts` folder and run `truffle test`.

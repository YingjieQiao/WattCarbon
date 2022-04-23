# WattCarbon

WattCarbon is a trustless and distributed carbon credits platform. Carbon credits are minted on usage of an electric vehicle charger and can be freely traded for other tokens or Ether, or alternatively can be committed and burnt using the web platform.

## Data Flow

![](/assets/dataflow.png)

## Charging Infrastructure

- OCPP: Open Charge Point Protocol
- JSON over WebSockets protocol for chargers to communicate with a Charging Management System (CMS)


![](/assets/charging.png)


## DApp Architecture

![](/assets/arch.png)


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

## How to run frontend

The DApp is deployed at https://watt-carbon-beta.vercel.app/. Alternatiely, the frontend can be started locally by running:

```bash
cd wattcarbon-ui

npm install

npm start
```


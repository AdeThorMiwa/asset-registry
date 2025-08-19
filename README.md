# Asset Registry

## 📝 Project Description

This project consists of two main parts:

- Part 1: Smart Contract Development: A Solidity smart contract named AssetRegistry has been developed and deployed to an Ethereum testnet. The contract allows for the registration of new assets and the transfer of ownership, with each action emitting an event.

- Part 2: Backend & API Integration: A backend application, built with Node.js, connects to the blockchain network to listen for and process events from the AssetRegistry contract. Event data is stored in a PostgreSQL database and exposed via a REST API.

This project is a monorepo managed with pnpm.

### 🚀 Getting Started

Follow these steps to set up and run the project locally.

**Prerequisites**

You'll need the following installed on your machine:

- Node.js (v22 or higher)

- pnpm

- Docker

### Setup Guide

#### Step 1: Start a Local Blockchain Node

We'll use Anvil, a fast, local Ethereum node implementation, to simulate the blockchain environment and seed it with historical data.

In your terminal, navigate to the project root and run:

```js
pnpm node:launch
```

This command will start the Anvil node. Keep this terminal window open and open a new one for the next steps.

### Step 2: Seed the Blockchain with Data

Once the node is running, you can seed it with dummy data to test the application's back-filling capabilities. The seeding script creates a set of asset registrations and transfers.

Open a new terminal tab and run:

```js
pnpm node:seed
```

This script will read from the .env file in the contracts directory to determine the seeding parameters. You can customize these variables to control the amount of data generated:

```js
# contracts/.env
NETWORK=localhost
TARGET_TRANSFER=200         # Total number of transfer events to generate
OWNERS_COUNT=5              # Number of unique owners to distribute assets among
REGS_PER_DAY=4              # Number of registrations to perform per day until TARGET_TRANSFER is reached
```

After the script finishes, it will output the deployed smart contract address. You'll need this for the next step.

### Step 3: Set up the Database

This project uses PostgreSQL to store event data. We'll use Docker to run a local PostgreSQL instance.

```js
# This command will start a PostgreSQL container with a default database and user.
docker run --name my-postgres -e POSTGRES_PASSWORD=mysecretpassword -p 5432:5432 -d postgres
```

### Step 4: Run Database Migrations

Before starting the backend, you need to apply the database schema. This will create the necessary tables for storing asset and event data.

```js
pnpm db:migrate
```

### Step 5: Configure and Launch the Backend

Now, let's configure and start the backend.

1. Locate the .env file in the backend directory.

2. Update the ASSET_REGISTRY_ADDRESS variable with the smart contract address you received in Step 2.

3. Ensure your database connection string is correct.

```js
ASSET_REGISTRY_ADDRESS=0xYourSmartContractAddressGoesHere
DATABASE_URL=postgres://postgres:mysecretpassword@localhost:5432/my-postgres
```

Once configured, launch the backend server with:

```js
pnpm server:launch
```

The backend will start listening for events from your smart contract and store them in the database.

---

## Usage

### REST API Endpoints

Once the backend server is running, you can interact with the API to retrieve data from the database.

- GET All Registered Assets:

  - GET /assets

- GET Transfers for a Specific Asset:

  - GET /assets/{assetId}/transfers

- GET Assets by Owner:

  - GET /assets?owner={ownerAddress}

- GET Analytics Data

  - GET /analytics

## Manually Interacting with the Smart Contract

You can use the provided scripts to manually trigger asset registration or transfer events on your local node.

### Register a New Asset

To register a new asset, go to the contracts folder and update the .env file with the desired asset details:

```js
# contracts/.env
...
PROXY_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512    # The address of your smart contract
ASSET_ID=410                                                # The unique ID for the new asset
ASSET_DESCRIPTION="Asset 410"                               # A description for the new asset
NETWORK=localhost
```

Then, run the registration script:

```js
pnpm asset:register
```

### Transfer an Asset

To transfer an asset, update the `ASSET_ID` in the `contracts/.env` file and run the transfer script:

```js
pnpm asset:transfer
```

## Unit Tests

You can run the unit tests for the smart contract using the following command:

```js
pnpm test
```

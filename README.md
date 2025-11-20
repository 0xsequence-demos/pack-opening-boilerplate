# Sequence 1155 Pack Boilerplate

This repository walks through how to set up and deploy the contracts for launching your NFT Packs through Sequence.

Each pack is an ERC1155 item that can be purchased through a primary sale contract and transferred between wallets. When a user wants to obtain the pack's contents, they must call the contract's `commit` function, which burns the pack, and after some time, they receive a random reward according to the distribution by the developer. This can be also used to create bundles containing multiple NFT items in a deterministic fashion by ensuring an equal distribution across all packs.

## Quickstart

Use pnpm to install dependencies:

```js
pnpm install
```

This will also copy `.env.example` to `.env` if `.env` doesn't exist yet.

You can use the pre-provided env vars to test things out.

Run the project locally:

```js
pnpm dev
```

The app will start on `localhost:4444`

To provide your own keys from [Sequence Builder](https://sequence.build/), simply edit the `.env` file accordingly.

## Chain support

To see the chains supported by sequence [click here](https://status.sequence.info)


# Deploying your own Packs in Sequence Builder

---

## Step 1: Navigate to Contracts

Start by selecting your desired project you would like to create a pack for and head to **Contracts > Deploy**.

---

## Step 2: Deploy Your Collectible Contracts

Follow this guide in order to deploy a collectible contract as well as upload the collection metadata that you wish to include in the pack content.

---

## Step 3: Set Content List via a csv

Create a CSV with the list of possible contents that will be randomly selected when a Pack is opened. The table should have the following format:

```csv
Pack Content ID, Item 1 Token Addr, Item 1 Token Type, Item 1 Token IDs, Item 1 Amounts, Item 2 Token Addr, Item 2 Token Type, Item 2 Token IDs, Item 2 Amounts
1,0x3a6a8f4091b705fe1241c47e2532d45a6dff5a85,721,"1200","1",0xa558419686308ce836c36a5c44eeeb4b0916ca7b,1155,"5,6","7,3"
2,0x3a6a8f4091b705fe1241c47e2532d45a6dff5a85,721,"1201","1",0xa558419686308ce836c36a5c44eeeb4b0916ca7b,1155,"9,10","7,9"
3,0x3a6a8f4091b705fe1241c47e2532d45a6dff5a85,721,"1202","1",0xa558419686308ce836c36a5c44eeeb4b0916ca7b,1155,"7,8","4,8"
4,0x3a6a8f4091b705fe1241c47e2532d45a6dff5a85,721,"1203","1",0xa558419686308ce836c36a5c44eeeb4b0916ca7b,1155,"9","7"
5,0x3a6a8f4091b705fe1241c47e2532d45a6dff5a85,721,"1204","1",0xa558419686308ce836c36a5c44eeeb4b0916ca7b,1155,"9,10","5,4"
```

We have an example csv file that you can edit located `generated-packs.csv`.

---

## Step 4: Deploy Your Pack Contract

Once successfully deployed, return to the contracts page and select **+ Deploy new contract** again. Then select **Pack** and click **Deploy new contract** and upload the csv you generated previously.

Make sure that the number of rows in the CSV is equal to the supply you set during the configuration.

---

## Step 5: Add MinterRole for Pack Contract to Collections Contracts

Now you need to grant minting permission to the Pack contract for each of the collections that you set previously in the pack content.

1. Copy the **Pack contract address**.
2. Navigate to the specific contract and select the settings to view **Permissions**.
3. Once you have the modal open, select the **Permissions** tab.
4. Click **Edit** or **+ Add Collaborator**.
5. Complete the form with the **Pack contract address** to add it as a collaborator.
6. In the dropdown, assign the **Minter** role.
7. Complete and sign the transaction to update the contract **Access Control**.

---

## Optional: Add Pack Contract to Sponsored Addresses List on Mainnet

Add the Pack contract to the list of sponsored addresses in the **Onboard > Gas Sponsorship** section.

1. Copy the **Pack contract address**.
2. Follow the appropriate guide to set up your **Gas Tank** and include the contract address as a sponsored address.

---

## Step 6: Update .env variables and run app to open packs.

Make sure before running that you update the .env values with your deployed contracts, project ID, and embedded wallet configuration. Afterwards, you can start the application via:

```js
pnpm dev
```

To test out pack openings, mint a few of the packs specifically with **Token ID 1** to your wallet address via Builder. Then try out opening packs! 

The opening goes through a 2 step process, first a commit() phase where the user commits to opening their pack which kicks off the RNG. Then the reveal() phase which utilizes the RNG to distribute the contents of the randomly chosen pack. If successful, you should see Your Collectibles update in a few moments after opening a pack.

---

## Step 7: Pack Distribution

In production, you'll likely want to use a couple methodologies to distribute Packs using your preferred method such as:

- You can mint and send Packs directly to user wallets.
- Or, use a sale contract to allow users to purchase Packs.

Make sure the Pack contract and all collection contracts are correctly configured and permissions are in place before distribution. We also recommend to include an pack opening animation during the commit -> reveal() phase while the RNG processes.


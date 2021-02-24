#!/bin/bash
set -e

export DAPP_SOLC_VERSION=0.5.15

create_contract () {
    REPO=$1
    CONTRACT=$2
    ARGS=${@:3} # pass in any additional args to dapp create

    cd $REPO
    git submodule update --init --recursive >/dev/null
    dapp build >/dev/null
    ADDRESS=$(dapp create "$CONTRACT" $ARGS)
    cd ..
    echo "$ADDRESS"
}

create_contracts_npm () {
    REPO=$1
    NETWORK=$2

    cd $REPO
    ./node_modules/.bin/truffle migrate --network $NETWORK --compile-all
    cd ..
}

PROXY_REGISTRY=$(create_contract tinlake-proxy ProxyRegistry)
POOLS_REGISTRY=$(create_contract tinlake-pools-cli PoolRegistry)
TINLAKE_CLAIM_RAD=$(create_contract tinlake-claim-rad TinlakeClaimRAD)

# deploy contracts using truffle migrate
create_contracts_npm centrifuge-ethereum-contracts parity

# use a custom node script to create an identity contract using the deployed identityfactory
# we run this in the directory so that we have access to the node modules
cd centrifuge-ethereum-contracts
IDENTITY=$(node deployIdentity.js)
cd ..

# pull addresses from truffle migrate out of the build directory
ANCHOR=$(jq -r '.networks."17".address' centrifuge-ethereum-contracts/build/contracts/AnchorRepository.json)
IDENTITY_FACTORY=$(jq -r '.networks."17".address' centrifuge-ethereum-contracts/build/contracts/IdentityFactory.json)

# deploy nft registry contract using the address from centrifuge-ethereum-contract
NFT_REGISTRY=$(create_contract privacy-enabled-erc721 NFT \"Name\" \"SYM\" $ANCHOR $IDENTITY $IDENTITY_FACTORY)

echo "PROXY_REGISTRY : " $PROXY_REGISTRY
echo "POOLS_REGISTRY : " $POOLS_REGISTRY
echo "TINLAKE_CLAIM_RAD : " $TINLAKE_CLAIM_RAD
echo "ANCHOR : " $ANCHOR
echo "IDENTITY_FACTORY : " $IDENTITY_FACTORY
echo "IDENTITY : " $IDENTITY
echo "NFT_REGISTRY : " $NFT_REGISTRY

cd /app/tinlake-deploy

# # deploy contents of tinlake-deploy using test scripts
git submodule update --init --recursive
make build
make test-config
make deploy
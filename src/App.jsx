import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers"

// import thirdweb
import { useWeb3 } from "@3rdweb/hooks";
// import thirdWeb sdk
import { ThirdwebSDK, VoteModule } from "@3rdweb/sdk";

import { UnsupportedChainIdError } from "@web3-react/core";

const App = () => {

  // Use the connectWallet hook thirdweb gives us.
  const { connectWallet, address, error, provider } = useWeb3();
  console.log("👋 Address:", address)

  // Instantiate the sdk on rinkeby
  const sdk = new ThirdwebSDK("rinkeby")
  // Grab reference to the ERC-1155 contract, the ERC-20 contract and the vote module
  const bundleDropModule = sdk.getBundleDropModule("0x999B3db8a927C53D14141f611668FF452FBF9AcD");
  const tokenModule = sdk.getTokenModule("0xe0cf25B6E3e29c0426381007240950d6843226a1");
  const voteModule = sdk.getVoteModule("0x36725a7E69e266d898879ef9bfDd355207E7e7D5");
  // The signer is required to sign transactions on the blockchain.
  // Without it we can only read data, not write.
  const signer = provider ? provider.getSigner() : undefined;

  // State variable for us to know whether the user has NFT
  const [ hasClaimedNFT, setHasClaimedNFT ] = useState(false)
  // isClaiming lets us easily keep a loading state while the NFT is minting.
  const [isClaiming, setIsClaiming] = useState(false);

  // Holds the amount of token each member has in state.
  const [memberTokenAmounts, setMemberTokenAmounts] = useState({});
  // The array holding all of our members addresses.
  const [memberAddresses, setMemberAddresses] = useState([]);

  const [proposals, setProposals] = useState([]);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  // fancy function to shorten somene's address, no need to display the whole address lol
  const shortenAddress = str => {
    return str.substring(0,6) + "..." + str.substring(str.length - 4)
  }

  
  
  // use React hook everytime the signer change
  useEffect(() => {
    // Pass the signer to sdk which allow us to interact with the contract
    sdk.setProviderOrSigner(signer)
  }, [signer]) 
  // use React hook everytime the address(user) change
  useEffect(() => {
    // If no connected address, exit!
    if(!address){
      return;
    }
    // check if the user has the NFT using the bundleDropModule.balanceOf
    const checkBalance = async () => {
      try{
        const balance = await bundleDropModule.balanceOf(address, 0);
        const check = await balance.gt(0);
        if(check){
          setHasClaimedNFT(true);
          console.log("This user has the Mana Core!");
        }else{
          setHasClaimedNFT(false);
          console.log("This user hasn't formed the Mana Core :(");
        }
      }catch(error){
        setHasClaimedNFT(false);
        console.log("Error occured while fetching the balance", error);
      }
      
    }

    return  checkBalance()
    

  }, [address])
  // use React hook to  grab the # of token each member hold
  // 1) All the wallet addresses that hold NFT
  // 2) The # of token each member holds
  // 3) Grab all the proposals
  useEffect(() => {
    if(!hasClaimedNFT){
      return;
    }

    // Wallet addresses
    const grabAddresses = async () => {
      const walletAddresses = await bundleDropModule.getAllClaimerAddresses("0");
      setMemberAddresses(walletAddresses)
      console.log("🚀 Members addresses", walletAddresses)
    }
    try{
      grabAddresses();
    }catch(error){
      console.error("failed to get member list", error);
    }

    // # of the token each member holds
    const grabHash = async () => {
      const amounts = await tokenModule.getAllHolderBalances();
      setMemberTokenAmounts(amounts);
      console.log("👜 Amounts", amounts);
    }
    try{
      grabHash();
    }catch(error){
      console.error("failed to get token balance", error);
    }

    // Grab all the proposals
    const grabProposals = async () => {
      const proposals = await voteModule.getAll();
      setProposals(proposals);
      console.log("🌈 Proposals:", proposals);
    }
    try{
      grabProposals();
    }catch(error){
      console.log("failed to get proposals", error)
    }

  }, [hasClaimedNFT])
  // // use React hook to check if the member has voted
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }
    // If we haven't finished retrieving the proposals from the useEffect above
    // then we can't check if the user voted yet!
    if (!proposals.length) {
      return;
    }
    const checkVote = async () => {
      const hasVoted = await voteModule.hasVoted(proposals[0].proposalId, address);
      setHasVoted(hasVoted);
      if(hasVoted) {
        console.log("🥵 User has already voted");
      } else {
        console.log("🙂 User has not voted yet");
      }
    }

    try{
      checkVote();
    }catch(error){
      console.error("Failed to check if wallet has voted", error);
    }

  }, [hasClaimedNFT, proposals, address])
  // combine the member address and the token's balance into an array
  const memberList = useMemo(()=>{
    return memberAddresses.map(address => {
      return {
        address,
        tokenAmount: ethers.utils.formatUnits(memberTokenAmounts[address] || 0, 18) 
      };
    });
  }, [memberAddresses, memberTokenAmounts]);

  if (error instanceof UnsupportedChainIdError ) {
    return (
      <div className="unsupported-network">
        <h2>Please connect to Rinkeby</h2>
        <p>
          This dapp only works on the Rinkeby network, please switch networks
          in your connected wallet.
        </p>
      </div>
    );
  }

  // This is the case where the user hasn't connected their wallet
  // to your web app. Let them call connectWallet.
  if (!address) {
    return (
      <div className="landing">
        <h1>Welcome to NarutoDAO</h1>
        <button onClick={() => connectWallet("injected")} className="btn-hero">
          Connect your wallet
          
        </button>
      </div>
    );
  }
  // If the user has already claimed their NFT we want to display the interal DAO page to them
  // only DAO members will see this. Render all the members + token amounts.
  if (hasClaimedNFT) {
    return (
      <div className="member-page">
        <h1 className="member-page-title">🍪DAO Member Page</h1>
        <p>Congratulations on being a member</p>
        <div>
          <div>
            <h2>Member List</h2>
            <table className="card">
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Token Amount</th>
                </tr>
              </thead>
              <tbody>
                {memberList.map((member) => {
                  return (
                    <tr key={member.address}>
                      <td>{shortenAddress(member.address)}</td>
                      <td>{member.tokenAmount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div>
            <h2>Active Proposals</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                e.stopPropagation();

                //before we do async things, we want to disable the button to prevent double clicks
                setIsVoting(true);

                // lets get the votes from the form for the values
                const votes = proposals.map((proposal) => {
                  let voteResult = {
                    proposalId: proposal.proposalId,
                    //abstain by default
                    vote: 2,
                  };
                  proposal.votes.forEach((vote) => {
                    const elem = document.getElementById(
                      proposal.proposalId + "-" + vote.type
                    );

                    if (elem.checked) {
                      voteResult.vote = vote.type;
                      return;
                    }
                  });
                  return voteResult;
                });

                // first we need to make sure the user delegates their token to vote
                try {
                  //we'll check if the wallet still needs to delegate their tokens before they can vote
                  const delegation = await tokenModule.getDelegationOf(address);
                  // if the delegation is the 0x0 address that means they have not delegated their governance tokens yet
                  if (delegation === ethers.constants.AddressZero) {
                    //if they haven't delegated their tokens yet, we'll have them delegate them before voting
                    await tokenModule.delegateTo(address);
                  }
                  // then we need to vote on the proposals
                  try {
                    await Promise.all(
                      votes.map(async (vote) => {
                        // before voting we first need to check whether the proposal is open for voting
                        // we first need to get the latest state of the proposal
                        const proposal = await voteModule.get(vote.proposalId);
                        // then we check if the proposal is open for voting (state === 1 means it is open)
                        if (proposal.state === 1) {
                          // if it is open for voting, we'll vote on it
                          return voteModule.vote(vote.proposalId, vote.vote);
                        }
                        // if the proposal is not open for voting we just return nothing, letting us continue
                        return;
                      })
                    );
                    try {
                      // if any of the propsals are ready to be executed we'll need to execute them
                      // a proposal is ready to be executed if it is in state 4
                      await Promise.all(
                        votes.map(async (vote) => {
                          // we'll first get the latest state of the proposal again, since we may have just voted before
                          const proposal = await voteModule.get(
                            vote.proposalId
                          );

                          //if the state is in state 4 (meaning that it is ready to be executed), we'll execute the proposal
                          if (proposal.state === 4) {
                            return voteModule.execute(vote.proposalId);
                          }
                        })
                      );
                      // if we get here that means we successfully voted, so let's set the "hasVoted" state to true
                      setHasVoted(true);
                      // and log out a success message
                      console.log("successfully voted");
                    } catch (err) {
                      console.error("failed to execute votes", err);
                    }
                  } catch (err) {
                    console.error("failed to vote", err);
                  }
                } catch (err) {
                  console.error("failed to delegate tokens");
                } finally {
                  // in *either* case we need to set the isVoting state to false to enable the button again
                  setIsVoting(false);
                }
              }}
            >
              {proposals.map((proposal, index) => (
                <div key={proposal.proposalId} className="card">
                  <h5>{proposal.description}</h5>
                  <div>
                    {proposal.votes.map((vote) => (
                      <div key={vote.type}>
                        <input
                          type="radio"
                          id={proposal.proposalId + "-" + vote.type}
                          name={proposal.proposalId}
                          value={vote.type}
                          //default the "abstain" vote to chedked
                          defaultChecked={vote.type === 2}
                        />
                        <label htmlFor={proposal.proposalId + "-" + vote.type}>
                          {vote.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button disabled={isVoting || hasVoted} type="submit">
                {isVoting
                  ? "Voting..."
                  : hasVoted
                    ? "You Already Voted"
                    : "Submit Votes"}
              </button>
              <small>
                This will trigger multiple transactions that you will need to
                sign.
              </small>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const mintNFT = async () => {
    // start the loading state
    setIsClaiming(true);
    try{
      // Call bundleDropModule.claim("0", 1) to mint nft to user's wallet.
      await bundleDropModule.claim("0", 1)
      setHasClaimedNFT(true)
      console.log(
        `🌊 Successfully Minted! Check it our on OpenSea: https://testnets.opensea.io/assets/${bundleDropModule.address.toLowerCase()}/0`
      );

    }catch(error){
      console.error("failed to claim", error)
    }
    
    setIsClaiming(false)
  }
  
  // This is the case where we have the user's address
  // which means they've connected their wallet to our site!
  return (
    <div className="landing">
      <h1>👀 wallet connected, now what!</h1>
      <button
        disabled={isClaiming}
        onClick={() => mintNFT()}
      >
        {isClaiming ? "Minting..." : "Mint your NFT(FREE)"}
      </button>
    </div>);
};

export default App;
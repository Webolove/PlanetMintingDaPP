"use client"
import { useState } from "react";
import toast from "react-hot-toast";
import { ethers } from "ethers";
import { FiCopy } from "react-icons/fi";
import ContractAdd from "@/ContractAdd";
import ABI from "@/ABI";
import Refresh from "@/Refresh";
import API from "@/ContractAPI";


export default function Home() {
  const [text, setText] = useState("CONNECT");
  const [contract, setContract] = useState(null);
  const [minted, setMinted] = useState(0);
  const mintRate = 0.0001;
  const [total_stocks, setTotalStocks] = useState(0);
  const [loading, setLoading] = useState(false);
  const [owned, setTotalOwned] = useState(0);
  const [Provider, setProvider] = useState(null);
  const [state, setState] = useState({
    account: "",
    signer: null,
    chainId: null,
    provider: null
  });

  const connectWallet = async () => {
    if (window.ethereum) {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);
      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const chainId = await provider.getNetwork().chainId;

      if (accounts.length > 0) {
        let len = accounts[0].length;
        let shrinkAcc = accounts[0][0] + accounts[0][1] + accounts[0][2] + accounts[0][3] + accounts[0][4] + accounts[0][5] + accounts[0][6] + "..." + accounts[0][len - 4] + accounts[0][len - 3] + accounts[0][len - 2] + accounts[0][len - 1];
        setState({
          account: accounts[0],
          signer,
          chainId,
          provider,
          shrinkAcc: shrinkAcc
        })
      }

      setContract(new ethers.Contract(ContractAdd, ABI, signer));
      if (contract != null) {
        setMinted(Number(await contract.totalSupply()));
        setTotalStocks(Number(await contract.MAX_SUPPLY()));
        setTotalOwned(Number(await contract.balanceOf(state.account), 18))
      }

      setLoading(false);
    } else
      toast.error("Oops!! No wallets found..");
  }

  function copytToClipBoard() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(state.account)
        .then(() => {
          toast.success("Text copied to clipboard", {
            position: "bottom-left"
          });
        })
        .catch(error => {
          toast.error("Error copying text to clipboard");
        });
    }
  }

  async function mintNFT(total_stocks, minted) {
    if (contract != null) {
      const NFTAPI = API;
      let idx = total_stocks - minted;

      if (idx == 0)
        toast("Bruh, Stocks done for the day...")
      else {
        const url = NFTAPI[`NFT_${idx}`];
        console.log(url)
        try {
          // let erc721 = new ethers.Contract(ContractAdd, ABI, Provider);
          // let acc = state.account;
          // let estimatedGas = await erc721.estimateGas.safeMint(acc, url);
          const tx = await contract.safeMint(state.account, url, { value: 1000000000000000, gasLimit: 3000000 })
          await tx.wait();

          toast.success("Planet minted successfully!", {
            icon: '🥳',
          });

        } catch (error) {
          const inputString = error.toString();
          // Regular expression pattern to match the error message
          const errorMessagePattern = /execution reverted: "([^"]+)"/;
          const match = inputString.match(errorMessagePattern);

          if (match) {
            const errorMessage = match[1]; // Extract the captured group
            toast.error(errorMessage);
          } else {
            console.log("No error message found in input string.", error);
            toast.error("Seems like an error occured");
          }
        }
      }
    }
  }

  return (
    <section className="p-7 flex flex-wrap justify-between h-screen bg-[#F9EFDB]">
      <div className="w-3/12 h-full rounded-2xl giveShadow bg-white flex flex-col p-6">
        {state.account == "" && <div className="bg-[#0C359E] text-xl p-2 text-white text-center tracking-widest hover:cursor-pointer rounded-3xl"
          onMouseEnter={() => setText("WALLET")}
          onMouseLeave={() => setText("CONNECT")}
          onClick={() => connectWallet()}
        >
          {text}
        </div>}
        {
          state.account != "" && <div>
            Your wallet Address :
            <p className="text-sm bg-[#DFF5FF] w-fit p-1 rounded-xl px-2 flex place-items-center justify-between gap-2 hover:cursor-pointer" onClick={() => copytToClipBoard()}>{state.shrinkAcc} <FiCopy className="text-[#378CE7]" /></p>

            <p className="mt-[20px]">You own : <span>{owned}</span></p>
          </div>


        }

      </div>

      <div className="w-8/12 h-full rounded-2xl giveShadow bg-white flex flex-col justify-between overflow-hidden">
        <div className="bg-red-300 p-6 flex justify-between place-items-center">
          <div className="flex gap-2 place-items-center">
            <span>Stocks Left : {total_stocks - minted} / {total_stocks}</span>
            <div className="cursor-pointer w-fit h-fit ">
              <Refresh fontCol={"text-red-700"} connectWallet={connectWallet} loading={loading} />
            </div>
          </div>
          <p>
            Pricing : {mintRate} ethers
          </p>
        </div>
        <div className="w-full h-full flex flex-col place-items-center justify-center">
          <div className="shadows">
            <span>P</span>
            <span>L</span>
            <span>a</span>
            <span>N</span>
            <span>E</span>
            <span>T</span>
          </div>
          {contract != null && <button className="bg-blue-200 p-2 px-4 tracking-wider rounded-lg text-lg myBtn"
            onClick={() => { mintNFT(total_stocks, minted); }}>Mint Your Planet 😃</button>}
          {contract == null && <div className="relative top-[20px] cursor-pointer w-fit h-fit"><Refresh fontCol={"text-blue-500"} connectWallet={connectWallet} loading={loading} /></div>}
        </div>
      </div>
    </section>
  );
}

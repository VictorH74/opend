import React, { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "../../../declarations/nft";
import { idlFactory as tokenIdlFactory} from "../../../declarations/token";
import { Principal } from "@dfinity/principal";
import { opend } from "../../../declarations/opend";
import Button from "./Button";
import CURRENT_USER_ID from "../index";
import PriceLabel from "./PriceLabel";

function Item(props) {

  const [name, setName] = useState();
  const [owner, setOwner] = useState();
  const [image, setImage] = useState();
  const [button, setButton] = useState();
  const [priceInput, setPrice] = useState();
  const [loaderHidden, setLoaderHidden] = useState(true);
  const [blur, setBlur] = useState();
  const [sellStatus, setSellStatus] = useState();
  const [priceLabel, setPriceLabel] = useState();
  const [shouldDisplay, setDisplay] = useState(true);

  const id = props.id;

  const localHost = "http://localhost:8080/";
  const agent = new HttpAgent({ host: localHost });
  // TODO: When deploy live, remove the following line
  agent.fetchRootKey();
  let NFTActor;

  async function loadNFT() {
    NFTActor = await Actor.createActor(idlFactory, {
      agent,
      canisterId: id,
    });

    const name = await NFTActor.getName();
    const owner = await NFTActor.getOwner();
    const imageData = await NFTActor.getAsset(); // array de numeros de 8 bits (Nat8)

    const imageContent = new Uint8Array(imageData); // converter
    const image = URL.createObjectURL(new Blob([imageContent.buffer], { type: "image/png" }));

    // imageData -> ex.: [255, 216, 255, 224, 0, 16, ...] ARRAY BRUTO
    // imageContent -> ex.: Uint8Array[255, 216, 255, 224, 0, 16, ...], buffer: ArrayBuffer[...] BUFFER
    // image -> ex.: blob:http://localhost:8080/c2fce58e-dd5b-4c33-9a87-c9966fa26eb5 BLOB URL

    setName(name);
    setOwner(String(owner));
    setImage(image);

    if (props.role == "collection") {
      const nftIsListened = await opend.isListed(props.id);

      if (nftIsListened) {
        setOwner("OpenD");
        setBlur({
          filter: "blur(4px)"
        });
        setSellStatus("Listed");
      } else {
        setButton(<Button handleClick={handleSell} text={"Sell"} />);
      }
    }else if(props.role == "discover") {
      const originalOwner = await opend.getOriginalOwner(props.id);
      if (originalOwner.toText() != CURRENT_USER_ID.toText()) {
        setButton(<Button handleClick={handleBuy} text={"Buy"} />);
      }

      const price = await opend.getListedNFTPrice(props.id);
      setPriceLabel(<PriceLabel sellPrice={price.toString()} />);
      
    }
  }

  useEffect(() => {
    loadNFT();
  }, []);

  let price;
  function handleSell() {
    console.log("button Sell")
    setPrice(
      <input
        placeholder="Price in DANG"
        type="number"
        className="price-input"
        value={price}
        onChange={e => price = e.target.value}
      />
    );
    setButton(<Button handleClick={sellItem} text={"Confirm"} />);
  }

  async function sellItem(e) {
    setBlur({
      filter: "blur(4px)"
    });
    setLoaderHidden(false);
    const listingResult = await opend.listItem(props.id, Number(price));
    if (listingResult === "Success!") {
      const opendId = await opend.getOpenDCanisterId();
      const transferResult = await NFTActor.transferOwnership(opendId);
      console.log("transfer: " + transferResult);
      if (transferResult === "Success!") {
        setLoaderHidden(true);
        setButton();
        setPrice();
        setOwner("OpenD");
        setSellStatus("Listed");
      }
    }
  }

  async function handleBuy() {
    setLoaderHidden(false);
    // create a token actor
    const tokenActor = await Actor.createActor(tokenIdlFactory, {
      agent,
      canisterId: Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai"),
    });

    // get selle id and item price
    const selleId = await opend.getOriginalOwner(props.id);
    const itemPrice = await opend.getListedNFTPrice(props.id);

    // complete transfer
    const result = await tokenActor.transfer(selleId, itemPrice);
    if (result == "Success") {
      const transferResult = await opend.completePurchase(props.id, selleId, CURRENT_USER_ID);
      console.log("purchase: " + transferResult);
      setLoaderHidden(true);
      setDisplay(false);
    }
  }

  return (
    <div style={{display: shouldDisplay ? "inline" : "none"}} className="disGrid-item">
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={image}
          style={blur}
        />
        <div hidden={loaderHidden} className="lds-ellipsis">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="disCardContent-root">
          {priceLabel}
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name}<span className="purple-text"> {sellStatus}</span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner: {owner}
          </p>
          {priceInput}
          {button}
        </div>
      </div>
    </div>
  );
}

export default Item;

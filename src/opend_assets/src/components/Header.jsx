import React, { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";
import homeImage from "../../assets/home-img.png";
import Minter from "./Minter";
import Gallery from "./Gallery";
import { opend } from "../../../declarations/opend"
import CURRENT_USER_ID from "../index";

function Header() {
  const [userOwnerGallery, setOwnerGallery] = useState();
  const [listingGallery, setListingGallery] = useState();

  async function getNFTs() {
    // find the user principal id -> CURRENT_USER_ID
    // execute getNFTs method in opend passing the user Principal id
    const userNFTIds = await opend.getOwnerNFT(CURRENT_USER_ID);
    console.log(userNFTIds);
    setOwnerGallery(<Gallery title="My NFTs" ids={userNFTIds} role="collection" />);

    const listedNFTIds = await opend.getListedNFTs();
    console.log(listedNFTIds);
    setListingGallery(<Gallery title="Discover" ids={listedNFTIds} role="discover" />)
  }

  useEffect(() => {
    getNFTs();
  }, []);

  return (
    <div className="app-root-1">
      <BrowserRouter forceRefresh={true}>
        <header className="Paper-root AppBar-root AppBar-positionStatic AppBar-colorPrimary Paper-elevation4">
          <div className="Toolbar-root Toolbar-regular header-appBar-13 Toolbar-gutters">
            <div className="header-left-4"></div>
            <img className="header-logo-11" src={logo} />
            <div className="header-vertical-9"></div>
            <Link to="/">
              <h5 className="Typography-root header-logo-text">OpenD</h5>
            </Link>
            <div className="header-empty-6"></div>
            <div className="header-space-8"></div>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/discover">Discover</Link>
            </button>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/minter">Minter</Link>
            </button>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/collection">My NFTs</Link>
            </button>
          </div>
        </header>
        <Switch>
          <Route exact path="/">
            <img className="bottom-space" src={homeImage} />
          </Route>
          <Route path="/discover">
            {listingGallery}
          </Route>
          <Route path="/minter">
            <Minter />
          </Route>
          <Route path="/collection">
            {userOwnerGallery}
          </Route>
        </Switch>
      </BrowserRouter>


    </div>
  );
}

export default Header;

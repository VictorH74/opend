import React, { useEffect, useState } from "react";
import Item from "./Item";

function Gallery({ title, ids, role }) {

  const [items, setItems] = useState();

  function fetchNFTs() {
    if (ids != undefined) {
      setItems(
        ids.map((NFTId) => <Item id={NFTId} key={String(NFTId)} role={role} />)
      );
    }
  };

  useEffect(() => {
    fetchNFTs();
  }, []);

  return (
    <div className="gallery-view">
      <h3 className="makeStyles-title-99 Typography-h3">{title}</h3>
      <div className="gallery">
        {items}
      </div>
    </div>
  );
}

export default Gallery;

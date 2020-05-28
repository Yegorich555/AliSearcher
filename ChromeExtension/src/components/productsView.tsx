/* eslint-disable jsx-a11y/alt-text */
import React, { Component } from "react";
// eslint-disable-next-line no-unused-vars
import Product from "@/entities/product";
import styles from "./productsView.scss";

export interface ProductsViewProps {
  items?: Product[];
}

export default class ProductsView extends Component<ProductsViewProps> {
  get filteredItems(): Product[] {
    return this.props.items || [];
  }

  render(): JSX.Element {
    const currency = "$";
    return (
      <ul className={styles.productsContainer}>
        {this.filteredItems.map(item => (
          <li key={item.id}>
            <a href={item.link} target="_blank" rel="noreferrer" className={styles.productLink}>
              <img src={item.linkImage} />
            </a>
            <div className={styles.priceBar}>
              <span>{`${item.unitPrice}${currency}`}</span>
              <span>{`${item.priceTotalMin}${!item.priceTotalMax ? "" : ` - ${item.priceTotalMax}`}`}</span>
              <span>{`${item.lotSizeNum ? `${item.lotSizeNum}${item.lotSizeText} / ` : ""}${item.unit}`}</span>
            </div>
            {/* todo price + shipping here <div></div> */}
            <div className={styles.ratingBar}>
              {/* todo ui-rating */}
              <span>Rating: {item.rating}</span>
              <span>Orders {item.storeOrderCount || 0}</span>
            </div>
            <a href={item.storeLink} target="_blank" rel="noreferrer" className={styles.storeLink}>
              {item.storeName}
            </a>
            <div>{item.description}</div>
          </li>
        ))}
      </ul>
    );
  }
}

import Product from "./product";
import log from "./log";

function setMinutes(date: Date, value: number): Date {
  date.setMinutes(date.getMinutes() + value);
  return date;
}

export class AliStore {
  // todo make cacheTime configurable
  /** (Minutes) */
  cacheTime = 2 * 7 * 24 * 60; // 2 weeks
  productStoreName = "product";

  db: IDBDatabase;
  ["constructor"]: typeof AliStore;

  connectDB(dbName: string, version?: number, upgradeFunction?: (db: IDBDatabase) => void): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(dbName, version);
      request.onerror = (e): void => {
        reject(e);
      };
      request.onsuccess = (): void => {
        resolve(request.result);
      };
      request.onupgradeneeded = (): void => {
        upgradeFunction && upgradeFunction(request.result);
      };
    });
  }

  constructor() {
    // todo remove after testing
    window.test = this;
    window.indexedDB.deleteDatabase("aliStore");

    this.connectDB("aliStore", 1, db => {
      const obj = db.createObjectStore(this.productStoreName, { autoIncrement: false, keyPath: "id" });
      obj.createIndex("priceMin", "priceMin");
      obj.createIndex("searchText", "searchText");
      obj.createIndex("date", "date");
    })
      .then(db => {
        this.db = db;
        this.clearProductsExpired();
      })
      .catch(e => log.error("Impossible to init IndexedDB", e));
  }

  connect(): Promise<IDBDatabase> {
    return new Promise(resolve => {
      if (this.db) {
        resolve(this.db);
      }
      this.connectDB("aliStore").then(db => {
        this.db = db;
        resolve(this.db);
      });
    });
  }

  async getProductStore(mode: IDBTransactionMode): Promise<IDBObjectStore> {
    const db = await this.connect();
    return db.transaction(this.productStoreName, mode).objectStore(this.productStoreName);
  }

  async appendProducts(product: Product[]): Promise<void> {
    const store = await this.getProductStore("readwrite");
    product.forEach(v => store.add(v));
  }

  async getProducts(searchText: string, priceMin?: number, priceMax?: number): Promise<Product[]> {
    const items: Product[] = [];
    const store = await this.getProductStore("readonly");
    const min = priceMin || 0;
    const max = priceMax || Number.MAX_SAFE_INTEGER;

    return new Promise((resolve, reject) => {
      const t = store.index("searchText").openCursor(searchText);

      t.onerror = (e): void => {
        reject(e);
      };
      t.onsuccess = (e): void => {
        // @ts-ignore
        const cursor = e.target.result as IDBCursorWithValue;
        if (cursor) {
          const item = cursor.value as Product;
          if (item.priceMin >= min && item.priceMax <= max) {
            items.push(Object.assign(new Product(), item));
          }
          cursor.continue();
        } else {
          resolve(items);
        }
      };
    });

    // const b = store.index("priceMin").getAll(IDBKeyRange.bound(priceMin, priceMax));
  }

  async clearProductsExpired(): Promise<void> {
    const store = await this.getProductStore("readwrite");
    return new Promise((resolve, reject) => {
      const range = IDBKeyRange.upperBound(setMinutes(new Date(), -1 * this.cacheTime), true);
      const t = store.index("date").openCursor(range);
      t.onsuccess = (e): void => {
        // @ts-ignore
        const cursor = e.target.result as IDBCursorWithValue;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };

      t.onerror = (e): void => {
        reject(e);
      };
    });
  }
}

const aliStore = new AliStore();
export default aliStore;

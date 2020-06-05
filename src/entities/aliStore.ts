import Product from "./product";
import log from "./log";
import SearchModel from "./searchModel";

const currencyMapper = {
  USD: "$",
  EUR: "€"
};

function setMinutes(date: Date, value: number): Date {
  date.setMinutes(date.getMinutes() + value);
  return date;
}

export class AliStore {
  /** (Minutes) */
  cacheTimeKey = "Ali_cacheTime";
  // default 1 week;
  get cacheTime(): number {
    return Number.parseInt(window.localStorage.getItem(this.cacheTimeKey), 10) || 1 * 7 * 24 * 60;
  }
  set cacheTime(v) {
    window.localStorage.setItem(this.cacheTimeKey, v.toString());
  }

  productStoreName = "product";

  modelKey = "Ali_SearchModel";
  saveModel(model: SearchModel): void {
    window.localStorage.setItem(this.modelKey, JSON.stringify(model));
  }

  getModel(): SearchModel | null {
    return JSON.parse(window.localStorage.getItem(this.modelKey));
  }

  currencyKey = "Ali_currency";
  get currency(): string {
    return window.sessionStorage.getItem(this.currencyKey);
  }
  set currency(v) {
    window.sessionStorage.setItem(this.currencyKey, currencyMapper[v]);
  }

  db: IDBDatabase;

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
    if (TEST) {
      return;
    }
    if (DEV_SERVER) {
      window.indexedDB.deleteDatabase("aliStore");
    }
    if (DEBUG) {
      // @ts-ignore
      window.aliStore = this;
    }

    this.connectDB("aliStore", 1, db => {
      const obj = db.createObjectStore(
        this.productStoreName, //
        { autoIncrement: false, keyPath: "searchId" }
      );
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

  async appendProducts(items: Product[]): Promise<void> {
    if (!items.length) {
      return;
    }

    const store = await this.getProductStore("readwrite");
    items.forEach(v => store.put(v));
  }

  async getProducts(
    searchText: string,
    priceMin?: number,
    priceMax?: number
  ): Promise<{ min: number; max: number; items: Product[] }> {
    const store = await this.getProductStore("readonly");
    const min = priceMin || 0;
    const max = priceMax || Number.MAX_SAFE_INTEGER;

    const result = {
      items: [] as Product[],
      min: Number.MAX_SAFE_INTEGER,
      max: 0
    };
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
          result.min = Math.min(result.min, item.priceMin);
          result.max = Math.max(result.max, item.priceMin);

          if (item.priceMin >= min && item.priceMin <= max) {
            result.items.push(Object.assign(new Product(), item));
          }
          cursor.continue();
        } else {
          if (!result.items.length) {
            result.min = null;
            result.max = null;
          }
          resolve(result);
        }
      };
    });

    // const b = store.index("priceMin").getAll(IDBKeyRange.bound(priceMin, priceMax));
  }

  async clearProducts(): Promise<void> {
    const store = await this.getProductStore("readwrite");
    store.clear();
  }

  /** Clears product that is expired and returns number of cleared */
  async clearProductsExpired(): Promise<number> {
    const store = await this.getProductStore("readwrite");

    const txtArr: string[] = [];
    function pushUnique(txt: string): void {
      if (txtArr.indexOf(txt) !== -1) {
        txtArr.push(txt);
      }
    }

    let cleared = 0;
    return new Promise((resolve, reject) => {
      const range = IDBKeyRange.upperBound(setMinutes(new Date(), -1 * this.cacheTime), true);
      const t = store.index("date").openCursor(range);
      t.onsuccess = (e): void => {
        // @ts-ignore
        const cursor = e.target.result as IDBCursorWithValue;
        if (cursor) {
          pushUnique((cursor.value as Product).searchText);
          ++cleared;
          cursor.delete();
          cursor.continue();
        } else {
          const t2 = store.index("searchText").openCursor();

          t2.onsuccess = (e2): void => {
            // remove rest items with the same searchText (otherwise very difficult to calculate ranges)
            // @ts-ignore
            const cursor2 = e2.target.result as IDBCursorWithValue;
            if (cursor2) {
              if (txtArr.includes((cursor2.value as Product).searchText)) {
                cursor2.delete();
                ++cleared;
              }
              cursor2.continue();
            } else {
              resolve(cleared);
            }
          };

          t2.onerror = (e2): void => {
            reject(e2);
          };
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

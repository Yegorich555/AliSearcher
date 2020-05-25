import axios from "axios";

class SearchClass {
  go(rawUrl: string) {
    // const url = encodeURI(rawUrl);
    axios.get(rawUrl).then(res => {
      console.log(res);
    });
  }
}

const search = new SearchClass();

export default search;

declare const DEV_SERVER: boolean;

interface Window {
  runConfigs: { searchAjaxUrl: string };
  runParams: { items: object[]; resultCount: number };
}

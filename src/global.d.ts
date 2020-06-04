declare const DEV_SERVER: boolean;
declare const TEST: boolean;
declare const DEBUG: boolean;

interface Window {
  runConfigs: { searchAjaxUrl: string };
  runParams: { items: object[]; resultCount: number };
}

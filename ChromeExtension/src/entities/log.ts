class LogClass {
  callback?: (message?: any, ...optionalParams: any[]) => void;

  error(message?: any, ...optionalParams: any[]): void {
    this.callback(message, ...optionalParams);
    console.error(`Alisearcher. ${message}`, ...optionalParams);
  }

  warn(message?: any, ...optionalParams: any[]): void {
    this.callback(message, ...optionalParams);
    console.warn(`Alisearcher. ${message}`, ...optionalParams);
  }

  info(message?: any, ...optionalParams: any[]): void {
    console.info(`Alisearcher. ${message}`, ...optionalParams);
  }

  subscribe(callback): void {
    this.callback = callback;
  }
}

const log = new LogClass();

export default log;

class LogClass {
  error(message?: any, ...optionalParams: any[]): void {
    console.error(`Alisearcher. ${message}`, ...optionalParams);
  }

  warn(message?: any, ...optionalParams: any[]): void {
    console.warn(`Alisearcher. ${message}`, ...optionalParams);
  }
}

const log = new LogClass();

export default log;

export interface DatabaseStrategy {
  connect(): Promise<any>;
}

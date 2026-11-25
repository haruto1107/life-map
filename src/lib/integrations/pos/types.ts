export type PosProvider =
  | "smaregi"
  | "square"
  | "airregi"
  | "stores_pos";

export type PosProduct = {
  externalId: string;
  sku: string | null;
  name: string;
  price: number | null;
};

export type PosInventory = {
  externalProductId: string;
  quantity: number | null;
  stockStatus:
    | "in_stock"
    | "low_stock"
    | "out_of_stock"
    | "unknown";
};

export type PosCredentials = {
  accessToken?: string;
  refreshToken?: string;
  apiKey?: string;
  apiToken?: string;
  contractId?: string;
};

export interface PosAdapter {
  provider: PosProvider;

  testConnection(
    credentials: PosCredentials
  ): Promise<boolean>;

  getProducts(
    credentials: PosCredentials
  ): Promise<PosProduct[]>;

  getInventory(
    credentials: PosCredentials
  ): Promise<PosInventory[]>;
}

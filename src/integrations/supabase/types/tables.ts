import type { Database } from './database';

type PublicSchema = Database['public'];

export type Tables<
  T extends keyof PublicSchema['Tables'] = keyof PublicSchema['Tables']
> = PublicSchema['Tables'][T]['Row'];

export type TablesInsert<
  T extends keyof PublicSchema['Tables'] = keyof PublicSchema['Tables']
> = PublicSchema['Tables'][T]['Insert'];

export type TablesUpdate<
  T extends keyof PublicSchema['Tables'] = keyof PublicSchema['Tables']
> = PublicSchema['Tables'][T]['Update'];

export type GeraideScan = Tables<'geraide_scans'>;
export type GeraideScanInsert = TablesInsert<'geraide_scans'>;
export type GeraideScanUpdate = TablesUpdate<'geraide_scans'>;
import type { Database } from './database'

type PublicSchema = Database['public']

export type Enums<
  T extends keyof PublicSchema['Enums'] = keyof PublicSchema['Enums']
> = PublicSchema['Enums'][T]
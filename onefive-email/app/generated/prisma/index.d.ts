
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model ResendEmail
 * 
 */
export type ResendEmail = $Result.DefaultSelection<Prisma.$ResendEmailPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more ResendEmails
 * const resendEmails = await prisma.resendEmail.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more ResendEmails
   * const resendEmails = await prisma.resendEmail.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.resendEmail`: Exposes CRUD operations for the **ResendEmail** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ResendEmails
    * const resendEmails = await prisma.resendEmail.findMany()
    * ```
    */
  get resendEmail(): Prisma.ResendEmailDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.19.3
   * Query Engine version: c2990dca591cba766e3b7ef5d9e8a84796e47ab7
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    ResendEmail: 'ResendEmail'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "resendEmail"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      ResendEmail: {
        payload: Prisma.$ResendEmailPayload<ExtArgs>
        fields: Prisma.ResendEmailFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ResendEmailFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResendEmailPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ResendEmailFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResendEmailPayload>
          }
          findFirst: {
            args: Prisma.ResendEmailFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResendEmailPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ResendEmailFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResendEmailPayload>
          }
          findMany: {
            args: Prisma.ResendEmailFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResendEmailPayload>[]
          }
          create: {
            args: Prisma.ResendEmailCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResendEmailPayload>
          }
          createMany: {
            args: Prisma.ResendEmailCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ResendEmailCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResendEmailPayload>[]
          }
          delete: {
            args: Prisma.ResendEmailDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResendEmailPayload>
          }
          update: {
            args: Prisma.ResendEmailUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResendEmailPayload>
          }
          deleteMany: {
            args: Prisma.ResendEmailDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ResendEmailUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ResendEmailUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResendEmailPayload>[]
          }
          upsert: {
            args: Prisma.ResendEmailUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResendEmailPayload>
          }
          aggregate: {
            args: Prisma.ResendEmailAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateResendEmail>
          }
          groupBy: {
            args: Prisma.ResendEmailGroupByArgs<ExtArgs>
            result: $Utils.Optional<ResendEmailGroupByOutputType>[]
          }
          count: {
            args: Prisma.ResendEmailCountArgs<ExtArgs>
            result: $Utils.Optional<ResendEmailCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    resendEmail?: ResendEmailOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */



  /**
   * Models
   */

  /**
   * Model ResendEmail
   */

  export type AggregateResendEmail = {
    _count: ResendEmailCountAggregateOutputType | null
    _min: ResendEmailMinAggregateOutputType | null
    _max: ResendEmailMaxAggregateOutputType | null
  }

  export type ResendEmailMinAggregateOutputType = {
    id: string | null
    email: string | null
    resendId: string | null
    createdAt: Date | null
    updatedAt: Date | null
    type: string | null
    jobId: string | null
  }

  export type ResendEmailMaxAggregateOutputType = {
    id: string | null
    email: string | null
    resendId: string | null
    createdAt: Date | null
    updatedAt: Date | null
    type: string | null
    jobId: string | null
  }

  export type ResendEmailCountAggregateOutputType = {
    id: number
    email: number
    resendId: number
    createdAt: number
    updatedAt: number
    logs: number
    type: number
    jobId: number
    _all: number
  }


  export type ResendEmailMinAggregateInputType = {
    id?: true
    email?: true
    resendId?: true
    createdAt?: true
    updatedAt?: true
    type?: true
    jobId?: true
  }

  export type ResendEmailMaxAggregateInputType = {
    id?: true
    email?: true
    resendId?: true
    createdAt?: true
    updatedAt?: true
    type?: true
    jobId?: true
  }

  export type ResendEmailCountAggregateInputType = {
    id?: true
    email?: true
    resendId?: true
    createdAt?: true
    updatedAt?: true
    logs?: true
    type?: true
    jobId?: true
    _all?: true
  }

  export type ResendEmailAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ResendEmail to aggregate.
     */
    where?: ResendEmailWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ResendEmails to fetch.
     */
    orderBy?: ResendEmailOrderByWithRelationInput | ResendEmailOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ResendEmailWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ResendEmails from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ResendEmails.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ResendEmails
    **/
    _count?: true | ResendEmailCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ResendEmailMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ResendEmailMaxAggregateInputType
  }

  export type GetResendEmailAggregateType<T extends ResendEmailAggregateArgs> = {
        [P in keyof T & keyof AggregateResendEmail]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateResendEmail[P]>
      : GetScalarType<T[P], AggregateResendEmail[P]>
  }




  export type ResendEmailGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ResendEmailWhereInput
    orderBy?: ResendEmailOrderByWithAggregationInput | ResendEmailOrderByWithAggregationInput[]
    by: ResendEmailScalarFieldEnum[] | ResendEmailScalarFieldEnum
    having?: ResendEmailScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ResendEmailCountAggregateInputType | true
    _min?: ResendEmailMinAggregateInputType
    _max?: ResendEmailMaxAggregateInputType
  }

  export type ResendEmailGroupByOutputType = {
    id: string
    email: string
    resendId: string
    createdAt: Date
    updatedAt: Date
    logs: JsonValue | null
    type: string
    jobId: string
    _count: ResendEmailCountAggregateOutputType | null
    _min: ResendEmailMinAggregateOutputType | null
    _max: ResendEmailMaxAggregateOutputType | null
  }

  type GetResendEmailGroupByPayload<T extends ResendEmailGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ResendEmailGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ResendEmailGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ResendEmailGroupByOutputType[P]>
            : GetScalarType<T[P], ResendEmailGroupByOutputType[P]>
        }
      >
    >


  export type ResendEmailSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    resendId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    logs?: boolean
    type?: boolean
    jobId?: boolean
  }, ExtArgs["result"]["resendEmail"]>

  export type ResendEmailSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    resendId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    logs?: boolean
    type?: boolean
    jobId?: boolean
  }, ExtArgs["result"]["resendEmail"]>

  export type ResendEmailSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    resendId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    logs?: boolean
    type?: boolean
    jobId?: boolean
  }, ExtArgs["result"]["resendEmail"]>

  export type ResendEmailSelectScalar = {
    id?: boolean
    email?: boolean
    resendId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    logs?: boolean
    type?: boolean
    jobId?: boolean
  }

  export type ResendEmailOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "resendId" | "createdAt" | "updatedAt" | "logs" | "type" | "jobId", ExtArgs["result"]["resendEmail"]>

  export type $ResendEmailPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ResendEmail"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      resendId: string
      createdAt: Date
      updatedAt: Date
      logs: Prisma.JsonValue | null
      type: string
      jobId: string
    }, ExtArgs["result"]["resendEmail"]>
    composites: {}
  }

  type ResendEmailGetPayload<S extends boolean | null | undefined | ResendEmailDefaultArgs> = $Result.GetResult<Prisma.$ResendEmailPayload, S>

  type ResendEmailCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ResendEmailFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ResendEmailCountAggregateInputType | true
    }

  export interface ResendEmailDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ResendEmail'], meta: { name: 'ResendEmail' } }
    /**
     * Find zero or one ResendEmail that matches the filter.
     * @param {ResendEmailFindUniqueArgs} args - Arguments to find a ResendEmail
     * @example
     * // Get one ResendEmail
     * const resendEmail = await prisma.resendEmail.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ResendEmailFindUniqueArgs>(args: SelectSubset<T, ResendEmailFindUniqueArgs<ExtArgs>>): Prisma__ResendEmailClient<$Result.GetResult<Prisma.$ResendEmailPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ResendEmail that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ResendEmailFindUniqueOrThrowArgs} args - Arguments to find a ResendEmail
     * @example
     * // Get one ResendEmail
     * const resendEmail = await prisma.resendEmail.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ResendEmailFindUniqueOrThrowArgs>(args: SelectSubset<T, ResendEmailFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ResendEmailClient<$Result.GetResult<Prisma.$ResendEmailPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ResendEmail that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ResendEmailFindFirstArgs} args - Arguments to find a ResendEmail
     * @example
     * // Get one ResendEmail
     * const resendEmail = await prisma.resendEmail.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ResendEmailFindFirstArgs>(args?: SelectSubset<T, ResendEmailFindFirstArgs<ExtArgs>>): Prisma__ResendEmailClient<$Result.GetResult<Prisma.$ResendEmailPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ResendEmail that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ResendEmailFindFirstOrThrowArgs} args - Arguments to find a ResendEmail
     * @example
     * // Get one ResendEmail
     * const resendEmail = await prisma.resendEmail.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ResendEmailFindFirstOrThrowArgs>(args?: SelectSubset<T, ResendEmailFindFirstOrThrowArgs<ExtArgs>>): Prisma__ResendEmailClient<$Result.GetResult<Prisma.$ResendEmailPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ResendEmails that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ResendEmailFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ResendEmails
     * const resendEmails = await prisma.resendEmail.findMany()
     * 
     * // Get first 10 ResendEmails
     * const resendEmails = await prisma.resendEmail.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const resendEmailWithIdOnly = await prisma.resendEmail.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ResendEmailFindManyArgs>(args?: SelectSubset<T, ResendEmailFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ResendEmailPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ResendEmail.
     * @param {ResendEmailCreateArgs} args - Arguments to create a ResendEmail.
     * @example
     * // Create one ResendEmail
     * const ResendEmail = await prisma.resendEmail.create({
     *   data: {
     *     // ... data to create a ResendEmail
     *   }
     * })
     * 
     */
    create<T extends ResendEmailCreateArgs>(args: SelectSubset<T, ResendEmailCreateArgs<ExtArgs>>): Prisma__ResendEmailClient<$Result.GetResult<Prisma.$ResendEmailPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ResendEmails.
     * @param {ResendEmailCreateManyArgs} args - Arguments to create many ResendEmails.
     * @example
     * // Create many ResendEmails
     * const resendEmail = await prisma.resendEmail.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ResendEmailCreateManyArgs>(args?: SelectSubset<T, ResendEmailCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ResendEmails and returns the data saved in the database.
     * @param {ResendEmailCreateManyAndReturnArgs} args - Arguments to create many ResendEmails.
     * @example
     * // Create many ResendEmails
     * const resendEmail = await prisma.resendEmail.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ResendEmails and only return the `id`
     * const resendEmailWithIdOnly = await prisma.resendEmail.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ResendEmailCreateManyAndReturnArgs>(args?: SelectSubset<T, ResendEmailCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ResendEmailPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ResendEmail.
     * @param {ResendEmailDeleteArgs} args - Arguments to delete one ResendEmail.
     * @example
     * // Delete one ResendEmail
     * const ResendEmail = await prisma.resendEmail.delete({
     *   where: {
     *     // ... filter to delete one ResendEmail
     *   }
     * })
     * 
     */
    delete<T extends ResendEmailDeleteArgs>(args: SelectSubset<T, ResendEmailDeleteArgs<ExtArgs>>): Prisma__ResendEmailClient<$Result.GetResult<Prisma.$ResendEmailPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ResendEmail.
     * @param {ResendEmailUpdateArgs} args - Arguments to update one ResendEmail.
     * @example
     * // Update one ResendEmail
     * const resendEmail = await prisma.resendEmail.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ResendEmailUpdateArgs>(args: SelectSubset<T, ResendEmailUpdateArgs<ExtArgs>>): Prisma__ResendEmailClient<$Result.GetResult<Prisma.$ResendEmailPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ResendEmails.
     * @param {ResendEmailDeleteManyArgs} args - Arguments to filter ResendEmails to delete.
     * @example
     * // Delete a few ResendEmails
     * const { count } = await prisma.resendEmail.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ResendEmailDeleteManyArgs>(args?: SelectSubset<T, ResendEmailDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ResendEmails.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ResendEmailUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ResendEmails
     * const resendEmail = await prisma.resendEmail.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ResendEmailUpdateManyArgs>(args: SelectSubset<T, ResendEmailUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ResendEmails and returns the data updated in the database.
     * @param {ResendEmailUpdateManyAndReturnArgs} args - Arguments to update many ResendEmails.
     * @example
     * // Update many ResendEmails
     * const resendEmail = await prisma.resendEmail.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ResendEmails and only return the `id`
     * const resendEmailWithIdOnly = await prisma.resendEmail.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ResendEmailUpdateManyAndReturnArgs>(args: SelectSubset<T, ResendEmailUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ResendEmailPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ResendEmail.
     * @param {ResendEmailUpsertArgs} args - Arguments to update or create a ResendEmail.
     * @example
     * // Update or create a ResendEmail
     * const resendEmail = await prisma.resendEmail.upsert({
     *   create: {
     *     // ... data to create a ResendEmail
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ResendEmail we want to update
     *   }
     * })
     */
    upsert<T extends ResendEmailUpsertArgs>(args: SelectSubset<T, ResendEmailUpsertArgs<ExtArgs>>): Prisma__ResendEmailClient<$Result.GetResult<Prisma.$ResendEmailPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ResendEmails.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ResendEmailCountArgs} args - Arguments to filter ResendEmails to count.
     * @example
     * // Count the number of ResendEmails
     * const count = await prisma.resendEmail.count({
     *   where: {
     *     // ... the filter for the ResendEmails we want to count
     *   }
     * })
    **/
    count<T extends ResendEmailCountArgs>(
      args?: Subset<T, ResendEmailCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ResendEmailCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ResendEmail.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ResendEmailAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ResendEmailAggregateArgs>(args: Subset<T, ResendEmailAggregateArgs>): Prisma.PrismaPromise<GetResendEmailAggregateType<T>>

    /**
     * Group by ResendEmail.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ResendEmailGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ResendEmailGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ResendEmailGroupByArgs['orderBy'] }
        : { orderBy?: ResendEmailGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ResendEmailGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetResendEmailGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ResendEmail model
   */
  readonly fields: ResendEmailFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ResendEmail.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ResendEmailClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ResendEmail model
   */
  interface ResendEmailFieldRefs {
    readonly id: FieldRef<"ResendEmail", 'String'>
    readonly email: FieldRef<"ResendEmail", 'String'>
    readonly resendId: FieldRef<"ResendEmail", 'String'>
    readonly createdAt: FieldRef<"ResendEmail", 'DateTime'>
    readonly updatedAt: FieldRef<"ResendEmail", 'DateTime'>
    readonly logs: FieldRef<"ResendEmail", 'Json'>
    readonly type: FieldRef<"ResendEmail", 'String'>
    readonly jobId: FieldRef<"ResendEmail", 'String'>
  }
    

  // Custom InputTypes
  /**
   * ResendEmail findUnique
   */
  export type ResendEmailFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ResendEmail
     */
    select?: ResendEmailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ResendEmail
     */
    omit?: ResendEmailOmit<ExtArgs> | null
    /**
     * Filter, which ResendEmail to fetch.
     */
    where: ResendEmailWhereUniqueInput
  }

  /**
   * ResendEmail findUniqueOrThrow
   */
  export type ResendEmailFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ResendEmail
     */
    select?: ResendEmailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ResendEmail
     */
    omit?: ResendEmailOmit<ExtArgs> | null
    /**
     * Filter, which ResendEmail to fetch.
     */
    where: ResendEmailWhereUniqueInput
  }

  /**
   * ResendEmail findFirst
   */
  export type ResendEmailFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ResendEmail
     */
    select?: ResendEmailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ResendEmail
     */
    omit?: ResendEmailOmit<ExtArgs> | null
    /**
     * Filter, which ResendEmail to fetch.
     */
    where?: ResendEmailWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ResendEmails to fetch.
     */
    orderBy?: ResendEmailOrderByWithRelationInput | ResendEmailOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ResendEmails.
     */
    cursor?: ResendEmailWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ResendEmails from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ResendEmails.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ResendEmails.
     */
    distinct?: ResendEmailScalarFieldEnum | ResendEmailScalarFieldEnum[]
  }

  /**
   * ResendEmail findFirstOrThrow
   */
  export type ResendEmailFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ResendEmail
     */
    select?: ResendEmailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ResendEmail
     */
    omit?: ResendEmailOmit<ExtArgs> | null
    /**
     * Filter, which ResendEmail to fetch.
     */
    where?: ResendEmailWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ResendEmails to fetch.
     */
    orderBy?: ResendEmailOrderByWithRelationInput | ResendEmailOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ResendEmails.
     */
    cursor?: ResendEmailWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ResendEmails from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ResendEmails.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ResendEmails.
     */
    distinct?: ResendEmailScalarFieldEnum | ResendEmailScalarFieldEnum[]
  }

  /**
   * ResendEmail findMany
   */
  export type ResendEmailFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ResendEmail
     */
    select?: ResendEmailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ResendEmail
     */
    omit?: ResendEmailOmit<ExtArgs> | null
    /**
     * Filter, which ResendEmails to fetch.
     */
    where?: ResendEmailWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ResendEmails to fetch.
     */
    orderBy?: ResendEmailOrderByWithRelationInput | ResendEmailOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ResendEmails.
     */
    cursor?: ResendEmailWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ResendEmails from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ResendEmails.
     */
    skip?: number
    distinct?: ResendEmailScalarFieldEnum | ResendEmailScalarFieldEnum[]
  }

  /**
   * ResendEmail create
   */
  export type ResendEmailCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ResendEmail
     */
    select?: ResendEmailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ResendEmail
     */
    omit?: ResendEmailOmit<ExtArgs> | null
    /**
     * The data needed to create a ResendEmail.
     */
    data: XOR<ResendEmailCreateInput, ResendEmailUncheckedCreateInput>
  }

  /**
   * ResendEmail createMany
   */
  export type ResendEmailCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ResendEmails.
     */
    data: ResendEmailCreateManyInput | ResendEmailCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ResendEmail createManyAndReturn
   */
  export type ResendEmailCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ResendEmail
     */
    select?: ResendEmailSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ResendEmail
     */
    omit?: ResendEmailOmit<ExtArgs> | null
    /**
     * The data used to create many ResendEmails.
     */
    data: ResendEmailCreateManyInput | ResendEmailCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ResendEmail update
   */
  export type ResendEmailUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ResendEmail
     */
    select?: ResendEmailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ResendEmail
     */
    omit?: ResendEmailOmit<ExtArgs> | null
    /**
     * The data needed to update a ResendEmail.
     */
    data: XOR<ResendEmailUpdateInput, ResendEmailUncheckedUpdateInput>
    /**
     * Choose, which ResendEmail to update.
     */
    where: ResendEmailWhereUniqueInput
  }

  /**
   * ResendEmail updateMany
   */
  export type ResendEmailUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ResendEmails.
     */
    data: XOR<ResendEmailUpdateManyMutationInput, ResendEmailUncheckedUpdateManyInput>
    /**
     * Filter which ResendEmails to update
     */
    where?: ResendEmailWhereInput
    /**
     * Limit how many ResendEmails to update.
     */
    limit?: number
  }

  /**
   * ResendEmail updateManyAndReturn
   */
  export type ResendEmailUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ResendEmail
     */
    select?: ResendEmailSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ResendEmail
     */
    omit?: ResendEmailOmit<ExtArgs> | null
    /**
     * The data used to update ResendEmails.
     */
    data: XOR<ResendEmailUpdateManyMutationInput, ResendEmailUncheckedUpdateManyInput>
    /**
     * Filter which ResendEmails to update
     */
    where?: ResendEmailWhereInput
    /**
     * Limit how many ResendEmails to update.
     */
    limit?: number
  }

  /**
   * ResendEmail upsert
   */
  export type ResendEmailUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ResendEmail
     */
    select?: ResendEmailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ResendEmail
     */
    omit?: ResendEmailOmit<ExtArgs> | null
    /**
     * The filter to search for the ResendEmail to update in case it exists.
     */
    where: ResendEmailWhereUniqueInput
    /**
     * In case the ResendEmail found by the `where` argument doesn't exist, create a new ResendEmail with this data.
     */
    create: XOR<ResendEmailCreateInput, ResendEmailUncheckedCreateInput>
    /**
     * In case the ResendEmail was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ResendEmailUpdateInput, ResendEmailUncheckedUpdateInput>
  }

  /**
   * ResendEmail delete
   */
  export type ResendEmailDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ResendEmail
     */
    select?: ResendEmailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ResendEmail
     */
    omit?: ResendEmailOmit<ExtArgs> | null
    /**
     * Filter which ResendEmail to delete.
     */
    where: ResendEmailWhereUniqueInput
  }

  /**
   * ResendEmail deleteMany
   */
  export type ResendEmailDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ResendEmails to delete
     */
    where?: ResendEmailWhereInput
    /**
     * Limit how many ResendEmails to delete.
     */
    limit?: number
  }

  /**
   * ResendEmail without action
   */
  export type ResendEmailDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ResendEmail
     */
    select?: ResendEmailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ResendEmail
     */
    omit?: ResendEmailOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const ResendEmailScalarFieldEnum: {
    id: 'id',
    email: 'email',
    resendId: 'resendId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    logs: 'logs',
    type: 'type',
    jobId: 'jobId'
  };

  export type ResendEmailScalarFieldEnum = (typeof ResendEmailScalarFieldEnum)[keyof typeof ResendEmailScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    
  /**
   * Deep Input Types
   */


  export type ResendEmailWhereInput = {
    AND?: ResendEmailWhereInput | ResendEmailWhereInput[]
    OR?: ResendEmailWhereInput[]
    NOT?: ResendEmailWhereInput | ResendEmailWhereInput[]
    id?: StringFilter<"ResendEmail"> | string
    email?: StringFilter<"ResendEmail"> | string
    resendId?: StringFilter<"ResendEmail"> | string
    createdAt?: DateTimeFilter<"ResendEmail"> | Date | string
    updatedAt?: DateTimeFilter<"ResendEmail"> | Date | string
    logs?: JsonNullableFilter<"ResendEmail">
    type?: StringFilter<"ResendEmail"> | string
    jobId?: StringFilter<"ResendEmail"> | string
  }

  export type ResendEmailOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    resendId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    logs?: SortOrderInput | SortOrder
    type?: SortOrder
    jobId?: SortOrder
  }

  export type ResendEmailWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    resendId?: string
    AND?: ResendEmailWhereInput | ResendEmailWhereInput[]
    OR?: ResendEmailWhereInput[]
    NOT?: ResendEmailWhereInput | ResendEmailWhereInput[]
    email?: StringFilter<"ResendEmail"> | string
    createdAt?: DateTimeFilter<"ResendEmail"> | Date | string
    updatedAt?: DateTimeFilter<"ResendEmail"> | Date | string
    logs?: JsonNullableFilter<"ResendEmail">
    type?: StringFilter<"ResendEmail"> | string
    jobId?: StringFilter<"ResendEmail"> | string
  }, "id" | "resendId">

  export type ResendEmailOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    resendId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    logs?: SortOrderInput | SortOrder
    type?: SortOrder
    jobId?: SortOrder
    _count?: ResendEmailCountOrderByAggregateInput
    _max?: ResendEmailMaxOrderByAggregateInput
    _min?: ResendEmailMinOrderByAggregateInput
  }

  export type ResendEmailScalarWhereWithAggregatesInput = {
    AND?: ResendEmailScalarWhereWithAggregatesInput | ResendEmailScalarWhereWithAggregatesInput[]
    OR?: ResendEmailScalarWhereWithAggregatesInput[]
    NOT?: ResendEmailScalarWhereWithAggregatesInput | ResendEmailScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ResendEmail"> | string
    email?: StringWithAggregatesFilter<"ResendEmail"> | string
    resendId?: StringWithAggregatesFilter<"ResendEmail"> | string
    createdAt?: DateTimeWithAggregatesFilter<"ResendEmail"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ResendEmail"> | Date | string
    logs?: JsonNullableWithAggregatesFilter<"ResendEmail">
    type?: StringWithAggregatesFilter<"ResendEmail"> | string
    jobId?: StringWithAggregatesFilter<"ResendEmail"> | string
  }

  export type ResendEmailCreateInput = {
    id?: string
    email: string
    resendId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    logs?: NullableJsonNullValueInput | InputJsonValue
    type: string
    jobId: string
  }

  export type ResendEmailUncheckedCreateInput = {
    id?: string
    email: string
    resendId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    logs?: NullableJsonNullValueInput | InputJsonValue
    type: string
    jobId: string
  }

  export type ResendEmailUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    resendId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    logs?: NullableJsonNullValueInput | InputJsonValue
    type?: StringFieldUpdateOperationsInput | string
    jobId?: StringFieldUpdateOperationsInput | string
  }

  export type ResendEmailUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    resendId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    logs?: NullableJsonNullValueInput | InputJsonValue
    type?: StringFieldUpdateOperationsInput | string
    jobId?: StringFieldUpdateOperationsInput | string
  }

  export type ResendEmailCreateManyInput = {
    id?: string
    email: string
    resendId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    logs?: NullableJsonNullValueInput | InputJsonValue
    type: string
    jobId: string
  }

  export type ResendEmailUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    resendId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    logs?: NullableJsonNullValueInput | InputJsonValue
    type?: StringFieldUpdateOperationsInput | string
    jobId?: StringFieldUpdateOperationsInput | string
  }

  export type ResendEmailUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    resendId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    logs?: NullableJsonNullValueInput | InputJsonValue
    type?: StringFieldUpdateOperationsInput | string
    jobId?: StringFieldUpdateOperationsInput | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type ResendEmailCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    resendId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    logs?: SortOrder
    type?: SortOrder
    jobId?: SortOrder
  }

  export type ResendEmailMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    resendId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    type?: SortOrder
    jobId?: SortOrder
  }

  export type ResendEmailMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    resendId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    type?: SortOrder
    jobId?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}
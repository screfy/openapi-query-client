import type {
	UseMutationOptions as UseTanStackMutationOptions,
	UseQueryOptions as UseTanStackQueryOptions,
} from '@tanstack/react-query';

// type JsonContentType = 'application/json';

type QueryHttpMethods = 'GET';
type MutationHttpMethods = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type OpenApiPaths = Record<string, any>;

export type HeadersFn = () => HeadersInit | undefined;

type RemoveEmptyParameters<T> = {
	[P in keyof T as T[P] extends undefined ? never : P]: T[P];
};

type HasEmptyParameters<T> = keyof RemoveEmptyParameters<T> extends never
	? true
	: false;

type ProcedureKey<
	Path extends string,
	Method extends string | number | symbol,
> = `${Uppercase<Method & string>} ${Path}`;

type ProcedureDef<Input = unknown, Result = unknown> = {
	input: Input;
	result: Result;
};

export type AllKeys<Paths extends OpenApiPaths> = keyof Paths extends infer K
	? K extends string
		? ProcedureKey<K, keyof RemoveEmptyParameters<Paths[K]>>
		: never
	: never;

type FilterKeys<
	Key extends string,
	AllowedMethods extends string,
> = Key extends `${infer Method} ${string}`
	? Method extends AllowedMethods
		? Key
		: never
	: never;

type KeyToSelector<Key extends string> =
	Key extends `${infer Method} ${infer Path}`
		? { method: Lowercase<Method>; path: Path }
		: never;

type InferProcedure<
	Paths extends OpenApiPaths,
	Key extends string,
	Selector extends KeyToSelector<Key> = KeyToSelector<Key>,
> = Selector extends never
	? never
	: Paths[Selector['path']][Selector['method']];

export type InferSchemaFromComponents<T extends Record<string, any>> =
	T['schemas'];

export type QueryKeys<Paths extends OpenApiPaths> = FilterKeys<
	AllKeys<Paths>,
	QueryHttpMethods
>;

export type MutationKeys<Paths extends OpenApiPaths> = FilterKeys<
	AllKeys<Paths>,
	MutationHttpMethods
>;

export type QueryProcedure<
	Paths extends OpenApiPaths,
	Key extends string,
	ContentType extends string,
	Procedure extends InferProcedure<Paths, Key> = InferProcedure<Paths, Key>,
> = Procedure extends never
	? never
	: ProcedureDef<
			HasEmptyParameters<Procedure['parameters']> extends true
				? never
				: Omit<
						RemoveEmptyParameters<Procedure['parameters']>,
						'header' | 'cookie'
					>,
			Procedure['responses'][200]['content'][ContentType]
		>;

export type MutationProcedure<
	Paths extends OpenApiPaths,
	Key extends string,
	ContentType extends string,
	Procedure extends InferProcedure<Paths, Key> = InferProcedure<Paths, Key>,
> = Procedure extends never
	? never
	: ProcedureDef<
			Omit<
				RemoveEmptyParameters<Procedure['parameters']>,
				'header' | 'cookie'
			> & {
				body: Procedure['requestBody']['content'][ContentType];
			},
			Procedure['responses'][200]['content'][ContentType]
		>;

export type UseQueryOptions<Query extends ProcedureDef> = Omit<
	UseTanStackQueryOptions<Query['result'], Error, Query['result']>,
	'queryKey' | 'queryFn'
>;

export type UseMutationOptions<Mutation extends ProcedureDef> = Omit<
	UseTanStackMutationOptions<
		Mutation['result'],
		Error,
		Mutation['input'] extends never ? void : Mutation['input']
	>,
	'mutationKey' | 'mutationFn'
>;

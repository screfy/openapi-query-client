import {
	QueryClientProvider,
	skipToken,
	useMutation as useTanStackMutation,
	useQuery as useTanStackQuery,
	type InvalidateQueryFilters,
	type QueryClient,
	type SkipToken,
	type Updater,
} from '@tanstack/react-query';
import type { ReactNode } from 'react';

import type {
	HeadersFn,
	MutationKeys,
	MutationProcedure,
	OpenApiPaths,
	QueryKeys,
	QueryProcedure,
	UseMutationOptions,
	UseQueryOptions,
} from './types.ts';
import { createMutationFn, createQueryFn } from './utils.ts';

export type CreateOpenApiClientOptions = {
	baseUrl: string;
	queryClient: QueryClient;
	headers?: HeadersFn;
};

export function createOpenApiClient<
	Paths extends OpenApiPaths,
	ContentType extends string = 'application/json',
>({ baseUrl, queryClient, headers }: CreateOpenApiClientOptions) {
	function Provider({ children }: { children: ReactNode }) {
		return (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);
	}

	function useQuery<
		Key extends QueryKeys<Paths>,
		Query extends QueryProcedure<Paths, Key, ContentType>,
	>(
		queryKey: Query['input'] extends never
			? [Key]
			: [Key, Query['input'] | SkipToken],
		options?: UseQueryOptions<Query>
	) {
		const isDisabled = queryKey[1] === skipToken;
		const gcTime = options?.gcTime || 0;

		return useTanStackQuery({
			...options,
			gcTime,
			queryKey,
			queryFn: isDisabled
				? skipToken
				: createQueryFn({ baseUrl, queryKey: queryKey as any, headers }),
		});
	}

	function useMutation<
		Key extends MutationKeys<Paths>,
		Mutation extends MutationProcedure<Paths, Key, ContentType>,
	>(mutationKey: [Key], options?: UseMutationOptions<Mutation>) {
		return useTanStackMutation({
			...options,
			mutationKey,
			mutationFn: createMutationFn({ baseUrl, mutationKey, headers }),
		});
	}

	function invalidate<
		Key extends QueryKeys<Paths>,
		Query extends QueryProcedure<Paths, Key, ContentType>,
	>(
		filters?: Omit<InvalidateQueryFilters, 'queryKey'> & {
			queryKey?: [Key, input?: Partial<Query['input']>];
		}
	) {
		return queryClient.invalidateQueries(filters);
	}

	function setData<
		Key extends QueryKeys<Paths>,
		Query extends QueryProcedure<Paths, Key, ContentType>,
	>(
		queryKey: Query['input'] extends never ? [Key] : [Key, Query['input']],
		updater: Updater<Query['result'], Query['result']>
	) {
		return queryClient.setQueryData(queryKey, updater);
	}

	function getData<
		Key extends QueryKeys<Paths>,
		Query extends QueryProcedure<Paths, Key, ContentType>,
	>(queryKey: Query['input'] extends never ? [Key] : [Key, Query['input']]) {
		return queryClient.getQueryData(queryKey);
	}

	return {
		Provider,
		useQuery,
		useMutation,
		utils: { invalidate, setData, getData },
	};
}

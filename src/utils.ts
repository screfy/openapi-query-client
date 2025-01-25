import type { MutationFunction, QueryFunction } from '@tanstack/react-query';

import type { HeadersFn } from './types.ts';

export function createQueryFn<T>({
	baseUrl,
	queryKey,
	headers,
}: {
	baseUrl: string;
	queryKey: [string, input?: object];
	headers?: HeadersFn;
}): QueryFunction<T> {
	const [key, input] = queryKey;
	const [method, path] = key.split(' ');

	const { params, query, body } = extractFromInput(input);
	const url = buildPath({ baseUrl, path, params, query });

	return () => makeRequest({ method, url, body, headers }) as T;
}

export function createMutationFn<T>({
	baseUrl,
	mutationKey,
	headers,
}: {
	baseUrl: string;
	mutationKey: [string];
	headers?: HeadersFn;
}): MutationFunction<T> {
	const [method, path] = mutationKey[0].split(' ');

	return async (input) => {
		const { params, query, body } = extractFromInput(input);
		const url = buildPath({ baseUrl, path, params, query });

		return makeRequest({ method, url, body, headers }) as T;
	};
}

const extractFieldFromInput = (input: Record<string, any>, field: string) =>
	field in input ? input[field] : undefined;

function extractFromInput(input: unknown) {
	if (!input || typeof input !== 'object') {
		return {};
	}

	return {
		params: extractFieldFromInput(input, 'path'),
		query: extractFieldFromInput(input, 'query'),
		body: extractFieldFromInput(input, 'body'),
	};
}

function buildPath({
	baseUrl,
	path,
	params,
	query,
}: {
	baseUrl: string;
	path: string;
	params?: Record<string, any>;
	query?: Record<string, any>;
}) {
	let url = baseUrl + path;

	if (params) {
		for (const [name, value] of Object.entries(params)) {
			const placeholder = '{' + name + '}';
			const index = url.indexOf(placeholder);

			if (index !== -1) {
				url =
					url.slice(0, index) + value + url.slice(index + placeholder.length);
			}
		}
	}

	if (query) {
		const searchParams = new URLSearchParams(query).toString();

		if (searchParams) {
			url += '?' + searchParams.toString();
		}
	}

	return url;
}

function parseResponse(res: Response) {
	const contentType = res.headers.get('Content-Type');

	if (contentType?.startsWith('application/json')) {
		return res.json();
	}

	return res.text();
}

async function makeRequest({
	method,
	url,
	body,
	headers: globalHeaders,
}: {
	method: string;
	url: string;
	body?: object;
	headers?: HeadersFn;
}) {
	const headers = new Headers({
		...globalHeaders?.(),
		Accept: 'application/json',
	});

	if (method !== 'GET') {
		headers.set('Content-Type', 'application/json');
	}

	const res = await fetch(url, {
		method,
		body: body ? JSON.stringify(body) : undefined,
		headers,
	});

	const data = await parseResponse(res);

	if (!res.ok) {
		throw new Error(data);
	}

	return data;
}

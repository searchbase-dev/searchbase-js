// searchbase.ts

interface FilterValue {
  [key: string]: any;
}

export interface Filter {
  field: string;
  op: string;
  value: FilterValue;
}

export enum SortDirection {
  ASC = "ASC",
  DESC = "DESC",
}

export interface Sort {
  field: string;
  direction: SortDirection;
}

export interface SearchOptions {
  index: string;
  filters?: Filter[];
  sort?: Sort[];
  select?: string[];
  limit?: number;
  offset?: number;
}

export interface Range {
  start: number;
  end: number;
}

export interface Timestamp {
  _seconds: number;
  _nanoseconds: number;
}

export interface SearchResult {
  id: string;
  title: string;
  url: string;
  rent: number;
  bedrooms: number;
  bathrooms: number;
  source: string;
  neighborhood: number;
  originalNeighborhood: string;
  thumbnailURLs: string[];
  createdAt: Timestamp;
}

export interface SearchResponse {
  total: number;
  range: Range;
  records: SearchResult[];
}

export class SearchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SearchError";
  }
}

export class SearchbaseSDK {
  private apiToken: string;
  private baseURL: string = "https://api.searchbase.dev";

  constructor(apiToken: string) {
    this.apiToken = apiToken;
  }

  private async fetchWithErrorHandling(
    url: string,
    options: RequestInit
  ): Promise<Response> {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorData = await response.json();
        throw new SearchError(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }
      return response;
    } catch (error) {
      if (error instanceof SearchError) {
        throw error;
      }
      throw new SearchError(`Network error: ${(error as Error).message}`);
    }
  }

  public async search(options: SearchOptions): Promise<SearchResponse> {
    const url = `${this.baseURL}/search`;
    const body = {
      query: {
        index: options.index,
        ...(options.filters && { filters: options.filters }),
        ...(options.sort && { sort: options.sort }),
        ...(options.select && { select: options.select }),
        ...(options.limit && { limit: options.limit }),
        ...(options.offset && { offset: options.offset }),
      },
    };

    const requestOptions: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-searchbase-token": this.apiToken,
      },
      body: JSON.stringify(body),
    };

    const response = await this.fetchWithErrorHandling(url, requestOptions);
    const data = await response.json();
    return data as SearchResponse;
  }

  public async *searchAll(
    options: Omit<SearchOptions, "limit" | "offset">
  ): AsyncGenerator<SearchResult[], void, unknown> {
    const batchSize = 100;
    let offset = 0;
    let totalFetched = 0;
    let total: number | undefined;

    do {
      const response = await this.search({
        ...options,
        limit: batchSize,
        offset,
      });

      yield response.records;

      totalFetched += response.records.length;
      offset = response.range.end;
      total = response.total;
    } while (totalFetched < (total ?? 0));
  }
}

export default SearchbaseSDK;

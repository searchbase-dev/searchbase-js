import { SearchbaseSDK, SearchError, SortDirection, Filter } from "../index";
import fetch from "cross-fetch";

jest.mock("cross-fetch");
const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;

interface TestSearchResult {
  id: string;
  title: string;
  [key: string]: any;
}

describe("SearchbaseSDK", () => {
  let sdk: SearchbaseSDK;

  beforeEach(() => {
    sdk = new SearchbaseSDK("test-api-token");
    jest.resetAllMocks();
  });

  describe("search", () => {
    it("should make a POST request with correct parameters", async () => {
      const mockResponse = {
        total: 1,
        range: { start: 0, end: 1 },
        records: [{ id: "1", title: "Test Record" }],
      };

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const filters: Filter[] = [
        { field: "category", op: "==", value: "test" },
      ];

      const result = await sdk.search<TestSearchResult>({
        index: "test-index",
        filters,
        sort: [{ field: "createdAt", direction: SortDirection.DESC }],
        limit: 10,
        offset: 0,
      });

      expect(mockedFetch).toHaveBeenCalledWith(
        "https://api.searchbase.dev/search",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "x-searchbase-token": "test-api-token",
          }),
          body: JSON.stringify({
            query: {
              index: "test-index",
              filters,
              sort: [{ field: "createdAt", direction: "DESC" }],
              limit: 10,
              // offset is omitted when it's 0
            },
          }),
        })
      );

      expect(result).toEqual(mockResponse);
    });

    // ... other tests remain the same ...
  });

  describe("searchAll", () => {
    it("should paginate through all results", async () => {
      const mockResponses = [
        {
          total: 3,
          range: { start: 0, end: 2 },
          records: [
            { id: "1", title: "Record 1" },
            { id: "2", title: "Record 2" },
          ],
        },
        {
          total: 3,
          range: { start: 2, end: 3 },
          records: [{ id: "3", title: "Record 3" }],
        },
      ];

      mockedFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponses[0],
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponses[1],
        } as Response);

      const searchAllIterator = sdk.searchAll<TestSearchResult>({
        index: "test-index",
      });

      const results: TestSearchResult[] = [];
      for await (const batch of searchAllIterator) {
        results.push(...batch);
      }

      expect(results).toEqual([
        { id: "1", title: "Record 1" },
        { id: "2", title: "Record 2" },
        { id: "3", title: "Record 3" },
      ]);

      expect(mockedFetch).toHaveBeenCalledTimes(2);
      expect(mockedFetch).toHaveBeenNthCalledWith(
        1,
        "https://api.searchbase.dev/search",
        expect.objectContaining({
          body: JSON.stringify({
            query: {
              index: "test-index",
              limit: 100,
              // offset is omitted when it's 0
            },
          }),
        })
      );
      expect(mockedFetch).toHaveBeenNthCalledWith(
        2,
        "https://api.searchbase.dev/search",
        expect.objectContaining({
          body: JSON.stringify({
            query: {
              index: "test-index",
              limit: 100,
              offset: 2,
            },
          }),
        })
      );
    });
  });
});

import { ref, watch } from "vue";
import http from "@/plugins/axios";

/** fetchAll 補齊其餘頁時，同時最多送出的請求數。 */
const FETCH_ALL_CONCURRENCY = 4;
const CACHE_PREFIX = "benefits-journey:api-collection:";
const memoryCache = new Map();

function requestCacheKey(endpoint, requestParams) {
  const sortedParams = Object.fromEntries(
    Object.entries(requestParams ?? {}).sort(([left], [right]) =>
      left.localeCompare(right),
    ),
  );
  return `${endpoint}?${JSON.stringify(sortedParams)}`;
}

function readCache(key, ttl) {
  if (!key || ttl <= 0) return null;

  let cached = memoryCache.get(key);
  if (!cached) {
    try {
      const stored = sessionStorage.getItem(`${CACHE_PREFIX}${key}`);
      cached = stored ? JSON.parse(stored) : null;
      if (cached) memoryCache.set(key, cached);
    } catch {
      cached = null;
    }
  }

  const savedAt = Number(cached?.savedAt);
  if (
    !cached ||
    !Array.isArray(cached.items) ||
    !Number.isFinite(savedAt) ||
    Date.now() - savedAt > ttl
  ) {
    memoryCache.delete(key);
    try {
      sessionStorage.removeItem(`${CACHE_PREFIX}${key}`);
    } catch {
      // sessionStorage 不可用時仍可使用記憶體快取。
    }
    return null;
  }
  return cached;
}

function writeCache(key, value) {
  if (!key) return;
  const cached = { ...value, savedAt: Date.now() };
  memoryCache.set(key, cached);
  try {
    sessionStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(cached));
  } catch {
    // 儲存空間已滿或被瀏覽器停用時，不影響正常請求。
  }
}

/**
 * 共用列表請求：負責載入、重試、取消舊請求與分頁回應。
 * fetchAll=true 用於需要一次顯示所有結果的頁面。
 */
export function useApiCollection(
  endpoint,
  params,
  { fetchAll = false, page = null, cacheTtl = 0 } = {},
) {
  const items = ref([]);
  const totalElements = ref(0);
  const totalPages = ref(0);
  const loading = ref(true);
  const error = ref(false);
  const errorStatus = ref(null);
  const reloadKey = ref(0);

  // 依頁碼放入固定位置，完成先後不影響合併順序。
  async function fetchRemainingPages(requestParams, pages, signal) {
    const total = pages - 1;
    const contents = new Array(total);
    let nextIndex = 0;
    let failure = null;

    async function worker() {
      while (nextIndex < total && !signal.aborted && !failure) {
        const index = nextIndex++;
        try {
          const { data } = await http.get(endpoint, {
            params: { ...requestParams, page: index + 2 },
            signal,
          });
          contents[index] = Array.isArray(data?.content) ? data.content : [];
        } catch (error) {
          failure = failure ?? error;
        }
      }
    }

    const workers = Math.min(FETCH_ALL_CONCURRENCY, total);
    await Promise.all(Array.from({ length: workers }, () => worker()));
    if (signal.aborted) return null;
    if (failure) throw failure;
    return contents.flat();
  }

  watch(
    [params, reloadKey],
    async (_, __, onCleanup) => {
      const controller = new AbortController();
      const { signal } = controller;
      onCleanup(() => controller.abort());

      const requestParams = params.value;
      const cacheKey =
        cacheTtl > 0 ? requestCacheKey(endpoint, requestParams) : null;
      const cached = readCache(cacheKey, cacheTtl);
      if (cached) {
        items.value = cached.items;
        totalPages.value = cached.totalPages;
        totalElements.value = cached.totalElements;
      }

      // 有快取時立即顯示舊資料，並在背景更新，避免重返頁面時再次空白等待。
      loading.value = !cached;
      error.value = false;
      errorStatus.value = null;
      let redirecting = false;

      try {
        const { data } = await http.get(endpoint, { params: requestParams, signal });
        if (signal.aborted) return;

        const parsedPages = Number(data?.totalPages);
        const pages =
          Number.isFinite(parsedPages) && parsedPages > 0 ? Math.trunc(parsedPages) : 0;
        // 結果變少時，避免停在不存在的頁碼；維持載入中，等下一輪請求。
        if (page && pages > 0 && page.value > pages) {
          redirecting = true;
          page.value = pages;
          return;
        }

        let nextItems = Array.isArray(data?.content) ? data.content : [];
        if (fetchAll && pages > 1) {
          const rest = await fetchRemainingPages(requestParams, pages, signal);
          if (signal.aborted || rest == null) return;
          nextItems = nextItems.concat(rest);
        }

        items.value = nextItems;
        totalPages.value = pages;
        totalElements.value = Number(data?.totalElements) || nextItems.length;
        writeCache(cacheKey, {
          items: nextItems,
          totalPages: pages,
          totalElements: totalElements.value,
        });
      } catch (requestError) {
        if (signal.aborted) return;
        if (cached) return;
        error.value = true;
        errorStatus.value = requestError?.response?.status ?? null;
        items.value = [];
        totalElements.value = 0;
        totalPages.value = 0;
      } finally {
        if (!signal.aborted && !redirecting) loading.value = false;
      }
    },
    { immediate: true },
  );

  function retry() {
    reloadKey.value += 1;
  }

  return { items, totalElements, totalPages, loading, error, errorStatus, retry };
}

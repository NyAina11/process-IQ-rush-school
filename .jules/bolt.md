## 2025-05-14 - Redundant Data Normalization in Dashboards
**Learning:** In list-heavy dashboards, calling normalization functions (like `getC` for student levels) within `filter` or `sort` methods that run on every render creates an O(N) bottleneck. This is compounded when multiple sub-components perform the same operations on the same data set.
**Action:** Memoize normalized data at the highest possible level using `useMemo` and pass the prepared data to `React.memo`-wrapped sub-components to ensure O(1) render checks when data hasn't changed.

# PWA 3파일 번들 (BookmarkItem + Bookmarks + BookmarkReport)

## 포함 파일

| 파일 | 출처 zip | 적용 위치 |
|---|---|---|
| `src/components/BookmarkItem.jsx` | pwa-soldout | 솔드아웃 표시 + 한 줄 레이아웃 v3 |
| `src/components/BookmarkReport.jsx` | pwa-report | 최저가 리포트 박스 (그룹 위) |
| `src/pages/Bookmarks.jsx` | pwa-soldout | last_check_status fetch 추가 |

`BookmarkGroup.jsx`는 별도 (pwa-lowest zip 또는 단일 파일).

## 적용

zip 풀어서 3파일 PWA 폴더에 덮어쓰기:
```
PWA 폴더 mosaic-shopping-pwa/src/components/BookmarkItem.jsx
PWA 폴더 mosaic-shopping-pwa/src/components/BookmarkReport.jsx
PWA 폴더 mosaic-shopping-pwa/src/pages/Bookmarks.jsx
```

dev HMR 자동 반영 → PWA 새로고침.

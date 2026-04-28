export default function LoadingScreen({ label = "불러오는 중..." }) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-mosaic-line border-t-mosaic-accent" />
        <p className="text-sm text-mosaic-muted">{label}</p>
      </div>
    </div>
  );
}

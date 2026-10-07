export function Logo() {
  return (
    <span className="flex items-center gap-2 font-medium">
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="size-5"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <rect
          x="3"
          y="10"
          width="18"
          height="8"
          rx="2"
          className="fill-marker stroke-none"
        />
        <path d="M9 4h6M12 4v16M9 20h6" className="stroke-current" />
      </svg>
      Highlight Popover
    </span>
  );
}

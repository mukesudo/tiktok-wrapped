import clsx from "clsx";

type VideoCardProps = {
  index: number;
  title: string;
  metric: number | string;
  metricLabel?: string;
  description?: string;
  href?: string;
  className?: string;
};

function formatValue(value: number | string) {
  if (typeof value === "number") {
    return value.toLocaleString();
  }
  return value;
}

export default function VideoCard({
  index,
  title,
  metric,
  metricLabel = "likes",
  description,
  href,
  className
}: VideoCardProps) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-gray-700 bg-gray-900 p-6 shadow-lg",
        className
      )}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-pink-400">
            #{index}
          </p>
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="mt-2 block text-lg font-semibold text-white underline-offset-4 hover:text-pink-200 hover:underline"
            >
              {title}
            </a>
          ) : (
            <p className="mt-2 text-lg font-semibold text-white">{title}</p>
          )}
          {description && (
            <p className="mt-2 break-all text-sm text-gray-300">
              {description}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold text-cyan-300">
            {formatValue(metric)}
          </p>
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
            {metricLabel}
          </p>
        </div>
      </div>
    </div>
  );
}

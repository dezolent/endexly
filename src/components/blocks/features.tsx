type FeatureItem = {
  icon?: string | null;
  title: string;
  description: string;
};

type FeaturesBlockProps = {
  blockType: "features";
  heading?: string | null;
  subheading?: string | null;
  columns?: "2" | "3" | "4";
  items: FeatureItem[];
  primaryColor?: string;
};

const colClass: Record<string, string> = {
  "2": "sm:grid-cols-2",
  "3": "sm:grid-cols-2 lg:grid-cols-3",
  "4": "sm:grid-cols-2 lg:grid-cols-4",
};

export function FeaturesBlock({
  heading,
  subheading,
  columns = "3",
  items,
  primaryColor = "#2563eb",
}: FeaturesBlockProps) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        {(heading || subheading) && (
          <div className="text-center mb-12">
            {heading && (
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                {heading}
              </h2>
            )}
            {subheading && (
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {subheading}
              </p>
            )}
          </div>
        )}

        <div className={`grid grid-cols-1 gap-6 ${colClass[columns] ?? colClass["3"]}`}>
          {items.map((item, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              {item.icon && (
                <div
                  className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md text-white text-sm font-bold"
                  style={{ backgroundColor: primaryColor }}
                  aria-hidden="true"
                >
                  {item.icon.slice(0, 2).toUpperCase()}
                </div>
              )}
              <h3 className="mb-2 font-semibold text-gray-900">{item.title}</h3>
              <p className="text-sm leading-relaxed text-gray-600">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

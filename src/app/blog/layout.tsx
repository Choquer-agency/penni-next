import RouteBodyClass from "@/components/RouteBodyClass";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RouteBodyClass value="blog" />
      {children}
    </>
  );
}

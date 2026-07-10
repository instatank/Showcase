import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

/** The classic site chrome — header + footer around every (site) page. */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}

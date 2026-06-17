import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";

export default function Admin() {
  return (
    <>
      <PageMeta
        title="React.js Registrations Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Registrations Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Registrations" />
      <div className="space-y-6">
        <ComponentCard title="Registration">
          <BasicTableOne />
        </ComponentCard>
      </div>
    </>
  );
}

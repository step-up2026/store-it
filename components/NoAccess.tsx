export function NoAccess({ resource }: { resource: string }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center border border-dashed border-neutral-300 rounded-lg py-16">
        <p className="text-neutral-700 font-medium mb-1">No access</p>
        <p className="text-neutral-500 text-sm">
          You don&apos;t have permission to view {resource}. Ask an
          administrator to grant you access.
        </p>
      </div>
    </div>
  );
}

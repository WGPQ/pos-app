import ComponentCard from '@/components/common/ComponentCard'
import AddButtonSale from '@/components/sale/AddButtonSale'
import ListsPos from '@/components/sale/ListsPos'

const SalesPage = () => {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2
          className="text-xl font-semibold text-gray-800 dark:text-white/90"
          x-text="pageName"
        >
          {"Ventas"}
        </h2>
      </div>
      <div className="space-y-4">
        <ComponentCard
          header={
            <div className="pt-2 flex items-center justify-end">
              <div className="flex items-center gap-2">
                <AddButtonSale />
              </div>
            </div>
          }
        >
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <div className="min-w-[1102px]">
                <ListsPos />
              </div>
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  )
}

export default SalesPage

import React, { useState } from 'react';
import { 
  ArrowRight, 
  RefreshCw, 
  FileSpreadsheet, 
  UtensilsCrossed, 
  PackageOpen, 
  Coffee, 
  ClipboardList 
} from 'lucide-react';
import { 
  Category, 
  InventoryItem, 
  MeasurementType, 
  RequirementItem, 
  TabType 
} from '../types';
import { CategoryView } from './CategoryView';
import { RequirementsTab } from './RequirementsTab';
import { ItemModal } from './ItemModal';
import { ReportPreview } from './ReportPreview';
import { toPersianDigits } from '../utils/persianDate';

interface InventorySectionProps {
  onBackToHome: () => void;
  categories: Category[];
  requirements: RequirementItem[];
  totalItemsCount: number;
  completedItemsCount: number;
  onUpdateValue: (itemId: string, newValue: number | string | boolean) => void;
  onSaveItem: (
    categoryId: string,
    subCategoryName: string,
    itemData: {
      id?: string;
      name: string;
      type: MeasurementType;
      value: number | string | boolean;
      description?: string;
      unit?: string;
    }
  ) => void;
  onDeleteItem: (itemId: string) => void;
  onAddRequirement: (text: string) => void;
  onDeleteRequirement: (id: string) => void;
  onClearShiftRequirements: () => void;
  onResetToDefault: () => void;
}

export const InventorySection: React.FC<InventorySectionProps> = ({
  onBackToHome,
  categories,
  requirements,
  totalItemsCount,
  completedItemsCount,
  onUpdateValue,
  onSaveItem,
  onDeleteItem,
  onAddRequirement,
  onDeleteRequirement,
  onClearShiftRequirements,
  onResetToDefault,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('kitchen');
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [selectedCategoryIdForModal, setSelectedCategoryIdForModal] = useState('kitchen');
  const [itemToEdit, setItemToEdit] = useState<InventoryItem | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const handleAddNewItem = (categoryId: string) => {
    setItemToEdit(null);
    setSelectedCategoryIdForModal(categoryId);
    setIsItemModalOpen(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setItemToEdit(item);
    setIsItemModalOpen(true);
  };

  const currentCategory = categories.find((cat) => cat.id === activeTab);

  const tabs = [
    { id: 'kitchen' as TabType, label: 'آشپزخانه', icon: UtensilsCrossed },
    { id: 'storage' as TabType, label: 'انبار', icon: PackageOpen },
    { id: 'bar' as TabType, label: 'بار سرد و گرم', icon: Coffee },
    { 
      id: 'requirements' as TabType, 
      label: 'نیازمندی‌ها', 
      icon: ClipboardList, 
      badge: requirements.length > 0 ? requirements.length : undefined 
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#201A19] flex flex-col" dir="rtl">
      {/* Top App Bar with Back to Home */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#EFEBE9] px-4 py-3 shadow-[0_2px_8px_rgba(62,39,35,0.03)]">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToHome}
              className="w-10 h-10 rounded-2xl bg-white hover:bg-[#F5F2EC] active:scale-95 text-[#201A19] flex items-center justify-center transition-all border border-[#E6DFD5] shadow-xs"
              title="بازگشت به صفحه اصلی"
            >
              <ArrowRight className="w-5 h-5 text-[#3E2723]" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg text-[#201A19] leading-none">موجودی و انبار</h1>
                <span className="text-[10px] bg-[#F3EBE7] text-[#5D4037] font-bold px-2.5 py-0.5 rounded-full border border-[#E6DDD8]">
                  چک شیفت
                </span>
              </div>
              <p className="text-xs text-[#6F5A52] mt-0.5 font-medium">
                شمارش شده: {toPersianDigits(completedItemsCount)} از {toPersianDigits(totalItemsCount)} قلم
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onResetToDefault}
              title="بازنشانی پیش‌فرض اقلام"
              className="w-9 h-9 rounded-2xl bg-white hover:bg-[#F5F2EC] active:scale-95 text-[#8D6E63] hover:text-[#3E2723] flex items-center justify-center transition-all border border-[#E6DFD5] shadow-xs"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Internal Tabs Sub-bar */}
      <div className="bg-[#FAF8F5] border-b border-[#EFEBE9] px-4 py-2 sticky top-[61px] z-30">
        <div className="max-w-2xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                  isActive
                    ? 'bg-[#3E2723] text-white shadow-sm'
                    : 'bg-white text-[#6F5A52] hover:bg-[#F5F2EC] border border-[#E6DFD5]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#FADCD2]' : 'text-[#8D6E63]'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-[#BA1A1A] text-white' : 'bg-[#BA1A1A] text-white'
                  }`}>
                    {toPersianDigits(tab.badge)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl mx-auto w-full pb-32 pt-3 px-4 sm:px-0">
        {activeTab === 'requirements' ? (
          <RequirementsTab
            requirements={requirements}
            onAddRequirement={onAddRequirement}
            onDeleteRequirement={onDeleteRequirement}
            onClearAll={onClearShiftRequirements}
          />
        ) : currentCategory ? (
          <CategoryView
            category={currentCategory}
            onUpdateValue={onUpdateValue}
            onAddNewItem={handleAddNewItem}
            onEditItem={handleEditItem}
          />
        ) : null}
      </main>

      {/* Sticky Bottom Generate PDF Report Button */}
      <div className="fixed bottom-4 left-0 right-0 z-30 px-4 pointer-events-none flex justify-center">
        <div className="w-full max-w-2xl pointer-events-auto">
          <button
            type="button"
            onClick={() => setIsReportModalOpen(true)}
            className="w-full h-12 bg-[#201A19] hover:bg-[#3E2723] active:scale-[0.98] text-white font-bold text-sm sm:text-base rounded-2xl flex items-center justify-center gap-2.5 shadow-[0_8px_24px_rgba(32,26,25,0.25)] border border-[#4E342E] transition-all duration-150 group"
          >
            <FileSpreadsheet className="w-5 h-5 text-[#FADCD2] group-hover:scale-110 transition-transform" />
            <span>ثبت و صدور گزارش PDF موجودی</span>
          </button>
        </div>
      </div>

      {/* Item Modal */}
      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => {
          setIsItemModalOpen(false);
          setItemToEdit(null);
        }}
        categories={categories}
        initialCategoryId={selectedCategoryIdForModal}
        itemToEdit={itemToEdit}
        onSaveItem={onSaveItem}
        onDeleteItem={onDeleteItem}
      />

      {/* Report Modal */}
      <ReportPreview
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        categories={categories}
        requirements={requirements}
      />
    </div>
  );
};

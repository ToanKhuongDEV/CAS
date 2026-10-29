import { CustomerBottomNavigation } from "../../../components/customer/customer-bottom-navigation";
import { CustomerPageSkeleton } from "../../../components/customer/customer-page-skeleton";

export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-cas-surface text-cas-on-surface">
      <div className="mx-auto flex w-full max-w-[85rem] items-start gap-8 px-4 pt-20 pb-28 md:gap-12 md:px-8 md:pt-24 md:pb-16 lg:gap-14">
        <CustomerBottomNavigation activeItem="settings" />
        <CustomerPageSkeleton withinLayout />
      </div>
    </div>
  );
}

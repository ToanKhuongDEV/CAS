import { CasIcon } from "../ui/cas-icon";

type ItemQuantityControlProps = {
  itemName: string;
  onIncrease?: () => void;
  quantity: number;
};

export function ItemQuantityControl({
  itemName,
  onIncrease,
  quantity,
}: ItemQuantityControlProps) {
  return (
    <div
      className="flex items-center gap-2 rounded-full bg-cas-secondary-container/20 p-1"
      aria-label={`Số lượng ${itemName}: ${quantity}`}
    >
      <button
        className="grid size-7 place-items-center rounded-full text-cas-primary focus-visible:outline-3 focus-visible:outline-cas-focus-ring"
        type="button"
        aria-label={`Giảm số lượng ${itemName}`}
      >
        <CasIcon className="size-4" name="minus" />
      </button>
      <span className="min-w-3 text-center text-xs font-extrabold">
        {quantity}
      </span>
      <button
        className="grid size-7 place-items-center rounded-full bg-cas-primary text-cas-on-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
        type="button"
        aria-label={`Tăng số lượng ${itemName}`}
        onClick={onIncrease}
      >
        <CasIcon className="size-4" name="plus" />
      </button>
    </div>
  );
}

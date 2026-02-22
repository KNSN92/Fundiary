import { type Modal, useModal } from "@/app/modal";
import fundiary from "@/fundiary";
import cn from "@/libs/cn";

export default function ModalRoot() {
  const modal: Modal | undefined = useModal();
  if (!modal) return null;
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions : buttonにしたかったけどhydration errorとかほざいたのでdivにする。
    <div
      onMouseUp={(e) => {
        e.target === e.currentTarget &&
          modal.bgClickToClose &&
          fundiary.modals.close();
      }}
      onMouseMove={(e) => {
        if (!modal.bgClickToClose) return;
        if (e.target === e.currentTarget) {
          e.currentTarget.style.cursor = "pointer";
        } else {
          e.currentTarget.style.cursor = "default";
        }
      }}
      className={cn("fixed inset-0 z-80 w-screen h-screen", {
        "pointer-events-none": modal.canControlBg,
        "bg-black/50": !modal.bgColor,
        "flex items-center justify-center": modal.centered,
      })}
      style={{
        backgroundColor: modal.bgColor ?? undefined,
      }}
    >
      <modal.render />
    </div>
  );
}

import { NextPage } from "next";
import useCopyToClipboard from "@/lib/hook/use-copy-to-clipboard";
import toast from "@/utils/toastService";

interface Props {
  data: string;
  message?: string;
}

const CopyText: NextPage<Props> = ({ data, message = null }) => {
  const [_, copy] = useCopyToClipboard();

  const handleCopy = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    copy(data || "");
    message
      ? toast.success(`${message} copied`)
      : toast.success(`copied success`);
  };

  return (
    <div
      className="position-relative"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <span className="wl-text-ellipsis" style={{ flex: 1 }}>
        {data || ""}
      </span>
      {data && (
        <span
          onClick={handleCopy}
          className="wl-tooltip-container"
          data-position="left"
          style={{ marginLeft: "8px" }}
        >
          <span className="wl-icon wl-icon-copy-gray"></span>
          <span className="wl-tooltip">Copy</span>
        </span>
      )}
    </div>
  );
};

export default CopyText;

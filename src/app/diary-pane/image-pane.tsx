import { ArkErrors, type } from "arktype";
import type { DiaryPane } from "fundiary-api/api/diary-pane";
import { useEffect, useRef, useState } from "react";
import { getImageAsObjectURL } from "@/db/image-db";

export type ImagePaneData = {
  imageId: string;
  objectFit: string;
  borderRadius: number;
};

export default {
  identifier: "base:image",
  name: "画像",
  size: { width: 1, height: 1 },
  dataValidator: type({
    imageId: "string",
    objectFit: "string",
    borderRadius: "number",
  }),
  initData: () => ({
    imageId: "",
    objectFit: "cover",
    borderRadius: 0,
  }),
  args: [
    {
      dataKey: "imageId",
      name: "画像",
      description: "表示する画像を選択します。",
      isParam: true,
      inputType: {
        kind: "image",
        accept: "image/*",
        maxSizeBytes: 10 * 1024 * 1024, // 10MB
      },
    },
    {
      dataKey: "objectFit",
      name: "表示方法",
      description: "画像の表示方法を選択します。",
      isParam: false,
      inputType: {
        kind: "select",
        placeholder: "表示方法を選択",
        options: [
          { value: "cover", label: "カバー（切り抜き）" },
          { value: "contain", label: "全体表示" },
          { value: "fill", label: "引き伸ばし" },
          { value: "none", label: "元サイズ" },
        ],
      },
    },
    {
      dataKey: "borderRadius",
      name: "角丸",
      description: "画像の角を丸くします（px）",
      isParam: false,
      inputType: {
        kind: "number",
        min: 0,
        max: 100,
        unit: "px",
      },
    },
  ],
  resize: {},
  component: ImagePaneComponent,
} as DiaryPane<ImagePaneData>;

function ImagePaneComponent({ data }: { data: ImagePaneData }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const imageUrlRef = useRef<string | null>(null);

  useEffect(() => {
    // 古いURLをクリーンアップ
    if (imageUrlRef.current) {
      URL.revokeObjectURL(imageUrlRef.current);
      imageUrlRef.current = null;
    }

    if (!data.imageId) {
      setImageUrl(null);
      return;
    }

    let cancelled = false;
    getImageAsObjectURL(data.imageId).then((url) => {
      if (cancelled) {
        if (typeof url === "string") URL.revokeObjectURL(url);
        return;
      }
      if (url instanceof ArkErrors) {
        setImageUrl(null);
        return;
      }
      imageUrlRef.current = url;
      setImageUrl(url);
    });

    return () => {
      cancelled = true;
      if (imageUrlRef.current) {
        URL.revokeObjectURL(imageUrlRef.current);
        imageUrlRef.current = null;
      }
    };
  }, [data.imageId]);

  if (!imageUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-text">
        <span className="text-4xl">🖼️</span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt=""
      className="w-full h-full"
      style={{
        objectFit: data.objectFit as React.CSSProperties["objectFit"],
        borderRadius: `${data.borderRadius}px`,
      }}
    />
  );
}

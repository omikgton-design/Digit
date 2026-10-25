import { useEffect, useRef, useState } from "react";
import { createBanner, deleteBanner, getMyBanners } from "../api/website";
import type { CustomerBanner, CustomerType } from "../types";
import { useToast } from "./ToastProvider";

type Props = {
  profileType?: CustomerType | string;
};

export function BannerManager({ profileType }: Props) {
  const { showToast } = useToast();
  const isGold = profileType === "gold";
  const [banners, setBanners] = useState<CustomerBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [preview, setPreview] = useState<{ file: File; url: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reload = () => {
    setLoading(true);
    getMyBanners()
      .then((data) => setBanners(data.results))
      .catch(() => setBanners([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
  }, []);

  const onPickFile = (file: File | null) => {
    if (preview) URL.revokeObjectURL(preview.url);
    if (!file) {
      setPreview(null);
      return;
    }
    setPreview({ file, url: URL.createObjectURL(file) });
  };

  const upload = async () => {
    if (!preview) {
      showToast("Эхлээд баннерын зураг сонгоно уу.", "error");
      return;
    }
    setUploading(true);
    try {
      await createBanner(preview.file, linkUrl.trim());
      showToast("Баннер амжилттай нэмэгдлээ.");
      onPickFile(null);
      setLinkUrl("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      reload();
    } catch (err) {
      showToast((err as Error).message || "Баннер нэмэхэд алдаа гарлаа.", "error");
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm("Энэ баннерыг устгах уу?")) return;
    try {
      await deleteBanner(id);
      showToast("Баннер устгагдлаа.");
      reload();
    } catch (err) {
      showToast((err as Error).message || "Устгахад алдаа гарлаа.", "error");
    }
  };

  if (!isGold) {
    return (
      <div className="profile-tab-panel">
        <div className="profile-banner-locked">
          <div className="profile-banner-locked-icon">🔒</div>
          <h3>Баннер байршуулах боломж зөвхөн Gold багцад нээлттэй</h3>
          <p>
            Gold багц худалдан авснаар та өөрийн байгууллагын зарын баннерыг нүүр хуудсанд хүртэл 2
            ширхэг байршуулах боломжтой болно.
          </p>
          <a className="profile-payment-primary" href="/pricing">▣ Багц сонгох</a>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-tab-panel">
      <div className="profile-panel-header">
        <h2>Баннер</h2>
        <p>Та нүүр хуудсанд харагдах хамгийн ихдээ 2 баннер байршуулах боломжтой.</p>
      </div>

      {loading ? (
        <div className="profile-software-empty">Ачаалж байна...</div>
      ) : (
        <div className="profile-banner-grid">
          {banners.map((banner) => (
            <div className="profile-banner-card" key={banner.id}>
              <img src={banner.image_url} alt="Баннер" />
              <div className="profile-banner-card-body">
                <span className="profile-banner-card-link">{banner.link_url || "Холбоос ороогүй"}</span>
                <button type="button" className="profile-banner-remove" onClick={() => remove(banner.id)}>
                  🗑 Устгах
                </button>
              </div>
            </div>
          ))}

          {banners.length < 2 ? (
            <div className="profile-banner-upload-card">
              {preview ? (
                <img src={preview.url} alt="Шинэ баннер" className="profile-banner-upload-preview" />
              ) : (
                <label className="profile-banner-upload-drop">
                  <span>+ Зураг сонгох</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => onPickFile(e.target.files?.[0] || null)}
                    hidden
                  />
                </label>
              )}
              <input
                type="url"
                className="profile-banner-link-input"
                placeholder="Холбоос (сонголттой), жишээ: https://example.mn"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
              <button type="button" className="profile-payment-primary" disabled={uploading} onClick={upload}>
                {uploading ? "Байршуулж байна..." : "Баннер нэмэх"}
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

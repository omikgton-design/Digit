import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {createAdvisory, createArticle, createSoftware, deleteAdvisory, deleteArticle, deleteSoftware, getAdvisories, getAdvisoryDetail, getArticleDetail, getArticles ,getMyRatings, getSoftwareDetail, getSoftwares, MyRatingItem, updateAdvisory, updateArticle, updateSoftware,deleteSoftwareRating, deleteAdvisoryRating, rateSoftware, rateAdvisory, getMySavedSoftwares, getMySavedAdvisories, getMySavedArticles, unsaveSoftware, unsaveAdvisory, unsaveArticle, }from "../api/website";
import { SimpleRichTextEditor } from "../components/SimpleRichTextEditor";
import { useToast } from "../components/ToastProvider";
import type { AdvisoryDetail, AdvisoryFacets, AdvisoryListItem, ArticleDetail, ArticleListItem, Category, CreateAdvisoryPayload, CreateArticlePayload, CreateSoftwarePayload, Customer, SoftwareDetail, SoftwareListItem } from "../types";
import { stripRichText } from "../utils/richText";

type Props = {
  profile: Partial<Customer>;
  loading: boolean;
  programCategories: Category[];
  advisoryCategories: Category[];
  articleCategories: Category[];
  advisoryFacets: AdvisoryFacets;
  onProfileChange: (value: Partial<Customer>) => void;
  onProfileSubmit: (event: FormEvent<HTMLFormElement>) => Promise<boolean>;
  onPasswordSubmit: (event: FormEvent<HTMLFormElement>) => Promise<boolean>;
  onLogoChange: (file: File) => void;
};

type SoftwareModalStep = 1 | 2 | 3 | 4;
type AdvisoryModalStep = 1 | 2 | 3;
type ArticleModalStep = 1 | 2;

const profileDetails = [
  { label: "Утас", value: "phone" },
  { label: "Вэб сайт", value: "website" },
  { label: "Хаяг", value: "address" },
  { label: "Холбоо барих нэр", value: "contact_person_name" },
  { label: "Холбоо барих утас", value: "contact_person_phone" },
  { label: "Бүртгэлийн төрөл", value: "type" },
] as const;

const tabItems = [
  { id: "overview", label: "Програм хангамж", title: "Програм хангамж" },
  {
    id: "contact",
    label: "Зөвлөх үйлчилгээ",
    title: "Зөвлөх үйлчилгээ",
    fields: [
      { label: "Утас", value: "phone" },
      { label: "Хаяг", value: "address" },
      { label: "Холбоо барих нэр", value: "contact_person_name" },
      { label: "Холбоо барих утас", value: "contact_person_phone" },
    ] as const,
  },
  {
    id: "account",
    label: "Нийтлэл",
    title: "Нийтлэл",
    fields: [
      { label: "Имэйл", value: "email" },
      { label: "Бүртгэлийн төрөл", value: "type" },
    ] as const,
  },
    {
    id: "reviews",
    label: "Миний үнэлгээ, сэтгэгдэл",
    title: "Миний үнэлгээ, сэтгэгдэл",
    fields: [],
  },
    {
    id: "payment",
    label: "Төлбөр",
    title: "Төлбөр",
    fields: [],
  },
] as const;
 

const createInitialSoftwareForm = (): CreateSoftwarePayload => ({
  name: "",
  development_start_year: new Date().getFullYear(),
  program_type_id: 0,
  advisory_sector_ids: [],
  price: "",
  price_type: "sale",
  introduction: "",
  description: "",
});

const createInitialAdvisoryForm = (): CreateAdvisoryPayload => ({
  title: "",
  service_type: "",
  advisory_sector_ids: [],
  service_start_year: new Date().getFullYear(),
  introduction: "",
  description: "",
  price_terms: "",
  price: "",
  client_organizations: "",
});

const createInitialArticleForm = (): CreateArticlePayload => ({
  title: "",
  article_type_id: 0,
  published_date: new Date().toISOString().slice(0, 10),
  description: "",
});

function getApprovalLabel(isApproved: boolean) {
  return isApproved ? "Нийтлэгдсэн" : "Хянагдаж байна";
}

export function ProfilePage({
  profile,
  loading,
  programCategories,
  advisoryCategories,
  articleCategories,
  advisoryFacets,
  onProfileChange,
  onProfileSubmit,
  onPasswordSubmit,
  onLogoChange,
}: Props) {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [modalMode, setModalMode] = useState<"profile" | "password" | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentPackage, setPaymentPackage] = useState<"bronze" | "silver" | "gold">((profile.type as "bronze" | "silver" | "gold") || "bronze");
  const [myRatings, setMyRatings] = useState< Awaited<ReturnType<typeof getMyRatings>>["results"]>([]);
  const [editingRatingId, setEditingRatingId] = useState<number | null>(null);
  const [editingScore, setEditingScore] = useState(0);
  const [editingComment, setEditingComment] = useState("");
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [savedSoftwares, setSavedSoftwares] = useState<SoftwareListItem[]>([]);
  const [savedAdvisories, setSavedAdvisories] = useState<AdvisoryListItem[]>([]);
  const [savedArticles, setSavedArticles] = useState<ArticleListItem[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [softwareForm, setSoftwareForm] = useState<CreateSoftwarePayload>(createInitialSoftwareForm);
  const [ownSoftwares, setOwnSoftwares] = useState<SoftwareListItem[]>([]);
  const [advisoryForm, setAdvisoryForm] = useState<CreateAdvisoryPayload>(createInitialAdvisoryForm);
  const [ownAdvisories, setOwnAdvisories] = useState<AdvisoryListItem[]>([]);
  const [articleForm, setArticleForm] = useState<CreateArticlePayload>(createInitialArticleForm);
  const [ownArticles, setOwnArticles] = useState<ArticleListItem[]>([]);
  const [softwareLoading, setSoftwareLoading] = useState(false);
  const [advisoryLoading, setAdvisoryLoading] = useState(false);
  const [articleLoading, setArticleLoading] = useState(false);
  const [softwareSubmitting, setSoftwareSubmitting] = useState(false);
  const [advisorySubmitting, setAdvisorySubmitting] = useState(false);
  const [articleSubmitting, setArticleSubmitting] = useState(false);
  const [softwareModalOpen, setSoftwareModalOpen] = useState(false);
  const [advisoryModalOpen, setAdvisoryModalOpen] = useState(false);
  const [articleModalOpen, setArticleModalOpen] = useState(false);
  const [softwareModalMode, setSoftwareModalMode] = useState<"create" | "edit">("create");
  const [advisoryModalMode, setAdvisoryModalMode] = useState<"create" | "edit">("create");
  const [articleModalMode, setArticleModalMode] = useState<"create" | "edit">("create");
  const [editingSoftwareId, setEditingSoftwareId] = useState<number | null>(null);
  const [editingAdvisoryId, setEditingAdvisoryId] = useState<number | null>(null);
  const [editingArticleId, setEditingArticleId] = useState<number | null>(null);
  const [softwareEditorLoading, setSoftwareEditorLoading] = useState(false);
  const [advisoryEditorLoading, setAdvisoryEditorLoading] = useState(false);
  const [articleEditorLoading, setArticleEditorLoading] = useState(false);
  const [softwareStep, setSoftwareStep] = useState<SoftwareModalStep>(1);
  const [advisoryStep, setAdvisoryStep] = useState<AdvisoryModalStep>(1);
  const [articleStep, setArticleStep] = useState<ArticleModalStep>(1);
  const [selectedProgramParentId, setSelectedProgramParentId] = useState<number | null>(null);
  const [selectedSectorParentId, setSelectedSectorParentId] = useState<number | null>(null);
  const [selectedAdvisoryWizardParentId, setSelectedAdvisoryWizardParentId] = useState<number | null>(null);
  const [softwareImages, setSoftwareImages] = useState<File[]>([]);
  const [advisoryImages, setAdvisoryImages] = useState<File[]>([]);
  const [articleImage, setArticleImage] = useState<File | null>(null);
  const [existingSoftwareImages, setExistingSoftwareImages] = useState<string[]>([]);
  const [existingAdvisoryImages, setExistingAdvisoryImages] = useState<string[]>([]);
  const [existingArticleImage, setExistingArticleImage] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const softwareImageInputRef = useRef<HTMLInputElement | null>(null);
  const advisoryImageInputRef = useRef<HTMLInputElement | null>(null);
  const articleImageInputRef = useRef<HTMLInputElement | null>(null);
  const { showToast } = useToast();
  const activeTabItem = tabItems.find((item) => item.id === activeTab) || tabItems[0];

  const programParentCategories = useMemo(
    () => programCategories.filter((category) => category.parent_id === null),
    [programCategories],
  );
  const programChildCategories = useMemo(
    () =>
      selectedProgramParentId
        ? programCategories.filter((category) => category.parent_id === selectedProgramParentId)
        : [],
    [programCategories, selectedProgramParentId],
  );
  const advisoryParentCategories = useMemo(
    () => advisoryCategories.filter((category) => category.parent_id === null),
    [advisoryCategories],
  );
  const advisoryChildCategories = useMemo(
    () =>
      selectedSectorParentId
        ? advisoryCategories.filter((category) => category.parent_id === selectedSectorParentId)
        : [],
    [advisoryCategories, selectedSectorParentId],
  );
  const softwareImagePreviews = useMemo(
    () => softwareImages.map((file) => ({ name: file.name, url: URL.createObjectURL(file) })),
    [softwareImages],
  );
  const advisoryImagePreviews = useMemo(
    () => advisoryImages.map((file) => ({ name: file.name, url: URL.createObjectURL(file) })),
    [advisoryImages],
  );
  const articleImagePreview = useMemo(
    () => (articleImage ? { name: articleImage.name, url: URL.createObjectURL(articleImage) } : null),
    [articleImage],
  );
  useEffect(() => {
    if (activeTab !== "reviews") return;

    setRatingsLoading(true);

    getMyRatings()
      .then((data) => {
        setMyRatings(data.results);
      })
      .catch(() => {
        setMyRatings([]);
      })
      .finally(() => {
        setRatingsLoading(false);
      });
  }, [activeTab]);

  useEffect(() => {
    if (!profile || profile.account_type !== "person") return;
    const loaders: Record<string, () => Promise<any>> = {
      savedSoftware: getMySavedSoftwares, savedAdvisory: getMySavedAdvisories, savedArticle: getMySavedArticles,
    };
    const loader = loaders[activeTab];
    if (!loader) return;
    setSavedLoading(true);
    loader().then((data) => {
      if (activeTab === "savedSoftware") setSavedSoftwares(data.results);
      if (activeTab === "savedAdvisory") setSavedAdvisories(data.results);
      if (activeTab === "savedArticle") setSavedArticles(data.results);
    }).catch(() => {}).finally(() => setSavedLoading(false));
  }, [activeTab, profile?.account_type]);

  useEffect(() => {
    return () => {
      softwareImagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [softwareImagePreviews]);

  useEffect(() => {
    return () => {
      advisoryImagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [advisoryImagePreviews]);

  useEffect(() => {
    return () => {
      if (articleImagePreview) {
        URL.revokeObjectURL(articleImagePreview.url);
      }
    };
  }, [articleImagePreview]);

  useEffect(() => {
    const customerId = profile.id;
    if (!customerId) {
      setOwnSoftwares([]);
      setOwnAdvisories([]);
      setOwnArticles([]);
      return;
    }

    setSoftwareLoading(true);
    getSoftwares({ developerIds: [customerId], pageSize: 50, mine: true })
      .then((data) => setOwnSoftwares(data.results))
      .catch((error) => showToast((error as Error).message, "error"))
      .finally(() => setSoftwareLoading(false));

    setAdvisoryLoading(true);
    getAdvisories({ companyIds: [customerId], pageSize: 50, mine: true })
      .then((data) => setOwnAdvisories(data.results))
      .catch((error) => showToast((error as Error).message, "error"))
      .finally(() => setAdvisoryLoading(false));

    setArticleLoading(true);
    getArticles({ organizationIds: [customerId], pageSize: 50, mine: true })
      .then((data) => setOwnArticles(data.results))
      .catch((error) => showToast((error as Error).message, "error"))
      .finally(() => setArticleLoading(false));
  }, [profile.id, showToast]);

  useEffect(() => {
    if (!programParentCategories.length) return;
    if (!selectedProgramParentId) {
      setSelectedProgramParentId(programParentCategories[0].id);
    }
  }, [programParentCategories, selectedProgramParentId]);

  useEffect(() => {
    if (!programParentCategories.length) {
      setSelectedProgramParentId(null);
      return;
    }

    const currentType = programCategories.find((category) => category.id === softwareForm.program_type_id);
    if (currentType?.parent_id) {
      setSelectedProgramParentId(currentType.parent_id);
      return;
    }

    if (currentType && currentType.parent_id === null) {
      setSelectedProgramParentId(currentType.id);
      return;
    }

    if (!selectedProgramParentId) {
      setSelectedProgramParentId(programParentCategories[0].id);
    }
  }, [programCategories, programParentCategories, selectedProgramParentId, softwareForm.program_type_id]);

  useEffect(() => {
    if (!selectedSectorParentId && advisoryParentCategories.length) {
      setSelectedSectorParentId(advisoryParentCategories[0].id);
    }
  }, [advisoryParentCategories, selectedSectorParentId]);

  useEffect(() => {
    if (!selectedAdvisoryWizardParentId && advisoryParentCategories.length) {
      setSelectedAdvisoryWizardParentId(advisoryParentCategories[0].id);
    }
  }, [advisoryParentCategories, selectedAdvisoryWizardParentId]);

  const handleLogoPick = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    onLogoChange(file);
    event.target.value = "";
  };

  const closeModal = () => setModalMode(null);

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    const ok = await onProfileSubmit(event);
    if (ok) closeModal();
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    const ok = await onPasswordSubmit(event);
    if (ok) closeModal();
  };

  const resetSoftwareWizard = () => {
    const defaultProgramParent = programParentCategories[0];

    setSoftwareForm({
      ...createInitialSoftwareForm(),
      program_type_id: 0,
    });
    setSoftwareImages([]);
    setExistingSoftwareImages([]);
    setSoftwareStep(1);
    setSoftwareModalMode("create");
    setEditingSoftwareId(null);
    setSelectedProgramParentId(defaultProgramParent?.id || null);
    setSelectedSectorParentId(advisoryParentCategories[0]?.id || null);
  };

  const openSoftwareWizard = () => {
    resetSoftwareWizard();
    setSoftwareModalMode("create");
    setSoftwareModalOpen(true);
  };

  const resetAdvisoryWizard = () => {
    setAdvisoryForm(createInitialAdvisoryForm());
    setAdvisoryImages([]);
    setExistingAdvisoryImages([]);
    setAdvisoryStep(1);
    setAdvisoryModalMode("create");
    setEditingAdvisoryId(null);
    setSelectedAdvisoryWizardParentId(advisoryParentCategories[0]?.id || null);
  };

  const openAdvisoryWizard = () => {
    resetAdvisoryWizard();
    setAdvisoryModalMode("create");
    setAdvisoryModalOpen(true);
  };

  const resetArticleWizard = () => {
    setArticleForm(createInitialArticleForm());
    setArticleImage(null);
    setExistingArticleImage("");
    setArticleStep(1);
    setArticleModalMode("create");
    setEditingArticleId(null);
  };

  const openArticleWizard = () => {
    resetArticleWizard();
    setArticleModalMode("create");
    setArticleModalOpen(true);
  };

  const fillSoftwareForm = (software: SoftwareDetail) => {
    const programType = programCategories.find((category) => category.id === software.program_type.id);

    setSoftwareForm({
      name: software.name,
      development_start_year: software.development_start_year,
      program_type_id: software.program_type.id,
      advisory_sector_ids: software.advisory_sectors.map((sector) => sector.id),
      price: software.price,
      price_type: software.price_type,
      introduction: software.introduction,
      description: software.description,
    });
    setSoftwareImages([]);
    setExistingSoftwareImages(software.images);
    setSoftwareStep(1);
    setSelectedProgramParentId(programType?.parent_id || programType?.id || programParentCategories[0]?.id || null);
    setSelectedSectorParentId(software.advisory_sectors[0]?.id ? advisoryCategories.find((category) => category.id === software.advisory_sectors[0].id)?.parent_id || advisoryParentCategories[0]?.id || null : advisoryParentCategories[0]?.id || null);
  };

  const openEditSoftwareWizard = async (softwareId: number) => {
    setSoftwareEditorLoading(true);
    try {
      const software = await getSoftwareDetail(softwareId);
      fillSoftwareForm(software);
      setSoftwareModalMode("edit");
      setEditingSoftwareId(softwareId);
      setSoftwareModalOpen(true);
    } catch (error) {
      showToast((error as Error).message, "error");
    } finally {
      setSoftwareEditorLoading(false);
    }
  };

  const fillAdvisoryForm = (advisory: AdvisoryDetail) => {
    setAdvisoryForm({
      title: advisory.title,
      service_type: advisory.service_type,
      advisory_sector_ids: advisory.advisory_sectors.map((sector) => sector.id),
      service_start_year: advisory.service_start_year,
      introduction: advisory.introduction,
      description: advisory.description,
      price_terms: advisory.price_terms,
      price: advisory.price,
      client_organizations: advisory.client_organizations,
    });
    setAdvisoryImages([]);
    setExistingAdvisoryImages(advisory.images);
    setAdvisoryStep(1);
    setSelectedAdvisoryWizardParentId(
      advisory.advisory_sectors[0]?.id
        ? advisoryCategories.find((category) => category.id === advisory.advisory_sectors[0].id)?.parent_id || advisoryParentCategories[0]?.id || null
        : advisoryParentCategories[0]?.id || null,
    );
  };

  const openEditAdvisoryWizard = async (advisoryId: number) => {
    setAdvisoryEditorLoading(true);
    try {
      const advisory = await getAdvisoryDetail(advisoryId);
      fillAdvisoryForm(advisory);
      setAdvisoryModalMode("edit");
      setEditingAdvisoryId(advisoryId);
      setAdvisoryModalOpen(true);
    } catch (error) {
      showToast((error as Error).message, "error");
    } finally {
      setAdvisoryEditorLoading(false);
    }
  };

  const fillArticleForm = (article: ArticleDetail) => {
    setArticleForm({
      title: article.title,
      article_type_id: article.article_type.id,
      published_date: article.published_date,
      description: article.description,
    });
    setArticleImage(null);
    setExistingArticleImage(article.image_url || article.thumbnail_url);
    setArticleStep(1);
  };

  const openEditArticleWizard = async (articleId: number) => {
    setArticleEditorLoading(true);
    try {
      const article = await getArticleDetail(articleId);
      fillArticleForm(article);
      setArticleModalMode("edit");
      setEditingArticleId(articleId);
      setArticleModalOpen(true);
    } catch (error) {
      showToast((error as Error).message, "error");
    } finally {
      setArticleEditorLoading(false);
    }
  };

  const closeSoftwareWizard = () => {
    setSoftwareModalOpen(false);
    resetSoftwareWizard();
  };

  const closeAdvisoryWizard = () => {
    setAdvisoryModalOpen(false);
    resetAdvisoryWizard();
  };

  const closeArticleWizard = () => {
    setArticleModalOpen(false);
    resetArticleWizard();
  };

  const goToNextSoftwareStep = () => {
    if (softwareStep === 1) {
      if (!softwareForm.name.trim()) {
        showToast("Програмын нэр оруулна уу.", "error");
        return;
      }
    }
    if (softwareStep === 2) {
      if (!softwareForm.program_type_id) {
        showToast("Програмын төрөл сонгоно уу.", "error");
        return;
      }
    }
    if (softwareStep === 3 && !softwareForm.advisory_sector_ids.length) {
      showToast("Дэд салбараас дор хаяж нэгийг сонгоно уу.", "error");
      return;
    }
    setSoftwareStep((current) => (current < 4 ? ((current + 1) as SoftwareModalStep) : current));
  };

  const goToPrevSoftwareStep = () => {
    setSoftwareStep((current) => (current > 1 ? ((current - 1) as SoftwareModalStep) : current));
  };

  const goToNextAdvisoryStep = () => {
    if (advisoryStep === 1) {
      if (!advisoryForm.title.trim()) {
        showToast("Зөвлөх үйлчилгээний нэр оруулна уу.", "error");
        return;
      }
      if (!advisoryForm.service_type) {
        showToast("Үйлчилгээний төрөл сонгоно уу.", "error");
        return;
      }
      if (!advisoryForm.price_terms) {
        showToast("Үнийн нөхцөл сонгоно уу.", "error");
        return;
      }
    }
    if (advisoryStep === 3 && !advisoryForm.advisory_sector_ids.length) {
      showToast("Дэд салбараас дор хаяж нэгийг сонгоно уу.", "error");
      return;
    }
    setAdvisoryStep((current) => (current < 3 ? ((current + 1) as AdvisoryModalStep) : current));
  };

  const goToPrevAdvisoryStep = () => {
    setAdvisoryStep((current) => (current > 1 ? ((current - 1) as AdvisoryModalStep) : current));
  };

  const goToNextArticleStep = () => {
    if (articleStep === 1) {
      if (!articleForm.title.trim()) {
        showToast("Нийтлэлийн гарчиг оруулна уу.", "error");
        return;
      }
      if (!articleForm.article_type_id) {
        showToast("Нийтлэлийн төрөл сонгоно уу.", "error");
        return;
      }
    }
    setArticleStep((current) => (current < 2 ? ((current + 1) as ArticleModalStep) : current));
  };

  const goToPrevArticleStep = () => {
    setArticleStep((current) => (current > 1 ? ((current - 1) as ArticleModalStep) : current));
  };

  const handleSoftwareImagePick = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setSoftwareImages((current) => [...current, ...files]);
    event.target.value = "";
  };

  const removeSelectedSoftwareImage = (indexToRemove: number) => {
    setSoftwareImages((current) => current.filter((_, index) => index !== indexToRemove));
  };

  const handleAdvisoryImagePick = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setAdvisoryImages((current) => [...current, ...files]);
    event.target.value = "";
  };

  const removeSelectedAdvisoryImage = (indexToRemove: number) => {
    setAdvisoryImages((current) => current.filter((_, index) => index !== indexToRemove));
  };

  const handleArticleImagePick = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setArticleImage(file);
    event.target.value = "";
  };

  const removeSelectedArticleImage = () => {
    setArticleImage(null);
  };

  const submitSoftware = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSoftwareSubmitting(true);

    try {
      const payload = {
        ...softwareForm,
        price: softwareForm.price || "0",
      };
      if (softwareModalMode === "edit" && editingSoftwareId) {
        const response = await updateSoftware(editingSoftwareId, payload, softwareImages);
        setOwnSoftwares((current) => current.map((item) => (item.id === editingSoftwareId ? response.software : item)));
        showToast("Програм амжилттай шинэчлэгдлээ.");
      } else {
        const response = await createSoftware(payload, softwareImages);
        setOwnSoftwares((current) => [response.software, ...current]);
        showToast("Програм хангамж амжилттай нэмэгдлээ.");
      }
      closeSoftwareWizard();
    } catch (error) {
      showToast((error as Error).message, "error");
    } finally {
      setSoftwareSubmitting(false);
    }
  };

  const submitAdvisory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAdvisorySubmitting(true);

    try {
      const payload = {
        ...advisoryForm,
        price: advisoryForm.price || "0",
      };
      if (advisoryModalMode === "edit" && editingAdvisoryId) {
        const response = await updateAdvisory(editingAdvisoryId, payload, advisoryImages);
        setOwnAdvisories((current) => current.map((item) => (item.id === editingAdvisoryId ? response.advisory : item)));
        showToast("Зөвлөх үйлчилгээ амжилттай шинэчлэгдлээ.");
      } else {
        const response = await createAdvisory(payload, advisoryImages);
        setOwnAdvisories((current) => [response.advisory, ...current]);
        showToast("Зөвлөх үйлчилгээ амжилттай нэмэгдлээ.");
      }
      closeAdvisoryWizard();
    } catch (error) {
      showToast((error as Error).message, "error");
    } finally {
      setAdvisorySubmitting(false);
    }
  };

  const submitArticle = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (articleModalMode === "create" && !articleImage) {
      showToast("Нийтлэлийн зураг сонгоно уу.", "error");
      return;
    }
    setArticleSubmitting(true);

    try {
      if (articleModalMode === "edit" && editingArticleId) {
        const response = await updateArticle(editingArticleId, articleForm, articleImage);
        setOwnArticles((current) => current.map((item) => (item.id === editingArticleId ? response.article : item)));
        showToast("Нийтлэл амжилттай шинэчлэгдлээ.");
      } else {
        const response = await createArticle(articleForm, articleImage);
        setOwnArticles((current) => [response.article, ...current]);
        showToast("Нийтлэл амжилттай нэмэгдлээ.");
      }
      closeArticleWizard();
    } catch (error) {
      showToast((error as Error).message, "error");
    } finally {
      setArticleSubmitting(false);
    }
  };

  const handleDeleteSoftware = async (softwareId: number) => {
    if (!window.confirm("Энэ програмыг устгах уу?")) return;

    try {
      await deleteSoftware(softwareId);
      setOwnSoftwares((current) => current.filter((item) => item.id !== softwareId));
      showToast("Програм устгагдлаа.");
    } catch (error) {
      showToast((error as Error).message, "error");
    }
  };

  const handleDeleteAdvisory = async (advisoryId: number) => {
    if (!window.confirm("Энэ зөвлөх үйлчилгээг устгах уу?")) return;

    try {
      await deleteAdvisory(advisoryId);
      setOwnAdvisories((current) => current.filter((item) => item.id !== advisoryId));
      showToast("Зөвлөх үйлчилгээ устгагдлаа.");
    } catch (error) {
      showToast((error as Error).message, "error");
    }
  };

  const handleDeleteArticle = async (articleId: number) => {
    if (!window.confirm("Энэ нийтлэлийг устгах уу?")) return;

    try {
      await deleteArticle(articleId);
      setOwnArticles((current) => current.filter((item) => item.id !== articleId));
      showToast("Нийтлэл устгагдлаа.");
    } catch (error) {
      showToast((error as Error).message, "error");
    }
  };

  const renderSoftwareWizardStep = () => {
    if (softwareStep === 1) {
      return (
        <div className="profile-software-grid">
          <label className="profile-edit-field">
            <span>Програмын нэр</span>
            <input
              value={softwareForm.name}
              onChange={(e) => setSoftwareForm({ ...softwareForm, name: e.target.value })}
              required
            />
          </label>

          <label className="profile-edit-field">
            <span>Эхэлсэн он</span>
            <input
              type="number"
              min="1900"
              max="2100"
              value={softwareForm.development_start_year}
              onChange={(e) => setSoftwareForm({ ...softwareForm, development_start_year: Number(e.target.value) })}
              required
            />
          </label>

          <label className="profile-edit-field">
            <span>Үнийн төрөл</span>
            <select
              value={softwareForm.price_type}
              onChange={(e) => setSoftwareForm({ ...softwareForm, price_type: e.target.value as "rent" | "sale" })}
            >
              <option value="sale">Худалдаа</option>
              <option value="rent">Түрээс</option>
            </select>
          </label>

          <label className="profile-edit-field">
            <span>Үнэ</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={softwareForm.price}
              onChange={(e) => setSoftwareForm({ ...softwareForm, price: e.target.value })}
            />
          </label>

          <label className="profile-edit-field profile-edit-field-full">
            <span>Товч танилцуулга</span>
            <textarea
              rows={3}
              value={softwareForm.introduction}
              onChange={(e) => setSoftwareForm({ ...softwareForm, introduction: e.target.value })}
            />
          </label>

          <SimpleRichTextEditor
            label="Дэлгэрэнгүй тайлбар"
            rows={7}
            value={softwareForm.description}
            onChange={(value) => setSoftwareForm({ ...softwareForm, description: value })}
          />
        </div>
      );
    }

    if (softwareStep === 2) {
      return (
        <div className="profile-software-sector-step">
          <div className="profile-sector-parent-list">
            {programParentCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={`profile-sector-parent-button ${selectedProgramParentId === category.id ? "is-active" : ""}`}
                onClick={() => {
                  const firstChild = programCategories.find((item) => item.parent_id === category.id);
                  setSelectedProgramParentId(category.id);
                  setSoftwareForm({ ...softwareForm, program_type_id: firstChild ? 0 : category.id });
                }}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className="profile-software-sector-box">
            <div className="profile-software-empty">Зөвхөн нэг төрлийг сонгоно.</div>
            {programChildCategories.length ? (
              programChildCategories.map((category) => (
                <label className="profile-sector-option" key={category.id}>
                  <input
                    type="radio"
                    name="program_type_id"
                    checked={softwareForm.program_type_id === category.id}
                    onChange={() => setSoftwareForm({ ...softwareForm, program_type_id: category.id })}
                  />
                  <span>{category.name}</span>
                </label>
              ))
            ) : selectedProgramParentId ? (
              <label className="profile-sector-option">
                <input
                  type="radio"
                  name="program_type_id"
                  checked={softwareForm.program_type_id === selectedProgramParentId}
                  onChange={() => setSoftwareForm({ ...softwareForm, program_type_id: selectedProgramParentId })}
                />
                <span>{programParentCategories.find((category) => category.id === selectedProgramParentId)?.name}</span>
              </label>
            ) : (
              <div className="profile-software-empty">Програмын төрөл алга.</div>
            )}
          </div>
        </div>
      );
    }

    if (softwareStep === 3) {
      return (
        <div className="profile-software-sector-step">
          <div className="profile-sector-parent-list">
            {advisoryParentCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={`profile-sector-parent-button ${selectedSectorParentId === category.id ? "is-active" : ""}`}
                onClick={() => setSelectedSectorParentId(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className="profile-software-sector-box">
            {advisoryChildCategories.length ? (
              advisoryChildCategories.map((category) => {
                const checked = softwareForm.advisory_sector_ids.includes(category.id);
                return (
                  <label className="profile-sector-option" key={category.id}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        setSoftwareForm({
                          ...softwareForm,
                          advisory_sector_ids: e.target.checked
                            ? [...softwareForm.advisory_sector_ids, category.id]
                            : softwareForm.advisory_sector_ids.filter((item) => item !== category.id),
                        });
                      }}
                    />
                    <span>{category.name}</span>
                  </label>
                );
              })
            ) : (
              <div className="profile-software-empty">Сонгосон үндсэн салбарт дэд салбар алга.</div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="profile-software-image-step">
        <input
          ref={softwareImageInputRef}
          className="profile-logo-input"
          type="file"
          accept="image/*"
          multiple
          onChange={handleSoftwareImagePick}
        />
        <button
          type="button"
          className="profile-software-upload-trigger"
          onClick={() => softwareImageInputRef.current?.click()}
        >
          Зураг нэмэх
        </button>

        {softwareImagePreviews.length ? (
          <div className="profile-software-image-grid">
            {softwareImagePreviews.map((preview, index) => (
              <div className="profile-software-image-card" key={`${preview.name}-${preview.url}`}>
                <button
                  type="button"
                  className="profile-software-image-remove"
                  onClick={() => removeSelectedSoftwareImage(index)}
                  aria-label={`${preview.name} зургийг хасах`}
                  title="Зургийг хасах"
                >
                  x
                </button>
                <img src={preview.url} alt={preview.name} />
                <span>{preview.name}</span>
              </div>
            ))}
          </div>
        ) : existingSoftwareImages.length ? (
          <div className="profile-software-image-grid">
            {existingSoftwareImages.map((imageUrl, index) => (
              <div className="profile-software-image-card" key={`${imageUrl}-${index}`}>
                <img src={imageUrl} alt={`Software image ${index + 1}`} />
                <span>Одоогийн зураг {index + 1}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="profile-software-empty">Одоогоор зураг сонгоогүй байна.</div>
        )}
        {softwareModalMode === "edit" ? (
          <div className="profile-software-empty">Шинэ зураг сонговол хуучин зургууд солигдоно.</div>
        ) : null}
      </div>
    );
  };

  const renderSoftwareTab = () => (
    <div className="profile-software-panel">
      <div className="profile-software-intro">
        <div className="profile-software-intro-actions">
          <button className="profile-action-button profile-software-toggle" type="button" onClick={openSoftwareWizard}>
            Шинээр нэмэх
          </button>
        </div>
      </div>

      <div className="profile-software-list-block">
        {softwareLoading ? (
          <div className="profile-software-empty">Програмын мэдээлэл уншиж байна...</div>
        ) : ownSoftwares.length ? (
          <div className="profile-software-list">
            {ownSoftwares.map((software) => (
              <article className="profile-software-card" key={software.id}>
                <div className="profile-software-card-top">
                  <span className="profile-software-card-type">{software.program_type.name}</span>
                  <span className="profile-software-card-price">
                    {software.price} / {software.price_type === "sale" ? "Худалдаа" : "Түрээс"}
                  </span>
                </div>
                <p>{getApprovalLabel(software.is_approved)}</p>
                <h4>{software.name}</h4>
                <p>{stripRichText(software.introduction) || "Товч танилцуулга оруулаагүй байна."}</p>
                <div className="profile-software-card-meta">
                  <span>
                    {software.advisory_sectors.length
                      ? software.advisory_sectors.map((sector) => sector.name).join(", ")
                      : "Салбар сонгоогүй"}
                  </span>
                  <div className="profile-software-card-actions">
                    <button
                      type="button"
                      className="profile-software-icon-button"
                      onClick={() => openEditSoftwareWizard(software.id)}
                      disabled={softwareEditorLoading}
                      aria-label="Засах"
                      title="Засах"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm14.71-9.04a1 1 0 0 0 0-1.41l-2.5-2.5a1 1 0 0 0-1.41 0l-1.09 1.09 3.75 3.75 1.25-1.13z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="profile-software-icon-button is-danger"
                      onClick={() => handleDeleteSoftware(software.id)}
                      aria-label="Устгах"
                      title="Устгах"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v8h-2V9zm4 0h2v8h-2V9zM7 9h2v8H7V9zm-1 11h12a2 2 0 0 0 2-2V8H4v10a2 2 0 0 0 2 2z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                    <Link to={`/softwares/${software.id}`}>Дэлгэрэнгүй</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="profile-software-empty">Одоогоор програм оруулаагүй байна.</div>
        )}
      </div>
    </div>
  );

  const renderAdvisoryWizardStep = () => {
    const advisoryWizardChildCategories = selectedAdvisoryWizardParentId
      ? advisoryCategories.filter((category) => category.parent_id === selectedAdvisoryWizardParentId)
      : [];

    if (advisoryStep === 1) {
      return (
        <div className="profile-software-grid">
          <label className="profile-edit-field">
            <span>Зөвлөх үйлчилгээний нэр</span>
            <input
              value={advisoryForm.title}
              onChange={(e) => setAdvisoryForm({ ...advisoryForm, title: e.target.value })}
              required
            />
          </label>

          <label className="profile-edit-field">
            <span>Үйлчилгээний төрөл</span>
            <select
              value={advisoryForm.service_type}
              onChange={(e) => setAdvisoryForm({ ...advisoryForm, service_type: e.target.value })}
            >
              <option value="">Сонгох</option>
              {advisoryFacets.service_types.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>

          <label className="profile-edit-field">
            <span>Үнийн нөхцөл</span>
            <select
              value={advisoryForm.price_terms}
              onChange={(e) => setAdvisoryForm({ ...advisoryForm, price_terms: e.target.value })}
            >
              <option value="">Сонгох</option>
              {advisoryFacets.price_terms.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>

          <label className="profile-edit-field">
            <span>Эхэлсэн он</span>
            <input
              type="number"
              min="1900"
              max="2100"
              value={advisoryForm.service_start_year}
              onChange={(e) => setAdvisoryForm({ ...advisoryForm, service_start_year: Number(e.target.value) })}
              required
            />
          </label>

          <label className="profile-edit-field">
            <span>Үнэ</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={advisoryForm.price}
              onChange={(e) => setAdvisoryForm({ ...advisoryForm, price: e.target.value })}
            />
          </label>

          <label className="profile-edit-field profile-edit-field-full">
            <span>Товч танилцуулга</span>
            <textarea
              rows={3}
              value={advisoryForm.introduction}
              onChange={(e) => setAdvisoryForm({ ...advisoryForm, introduction: e.target.value })}
            />
          </label>

          <SimpleRichTextEditor
            label="Дэлгэрэнгүй тайлбар"
            rows={7}
            value={advisoryForm.description}
            onChange={(value) => setAdvisoryForm({ ...advisoryForm, description: value })}
          />

          <label className="profile-edit-field profile-edit-field-full">
            <span>Үйлчилгээ авсан байгууллагууд</span>
            <textarea
              rows={3}
              value={advisoryForm.client_organizations}
              onChange={(e) => setAdvisoryForm({ ...advisoryForm, client_organizations: e.target.value })}
            />
          </label>
        </div>
      );
    }

    if (advisoryStep === 2) {
      return (
        <div className="profile-software-sector-step">
          <div className="profile-sector-parent-list">
            {advisoryParentCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={`profile-sector-parent-button ${selectedAdvisoryWizardParentId === category.id ? "is-active" : ""}`}
                onClick={() => setSelectedAdvisoryWizardParentId(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className="profile-software-sector-box">
            {advisoryWizardChildCategories.length ? (
              advisoryWizardChildCategories.map((category) => {
                const checked = advisoryForm.advisory_sector_ids.includes(category.id);
                return (
                  <label className="profile-sector-option" key={category.id}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        setAdvisoryForm({
                          ...advisoryForm,
                          advisory_sector_ids: e.target.checked
                            ? [...advisoryForm.advisory_sector_ids, category.id]
                            : advisoryForm.advisory_sector_ids.filter((item) => item !== category.id),
                        });
                      }}
                    />
                    <span>{category.name}</span>
                  </label>
                );
              })
            ) : (
              <div className="profile-software-empty">Сонгосон үндсэн салбарт дэд салбар алга.</div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="profile-software-image-step">
        <input
          ref={advisoryImageInputRef}
          className="profile-logo-input"
          type="file"
          accept="image/*"
          multiple
          onChange={handleAdvisoryImagePick}
        />
        <button
          type="button"
          className="profile-software-upload-trigger"
          onClick={() => advisoryImageInputRef.current?.click()}
        >
          Зураг нэмэх
        </button>

        {advisoryImagePreviews.length ? (
          <div className="profile-software-image-grid">
            {advisoryImagePreviews.map((preview, index) => (
              <div className="profile-software-image-card" key={`${preview.name}-${preview.url}`}>
                <button
                  type="button"
                  className="profile-software-image-remove"
                  onClick={() => removeSelectedAdvisoryImage(index)}
                  aria-label={`${preview.name} зургийг хасах`}
                  title="Зургийг хасах"
                >
                  x
                </button>
                <img src={preview.url} alt={preview.name} />
                <span>{preview.name}</span>
              </div>
            ))}
          </div>
        ) : existingAdvisoryImages.length ? (
          <div className="profile-software-image-grid">
            {existingAdvisoryImages.map((imageUrl, index) => (
              <div className="profile-software-image-card" key={`${imageUrl}-${index}`}>
                <img src={imageUrl} alt={`Advisory image ${index + 1}`} />
                <span>Одоогийн зураг {index + 1}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="profile-software-empty">Одоогоор зураг сонгоогүй байна.</div>
        )}
        {advisoryModalMode === "edit" ? (
          <div className="profile-software-empty">Шинэ зураг сонговол хуучин зургууд солигдоно.</div>
        ) : null}
      </div>
    );
  };

  const renderAdvisoryTab = () => (
    <div className="profile-software-panel">
      <div className="profile-software-intro">
        <div className="profile-software-intro-actions">
          <button className="profile-action-button profile-software-toggle" type="button" onClick={openAdvisoryWizard}>
            Шинээр нэмэх
          </button>
        </div>
      </div>

      <div className="profile-software-list-block">
        {advisoryLoading ? (
          <div className="profile-software-empty">Зөвлөх үйлчилгээний мэдээлэл уншиж байна...</div>
        ) : ownAdvisories.length ? (
          <div className="profile-software-list">
            {ownAdvisories.map((advisory) => (
              <article className="profile-software-card" key={advisory.id}>
                <div className="profile-software-card-top">
                  <span className="profile-software-card-type">{advisory.service_type_value || advisory.service_type}</span>
                  <span className="profile-software-card-price">
                    {advisory.price} / {advisory.price_terms}
                  </span>
                </div>
                <p>{getApprovalLabel(advisory.is_approved)}</p>
                <h4>{advisory.title}</h4>
                <p>{stripRichText(advisory.introduction) || "Товч танилцуулга оруулаагүй байна."}</p>
                <div className="profile-software-card-meta">
                  <span>
                    {advisory.advisory_sectors.length
                      ? advisory.advisory_sectors.map((sector) => sector.name).join(", ")
                      : "Салбар сонгоогүй"}
                  </span>
                  <div className="profile-software-card-actions">
                    <button
                      type="button"
                      className="profile-software-icon-button"
                      onClick={() => openEditAdvisoryWizard(advisory.id)}
                      disabled={advisoryEditorLoading}
                      aria-label="Засах"
                      title="Засах"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm14.71-9.04a1 1 0 0 0 0-1.41l-2.5-2.5a1 1 0 0 0-1.41 0l-1.09 1.09 3.75 3.75 1.25-1.13z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="profile-software-icon-button is-danger"
                      onClick={() => handleDeleteAdvisory(advisory.id)}
                      aria-label="Устгах"
                      title="Устгах"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v8h-2V9zm4 0h2v8h-2V9zM7 9h2v8H7V9zm-1 11h12a2 2 0 0 0 2-2V8H4v10a2 2 0 0 0 2 2z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                    <Link to={`/advisories/${advisory.id}`}>Дэлгэрэнгүй</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="profile-software-empty">Одоогоор зөвлөх үйлчилгээ оруулаагүй байна.</div>
        )}
      </div>
    </div>
  );

  const renderArticleWizardStep = () => {
    if (articleStep === 1) {
      return (
        <div className="profile-software-grid">
          <label className="profile-edit-field">
            <span>Нийтлэлийн гарчиг</span>
            <input
              value={articleForm.title}
              onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
              required
            />
          </label>

          <label className="profile-edit-field">
            <span>Нийтлэлийн төрөл</span>
            <select
              value={articleForm.article_type_id}
              onChange={(e) => setArticleForm({ ...articleForm, article_type_id: Number(e.target.value) })}
            >
              <option value={0}>Сонгох</option>
              {articleCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <SimpleRichTextEditor
            label="Дэлгэрэнгүй тайлбар"
            rows={8}
            value={articleForm.description}
            onChange={(value) => setArticleForm({ ...articleForm, description: value })}
          />
        </div>
      );
    }

    return (
      <div className="profile-software-image-step">
        <input
          ref={articleImageInputRef}
          className="profile-logo-input"
          type="file"
          accept="image/*"
          onChange={handleArticleImagePick}
        />
        <button
          type="button"
          className="profile-software-upload-trigger"
          onClick={() => articleImageInputRef.current?.click()}
        >
          Зураг нэмэх
        </button>

        {articleImagePreview ? (
          <div className="profile-software-image-grid">
            <div className="profile-software-image-card" key={articleImagePreview.url}>
              <button
                type="button"
                className="profile-software-image-remove"
                onClick={removeSelectedArticleImage}
                aria-label={`${articleImagePreview.name} зургийг хасах`}
                title="Зургийг хасах"
              >
                x
              </button>
              <img src={articleImagePreview.url} alt={articleImagePreview.name} />
              <span>{articleImagePreview.name}</span>
            </div>
          </div>
        ) : existingArticleImage ? (
          <div className="profile-software-image-grid">
            <div className="profile-software-image-card">
              <img src={existingArticleImage} alt="Article image" />
              <span>Одоогийн зураг</span>
            </div>
          </div>
        ) : (
          <div className="profile-software-empty">Одоогоор зураг сонгоогүй байна.</div>
        )}
        {articleModalMode === "edit" ? (
          <div className="profile-software-empty">Шинэ зураг сонговол хуучин зураг солигдоно.</div>
        ) : null}
      </div>
    );
  };

  const renderArticleTab = () => (
    <div className="profile-software-panel">
      <div className="profile-software-intro">
        <div className="profile-software-intro-actions">
          <button className="profile-action-button profile-software-toggle" type="button" onClick={openArticleWizard}>
            Шинээр нэмэх
          </button>
        </div>
      </div>

      <div className="profile-software-list-block">
        {articleLoading ? (
          <div className="profile-software-empty">Нийтлэлийн мэдээлэл уншиж байна...</div>
        ) : ownArticles.length ? (
          <div className="profile-software-list">
            {ownArticles.map((article) => (
              <article className="profile-software-card" key={article.id}>
                <div className="profile-software-card-top">
                  <span className="profile-software-card-type">{article.article_type.name}</span>
                  <span className="profile-software-card-price">{article.published_date}</span>
                </div>
                <p>{getApprovalLabel(article.is_approved)}</p>
                <h4>{article.title}</h4>
                <p>{stripRichText(article.description) || "Тайлбар оруулаагүй байна."}</p>
                <div className="profile-software-card-meta">
                  <span>{article.organization.name}</span>
                  <div className="profile-software-card-actions">
                    <button
                      type="button"
                      className="profile-software-icon-button"
                      onClick={() => openEditArticleWizard(article.id)}
                      disabled={articleEditorLoading}
                      aria-label="Засах"
                      title="Засах"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm14.71-9.04a1 1 0 0 0 0-1.41l-2.5-2.5a1 1 0 0 0-1.41 0l-1.09 1.09 3.75 3.75 1.25-1.13z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="profile-software-icon-button is-danger"
                      onClick={() => handleDeleteArticle(article.id)}
                      aria-label="Устгах"
                      title="Устгах"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v8h-2V9zm4 0h2v8h-2V9zM7 9h2v8H7V9zm-1 11h12a2 2 0 0 0 2-2V8H4v10a2 2 0 0 0 2 2z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                    <Link to={`/articles/${article.id}`}>Дэлгэрэнгүй</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="profile-software-empty">Одоогоор нийтлэл оруулаагүй байна.</div>
        )}
      </div>
    </div>
  );

   const isPerson = profile.account_type === "person";
   if (isPerson) {
    const personalNav = [
      ["overview", "●", "Миний профайл"],
      ["savedSoftware", "▣", "Хадгалсан програм хангамж"],
      ["savedAdvisory", "▤", "Хадгалсан зөвлөх үйлчилгээ"],
      ["savedArticle", "□", "Хадгалсан нийтлэл"],
      ["reviews", "★", "Миний үнэлгээ, сэтгэгдэл"],
      ["settings", "⚙", "Тохиргоо"],
    ];
    const savedTitle = activeTab === "savedSoftware" ? "Хадгалсан програм хангамж" : activeTab === "savedAdvisory" ? "Хадгалсан зөвлөх үйлчилгээ" : "Хадгалсан нийтлэл";
    const savedItems: any[] = activeTab === "savedSoftware" ? savedSoftwares : activeTab === "savedAdvisory" ? savedAdvisories : savedArticles;
    return (
      <section className="login-page profile-page">
        <div className="container">
          <div className="profile-account-header">
            <button className="profile-account-avatar" type="button" onClick={() => fileInputRef.current?.click()}>
              {profile.logo_url ? <img src={profile.logo_url} alt="Profile" /> : <span>{(profile.name || "D").slice(0, 1)}</span>}
              <i aria-hidden="true">✎</i>
            </button>
            <div className="profile-account-identity">
              <span className="profile-account-kicker">ХУВИЙН ПРОФАЙЛ</span>
              <h1>{profile.name || "Хэрэглэгч"}</h1>
              <p>{profile.email || "Имэйл оруулаагүй"}</p>
            </div>
            <button type="button" className="profile-account-edit" onClick={() => setModalMode("profile")}>Профайл засах</button>
          </div>
          <div className="profile-shell">
          <aside className="profile-sidebar"><div className="profile-card profile-sidebar-card">
            <div className="profile-sidebar-user">
              <button className="profile-avatar profile-avatar-button" type="button" onClick={() => fileInputRef.current?.click()}>
                {profile.logo_url ? <img src={profile.logo_url} alt="Profile" /> : <span className="profile-avatar-placeholder">{(profile.name || "D").slice(0,1)}</span>}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={(e) => { const f=e.target.files?.[0]; if(f) onLogoChange(f); e.currentTarget.value=""; }} />
              <div><strong>{profile.name}</strong><span>{profile.email}</span></div>
            </div>
            <nav className="profile-side-nav">
              {personalNav.map(([id, icon, label]) => <button key={id} type="button" className={`profile-side-nav-item ${activeTab===id?"active":""}`} onClick={() => setActiveTab(id)}><span className="profile-side-nav-icon">{icon}</span><span>{label}</span></button>)}
            </nav>
          </div></aside>
          <div className="profile-main"><div className="profile-card profile-card-main">
            {activeTab === "overview" ? <div className="profile-person-main">
              <div className="profile-section-heading"><div><h2>Миний профайл</h2><p>Хувийн мэдээллээ харах болон шинэчлэх</p></div><button type="button" className="login-submit" style={{width:"auto"}} onClick={()=>setModalMode("profile")}>Мэдээлэл засах</button></div>
              <div className="profile-person-summary"><div className="profile-person-summary-card"><span>НЭР</span><strong>{profile.name||"-"}</strong></div><div className="profile-person-summary-card"><span>ИМЭЙЛ</span><strong>{profile.email||"-"}</strong></div><div className="profile-person-summary-card"><span>УТАС</span><strong>{profile.phone||"-"}</strong></div></div>
            </div> : activeTab.startsWith("saved") ? <div className="profile-person-main"><div className="profile-section-heading"><div><h2>{savedTitle}</h2><p>Таны дараа үзэхээр хадгалсан мэдээллүүд</p></div></div>
              {savedLoading ? <div className="profile-empty-state">Уншиж байна...</div> : savedItems.length===0 ? <div className="profile-empty-state">Одоогоор хадгалсан зүйл байхгүй байна.</div> : <div className="profile-saved-grid">{savedItems.map((item:any) => {
                const name=item.name||item.title; const img=item.thumbnail_url||item.image_url||""; const route=activeTab==="savedSoftware"?`/softwares/${item.id}`:activeTab==="savedAdvisory"?`/advisories/${item.id}`:`/articles/${item.id}`; const kind=activeTab==="savedSoftware"?"Програм хангамж":activeTab==="savedAdvisory"?"Зөвлөх үйлчилгээ":"Нийтлэл";
                return <article className="profile-saved-card" key={item.id}><div className="profile-saved-thumb">{img?<img src={img} alt={name}/>:<div className="profile-saved-thumb-empty">{name?.charAt(0)}</div>}</div><div className="profile-saved-body"><div><span className="profile-saved-kind">{kind}</span><h3>{name}</h3></div><div className="profile-saved-actions"><Link to={route}>Дэлгэрэнгүй</Link><button type="button" onClick={async()=>{if(activeTab==="savedSoftware"){await unsaveSoftware(item.id);setSavedSoftwares(x=>x.filter(v=>v.id!==item.id));}else if(activeTab==="savedAdvisory"){await unsaveAdvisory(item.id);setSavedAdvisories(x=>x.filter(v=>v.id!==item.id));}else{await unsaveArticle(item.id);setSavedArticles(x=>x.filter(v=>v.id!==item.id));}}}>Хасах</button></div></div></article>})}</div>}
            </div> : activeTab === "reviews" ? <div className="profile-reviews" style={{padding:28}}><h2>Миний үнэлгээ, сэтгэгдэл</h2>
              {ratingsLoading?<div className="profile-reviews-empty">Уншиж байна...</div>:myRatings.length===0?<div className="profile-reviews-empty">Одоогоор үнэлгээ, сэтгэгдэл байхгүй байна.</div>:<div className="profile-reviews-list">{myRatings.map(r=><div className="profile-review-item" key={`${r.type}-${r.id}`}><div className="profile-review-top"><div className="profile-review-company">{r.logo?<img src={r.logo} alt={r.name} className="profile-review-logo"/>:<div className="profile-review-logo profile-review-logo-empty">{r.name.charAt(0)}</div>}<div><h3>{r.name}</h3><span className="profile-review-type">{r.type==="software"?"Програм хангамж":"Зөвлөх үйлчилгээ"}</span></div></div><div className="profile-review-actions"><span>{"★".repeat(r.score)}{"☆".repeat(5-r.score)}</span><button type="button" onClick={()=>{setEditingRatingId(r.id);setEditingScore(r.score);setEditingComment(r.comment||"")}}>Засах</button><button type="button" className="profile-review-delete" onClick={async()=>{if(!confirm("Устгах уу?"))return;if(r.type==="software")await deleteSoftwareRating(r.item_id);else await deleteAdvisoryRating(r.item_id);setMyRatings(x=>x.filter(v=>!(v.type===r.type&&v.id===r.id)))}}>Устгах</button></div></div>
                {editingRatingId===r.id?<div className="profile-review-edit-form"><label><span>Үнэлгээ</span><select value={editingScore} onChange={e=>setEditingScore(Number(e.target.value))}>{[1,2,3,4,5].map(n=><option key={n}>{n}</option>)}</select></label><label><span>Сэтгэгдэл</span><textarea rows={3} value={editingComment} onChange={e=>setEditingComment(e.target.value)}/></label><div className="profile-review-edit-buttons"><button onClick={()=>setEditingRatingId(null)}>Болих</button><button onClick={async()=>{if(r.type==="software")await rateSoftware(r.item_id,editingScore,editingComment);else await rateAdvisory(r.item_id,editingScore,editingComment);setMyRatings(x=>x.map(v=>v.type===r.type&&v.id===r.id?{...v,score:editingScore,comment:editingComment}:v));setEditingRatingId(null)}}>Хадгалах</button></div></div>:<p className="profile-review-comment">{r.comment||"Сэтгэгдэл бичээгүй."}</p>}</div>)}</div>}
            </div> : <div className="profile-person-main"><div className="profile-section-heading"><div><h2>Тохиргоо</h2><p>Хувийн мэдээлэл болон нууц үгийн тохиргоо</p></div></div><div className="profile-settings-actions"><button className="login-submit" style={{width:"auto"}} onClick={()=>setModalMode("profile")}>Хувийн мэдээлэл засах</button><button className="profile-secondary-button" onClick={()=>setModalMode("password")}>Нууц үг солих</button></div></div>}
          </div></div>
        </div></div>
        {modalMode ? <div className="profile-modal-backdrop" onClick={()=>setModalMode(null)}><div className="profile-modal" onClick={e=>e.stopPropagation()}><div className="profile-modal-header"><h3>{modalMode==="profile"?"Хувийн мэдээлэл шинэчлэх":"Нууц үг солих"}</h3><button type="button" onClick={()=>setModalMode(null)}>×</button></div>
          {modalMode==="profile"?<form onSubmit={async e=>{if(await onProfileSubmit(e))setModalMode(null)}}><div className="profile-modal-body"><label>Нэр<input value={profile.name||""} onChange={e=>onProfileChange({...profile,name:e.target.value})}/></label><label>Имэйл<input type="email" value={profile.email||""} onChange={e=>onProfileChange({...profile,email:e.target.value})}/></label><label>Утас<input value={profile.phone||""} onChange={e=>onProfileChange({...profile,phone:e.target.value})}/></label></div><div className="profile-modal-actions"><button type="button" onClick={()=>setModalMode(null)}>Болих</button><button className="login-submit" disabled={loading}>{loading?"Хадгалж байна...":"Хадгалах"}</button></div></form>:<form onSubmit={async e=>{if(await onPasswordSubmit(e))setModalMode(null)}}><div className="profile-modal-body"><label>Одоогийн нууц үг<input name="current_password" type="password" required/></label><label>Шинэ нууц үг<input name="new_password" type="password" required/></label><label>Шинэ нууц үг давтах<input name="confirm_password" type="password" required/></label></div><div className="profile-modal-actions"><button type="button" onClick={()=>setModalMode(null)}>Болих</button><button className="login-submit" disabled={loading}>Нууц үг солих</button></div></form>}
        </div></div>:null}
      </section>
    );
   }

   return (
    
     <section className="login-page profile-page">
      <div className="container">
        <div className="profile-account-header">
          <button className="profile-account-avatar" type="button" onClick={() => fileInputRef.current?.click()}>
            {profile.logo_url ? <img src={profile.logo_url} alt="Logo" /> : <span>{(profile.name || "D").slice(0, 1)}</span>}
            <i aria-hidden="true">✎</i>
          </button>
          <div className="profile-account-identity">
            <span className="profile-account-kicker">БАЙГУУЛЛАГЫН ПРОФАЙЛ</span>
            <h1>{profile.name || "Байгууллага"}</h1>
            <p>{profile.email || "Имэйл оруулаагүй"}{profile.phone ? ` · ${profile.phone}` : ""}</p>
          </div>
          <button type="button" className="profile-account-edit" onClick={() => setModalMode("profile")}>Профайл засах</button>
        </div>
        <div className="profile-shell">
          <aside className="profile-sidebar">
  <div className="profile-card profile-sidebar-card">

    <div className="profile-sidebar-user">
      <button
        className="profile-avatar profile-avatar-button"
        type="button"
        onClick={() => fileInputRef.current?.click()}
      >
        {profile.logo_url ? (
          <img src={profile.logo_url} alt="Logo" />
        ) : (
          <span className="profile-avatar-placeholder">
            {(profile.name || "D").slice(0, 1)}
          </span>
        )}

        <span className="profile-avatar-edit" aria-hidden="true">
          <svg viewBox="0 0 24 24" role="img">
            <path
              d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25zm17.71-10.04a1.003 1.003 0 0 0 0-1.42l-2.5-2.5a1.003 1.003 0 0 0-1.42 0l-1.96 1.96 3.75 3.75 2.13-2.13z"
              fill="currentColor"
            />
          </svg>
        </span>
      </button>

      <input
        ref={fileInputRef}
        className="profile-logo-input"
        type="file"
        accept="image/*"
        onChange={handleLogoPick}
      />

      <h3>{profile.name}</h3>
      <p className="profile-role">{profile.email}</p>
    </div>

    <nav className="profile-side-nav">

      <button
        type="button"
        className="profile-side-nav-item profile-side-nav-profile"
        onClick={() => setModalMode("profile")}
      >
        <span className="profile-side-nav-icon">♙</span>
        <span>Байгууллагын профайл</span>
      </button>

      <button
        type="button"
        className={`profile-side-nav-item ${
          activeTab === "overview" ? "active" : ""
        }`}
        onClick={() => setActiveTab("overview")}
      >
        <span className="profile-side-nav-icon">▦</span>
        <span>Програм хангамж</span>
      </button>

      <button
        type="button"
        className={`profile-side-nav-item ${
          activeTab === "contact" ? "active" : ""
        }`}
        onClick={() => setActiveTab("contact")}
      >
        <span className="profile-side-nav-icon">◇</span>
        <span>Зөвлөх үйлчилгээ</span>
      </button>

      <button
        type="button"
        className={`profile-side-nav-item ${
          activeTab === "account" ? "active" : ""
        }`}
        onClick={() => setActiveTab("account")}
      >
        <span className="profile-side-nav-icon">▤</span>
        <span>Нийтлэл</span>
      </button>

      <button
  type="button"
  className={`profile-side-nav-item ${
    activeTab === "reviews" ? "active" : ""
  }`}
  onClick={() => setActiveTab("reviews")}
>
  <span className="profile-side-nav-icon">☆</span>
  <span>Миний үнэлгээ, сэтгэгдэл</span>
</button>

      <button
  type="button"
  className={`profile-side-nav-item ${
    activeTab === "payment" ? "active" : ""
  }`}
  onClick={() => setActiveTab("payment")}
>
  <span className="profile-side-nav-icon">▣</span>
  <span>Төлбөр</span>
</button>

      <button type="button" className="profile-side-nav-item" onClick={() => setModalMode("password")}>
        <span className="profile-side-nav-icon">⚙</span>
        <span>Тохиргоо</span>
      </button>
    </nav>
  </div>
</aside>

          <div className="profile-main">
  <div className="profile-card profile-card-main">

    {activeTab !== "overview" ? (
      <div className="profile-header">
        <h2>{activeTabItem.title}</h2>
      </div>
    ) : null}

    {activeTab === "overview" ? (
      renderSoftwareTab()
    ) : activeTab === "contact" ? (
      renderAdvisoryTab()
    ) : activeTab === "account" ? (
      renderArticleTab()
    ) : activeTab === "reviews" ? (
      <div className="profile-reviews">

        {ratingsLoading ? (
          <div className="profile-reviews-empty">
            Уншиж байна...
          </div>
        ) : myRatings.length === 0 ? (
          <div className="profile-reviews-empty">
            Одоогоор үнэлгээ, сэтгэгдэл байхгүй байна.
          </div>
        ) : (
          <div className="profile-reviews-list">

            {myRatings.map((rating) => (
              <div
                className="profile-review-item"
                key={`${rating.type}-${rating.id}`}
              >
                <div className="profile-review-top">
                 <div className="profile-review-company">
  {rating.logo ? (
    <img
      src={rating.logo}
      alt={rating.name}
      className="profile-review-logo"
    />
  ) : (
    <div className="profile-review-logo profile-review-logo-empty">
      {rating.name.charAt(0).toUpperCase()}
    </div>
  )}

  <div>
    <h3>{rating.name}</h3>

    <span className="profile-review-type">
      {rating.type === "software"
        ? "Програм хангамж"
        : "Зөвлөх үйлчилгээ"}
    </span>
  </div>
</div>

                  <div className="profile-review-actions">
                    <div className="profile-review-stars">
                      {"★".repeat(rating.score)}
                      <span>
                        {"★".repeat(5 - rating.score)}
                      </span>
                    </div>

                    <button
                   type="button"
                   className="profile-review-edit"
                   onClick={() => {
                   setEditingRatingId(rating.id);
                   setEditingScore(rating.score);
                    setEditingComment(rating.comment || "");
                  }}
                    >
                   Засах
                  </button>

                    <button
                      type="button"
                      className="profile-review-delete"
                      onClick={async () => {
                        if (
                          !window.confirm(
                            "Энэ үнэлгээ, сэтгэгдлийг устгах уу?"
                          )
                        ) {
                          return;
                        }

                        try {
                          if (rating.type === "software") {
                            await deleteSoftwareRating(rating.item_id);
                          } else {
                            await deleteAdvisoryRating(rating.item_id);
                          }

                          setMyRatings((current) =>
                            current.filter(
                              (item) =>
                                !(
                                  item.type === rating.type &&
                                  item.id === rating.id
                                )
                            )
                          );
                        } catch {
                          window.alert("Устгахад алдаа гарлаа.");
                        }
                      }}
                    >
                      Устгах
                    </button>
                  </div>
                </div>

                <div className="profile-review-date">
                  {new Date(
                    rating.update_date
                  ).toLocaleDateString("mn-MN")}
                </div>

                {editingRatingId === rating.id ? (
  <div className="profile-review-edit-form">
    <label>
      <span>Үнэлгээ</span>
      <select
        value={editingScore}
        onChange={(e) => setEditingScore(Number(e.target.value))}
      >
        <option value={1}>1</option>
        <option value={2}>2</option>
        <option value={3}>3</option>
        <option value={4}>4</option>
        <option value={5}>5</option>
      </select>
    </label>

    <label>
      <span>Сэтгэгдэл</span>
      <textarea
        value={editingComment}
        onChange={(e) => setEditingComment(e.target.value)}
        placeholder="Сэтгэгдлээ бичнэ үү..."
        rows={3}
      />
    </label>

  <div className="profile-review-edit-buttons">
  <button
    type="button"
    onClick={() => {
      setEditingRatingId(null);
      setEditingScore(0);
      setEditingComment("");
    }}
  >
    Болих
  </button>

  <button
    type="button"
    onClick={async () => {
      try {
        if (rating.type === "software") {
          await rateSoftware(
            rating.item_id,
            editingScore,
            editingComment
          );
        } else {
          await rateAdvisory(
            rating.item_id,
            editingScore,
            editingComment
          );
        }

        setMyRatings((current) =>
          current.map((item) =>
            item.type === rating.type && item.id === rating.id
              ? {
                  ...item,
                  score: editingScore,
                  comment: editingComment,
                  update_date: new Date().toISOString(),
                }
              : item
          )
        );

        setEditingRatingId(null);
        setEditingScore(0);
        setEditingComment("");
      } catch {
        window.alert(
          "Үнэлгээ, сэтгэгдэл хадгалахад алдаа гарлаа."
        );
      }
    }}
  >
    Хадгалах
  </button>
</div>
</div>

) : (
  <p className="profile-review-comment">
    {rating.comment || "Сэтгэгдэл бичээгүй."}
  </p>
)}
              </div>
            ))}

          </div>
        )}

           </div>
    ) : activeTab === "payment" ? (
      <div className="profile-payment-reference">
        <div className="profile-payment-titlebar">
          <div>
            <h2>Төлбөр</h2>
            <p>Digit системд төлсөн төлбөрийн мэдээлэл, түүхийг харах боломжтой.</p>
          </div>
        </div>

        <div className="profile-payment-stat-grid">
          <article className="profile-payment-stat">
            <span className="profile-payment-stat-icon">▣</span>
            <span>Нийт төлсөн дүн</span>
            <strong>0 ₮</strong>
            <small>Бүртгэгдсэн төлбөрийн дүн</small>
          </article>
          <article className="profile-payment-stat">
            <span className="profile-payment-stat-icon">♛</span>
            <span>Идэвхтэй багц</span>
            <strong>{String(profile.type || "bronze").replace(/^./, (c) => c.toUpperCase())}</strong>
            <small>Одоогийн багцын төрөл</small>
          </article>
          <article className="profile-payment-stat">
            <span className="profile-payment-stat-icon">▦</span>
            <span>Дараагийн сунгалт</span>
            <strong>—</strong>
            <small>Сунгалтын огноо бүртгэгдээгүй</small>
          </article>
          <article className="profile-payment-stat">
            <span className="profile-payment-stat-icon profile-payment-stat-icon-green">✓</span>
            <span>Төлөв</span>
            <strong className="profile-payment-active">Бүртгэлтэй</strong>
            <small>Байгууллагын бүртгэл идэвхтэй</small>
          </article>
        </div>

        <section className="profile-payment-history-card">
          <div className="profile-payment-history-head">
            <h3>Төлбөрийн түүх</h3>
            <div className="profile-payment-filters">
              <button type="button">Бүгд⌄</button>
              <button type="button">▣ Хугацаагаар шүүх</button>
            </div>
          </div>
          <div className="profile-payment-table-wrap">
            <table className="profile-payment-table">
              <thead><tr><th>Огноо</th><th>Гүйлгээний нэр</th><th>Багц</th><th>Дүн</th><th>Төлөв</th><th>Нэхэмжлэх</th></tr></thead>
              <tbody><tr><td colSpan={6}><div className="profile-payment-no-data">Одоогоор төлбөрийн түүх бүртгэгдээгүй байна.</div></td></tr></tbody>
            </table>
          </div>
          <div className="profile-payment-actions">
            <button type="button" className="profile-payment-primary" onClick={() => setPaymentModalOpen(true)}>▣ Төлбөр хийх</button>
            <button type="button" onClick={() => setPaymentModalOpen(true)}>↻ Багцаа шинэчлэх</button>
            <button type="button" disabled>▤ Нэхэмжлэх татах</button>
            <button type="button" disabled>▤ Төлбөрийн баримт харах</button>
          </div>
        </section>
      </div>
    ) : (
      <div className="profile-tab-panel">
        {"fields" in activeTabItem &&
          activeTabItem.fields.map((field) => {
            const rawValue = profile[field.value];

            const value =
              typeof rawValue === "string" && rawValue.trim()
                ? rawValue
                : "-";

            return (
              <div
                className="profile-tab-item"
                key={field.value}
              >
                <span>{field.label}</span>
                <strong>{value}</strong>
              </div>
            );
          })}
      </div>
    )}

  </div>
</div>

      {softwareModalOpen ? (
        <div className="profile-modal-backdrop" role="presentation" onClick={closeSoftwareWizard}>
          <div className="profile-modal profile-software-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <div className="profile-software-modal-title">
                <h3>{softwareModalMode === "edit" ? "Програм засах" : "Програм нэмэх"}</h3>
                <div className="profile-software-step-indicator">
                  <span className={softwareStep === 1 ? "is-active" : ""}>1. Үндсэн мэдээлэл</span>
                  <span className={softwareStep === 2 ? "is-active" : ""}>2. Програмын төрөл</span>
                  <span className={softwareStep === 3 ? "is-active" : ""}>3. Ашиглах салбар</span>
                  <span className={softwareStep === 4 ? "is-active" : ""}>4. Зураг</span>
                </div>
              </div>
              <button className="profile-modal-close" type="button" onClick={closeSoftwareWizard}>
                x
              </button>
            </div>

            <form className="profile-edit-form" onSubmit={submitSoftware}>
              {renderSoftwareWizardStep()}

              <div className="profile-software-wizard-actions">
                {softwareStep > 1 ? (
                  <button type="button" className="profile-software-secondary" onClick={goToPrevSoftwareStep}>
                    Буцах
                  </button>
                ) : (
                  <span></span>
                )}

                {softwareStep < 4 ? (
                  <button key="software-next" type="button" className="login-submit profile-software-submit" onClick={goToNextSoftwareStep}>
                    Дараах
                  </button>
                ) : (
                  <button key="software-submit" className="login-submit profile-software-submit" type="submit" disabled={softwareSubmitting}>
                    {softwareSubmitting ? "Хадгалж байна..." : softwareModalMode === "edit" ? "Хадгалах" : "Нэмэх"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {advisoryModalOpen ? (
        <div className="profile-modal-backdrop" role="presentation" onClick={closeAdvisoryWizard}>
          <div className="profile-modal profile-software-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <div className="profile-software-modal-title">
                <h3>{advisoryModalMode === "edit" ? "Зөвлөх үйлчилгээ засах" : "Зөвлөх үйлчилгээ нэмэх"}</h3>
                <div className="profile-software-step-indicator">
                  <span className={advisoryStep === 1 ? "is-active" : ""}>1. Үндсэн мэдээлэл</span>
                  <span className={advisoryStep === 2 ? "is-active" : ""}>2. Ашиглах салбар</span>
                  <span className={advisoryStep === 3 ? "is-active" : ""}>3. Зураг</span>
                </div>
              </div>
              <button className="profile-modal-close" type="button" onClick={closeAdvisoryWizard}>
                x
              </button>
            </div>

            <form className="profile-edit-form" onSubmit={submitAdvisory}>
              {renderAdvisoryWizardStep()}

              <div className="profile-software-wizard-actions">
                {advisoryStep > 1 ? (
                  <button type="button" className="profile-software-secondary" onClick={goToPrevAdvisoryStep}>
                    Буцах
                  </button>
                ) : (
                  <span></span>
                )}

                {advisoryStep < 3 ? (
                  <button key="advisory-next" type="button" className="login-submit profile-software-submit" onClick={goToNextAdvisoryStep}>
                    Дараах
                  </button>
                ) : (
                  <button key="advisory-submit" className="login-submit profile-software-submit" type="submit" disabled={advisorySubmitting}>
                    {advisorySubmitting ? "Хадгалж байна..." : advisoryModalMode === "edit" ? "Хадгалах" : "Нэмэх"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {articleModalOpen ? (
        <div className="profile-modal-backdrop" role="presentation" onClick={closeArticleWizard}>
          <div className="profile-modal profile-software-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <div className="profile-software-modal-title">
                <h3>{articleModalMode === "edit" ? "Нийтлэл засах" : "Нийтлэл нэмэх"}</h3>
                <div className="profile-software-step-indicator">
                  <span className={articleStep === 1 ? "is-active" : ""}>1. Үндсэн мэдээлэл</span>
                  <span className={articleStep === 2 ? "is-active" : ""}>2. Зураг</span>
                </div>
              </div>
              <button className="profile-modal-close" type="button" onClick={closeArticleWizard}>
                x
              </button>
            </div>

            <form className="profile-edit-form" onSubmit={submitArticle}>
              {renderArticleWizardStep()}

              <div className="profile-software-wizard-actions">
                {articleStep > 1 ? (
                  <button type="button" className="profile-software-secondary" onClick={goToPrevArticleStep}>
                    Буцах
                  </button>
                ) : (
                  <span></span>
                )}

                {articleStep < 2 ? (
                  <button key="article-next" type="button" className="login-submit profile-software-submit" onClick={goToNextArticleStep}>
                    Дараах
                  </button>
                ) : (
                  <button key="article-submit" className="login-submit profile-software-submit" type="submit" disabled={articleSubmitting}>
                    {articleSubmitting ? "Хадгалж байна..." : articleModalMode === "edit" ? "Хадгалах" : "Нэмэх"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {paymentModalOpen ? (
        <div className="profile-modal-backdrop" role="presentation" onClick={() => setPaymentModalOpen(false)}>
          <div className="profile-payment-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="profile-payment-modal-head">
              <div><span>ТӨЛБӨР</span><h3>Багц сонгох</h3></div>
              <button type="button" onClick={() => setPaymentModalOpen(false)}>×</button>
            </div>
            <p className="profile-payment-modal-copy">Байгууллагынхаа ашиглах багцыг сонгоно уу. Онлайн төлбөрийн холболт дараагийн шатанд хийгдэнэ.</p>
            <div className="profile-payment-package-grid">
              {([
                ["bronze", "Bronze", "Үндсэн багц"],
                ["silver", "Silver", "Өргөтгөсөн багц"],
                ["gold", "Gold", "Бүрэн багц"],
              ] as const).map(([value, label, note]) => (
                <button key={value} type="button" className={paymentPackage === value ? "active" : ""} onClick={() => setPaymentPackage(value)}>
                  <span>{label}</span><small>{note}</small>
                </button>
              ))}
            </div>
            <div className="profile-payment-modal-actions">
              <button type="button" onClick={() => setPaymentModalOpen(false)}>Болих</button>
              <button type="button" className="profile-payment-primary" onClick={() => window.alert("Онлайн төлбөрийн холболт дараагийн шатанд хийгдэнэ.")}>Үргэлжлүүлэх</button>
            </div>
          </div>
        </div>
      ) : null}

      {modalMode ? (
        <div className="profile-modal-backdrop" role="presentation" onClick={closeModal}>
          <div className="profile-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <h3>{modalMode === "profile" ? "Хэрэглэгчийн мэдээлэл шинэчлэх" : "Нууц үг солих"}</h3>
              <button className="profile-modal-close" type="button" onClick={closeModal}>
                x
              </button>
            </div>

            {modalMode === "profile" ? (
              <form className="profile-edit-form" onSubmit={handleProfileSubmit}>
                <div className="profile-edit-grid">
                  <label className="profile-edit-field">
                    <span>Нэр</span>
                    <input value={profile.name || ""} onChange={(e) => onProfileChange({ ...profile, name: e.target.value })} required />
                  </label>
                  <label className="profile-edit-field">
                    <span>Имэйл</span>
                    <input type="email" value={profile.email || ""} onChange={(e) => onProfileChange({ ...profile, email: e.target.value })} required />
                  </label>
                  <label className="profile-edit-field">
                    <span>Утас</span>
                    <input value={profile.phone || ""} onChange={(e) => onProfileChange({ ...profile, phone: e.target.value })} />
                  </label>
                  <label className="profile-edit-field">
                    <span>Вэб сайт</span>
                    <input value={profile.website || ""} onChange={(e) => onProfileChange({ ...profile, website: e.target.value })} />
                  </label>
                  <label className="profile-edit-field">
                    <span>Хаяг</span>
                    <input value={profile.address || ""} onChange={(e) => onProfileChange({ ...profile, address: e.target.value })} />
                  </label>
                  <label className="profile-edit-field">
                    <span>Холбоо барих нэр</span>
                    <input value={profile.contact_person_name || ""} onChange={(e) => onProfileChange({ ...profile, contact_person_name: e.target.value })} />
                  </label>
                  <label className="profile-edit-field">
                    <span>Холбоо барих утас</span>
                    <input value={profile.contact_person_phone || ""} onChange={(e) => onProfileChange({ ...profile, contact_person_phone: e.target.value })} />
                  </label>
                </div>
                <div className="profile-edit-actions">
                  <button className="login-submit" type="submit" disabled={loading}>
                    {loading ? "Хадгалж байна..." : "Мэдээлэл шинэчлэх"}
                  </button>
                </div>
              </form>
            ) : (
              <form className="profile-edit-form" onSubmit={handlePasswordSubmit}>
                <div className="profile-edit-grid profile-password-grid">
                  <label className="profile-edit-field">
                    <span>Одоогийн нууц үг</span>
                    <input name="current_password" type="password" autoComplete="current-password" required />
                  </label>
                  <label className="profile-edit-field">
                    <span>Шинэ нууц үг</span>
                    <input name="new_password" type="password" autoComplete="new-password" required />
                  </label>
                  <label className="profile-edit-field">
                    <span>Шинэ нууц үг давтах</span>
                    <input name="confirm_password" type="password" autoComplete="new-password" required />
                  </label>
                </div>
                <div className="profile-edit-actions">
                  <button className="login-submit" type="submit" disabled={loading}>
                    {loading ? "Шинэчилж байна..." : "Нууц үг солих"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </div>
  </div>
</section>
  );
}
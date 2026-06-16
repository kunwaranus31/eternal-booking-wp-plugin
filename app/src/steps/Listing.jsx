import { useState } from "react";
import { Star, ArrowRight } from "lucide-react";
import { useCheckout, STEPS } from "@/context/CheckoutContext";
import { useGetServices, useGetPackages } from "@/hooks";
import { convertToDollars } from "@/utils/helpers";
import { getField, firstImage, isFourHand } from "@/utils/format";
import { Button, Loading } from "@/components/ui";

export default function Listing() {
  const [tab, setTab] = useState("experiences");

  return (
    <div>
      <h1 className="tw-text-4xl laptop:tw-text-5xl unna tw-text-center tw-text-primary">
        Book Your Experience
      </h1>
      <p className="tw-text-center urbanist tw-text-brown tw-mt-2">
        Choose a single experience or a multi-session package
      </p>

      {/* Tabs */}
      <div className="tw-flex tw-justify-center tw-gap-2 tw-mt-6 tw-mb-8">
        {[
          { key: "experiences", label: "Experiences" },
          { key: "packages", label: "Packages" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`tw-px-6 tw-py-2 tw-rounded-full urbanist tw-font-medium tw-transition ${
              tab === t.key
                ? "tw-bg-primary tw-text-white"
                : "tw-bg-white tw-text-primary tw-border tw-border-brown/40"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "experiences" ? <ExperiencesTab /> : <PackagesTab />}
    </div>
  );
}

/* ── Experiences ─────────────────────────────────────── */
function ExperiencesTab() {
  const { services, isLoading } = useGetServices();
  const { setService, setFlowType, setSession, setPackageType, goTo } =
    useCheckout();

  if (isLoading) return <Loading label="Loading experiences..." />;
  if (!services?.length)
    return <Empty text="No experiences available right now." />;

  const handleBook = (service) => {
    setService(service);
    setFlowType("experience");
    setSession(null);
    setPackageType(null);
    goTo(STEPS.BOOK_SLOT);
  };

  return (
    <div className="tw-grid tw-gap-6 s_phone:tw-grid-cols-1 tablet:tw-grid-cols-2 laptop:tw-grid-cols-3">
      {services.map((service) => (
        <ExperienceCard
          key={service?._id}
          service={service}
          onBook={() => handleBook(service)}
        />
      ))}
    </div>
  );
}

function ExperienceCard({ service, onBook }) {
  const price = convertToDollars(service?.price);
  const fourHand = isFourHand(service?.type);
  return (
    <div className="tw-flex tw-flex-col tw-bg-white tw-rounded-2xl tw-border tw-border-sand tw-overflow-hidden tw-shadow-sm hover:tw-shadow-md tw-transition">
      <div className="tw-relative">
        <img
          src={firstImage(service)}
          alt={getField(service, "name")}
          className="tw-w-full tw-h-44 tw-object-cover"
        />
        <div className="tw-absolute tw-top-2 tw-right-2 tw-bg-black/70 tw-rounded-full tw-px-2 tw-py-1 tw-flex tw-items-center tw-gap-1">
          <Star className="tw-w-3.5 tw-h-3.5 tw-text-yellow-400" fill="currentColor" />
          <span className="tw-text-white tw-text-xs tw-font-semibold">
            {service?.averageRating ? `${service.averageRating}/5` : "New"}
          </span>
        </div>
      </div>
      <div className="tw-flex tw-flex-col tw-flex-1 tw-p-4">
        <div className="tw-flex tw-justify-between tw-gap-2 tw-items-start">
          <h3 className="tw-text-xl unna tw-capitalize tw-line-clamp-2">
            {getField(service, "name")}
          </h3>
          <span className="tw-text-2xl unna tw-text-primary tw-whitespace-nowrap">
            ${price}
          </span>
        </div>
        <p className="urbanist tw-text-sm tw-text-brown tw-mt-1 tw-line-clamp-2">
          {getField(service, "description")}
        </p>
        <ul className="urbanist tw-text-sm tw-text-primary/80 tw-mt-3 tw-space-y-1">
          <li>• {service?.duration} minutes</li>
          <li>• {fourHand ? "Four-hand · 2 instructors" : "Two-hand · 1 instructor"}</li>
        </ul>
        <Button
          variant="brown"
          icon={ArrowRight}
          className="tw-mt-4 tw-w-full"
          onClick={onBook}
        >
          Book Now
        </Button>
      </div>
    </div>
  );
}

/* ── Packages ────────────────────────────────────────── */
function PackagesTab() {
  const { packages, isLoading } = useGetPackages();
  const { setUserPackages, setFlowType, setPackageType, goTo } = useCheckout();

  if (isLoading) return <Loading label="Loading packages..." />;
  if (!packages?.length) return <Empty text="No packages available right now." />;

  const handleBook = (group) => {
    setUserPackages(group);
    setFlowType("package");
    setPackageType(null);
    goTo(STEPS.SELECT_PACKAGE);
  };

  return (
    <div className="tw-grid tw-gap-6 s_phone:tw-grid-cols-1 tablet:tw-grid-cols-2 laptop:tw-grid-cols-3">
      {packages.map((group) => (
        <PackageCard
          key={group?._id || group?.service?._id}
          group={group}
          onBook={() => handleBook(group)}
        />
      ))}
    </div>
  );
}

function PackageCard({ group, onBook }) {
  const service = group?.service;
  const fourHand = isFourHand(service?.type);
  return (
    <div className="tw-flex tw-flex-col tw-bg-white tw-rounded-2xl tw-border tw-border-sand tw-overflow-hidden tw-shadow-sm hover:tw-shadow-md tw-transition">
      <img
        src={firstImage(service)}
        alt={getField(service, "name")}
        className="tw-w-full tw-h-44 tw-object-cover"
      />
      <div className="tw-flex tw-flex-col tw-flex-1 tw-p-4">
        <h3 className="tw-text-xl unna tw-capitalize">{getField(service, "name")}</h3>
        <p className="urbanist tw-text-xs tw-text-brown tw-mt-0.5">
          {service?.duration} mins · {fourHand ? "Four-hand" : "Two-hand"}
        </p>
        <div className="tw-mt-3 tw-space-y-1 tw-flex-1">
          {group?.packages?.slice(0, 4).map((pkg) => (
            <div
              key={pkg?._id}
              className="tw-flex tw-justify-between tw-text-sm urbanist tw-border-b tw-border-sand tw-py-1"
            >
              <span className="tw-text-primary">
                {getField(pkg, "name")} ({pkg?.noOfSessions} sessions)
              </span>
              <span className="tw-font-semibold">${convertToDollars(pkg?.price)}</span>
            </div>
          ))}
        </div>
        <Button
          variant="brown"
          icon={ArrowRight}
          className="tw-mt-4 tw-w-full"
          onClick={onBook}
        >
          Book Now
        </Button>
      </div>
    </div>
  );
}

function Empty({ text }) {
  return (
    <div className="tw-text-center tw-py-16 tw-text-brown urbanist">{text}</div>
  );
}

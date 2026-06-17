import { useState } from "react";
import { Star, Hand, Clock, Info } from "lucide-react";
import { useCheckout, STEPS } from "@/context/CheckoutContext";
import { useGetServices, useGetPackages } from "@/hooks";
import { convertToDollars } from "@/utils/helpers";
import { getField, firstImage, isFourHand } from "@/utils/format";
import { Button, Loading } from "@/components/ui";

export default function Listing() {
  const [tab, setTab] = useState("experiences");

  return (
    <div>
      <h1 className="unna laptop:tw-text-5xl s_phone:tw-text-4xl tw-text-center tw-text-primary">
        Book Your Experience
      </h1>

      {/* Tabs */}
      <div className="tw-flex tw-justify-center tw-gap-2 tw-mt-6 tw-mb-2">
        {[
          { key: "experiences", label: "Experiences" },
          { key: "packages", label: "Packages" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`tw-px-8 tw-py-2 tw-rounded-full unna tw-text-lg tw-transition ${
              tab === t.key
                ? "tw-bg-primary tw-text-white"
                : "tw-bg-white tw-text-primary tw-border tw-border-sand"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div key={tab} className="tw-py-6 animate-fade-in">
        {tab === "experiences" ? <ExperiencesTab /> : <PackagesTab />}
      </div>

      <div className="tw-flex tw-justify-center tw-items-start tw-gap-2 tw-text-primary">
        <Info size={16} className="tw-mt-1 tw-shrink-0" />
        <p className="urbanist tw-text-base">
          {tab === "experiences"
            ? "Please note: Bookings must be made at least 24 hours in advance so we can prepare for your visit."
            : "Add-ons are not included with multi-session packages."}
        </p>
      </div>
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
    <div className="tw-group tw-flex tw-flex-col tw-bg-white tw-rounded-2xl tw-border tw-border-sand tw-overflow-hidden tw-shadow-sm hover:tw-shadow-lg tw-transition tw-duration-300 hover:-tw-translate-y-1">
      <div className="tw-relative">
        <img
          src={firstImage(service)}
          alt={getField(service, "name")}
          className="tw-w-full tw-h-48 tw-object-cover"
        />
        <div className="tw-absolute tw-top-2 tw-right-2 tw-bg-black/70 tw-rounded-full tw-px-3 tw-py-1 tw-flex tw-items-center tw-gap-1 tw-border tw-border-white/20">
          <Star className="tw-w-3.5 tw-h-3.5 tw-text-yellow-400" fill="currentColor" />
          <span className="tw-text-white tw-text-xs tw-font-semibold">
            {service?.averageRating ? `${service.averageRating}/5` : "No reviews yet"}
          </span>
        </div>
      </div>
      <div className="tw-flex tw-flex-col tw-flex-1 tw-p-5">
        <div className="tw-flex tw-justify-between tw-gap-2 tw-items-start">
          <h3 className="tw-text-xl unna tw-text-primary tw-capitalize tw-line-clamp-2">
            {getField(service, "name")}
          </h3>
          <span className="tw-text-3xl unna tw-text-primary tw-whitespace-nowrap">
            ${price}
          </span>
        </div>
        <p className="urbanist tw-text-sm tw-text-grey tw-mt-2 tw-line-clamp-2">
          {getField(service, "description")}
        </p>
        <div className="tw-flex tw-flex-wrap tw-gap-2 tw-mt-3">
          <Tag icon={Clock}>{service?.duration} mins</Tag>
          <Tag icon={Hand}>{fourHand ? "Four-hand · 2 instructors" : "Two-hand · 1 instructor"}</Tag>
        </div>
        <div className="tw-flex-1" />
        <Button variant="secondary" className="tw-mt-5 tw-w-full unna tw-text-lg" onClick={onBook}>
          Book Now →
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
    <div className="tw-flex tw-flex-col tw-bg-white tw-rounded-2xl tw-border tw-border-sand tw-overflow-hidden tw-shadow-sm hover:tw-shadow-lg tw-transition">
      <img
        src={firstImage(service)}
        alt={getField(service, "name")}
        className="tw-w-full tw-h-48 tw-object-cover"
      />
      <div className="tw-flex tw-flex-col tw-flex-1 tw-p-5">
        <h3 className="tw-text-xl unna tw-text-primary tw-capitalize">
          {getField(service, "name")}
        </h3>
        <div className="tw-flex tw-flex-wrap tw-gap-2 tw-mt-2">
          <Tag icon={Hand}>{fourHand ? "Four-hand" : "Two-hand"}</Tag>
          <Tag icon={Clock}>{service?.duration} mins</Tag>
        </div>
        <p className="urbanist tw-text-xl unna tw-text-primary tw-mt-4">Types of Packages</p>
        <div className="tw-mt-2 tw-space-y-1 tw-flex-1 tw-max-h-40 tw-overflow-auto tw-pr-1">
          {group?.packages?.map((pkg, i) => (
            <div
              key={pkg?._id}
              className={`tw-flex tw-justify-between tw-items-start tw-gap-3 tw-py-2 ${
                i < group.packages.length - 1 ? "tw-border-b tw-border-sand" : ""
              }`}
            >
              <div className="tw-flex tw-gap-2">
                <span className="tw-w-2 tw-h-2 tw-rounded-full tw-bg-primary tw-mt-2 tw-shrink-0" />
                <div>
                  <p className="urbanist tw-font-bold tw-text-primary tw-break-all">
                    {getField(pkg, "name")}
                  </p>
                  <p className="urbanist tw-text-sm tw-text-grey">
                    {pkg?.noOfSessions} sessions
                  </p>
                </div>
              </div>
              <span className="unna tw-text-lg tw-text-primary tw-whitespace-nowrap">
                ${convertToDollars(pkg?.price)}
              </span>
            </div>
          ))}
        </div>
        <Button variant="secondary" className="tw-mt-5 tw-w-full unna tw-text-lg" onClick={onBook}>
          Book Now →
        </Button>
      </div>
    </div>
  );
}

const Tag = ({ icon: Icon, children }) => (
  <span className="tw-bg-sand/40 tw-text-primary tw-text-xs tw-font-semibold urbanist tw-px-3 tw-py-1 tw-rounded-full tw-inline-flex tw-items-center tw-gap-1.5">
    {Icon && <Icon className="tw-w-3.5 tw-h-3.5" />}
    {children}
  </span>
);

function Empty({ text }) {
  return <div className="tw-text-center tw-py-16 tw-text-grey urbanist">{text}</div>;
}

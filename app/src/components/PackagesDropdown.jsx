import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { convertToDollars } from "@/utils/helpers";
import { getField } from "@/utils/format";

/**
 * Rich package picker (no native <select>) mirroring the main app's
 * PackagesDropdown: each row has a radio bullet + package name + sessions on the
 * left and the price on the right, with the bonus line underneath.
 */
export default function PackagesDropdown({
  packageType,
  setPackageType,
  title,
  placeholder = "Choose Package",
  data = [],
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const isSelected = (item) => packageType?._id === item?._id;

  const handleSelect = (item) => {
    setPackageType(item);
    setOpen(false);
  };

  return (
    <div className="tw-w-full tw-min-w-0" ref={ref}>
      {title && (
        <p className="urbanist tw-text-lg tw-text-primary tw-mb-2">{title}</p>
      )}

      {/* Header */}
      <div
        onClick={() => setOpen((o) => !o)}
        className="tw-bg-white tw-w-full tw-min-w-0 tw-px-3 tw-py-3 tw-rounded-md tw-border tw-border-gray-medium tw-flex tw-items-start tw-gap-3 tw-cursor-pointer"
      >
        {packageType ? (
          <div className="tw-flex tw-flex-col phone:tw-flex-row phone:tw-items-start phone:tw-justify-between tw-gap-3 tw-w-full tw-min-w-0 tw-overflow-hidden tw-font-medium tw-rounded-md tw-bg-gray/70 tw-p-3">
            <div className="tw-min-w-0 tw-flex-1">
              <div className="tw-flex tw-items-start tw-gap-2">
                <span className="tw-w-4 tw-h-4 tw-mt-1 tw-shrink-0 tw-border tw-border-primary tw-rounded-full tw-flex tw-items-center tw-justify-center">
                  <span className="tw-w-2 tw-h-2 tw-bg-primary tw-rounded-full" />
                </span>
                <div className="tw-min-w-0">
                  <p className="urbanist tw-font-bold tw-leading-5 tw-break-words tw-text-primary">
                    {getField(packageType, "name")}:
                  </p>
                  <p className="urbanist tw-text-sm tw-text-black/70 tw-mt-1">
                    {packageType?.noOfSessions} Sessions
                  </p>
                </div>
              </div>
              {getField(packageType, "bonus") && (
                <p className="urbanist tw-break-words tw-text-sm tw-leading-5 tw-mt-2 tw-pl-6 tw-text-black/80">
                  <b>Bonus: </b>
                  {getField(packageType, "bonus")}
                </p>
              )}
            </div>
            <div className="tw-flex tw-items-center tw-justify-between phone:tw-justify-start tw-gap-2 tw-shrink-0 tw-w-full phone:tw-w-auto tw-pl-6 phone:tw-pl-0">
              <p className="unna tw-text-2xl tw-leading-none tw-whitespace-nowrap tw-text-primary">
                ${convertToDollars(packageType?.price)}
              </p>
              <ChevronDown
                className={`tw-shrink-0 tw-text-primary tw-transition-transform tw-duration-300 ${
                  open ? "tw-rotate-180" : ""
                }`}
              />
            </div>
          </div>
        ) : (
          <div className="tw-w-full tw-flex tw-justify-between tw-items-center">
            <p className="urbanist tw-text-sm tw-text-grey/70">{placeholder}</p>
            <ChevronDown
              className={`tw-text-primary tw-transition-transform tw-duration-300 ${
                open ? "tw-rotate-180" : ""
              }`}
            />
          </div>
        )}
      </div>

      {/* Options */}
      <div
        className={`tw-overflow-hidden tw-transition-all tw-duration-300 tw-ease-in-out ${
          open ? "tw-max-h-[31rem] tw-opacity-100 tw-mt-2" : "tw-max-h-0 tw-opacity-0"
        }`}
      >
        <div className="eb-scroll tw-bg-white tw-w-full tw-min-w-0 tw-px-2 tw-py-2 tw-rounded-md tw-border tw-border-gray-medium tw-max-h-80 tw-overflow-x-hidden tw-overflow-y-auto tw-shadow-sm">
          {data?.map((item, index) => (
            <div
              key={item?._id || index}
              onClick={() => handleSelect(item)}
              className={`tw-cursor-pointer tw-px-3 tw-py-3 tw-mb-1 tw-rounded-md tw-transition-all tw-duration-200 ${
                isSelected(item) ? "tw-bg-gray tw-shadow-sm" : "hover:tw-bg-gray/70"
              } ${index !== data.length - 1 ? "tw-border-b tw-border-black/10" : ""}`}
            >
              <div className="tw-flex tw-flex-col phone:tw-flex-row phone:tw-items-start phone:tw-justify-between tw-gap-3 tw-min-w-0">
                <div className="tw-flex tw-items-start tw-gap-2 tw-min-w-0">
                  <span className="tw-w-4 tw-h-4 tw-mt-1 tw-shrink-0 tw-border-2 tw-border-primary tw-rounded-full tw-flex tw-items-center tw-justify-center">
                    {isSelected(item) && (
                      <span className="tw-w-2 tw-h-2 tw-bg-primary tw-rounded-full" />
                    )}
                  </span>
                  <div className="tw-min-w-0">
                    <p className="urbanist tw-font-bold tw-break-words tw-leading-5 tw-text-primary">
                      {getField(item, "name")}:
                    </p>
                    <p className="urbanist tw-text-sm tw-text-black/70 tw-mt-1">
                      {item?.noOfSessions} Sessions
                    </p>
                    {getField(item, "bonus") && (
                      <p className="urbanist tw-break-words tw-line-clamp-3 tw-leading-5 tw-text-sm tw-text-black/80 tw-mt-2">
                        <b>Bonus: </b>
                        {getField(item, "bonus")}
                      </p>
                    )}
                  </div>
                </div>
                <div className="tw-shrink-0 tw-pl-6 phone:tw-pl-0">
                  <p className="unna tw-text-2xl tw-whitespace-nowrap tw-leading-none tw-text-primary">
                    ${convertToDollars(item?.price)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

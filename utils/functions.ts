/**
 * Date formatting utility functions with multilingual support
 */
import i18n from "@/lib/i18n";

// Define locale mappings
const localeMap: Record<string, string> = {
  en: "en-US",
  vi: "vi-VN",
  ja: "ja-JP",
};

// Get current locale from i18n
const getCurrentLocale = (): string => {
  const language = i18n.language || "en";
  return localeMap[language] || "en-US";
};

/**
 * Utility function to conditionally join classNames together
 * @param classes - Array of class strings or objects where keys are class names and values are booleans
 * @returns Combined class string
 */
export function classNames(
  ...classes: (string | Record<string, boolean> | null | undefined)[]
): string {
  return classes
    .filter(Boolean)
    .map((cls) => {
      if (typeof cls === "string") return cls;
      if (cls && typeof cls === "object") {
        return Object.entries(cls)
          .filter(([_, value]) => Boolean(value))
          .map(([key, _]) => key)
          .join(" ");
      }
      return "";
    })
    .join(" ");
}

/**
 * Format countdown to an appointment
 * @param appointmentDate Date object or date string of the appointment
 * @returns Formatted countdown string (e.g., "Còn 2 giờ 30 phút tới lịch hẹn")
 */
export const formatCountdown = (appointmentDate: Date | string): string => {
  if (!appointmentDate) return "";

  const dateObj =
    typeof appointmentDate === "string"
      ? new Date(appointmentDate)
      : appointmentDate;
  const now = new Date();

  // If the appointment is in the past, return appropriate message
  if (dateObj <= now) {
    return i18n.t("time.appointment_passed");
  }

  const diffInMs = dateObj.getTime() - now.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

  if (diffInMinutes < 60) {
    // Less than an hour
    return i18n.t("time.countdown_minutes", { minutes: diffInMinutes });
  }

  const hours = Math.floor(diffInMinutes / 60);
  const minutes = diffInMinutes % 60;

  if (hours < 24) {
    // Less than a day
    if (minutes === 0) {
      return i18n.t("time.countdown_hours_only", { hours });
    } else {
      return i18n.t("time.countdown_hours_minutes", { hours, minutes });
    }
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  if (remainingHours === 0) {
    return i18n.t("time.countdown_days_only", { days });
  } else if (minutes === 0) {
    return i18n.t("time.countdown_days_hours", { days, hours: remainingHours });
  } else {
    return i18n.t("time.countdown_days_hours_minutes", {
      days,
      hours: remainingHours,
      minutes,
    });
  }
};

/**
 * Format a date to a standard date string based on current language
 * @param date Date object, date string or timestamp
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string | number): string => {
  if (!date) return "";

  let dateObj: Date;

  if (typeof date === "number") {
    dateObj = new Date(date);
  } else if (typeof date === "string") {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }

  // Check if the date is valid before calling toLocaleDateString
  if (isNaN(dateObj.getTime())) {
    console.error("Invalid date:", date);
    return "";
  }

  const locale = getCurrentLocale();

  try {
    return dateObj.toLocaleDateString(locale, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return date.toString();
  }
};

/**
 * Format a date to a short date string based on locale patterns
 * @param date Date object or date string
 * @param separator Separator character for date parts (default: "/")
 * @param apiFormat If true, always returns YYYY-MM-DD format regardless of locale
 * @returns Formatted date string
 */
export const formatShortDate = (
  date: Date | string,
  separator: string = "/",
  apiFormat: boolean = false
): string => {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;
  const day = dateObj.getDate().toString().padStart(2, "0");
  const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
  const year = dateObj.getFullYear();

  // If requesting API format, always return YYYY-MM-DD regardless of locale
  if (apiFormat || separator === "-") {
    return `${year}-${month}-${day}`;
  }

  const locale = getCurrentLocale();

  // For Japanese and Vietnamese, use the locale's default format
  if (locale === "ja-JP" || locale === "vi-VN") {
    return dateObj.toLocaleDateString(locale);
  }

  // For English and other locales, use a custom format
  return `${day}${separator}${month}${separator}${year}`;
};

/**
 * Format a date to display relative time with localized strings
 * @param date Date object or date string
 * @returns Relative time string
 */
export const formatRelativeTime = (date: Date | string): string => {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  const language = i18n.language || "en";

  if (diffInSeconds < 60) {
    return i18n.t("time.just_now");
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return i18n.t("time.minutes_ago", { count: diffInMinutes });
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return i18n.t("time.hours_ago", { count: diffInHours });
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return i18n.t("time.days_ago", { count: diffInDays });
  }

  // Fall back to standard date format for older dates
  return formatDate(dateObj);
};

/**
 * Format a date to display time based on locale
 * @param date Date object or date string
 * @param use24Hour Whether to use 24-hour format (default: false)
 * @returns Formatted time string
 */
export const formatTime = (
  date: Date | string,
  use24Hour: boolean = false
): string => {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;
  const locale = getCurrentLocale();

  return dateObj.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: !use24Hour,
  });
};

/**
 * Format a date for appointment display with localized format
 * @param date Date object or date string
 * @returns Formatted appointment date string
 */
export const formatAppointmentDate = (date: Date | string): string => {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;
  const locale = getCurrentLocale();

  return dateObj.toLocaleDateString(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

/**
 * Format a date with both date and time with localized format
 * @param date Date object or date string
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: Date | string): string => {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;
  const locale = getCurrentLocale();

  return `${dateObj.toLocaleDateString(locale)} ${dateObj.toLocaleTimeString(
    locale,
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  )}`;
};

/**
 * Check if a date is today
 * @param date Date object or date string
 * @returns Boolean indicating if the date is today
 */
export const isToday = (date: Date | string): boolean => {
  if (!date) return false;

  const dateObj = typeof date === "string" ? new Date(date) : date;
  const today = new Date();

  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
};

export const formatPrice = (price: number): string => {
  if (price === null || price === undefined) return "0vnd";

  const roundedPrice = Math.round(price);

  const formattedPrice = roundedPrice.toLocaleString("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return `${formattedPrice} vnd`;
};

/**
 * Formats a time string from API format (09:00:00) to display format (9h00)
 * @param timeString - Time string in HH:MM:SS format
 * @returns Formatted time string in the format "HhMM"
 */
export const formatTimeSlot = (timeString: string): string => {
  if (!timeString) return "";
  const [hours, minutes] = timeString.split(":");
  return `${parseInt(hours)}h${minutes}`;
};

/**
 * Format date with weekday name based on locale
 * @param date Date object or date string
 * @param options Additional formatting options
 * @returns Formatted date with weekday name (e.g., "Thứ Hai, 15 Tháng 5 2025")
 */
export const formatDateWithWeekday = (
  date: Date | string,
  options?: { includeYear?: boolean }
): string => {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;
  const language = i18n.language || "en";

  // Get the locale format to use
  const locale = localeMap[language] || "en-US";

  // Format options including weekday
  const formatOptions: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: options?.includeYear !== false ? "numeric" : undefined,
  };

  return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj);
};

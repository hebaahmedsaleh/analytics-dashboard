import * as React from "react";
import { createContext, useState, useContext, ReactNode } from "react";

interface DateRange {
  start: string;
  end: string;
}

interface DateRangeContextProps {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
}

const DateRangeContext = createContext<DateRangeContextProps | undefined>(undefined);

export const useDateRange = () => {
  const context = useContext(DateRangeContext);
  if (!context) throw new Error("useDateRange must be used within a DateRangeProvider");
  return context;
};

export const DateRangeProvider = ({ children }: { children: ReactNode }) => {
  const getDateString = (offset = 0) => {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
    const yyyy = d.getFullYear();
  const mm = ("0" + (d.getMonth() + 1)).slice(-2);
  const dd = ("0" + d.getDate()).slice(-2);
    return `${yyyy}-${mm}-${dd}`;
  };

  const [dateRange, setDateRange] = useState<DateRange>({
    start: getDateString(0),
    end: getDateString(1),
  });
  return React.createElement(
    DateRangeContext.Provider,
    { value: { dateRange, setDateRange } },
    children
  );
};

"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { forwardRef, useEffect, useRef, useState } from "react";
import "../app/globals.css";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpSquareIcon } from "lucide-react";

export type historyRecord = {
  action: string;
  org: string;
  user: string;
  timeStamp: string;
};

type DocHistoryProps = {
  docHistory: historyRecord[];
  closeHistory: () => void;
};

const DocumentHistory = forwardRef<HTMLDivElement, DocHistoryProps>(
  ({ docHistory, closeHistory }, ref) => {
    const [data, setData] = useState<historyRecord[]>([]);
    const notifRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      setData([...docHistory].reverse());
    }, [docHistory]);

    const handleClickOutside = (event: MouseEvent) => {
      const clickedOutsideNotifications =
        notifRef.current && !notifRef.current.contains(event.target as Node);

      if (clickedOutsideNotifications) {
        closeHistory();
      }
    };

    useEffect(() => {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="grid grid-rows-1 grid-cols-1 place-items-center fixed top-0 left-0 right-0 bottom-0 bg-[#00000050] z-10"
        >
          <Card className="w-[600px] shadow-lg rounded-lg" ref={notifRef}>
            <CardHeader className="p-4">
              <CardTitle className="leading-8 text-xl font-semibold">
                Document History
              </CardTitle>
              <CardDescription className="text-sm">
                {data.length} recent actions
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 max-h-80 overflow-y-auto custom-scrollbar">
              {data.map((record, index) => (
                <div
                  className="grid"
                  style={{ gridTemplateColumns: "2fr 1fr" }}
                >
                  <div
                    key={index}
                    className={`${
                      record.action.includes("Modified")
                        ? "bg-yellow-500"
                        : record.action.includes("accepted")
                        ? "bg-green-500"
                        : "bg-blue-500"
                    } bg-opacity-30 hover:bg-opacity-70 rounded-lg mb-2 text-muted-foreground hover:text-secondary-foreground flex items-center space-x-2 cursor-pointer hover:scale-105 transform transition-all`}
                  >
                    <div className="flex flex-col m-2">
                      <span>
                        {record.action} by {record.user} on {record.org}
                      </span>
                    </div>
                  </div>
                  <span className="text-s flex flex-col items-center justify-center">
                    {(record.timeStamp as any)
                      .toDate()
                      .toLocaleDateString("en-GB", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      <div className="w-[1px] h-2/3 bg-muted-foreground"></div>
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    );
  }
);

DocumentHistory.displayName = "DocumentHistory";
export default DocumentHistory;

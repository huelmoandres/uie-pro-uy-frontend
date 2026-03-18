import React from "react";
import { View, Text, Pressable } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";

export interface PaginatorProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

/**
 * Reusable functional component for pagination.
 * Includes page size selector (defaulting to 5-50) and page navigation.
 */
export const Paginator: React.FC<PaginatorProps> = React.memo(
  ({
    currentPage = 1,
    totalPages = 1,
    pageSize = 20,
    totalItems = 0,
    pageSizeOptions = [20, 30, 50],
    onPageChange,
    onPageSizeChange,
  }) => {
    // Prevent pagination over total bounds, fallback to 1 to avoid NaN
    const safeTotalPages = Math.max(1, totalPages || 1);
    const validCurrentPage = Math.max(
      1,
      Math.min(currentPage || 1, safeTotalPages),
    );
    const safeTotalItems = totalItems || 0;

    const startIndex =
      safeTotalItems === 0 ? 0 : (validCurrentPage - 1) * pageSize + 1;
    const endIndex = Math.min(validCurrentPage * pageSize, safeTotalItems);

    return (
      <View className="py-2">
        <View
          className={`flex-row items-center justify-between ${safeTotalPages > 1 ? "mb-3" : ""}`}
        >
          <Text className="text-[11px] font-sans-semi text-slate-400 tracking-wider">
            Mostrando <Text className="font-sans-bold">{startIndex}</Text> al{" "}
            <Text className="font-sans-bold">{endIndex}</Text> de{" "}
            <Text className="font-sans-bold">{safeTotalItems}</Text>
          </Text>

          <View className="flex-row items-center gap-1">
            {pageSizeOptions.map((size) => (
              <Pressable
                key={size}
                onPress={() => onPageSizeChange(size)}
                className={`min-w-[32px] h-8 items-center justify-center rounded-lg border ${
                  pageSize === size
                    ? "bg-primary border-primary dark:bg-accent dark:border-accent"
                    : "bg-transparent border-transparent active:bg-slate-100 dark:active:bg-white/5"
                }`}
              >
                <Text
                  className={`text-[12px] font-sans-bold ${
                    pageSize === size
                      ? "text-white"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {size}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Pagination Controls */}
        {safeTotalPages > 1 && (
          <View className="flex-row items-center justify-between bg-slate-50 border border-slate-100 dark:bg-white/5 dark:border-white/10 rounded-2xl p-1">
            <Pressable
              disabled={validCurrentPage === 1}
              onPress={() => onPageChange(validCurrentPage - 1)}
              className="h-10 px-4 flex-row gap-1 items-center justify-center rounded-xl bg-white shadow-sm shadow-slate-200/50 disabled:opacity-40 disabled:shadow-none active:bg-slate-50 dark:bg-white/10 dark:shadow-none dark:active:bg-white/20"
            >
              <ChevronLeft size={16} color="#64748B" />
              <Text className="text-[13px] font-sans-semi text-slate-700 dark:text-slate-300">
                Anterior
              </Text>
            </Pressable>

            <Text className="text-[12px] font-sans-semi text-slate-500 px-2">
              Pág{" "}
              <Text className="font-sans-bold text-slate-800 dark:text-white">
                {validCurrentPage}
              </Text>{" "}
              de {safeTotalPages}
            </Text>

            <Pressable
              disabled={validCurrentPage === safeTotalPages}
              onPress={() => onPageChange(validCurrentPage + 1)}
              className="h-10 px-4 flex-row gap-1 items-center justify-center rounded-xl bg-white shadow-sm shadow-slate-200/50 disabled:opacity-40 disabled:shadow-none active:bg-slate-50 dark:bg-white/10 dark:shadow-none dark:active:bg-white/20"
            >
              <Text className="text-[13px] font-sans-semi text-slate-700 dark:text-slate-300">
                Siguiente
              </Text>
              <ChevronRight size={16} color="#64748B" />
            </Pressable>
          </View>
        )}
      </View>
    );
  },
);
Paginator.displayName = "Paginator";

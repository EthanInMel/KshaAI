import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    hasNext: boolean;
    hasPrev: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    hasNext,
    hasPrev,
}) => {
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push('...');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    return (
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.05] bg-white/[0.02]">
            <div className="text-sm text-gray-400">
                Page <span className="font-medium text-white">{currentPage}</span> of{' '}
                <span className="font-medium text-white">{totalPages}</span>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={!hasPrev}
                    className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.05] text-gray-400 hover:text-white hover:bg-white/[0.05] transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/[0.03] disabled:hover:text-gray-400"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                {getPageNumbers().map((page, index) =>
                    typeof page === 'number' ? (
                        <button
                            key={index}
                            onClick={() => onPageChange(page)}
                            className={`min-w-[40px] h-10 rounded-lg font-medium transition-all ${page === currentPage
                                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                    : 'bg-white/[0.03] border border-white/[0.05] text-gray-400 hover:text-white hover:bg-white/[0.05]'
                                }`}
                        >
                            {page}
                        </button>
                    ) : (
                        <span key={index} className="px-2 text-gray-600">
                            {page}
                        </span>
                    )
                )}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={!hasNext}
                    className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.05] text-gray-400 hover:text-white hover:bg-white/[0.05] transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/[0.03] disabled:hover:text-gray-400"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

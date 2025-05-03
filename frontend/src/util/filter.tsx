import { Filter, FilterType } from "@/components/ui/filters";
import { LearningPath } from "@/types/type";

export function filterLearningPaths(paths: LearningPath[],
    filters: Filter[],
    searchQuery: string
): LearningPath[] {
    if (!paths) return [];
    return paths.filter(path => {
        // First check the search query
        if (searchQuery && !path.title.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }
        // If no filters are applied, show all paths that match the search
        if (filters.length === 0) return true;
        // Check if path matches all active filters
        return filters.every(filter => {
            switch (filter.type) {
                case FilterType.LANGUAGE:
                    if (filter.value.length === 0) return true;
                    // Check if the path's language matches the selected languages
                    if (path.language === null) return false; // Handle null language
                    // Check if any of the selected languages match the path's language
                    return filter.value.length === 0 || filter.value.includes(path.language);
                case FilterType.CREATED_DATE:
                    if (filter.value.length === 0) return true;
                    const pathDate = new Date(path.createdAt);
                    if (isNaN(pathDate.getTime())) return false; // Invalid date
                    const now = new Date();
                    const diffDays = Math.floor((now.getTime() - pathDate.getTime()) / (1000 * 60 * 60 * 24));

                    return filter.value.some(value => {
                        switch (value) {
                            case 'week': return diffDays <= 7;
                            case 'month': return diffDays <= 30;
                            case 'year': return diffDays <= 365;
                            default: return true;
                        }
                    });
                case FilterType.CREATOR:
                    if (filter.value.length === 0) return true;
                    if (!path.creator?.user?.firstName || !path.creator?.user?.lastName) return false;
                    const creatorFullName = `${path.creator.user.firstName} ${path.creator.user.lastName}`;
                    // Check if any of the selected creators match the path's creator full name
                    return filter.value.some(v => creatorFullName === v);

                default:
                    return true;
            }
        });
    });
}
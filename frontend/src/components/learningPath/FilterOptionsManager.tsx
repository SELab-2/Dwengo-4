import { User } from "lucide-react";
import { Filter, FilterType, filterViewToFilterOptions } from "../ui/filters";
import * as React from "react";

interface FilterOptionsManagerProps {
    creators?: { name: string; }[];
    languages?: { name: string; }[];
    filters: Filter[];
}

export function FilterOptionsManager({ creators, languages, filters }: FilterOptionsManagerProps) {
    React.useEffect(() => {
        if (creators?.length) {
            const selectedCreators = filters
                .filter(f => f.type === FilterType.CREATOR)
                .flatMap(f => f.value);

            filterViewToFilterOptions[FilterType.CREATOR] = creators
                .filter(creator => !selectedCreators.includes(creator.name))
                .map(creator => ({
                    name: creator.name,
                    icon: <User className="size-3" />,
                }));
        }

        if (languages?.length) {
            const selectedLanguages = filters
                .filter(f => f.type === FilterType.LANGUAGE)
                .flatMap(f => f.value);

            filterViewToFilterOptions[FilterType.LANGUAGE] = languages
                .filter(language => !selectedLanguages.includes(language.name))
                .map(language => ({
                    name: language.name,
                    icon: undefined,
                }));
        }
    }, [creators, languages, filters]);

    return null;
}

"use client";

import { Button } from "../ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../ui/popover";
import { cn } from "../../lib/utils";
import { ListFilter } from "lucide-react";
import * as React from "react";
import Filters, { Filter } from "../ui/filters";
import {
    FilterType,
} from "../ui/filters";
import { FilterOptionsManager } from "./FilterOptionsManager";
import { FilterCommandMenu } from "./FilterCommandMenu";

interface LearningPathFilterProps {
    filters: Filter[];
    setFilters: React.Dispatch<React.SetStateAction<Filter[]>>;
    creators?: {
        name: string;
    }[];
    languages?: {
        name: string;
    }[];
}

export function LearningPathFilter({ filters, setFilters, creators, languages }: LearningPathFilterProps) {
    const [open, setOpen] = React.useState(false);
    const [selectedView, setSelectedView] = React.useState<FilterType | null>(null);
    const [commandInput, setCommandInput] = React.useState("");
    const commandInputRef = React.useRef<HTMLInputElement>(null!);

    return (
        <div className="flex gap-2 flex-wrap">
            <FilterOptionsManager creators={creators} languages={languages} filters={filters} />
            <Filters filters={filters} setFilters={setFilters} />
            {filters.filter((filter) => filter.value?.length > 0).length > 0 && (
                <Button
                    variant="outline"
                    size="sm"
                    className="transition group h-6 text-xs items-center rounded-sm"
                    onClick={() => setFilters([])}
                >
                    Clear
                </Button>
            )}
            <Popover
                open={open}
                onOpenChange={(open) => {
                    setOpen(open);
                    if (!open) {
                        setTimeout(() => {
                            setSelectedView(null);
                            setCommandInput("");
                        }, 200);
                    }
                }}
            >
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        role="combobox"
                        aria-expanded={open}
                        size="sm"
                        className={cn(
                            "transition group h-6 text-xs items-center rounded-sm flex gap-1.5 items-center",
                            filters.length > 0 && "w-6"
                        )}
                    >
                        <ListFilter className="size-3 shrink-0 transition-all text-muted-foreground group-hover:text-primary" />
                        {!filters.length && "Filter"}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                    <FilterCommandMenu
                        selectedView={selectedView}
                        setSelectedView={setSelectedView}
                        commandInput={commandInput}
                        setCommandInput={setCommandInput}
                        setFilters={setFilters}
                        setOpen={setOpen}
                        commandInputRef={commandInputRef}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}   
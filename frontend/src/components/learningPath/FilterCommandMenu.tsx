import * as React from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "../ui/command";
import { Filter, FilterOperator, FilterOption, FilterType, filterViewOptions, filterViewToFilterOptions, DueDate } from "../ui/filters";
import { nanoid } from "nanoid";
import { AnimateChangeInHeight } from "../ui/filters";

interface FilterCommandMenuProps {
    selectedView: FilterType | null;
    setSelectedView: (view: FilterType | null) => void;
    commandInput: string;
    setCommandInput: (input: string) => void;
    setFilters: React.Dispatch<React.SetStateAction<Filter[]>>;
    setOpen: (open: boolean) => void;
    commandInputRef: React.RefObject<HTMLInputElement>;
}

export function FilterCommandMenu({ selectedView, setSelectedView, commandInput, setCommandInput, setFilters, setOpen, commandInputRef }: FilterCommandMenuProps) {
    return (
        <AnimateChangeInHeight>
            <Command>
                <CommandInput
                    placeholder={selectedView ? selectedView : "Filter..."}
                    className="h-9"
                    value={commandInput}
                    onInputCapture={(e) => setCommandInput(e.currentTarget.value)}
                    ref={commandInputRef}
                />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    {selectedView ? (
                        <CommandGroup>
                            {filterViewToFilterOptions[selectedView].map((filter: FilterOption) => (
                                <CommandItem
                                    className="group text-muted-foreground flex gap-2 items-center"
                                    key={filter.name}
                                    value={filter.name}
                                    onSelect={(currentValue) => {
                                        setFilters((prev) => [
                                            ...prev,
                                            {
                                                id: nanoid(),
                                                type: selectedView,
                                                operator: selectedView === FilterType.DUE_DATE && currentValue !== DueDate.IN_THE_PAST
                                                    ? FilterOperator.BEFORE : FilterOperator.IS,
                                                value: [currentValue],
                                            },
                                        ]);
                                        setTimeout(() => {
                                            setSelectedView(null);
                                            setCommandInput("");
                                        }, 200);
                                        setOpen(false);
                                    }}
                                >
                                    {filter.icon}
                                    <span className="text-accent-foreground">{filter.name}</span>
                                    {filter.label && (
                                        <span className="text-muted-foreground text-xs ml-auto">{filter.label}</span>
                                    )}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    ) : (
                        filterViewOptions.map((group: FilterOption[], index: number) => (
                            <React.Fragment key={`filter-group-${group[0]?.name ?? index}`}>
                                <CommandGroup>
                                    {group.map((filter: FilterOption) => (
                                        <CommandItem
                                            className="group text-muted-foreground flex gap-2 items-center"
                                            key={filter.name}
                                            value={filter.name}
                                            onSelect={(currentValue) => {
                                                setSelectedView(currentValue as FilterType);
                                                setCommandInput("");
                                                commandInputRef.current?.focus();
                                            }}
                                        >
                                            {filter.icon}
                                            <span className="text-accent-foreground">{filter.name}</span>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                                {index < filterViewOptions.length - 1 && <CommandSeparator />}
                            </React.Fragment>
                        ))
                    )}
                </CommandList>
            </Command>
        </AnimateChangeInHeight>
    );
}

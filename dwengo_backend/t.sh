#!/bin/bash

output_file="/home/daan/Documents/sel2/Dwengo-4/dwengo_backend/out.txt"

# Leeg het output-bestand voordat je begint
#> "$output_file"

print_files() {
    local dir="$1"
    for file in "$dir"/*; do
        if [ -d "$file" ]; then
            # Als het een directory is, roep de functie opnieuw aan
            print_files "$file"
        elif [ -f "$file" ]; then
            # Schrijf de bestandsnaam en inhoud naar het output-bestand
            echo "=== $file ===" >> "$output_file"
            cat "$file" >> "$output_file"
            echo "" >> "$output_file"  # Voeg een lege regel toe voor leesbaarheid
        fi
    done
}

# Start de functie vanaf de huidige directory of een opgegeven pad
start_dir="${1:-.}"
print_files "$start_dir"

echo "Alle bestanden en hun inhoud zijn opgeslagen in $output_file"

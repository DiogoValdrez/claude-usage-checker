#!/bin/bash
# Script to get Claude Code usage via /usage command
# Uses expect-like behavior to interact with Claude

# Create a temporary file for the commands
TMPFILE=$(mktemp)
echo "/usage" > "$TMPFILE"
echo "/exit" >> "$TMPFILE"

# Run claude with the commands and capture output
timeout 15 claude < "$TMPFILE" 2>&1 | \
    sed -n '/Sonnet/,/exit/p' | \
    grep -v "^$" | \
    head -20

# Clean up
rm -f "$TMPFILE"
